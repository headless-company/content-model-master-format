# Canonical Types

## What Canonical Types Are

Canonical types are the standard field types supported by CMMF 1.2.0.

They exist to provide a stable vocabulary for model authors while leaving room for translators to map those types into platform-specific equivalents.

## Why Canonical Types Matter

Different CMSs often provide overlapping but inconsistent field types. CMMF uses canonical types to describe meaning at a common layer first.

This helps because:

- model authors can think in platform-neutral terms
- translators can map one source type to many platform targets
- validators can reason about fields consistently

## Type List

- `string`
- `text`
- `number`
- `boolean`
- `date`
- `datetime`
- `slug`
- `enum`
- `richText`
- `asset`
- `json`
- `object`
- `reference`

## Type Details

### `string`

Short text values.

Common options:

- `required`
- `default`
- `localisation`
- `validations.minLength`
- `validations.maxLength`
- `validations.regex`

### `text`

Longer plain-text values.

Common options:

- `required`
- `localisation`
- `default`
- `validations.minLength`
- `validations.maxLength`

### `number`

Numeric values.

Common options:

- `required`
- `default`
- `validations.min`
- `validations.max`
- `validations.integerOnly`

### `boolean`

True/false values.

Common options:

- `required`
- `default`

### `date`

Calendar dates without time-of-day semantics.

Common options:

- `required`
- `default`

### `datetime`

Date plus time value.

Common options:

- `required`
- `default`

### `slug`

A URL-safe identifier usually derived from another field.

Common options:

- `required`
- `localisation`
- `editorial.helpText`
- string-like validations where supported by translators

### `enum`

A constrained string with an explicit set of allowed values.

Required option:

- `values`

Common additional options:

- `required`
- `default`

### `richText`

Formatted editorial content.

Common options:

- `required`
- `localisation`
- `richTextConfig`

`richTextConfig` allows a model to express the intended rich text capability envelope without tying that field to one CMS editor implementation.

Example:

```yaml
- id: body
  type: richText
  richTextConfig:
    marks: [bold, italic, underline]
    blocks: [paragraph, heading-1, quote]
    embeds:
      - kind: asset
      - kind: reference
        targets: [callout]
```

Within `richTextConfig`:

- `marks` is an optional allowlist of inline formatting capabilities
- `blocks` is an optional allowlist of block-level structures
- `embeds` is an optional allowlist of supported embed kinds

If `richTextConfig` is omitted, translators may use their default rich text capability set for the target platform. If requested capabilities cannot be represented cleanly, translators should log the lossy mapping.

### `asset`

A file or media reference.

Common options:

- `required`
- `validations.mimeTypes`
- `validations.dimensions`
- `validations.fileSize`

### `json`

Arbitrary structured data where no stronger canonical type exists.

Use carefully. It is flexible, but that flexibility can weaken validation and translation clarity.

### `object`

An embedded structured field.

Required option:

- `objectType`

Common additional options:

- `required`
- `list`
- `translationHints`

An `object` field points to another model structure by identity, while preserving embedded semantics at the field level.

### `reference`

A relationship to another model.

Required option:

- `targets`

Canonical repeatability option:

- `list`

Legacy compatibility option:

- `relation.cardinality`

Common additional options:

- `required`
- `list`
- `relation.ownership`
- `relation.ordered`
- `relation.uniqueItems`
- `relation.minItems`
- `relation.maxItems`

## Shared Field Options

Most canonical types can use shared field properties such as:

- `id`
- `name`
- `description`
- `required`
- `localisation`
- `default`
- `editorial`
- `translationHints`

Some options are meaningful only for certain types. For example:

- `values` applies to `enum`
- `objectType` applies to `object`
- `targets` and `relation` apply to `reference`
- `list` is the canonical repeatability flag for any field type, including `reference`

## Why Types Stay Abstract

CMMF intentionally avoids coupling canonical types to one CMS implementation. For example:

- `asset` may map to an asset picker, media library reference, or file field
- `slug` may map to a special slug field or a validated string
- `object` may map to inline nested data or a reusable schema fragment

That abstraction is one of the main reasons CMMF can act as a durable source format.
