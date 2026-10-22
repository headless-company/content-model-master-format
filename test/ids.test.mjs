import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import Ajv from 'ajv';
import { parse } from 'yaml';

const schema = JSON.parse(await readFile(new URL('../schemas/model.schema.json', import.meta.url), 'utf8'));
const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);
const model = id => ({ id, name: 'Example', kind: 'entry', fields: [{ id, type: 'string' }] });

for (const id of ['pageTitle', 'PageTitle', 'SEO', 'page_title', 'page-title', 'page2Title', '123', '_', '-']) {
  test(`accepts model and field ID ${id} and preserves casing`, () => {
    const value = model(id);
    const before = structuredClone(value);
    assert.equal(validate(value), true, JSON.stringify(validate.errors));
    assert.deepEqual(value, before);
  });
}

for (const id of ['', 'page.title', 'page title', 'page/title', 'café', 'page\nTitle']) {
  for (const location of ['model', 'field']) {
    test(`rejects invalid ${location} ID ${JSON.stringify(id)}`, () => {
      const value = model('valid');
      if (location === 'model') value.id = id;
      else value.fields[0].id = id;
      assert.equal(validate(value), false);
    });
  }
}

test('case-distinct field IDs and mixed-case model references remain valid', () => {
  const value = model('ArticlePage');
  value.fields = [
    { id: 'pageTitle', type: 'string' },
    { id: 'pagetitle', type: 'string' },
    { id: 'seoMetadata', type: 'object', objectType: 'SeoMetadata' },
    { id: 'relatedPages', type: 'reference', targets: ['ArticlePage'], list: true },
    { id: 'body', type: 'richText', richTextConfig: { embeds: [{ kind: 'reference', targets: ['ArticlePage'] }] } },
  ];
  const before = structuredClone(value);
  assert.equal(validate(value), true, JSON.stringify(validate.errors));
  assert.deepEqual(value, before);
});

test('rich-text capability names keep their separate lowercase syntax', () => {
  for (const key of ['marks', 'blocks']) {
    const value = model('ArticlePage');
    value.fields = [{ id: 'bodyText', type: 'richText', richTextConfig: { [key]: ['UpperCase'] } }];
    assert.equal(validate(value), false);
  }
});

test('bundled manifest matches the package version and all example models validate', async () => {
  const manifest = parse(await readFile(new URL('../examples/manifest.yaml', import.meta.url), 'utf8'));
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(manifest.specVersion, pkg.version);
  const directory = new URL('../examples/models/', import.meta.url);
  const files = (await readdir(directory)).filter(name => /\.(yaml|yml|json)$/.test(name));
  assert.ok(files.length > 0);
  for (const file of files) {
    assert.equal(validate(parse(await readFile(new URL(file, directory), 'utf8'))), true, `${file}: ${JSON.stringify(validate.errors)}`);
  }
});
