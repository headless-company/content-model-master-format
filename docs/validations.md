# Validations

## Why Validations Exist in CMMF

Validations allow a model to express structural constraints without tying those constraints to one CMS implementation.

They are important because they:

- improve content quality
- document modelling expectations
- give translators and validators more information to work with

In CMMF 1.2.0, validations are intentionally practical rather than exhaustive.

## Supported Validation Keys in 1.2.0

- `minLength`
- `maxLength`
- `regex`
- `min`
- `max`
- `integerOnly`
- `minItems`
- `maxItems`
- `uniqueItems`
- `mimeTypes`
- `dimensions`
- `fileSize`

## Validation by Field Category

### Text-like Fields

Common validations:

- `minLength`
- `maxLength`
- `regex`

Most useful for:

- `string`
- `text`
- `slug`

### Number Fields

Common validations:

- `min`
- `max`
- `integerOnly`

Most useful for:

- `number`

### List-like Fields

Common validations:

- `minItems`
- `maxItems`
- `uniqueItems`

Most useful for:

- `list: true` fields, including repeatable references
- translator logic that carries list-oriented constraints into target-platform relationship fields

### Asset Fields

Common validations:

- `mimeTypes`
- `dimensions`
- `fileSize`

Most useful for:

- `asset`

## Why Validation Stays Lightweight in 1.2.0

Different CMS platforms support validation in very different ways. Some provide rich native constraints; some require code; some do not support certain checks at all.

CMMF 1.2.0 therefore uses validations as a shared intent layer. Translators should:

- preserve validations where possible
- report unsupported validations
- log lossy mappings in translation output

## Important Practical Point

Not every validation key is meaningful for every type. CMMF 1.2.0 does not attempt to fully formalise that compatibility matrix inside the JSON Schema validator.

That means:

- the schema catches structural presence rules
- deeper semantic validation is a good candidate for a dedicated validation tool or agent

## Example

```yaml
- id: title
  type: string
  required: true
  validations:
    minLength: 5
    maxLength: 100
```

This says more than "store a string." It says the field has expected editorial bounds, and those bounds should be preserved or at least acknowledged during translation.
