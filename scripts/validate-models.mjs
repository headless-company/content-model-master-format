import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import Ajv from 'ajv';
import { parse } from 'yaml';

export const SPEC_VERSION = '1.3.0-beta.1';
const schema = JSON.parse(await readFile(new URL('../schemas/model.schema.json', import.meta.url), 'utf8'));
// The inherited 1.2 schema uses permissive conditional subschemas. Keep its
// behaviour; validate the new hint declarations without coercion or defaults.
const validateShape = new Ajv({ allErrors: true, strict: false }).compile(schema);
const textTypes = new Set(['string', 'text', 'slug', 'enum']);
const scalarTypes = new Set([...textTypes, 'number', 'boolean', 'date', 'datetime']);
const numericOperators = new Set(['gt', 'gte', 'lt', 'lte']);
const has = (object, key) => Object.hasOwn(object, key);

/** Check declarations only. Never evaluate content, expressions, or patterns. */
export function validateModel(model) {
  if (!validateShape(model)) {
    return validateShape.errors.map(error => ({
      code: 'schema', path: error.instancePath || '/',
      message: error.message, details: error.params,
    }));
  }
  const errors = [];
  const report = (code, path, message) => errors.push({ code, path, message });
  const fields = new Map();
  for (const [index, field] of model.fields.entries()) {
    if (fields.has(field.id)) report('duplicate-field-id', `/fields/${index}/id`, `Duplicate field ID: ${field.id}`);
    fields.set(field.id, field);
  }
  const hintIds = new Set();
  const findField = (id, path) => {
    if (!fields.has(id)) report('unknown-field', path, `No field with ID ${id} in model ${model.id}`);
    return fields.get(id);
  };
  function condition(node, path) {
    for (const key of ['allOf', 'anyOf']) {
      if (has(node, key)) {
        node[key].forEach((child, index) => condition(child, `${path}/${key}/${index}`));
        return;
      }
    }
    if (has(node, 'not')) return condition(node.not, `${path}/not`);
    const field = findField(node.field, `${path}/field`);
    if (!field) return;
    const operator = Object.keys(node).find(key => key !== 'field');
    if (operator === 'isEmpty' || operator === 'isNotEmpty') return;
    const repeatable = field.list === true || (field.type === 'reference' && field.relation?.cardinality === 'many');
    const allowedTypes = numericOperators.has(operator) ? new Set(['number'])
      : operator === 'matches' ? textTypes : scalarTypes;
    if (repeatable || !allowedTypes.has(field.type)) {
      report('operator-type', path, `${operator} is not supported for ${repeatable ? 'repeatable ' : ''}${field.type} field ${field.id}`);
      return;
    }
    if (operator === 'matches') {
      try { new RegExp(node.matches); }
      catch { report('invalid-pattern', `${path}/matches`, 'Expected an ECMAScript regular expression without delimiters or flags'); }
      return;
    }
    const expected = field.type === 'number' ? 'number' : field.type === 'boolean' ? 'boolean' : 'string';
    const values = operator === 'in' || operator === 'notIn' ? node[operator] : [node[operator]];
    for (const value of values) {
      if (value !== null && typeof value !== expected) {
        report('operand-type', `${path}/${operator}`, `Expected ${expected} or null for ${field.id}; no type coercion is allowed`);
      }
    }
  }
  for (const [index, hint] of (model.validationHints ?? []).entries()) {
    const path = `/validationHints/${index}`;
    if (hintIds.has(hint.id)) report('duplicate-hint-id', `${path}/id`, `Duplicate hint ID: ${hint.id}`);
    hintIds.add(hint.id);
    if (hint.when) condition(hint.when, `${path}/when`);
    for (const [action, ids] of Object.entries(hint.then ?? {})) {
      ids.forEach((id, item) => findField(id, `${path}/then/${action}/${item}`));
    }
  }
  return errors;
}

async function readData(file) {
  return parse(await readFile(file, 'utf8'), { uniqueKeys: true, maxAliasCount: 100 });
}

export async function checkManifest(file) {
  const manifest = await readData(file);
  if (manifest?.specVersion !== SPEC_VERSION) {
    throw new Error(`Expected specVersion: "${SPEC_VERSION}"; received ${JSON.stringify(manifest?.specVersion)}. This checker never falls back to another spec version.`);
  }
  const modelsDirectory = resolve(dirname(file), manifest.modelsPath ?? './models');
  const files = (await readdir(modelsDirectory, { withFileTypes: true }))
    .filter(entry => entry.isFile() && ['.yaml', '.yml', '.json'].includes(extname(entry.name)))
    .map(entry => resolve(modelsDirectory, entry.name)).sort();
  if (!files.length) throw new Error(`No model files in ${modelsDirectory}`);
  const diagnostics = [];
  const modelIds = new Set();
  for (const modelFile of files) {
    const model = await readData(modelFile);
    diagnostics.push(...validateModel(model).map(error => ({ file: modelFile, ...error })));
    if (typeof model?.id === 'string') {
      if (modelIds.has(model.id)) diagnostics.push({ file: modelFile, code: 'duplicate-model-id', path: '/id', message: `Duplicate model ID: ${model.id}` });
      modelIds.add(model.id);
    }
  }
  return { files, diagnostics };
}

async function main(args) {
  if (args.length !== 2 || args[0] !== '--manifest') {
    throw new Error('Usage: node scripts/validate-models.mjs --manifest path/to/manifest.yaml');
  }
  const { files, diagnostics } = await checkManifest(resolve(args[1]));
  for (const error of diagnostics) process.stderr.write(`${error.file}${error.path} [${error.code}] ${error.message}\n`);
  if (diagnostics.length) process.exitCode = 1;
  else process.stdout.write(`Validated ${files.length} model declarations against CMMF ${SPEC_VERSION}. Content and expressions were not evaluated.\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch(error => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
