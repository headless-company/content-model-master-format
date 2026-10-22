import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { stringify } from 'yaml';
import { SPEC_VERSION, validateModel, checkManifest } from '../scripts/validate-models.mjs';

const fields = [
  { id: 'kind', type: 'enum', values: ['internal', 'external'] },
  { id: 'url', type: 'string' }, { id: 'notes', type: 'text' },
  { id: 'count', type: 'number' }, { id: 'enabled', type: 'boolean' },
  { id: 'date', type: 'date' }, { id: 'timestamp', type: 'datetime' },
  { id: 'slug', type: 'slug' },
  { id: 'tags', type: 'string', list: true },
  { id: 'author', type: 'reference', targets: ['person'] },
  { id: 'authors', type: 'reference', targets: ['person'], relation: { cardinality: 'many' } },
  { id: 'body', type: 'richText' }, { id: 'image', type: 'asset' },
  { id: 'data', type: 'json' }, { id: 'seo', type: 'object', objectType: 'seo' },
];
const model = hints => ({ id: 'article', name: 'Article', kind: 'entry', fields: structuredClone(fields), ...(hints === undefined ? {} : { validationHints: hints }) });
const hint = extra => ({ id: 'external-source', description: 'External articles need a source.', ...extra });
const conditional = when => hint({ when, then: { require: ['url'] } });
const valid = value => assert.deepEqual(validateModel(value), []);
const invalid = (value, code = 'schema') => assert.ok(validateModel(value).some(error => error.code === code), JSON.stringify(validateModel(value)));

test('old model structure and hint-free models remain valid', () => valid(model()));

const mixedCaseModel = () => ({
  id: 'ArticlePage', name: 'Article page', kind: 'entry',
  fields: [{ id: 'pageTitle', type: 'string' }, { id: 'pagetitle', type: 'string' }],
  validationHints: [{
    id: 'RequireTitle', description: 'A title is required.',
    when: { not: { anyOf: [{ field: 'pageTitle', isEmpty: true }] } },
    then: { require: ['pageTitle'] },
  }],
});

test('camelCase references and case-distinct field and hint IDs preserve identity', () => {
  const value = mixedCaseModel();
  value.validationHints.push({ id: 'requiretitle', description: 'A distinct hint.' });
  const before = structuredClone(value);
  valid(value);
  assert.deepEqual(value, before);
});

test('condition field lookup requires exact casing', () => {
  const value = mixedCaseModel();
  value.validationHints[0].when = { field: 'PageTitle', isEmpty: true };
  invalid(value, 'unknown-field');
});

for (const action of ['require', 'forbid', 'atLeastOneOf', 'atMostOneOf', 'exactlyOneOf']) {
  test(`${action} accepts camelCase and resolves case-distinct fields separately`, () => {
    const value = mixedCaseModel();
    value.validationHints[0].then = { [action]: ['pageTitle', 'pagetitle'] };
    valid(value);
    value.validationHints[0].then[action] = ['PageTitle'];
    invalid(value, 'unknown-field');
  });
}

test('mixed-case IDs still reject exact field and hint duplicates', () => {
  const value = mixedCaseModel();
  value.fields.push({ id: 'pageTitle', type: 'string' });
  invalid(value, 'duplicate-field-id');
  value.fields.pop();
  value.validationHints.push(structuredClone(value.validationHints[0]));
  invalid(value, 'duplicate-hint-id');
});

for (const [name, value] of Object.entries({
  prose: hint({ severity: 'info' }),
  conditional: conditional({ field: 'kind', equals: 'external' }),
  unconditional: hint({ then: { atLeastOneOf: ['url', 'author'] } }),
  combinedActions: hint({ then: { require: ['url'], forbid: ['notes'], exactlyOneOf: ['author', 'authors'] } }),
  nested: conditional({ allOf: [{ field: 'kind', in: ['internal', 'external'] }, { not: { anyOf: [{ field: 'enabled', equals: false }, { field: 'count', lte: 0 }] } }] }),
  expression: hint({ expression: { dialect: 'jsonlogic', rule: { '>': [{ var: 'count' }, 0] } } }),
  unknownDialect: hint({ expression: { dialect: 'vendor-rules-v2', rule: 'not parsed or executed' } }),
  nullExpression: hint({ expression: { dialect: 'example', rule: null } }),
  falseLiteral: conditional({ field: 'enabled', equals: false }),
  zeroLiteral: conditional({ field: 'count', gte: 0 }),
  nullLiteral: conditional({ field: 'url', equals: null }),
  dateEquality: conditional({ field: 'date', equals: '2026-10-19' }),
  regex: conditional({ field: 'url', matches: '^https://' }),
  nullMembership: conditional({ field: 'count', notIn: [null, 0, 1] }),
})) test(`accepts ${name}`, () => valid(model([value])));

for (const action of ['require', 'forbid', 'atLeastOneOf', 'atMostOneOf', 'exactlyOneOf']) {
  test(`accepts ${action} for singular and repeatable fields`, () => valid(model([hint({ then: { [action]: ['url', 'tags', 'authors'] } })])));
}
for (const field of fields) {
  for (const operator of ['isEmpty', 'isNotEmpty']) {
    test(`${operator} supports ${field.id}`, () => valid(model([conditional({ field: field.id, [operator]: true })])));
  }
}
for (const [operator, operand] of Object.entries({ equals: 1, notEquals: 2, in: [0, 1], notIn: [3], gt: 0, gte: 1, lt: 3, lte: 2 })) {
  test(`supports numeric ${operator}`, () => valid(model([conditional({ field: 'count', [operator]: operand })])));
}

const malformed = {
  missingId: { description: 'Missing ID' },
  invalidId: hint({ id: 'Invalid.id' }),
  missingDescription: { id: 'no-description' },
  blankDescription: hint({ description: ' \n\t' }),
  badSeverity: hint({ severity: 'fatal' }),
  unknownHintKey: hint({ required: true }),
  triggerOnly: hint({ when: { field: 'enabled', equals: true } }),
  expressionAndThen: hint({ expression: { dialect: 'example', rule: true }, then: { require: ['url'] } }),
  expressionAndWhen: hint({ expression: { dialect: 'example', rule: true }, when: { field: 'enabled', equals: true } }),
  missingDialect: hint({ expression: { rule: true } }),
  missingRule: hint({ expression: { dialect: 'example' } }),
  badDialect: hint({ expression: { dialect: '-Bad--Dialect-', rule: true } }),
  unknownExpressionKey: hint({ expression: { dialect: 'example', rule: true, run: true } }),
  emptyAction: hint({ then: {} }),
  unknownAction: hint({ then: { mutuallyExclusive: ['url', 'author'] } }),
  emptyActionList: hint({ then: { require: [] } }),
  duplicateActionField: hint({ then: { require: ['url', 'url'] } }),
  multipleOperators: conditional({ field: 'count', gt: 0, lt: 10 }),
  noOperator: conditional({ field: 'url' }),
  unknownOperator: conditional({ field: 'url', contains: 'x' }),
  falseEmptyOperand: conditional({ field: 'url', isEmpty: false }),
  badNumericOperand: conditional({ field: 'count', gt: '0' }),
  objectEquality: conditional({ field: 'url', equals: {} }),
  emptyMembership: conditional({ field: 'url', in: [] }),
  duplicateMembership: conditional({ field: 'url', in: ['x', 'x'] }),
  emptyAll: conditional({ allOf: [] }),
  emptyAny: conditional({ anyOf: [] }),
  mixedCombinators: conditional({ allOf: [{ field: 'url', isEmpty: true }], anyOf: [{ field: 'url', isEmpty: true }] }),
  predicateAndCombinator: conditional({ field: 'url', isEmpty: true, not: { field: 'url', isEmpty: true } }),
  nestedUnknownKey: conditional({ not: { field: 'url', isEmpty: true, typo: true } }),
  pathReference: conditional({ field: 'seo.title', isEmpty: true }),
};
for (const [name, value] of Object.entries(malformed)) {
  test(`rejects ${name}`, () => invalid(model([value])));
}
test('rejects empty hint array', () => invalid(model([])));
test('IDs are unique per model, not globally', () => {
  invalid(model([hint(), hint()]), 'duplicate-hint-id');
  valid(model([hint()]));
  valid({ ...model([hint()]), id: 'another' });
});
test('rejects duplicate field IDs rather than resolving ambiguously', () => {
  const value = model([conditional({ field: 'url', isEmpty: true })]);
  value.fields.push({ id: 'url', type: 'number' });
  invalid(value, 'duplicate-field-id');
});
test('finds unknown fields inside recursive conditions and actions', () => {
  invalid(model([conditional({ not: { allOf: [{ field: 'missing', isNotEmpty: true }] } })]), 'unknown-field');
  invalid(model([hint({ then: { require: ['missing'] } })]), 'unknown-field');
});
for (const [name, predicate, code] of [
  ['date ordering', { field: 'date', gt: 0 }, 'operator-type'],
  ['text ordering', { field: 'url', gt: 0 }, 'operator-type'],
  ['list equality', { field: 'tags', equals: 'x' }, 'operator-type'],
  ['legacy repeatable reference equality', { field: 'authors', equals: 'person' }, 'operator-type'],
  ['reference equality', { field: 'author', equals: 'person' }, 'operator-type'],
  ['rich text regex', { field: 'body', matches: 'x' }, 'operator-type'],
  ['numeric regex', { field: 'count', matches: 'x' }, 'operator-type'],
  ['string coercion', { field: 'count', equals: '1' }, 'operand-type'],
  ['boolean coercion', { field: 'enabled', equals: 0 }, 'operand-type'],
  ['mixed membership types', { field: 'url', in: ['x', 1] }, 'operand-type'],
  ['invalid regex', { field: 'url', matches: '[' }, 'invalid-pattern'],
]) test(`rejects ${name}`, () => invalid(model([conditional(predicate)]), code));

test('validation does not mutate input or insert default severity', () => {
  const value = model([hint()]);
  const before = structuredClone(value);
  valid(value);
  assert.deepEqual(value, before);
});
test('existing reference and rich text rules still apply', () => {
  for (const field of [
    { id: 'x', type: 'reference' },
    { id: 'x', type: 'object' },
    { id: 'x', type: 'enum' },
    { id: 'x', type: 'string', richTextConfig: { marks: ['bold'] } },
    { id: 'x', type: 'richText', richTextConfig: { embeds: [{ kind: 'reference' }] } },
    { id: 'x', type: 'reference', targets: ['person'], list: true, relation: { cardinality: 'one' } },
    { id: 'x', type: 'reference', targets: ['person'], list: false, relation: { cardinality: 'many' } },
  ]) invalid({ ...model(), fields: [field] });
  valid({ ...model(), fields: [{ id: 'x', type: 'richText', richTextConfig: { marks: ['bold'], embeds: [{ kind: 'reference', targets: ['person'] }] } }] });
});

test('CLI rejects invalid declarations and unsupported versions without fallback', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'cmmf-beta-'));
  const cli = fileURLToPath(new URL('../scripts/validate-models.mjs', import.meta.url));
  try {
    await mkdir(join(directory, 'models'));
    const manifestFile = join(directory, 'manifest.yaml');
    const run = () => execFileSync(process.execPath, [cli, '--manifest', manifestFile], { encoding: 'utf8', stdio: 'pipe' });
    for (const version of ['1.2.0', '1.3', '1.3.0', '1.3.0-beta.2', 1, null]) {
      await writeFile(manifestFile, stringify({ specVersion: version }));
      assert.throws(run, error => error.status === 1 && /never falls back/.test(error.stderr));
    }
    await writeFile(manifestFile, stringify({ specVersion: SPEC_VERSION }));
    await writeFile(join(directory, 'models/article.yaml'), stringify(model([hint({ expression: { dialect: 'unknown', rule: 'throw new Error()' } })])));
    assert.match(run(), /Validated 1 model declarations/);
    await writeFile(join(directory, 'models/article.yaml'), stringify(model([hint({ then: { require: ['missing'] } })])));
    assert.throws(run, error => error.status === 1 && /unknown-field/.test(error.stderr));
    await writeFile(join(directory, 'models/article.yaml'), 'id: one\nid: two\n');
    assert.throws(run, error => error.status === 1 && /unique/.test(error.stderr));
    await writeFile(join(directory, 'models/article.yaml'), stringify(model()));
    await writeFile(join(directory, 'models/duplicate.json'), JSON.stringify(model()));
    const result = await checkManifest(manifestFile);
    assert.ok(result.diagnostics.some(error => error.code === 'duplicate-model-id'));
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('beta manifest, schema, package, and normative documents agree on exact version', async () => {
  const root = new URL('../', import.meta.url);
  const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
  const schema = JSON.parse(await readFile(new URL('schemas/model.schema.json', root), 'utf8'));
  assert.equal(pkg.version, SPEC_VERSION);
  assert.equal(schema.title, `CMMF ${SPEC_VERSION} Model Schema`);
  for (const file of [`spec/cmmf-v${SPEC_VERSION}.md`, `spec/translation-contract-v${SPEC_VERSION}.md`]) {
    assert.match(await readFile(new URL(file, root), 'utf8'), new RegExp(SPEC_VERSION.replaceAll('.', '\\.')));
  }
  const examples = await checkManifest(fileURLToPath(new URL('examples/manifest.yaml', root)));
  assert.equal(examples.files.length, 5);
  assert.deepEqual(examples.diagnostics, []);
});
