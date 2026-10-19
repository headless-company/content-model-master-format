# Validations

This branch documents **CMMF 1.3.0-beta.1**, an experimental prerelease. Stable
1.2.0 remains canonical on `main` and the `v1.2.0` release.

Validation has three distinct concerns. Passing one does not imply passing all three.

## Schema / Format Validation

[The JSON Schema](../schemas/model.schema.json) checks model declaration shape:
required properties, canonical field types, relationship compatibility, rich-text
configuration, and the structure of `validationHints`. It rejects malformed hint
objects, missing IDs or descriptions, unknown operators, mixed representations,
and empty action lists. It does not validate documents containing content.

## Graph / Semantic Validation

Semantic validation checks declarations in context. A structured hint must refer
to fields that actually exist in the same model. Hint IDs must be unique within
that model, and operators and literal types must fit the referenced field.

The beta includes a small [declaration checker](../scripts/validate-models.mjs):

```sh
npm ci
npm run validate
node scripts/validate-models.mjs --manifest /path/to/manifest.yaml
```

It requires Node.js 22 or later and the exact manifest version `"1.3.0-beta.1"`.
It reads YAML or JSON model files directly within `modelsPath` (default `./models`)
and reports schema errors, duplicate model/field/hint IDs, unknown structured field
references, incompatible operators or operands, and malformed regex patterns.
It does not change input or insert defaults.

This is a focused declaration checker, not a complete model-graph validator: it
does not resolve relationship targets, inspect dialect-specific expressions or
prose, solve contradictory hints, or fully formalise existing field validations.

## Content Validation

Content validation asks whether a particular document meets the model's declared
constraints. Field-level `required` and `validations` express single-field intent;
model-level [validation hints](./document-validation-hints.md) describe conditional
and cross-field intent. A hint's `severity` describes the intended content finding.
It does not change whether the hint declaration itself is valid.

CMMF does not ship a content evaluator or execute expressions. Editors, validators,
and translators decide how to realise that intent. Translators must account for
every hint with a disposition and reason; hints are never silently discarded.

## Existing Field-Level Validation Keys

Field validations remain unchanged in this beta:

| Category | Keys | Typical fields |
|---|---|---|
| Text | `minLength`, `maxLength`, `regex` | `string`, `text`, `slug` |
| Number | `min`, `max`, `integerOnly` | `number` |
| Lists | `minItems`, `maxItems`, `uniqueItems` | Any `list: true` field |
| Asset | `mimeTypes`, `dimensions`, `fileSize` | `asset` |

```yaml
- id: title
  type: string
  required: true
  validations:
    minLength: 5
    maxLength: 100
```

Field-level validation semantics remain lightweight. Translators preserve them
where possible and report unsupported or lossy mappings. The schema does not
fully formalise the compatibility matrix for those existing validation keys.
