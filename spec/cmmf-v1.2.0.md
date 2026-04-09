# Content Model Master Format (CMMF) 1.2.0

## 1. Overview

The Content Model Master Format (CMMF) is a CMS-agnostic schema definition language designed to:

- define content models in a portable, human-readable format
- capture modelling intent, not just implementation structure
- support translation into multiple CMS platforms
- enable tooling such as generators, validators, and diagram builders

## 2. Core Principles

### Intent over implementation

The format describes what the model means, not how a specific CMS stores or renders it.

### Explicit relationships

References and composition must be described directly, including relationship intent where relevant.

### Separation of concerns

The core schema defines structure and intent. CMS-specific choices belong in a translation layer.

### Deterministic structure

The same CMMF input should produce the same structural interpretation every time.

## 3. Recommended File Structure

```text
/examples
  manifest.yaml
  /models
    page.yaml
    article.yaml
    person.yaml
```

## 4. Manifest Specification

Example:

```yaml
specVersion: "1.2.0"
namespace: example.project
modelsPath: ./models
defaults:
  required: false
  localisation: false
```

### Manifest Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `specVersion` | string | yes | Semver spec version. In CMMF 1.2.0 this must be `"1.2.0"`. |
| `namespace` | string | yes | Unique namespace for the model set. |
| `modelsPath` | string | no | Relative path to model files. |
| `defaults` | object | no | Default values applied by tooling when omitted in model files. |

Legacy compatibility note:

- pre-semver manifests may use `specVersion: 1` to indicate the original v1 release
- semver-based manifests should use a quoted string such as `"1.2.0"`

### Supported Defaults in 1.2.0

| Field | Type | Description |
|---|---|---|
| `required` | boolean | Default field requiredness. |
| `localisation` | boolean | Default field localisation behaviour. |

## 5. Model Specification

Example:

```yaml
id: page
name: Page
kind: entry
fields: []
```

### Required Model Fields

| Field | Description |
|---|---|
| `id` | Unique identifier for the model. |
| `name` | Human-readable model name. |
| `kind` | Model kind. |
| `fields` | Array of field definitions. |

### Optional Model Fields

- `description`
- `tags`
- `localisation`
- `singleton`
- `editorial`
- `governance`
- `translationHints`

## 6. Model Kinds

| Kind | Meaning |
|---|---|
| `entry` | Standalone content. |
| `component` | Reusable composable block. |
| `object` | Embedded structure. |
| `taxonomy` | Classification model. |
| `settings` | Singleton or global configuration. |

## 7. Field Specification

Example:

```yaml
- id: title
  type: string
  required: true
```

### Required Field Properties

- `id`
- `type`

### Optional Field Properties

- `name`
- `description`
- `required`
- `localisation`
- `default`
- `list`
- `validations`
- `editorial`
- `relation`
- `objectType`
- `targets`
- `values`
- `richTextConfig`
- `translationHints`

## 8. Canonical Types

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

## 9. Type Rules

### Object Fields

Object fields represent embedded structures.

```yaml
type: object
objectType: seo-metadata
```

Requirements:

- `type` must be `object`
- `objectType` must be present

### Reference Fields

Reference fields represent links to one or more target models.

```yaml
type: reference
targets: [article]
list: true
relation:
  ownership: linked
```

Requirements:

- `type` must be `reference`
- `targets` must be present
- `list: true` indicates a repeatable reference field
- `relation.cardinality` is a legacy alias accepted for compatibility

### Enum Fields

Enum fields constrain values to a fixed set of allowed strings.

```yaml
type: enum
values: [draft, review, published]
```

Requirements:

- `type` must be `enum`
- `values` must be present

### Rich Text Fields

Rich text fields represent formatted editorial content with optional capability constraints.

```yaml
type: richText
richTextConfig:
  marks: [bold, italic]
  blocks: [paragraph, heading-1, quote]
  embeds:
    - kind: asset
    - kind: reference
      targets: [callout]
```

Requirements:

- `richTextConfig` is only valid when `type` is `richText`
- omitted `richTextConfig` means translator-defined default rich text capabilities
- `marks` and `blocks` are optional allowlists of translator-recognised capability tokens
- `embeds` is an optional allowlist of supported embed definitions
- embed `kind` must be `asset` or `reference`
- `reference` embeds must include `targets`

## 10. Relationship Specification

Example:

```yaml
relation:
  ordered: true
  uniqueItems: true
  ownership: contained
```

### Relationship Fields

| Field | Type | Description |
|---|---|---|
| `ordered` | boolean | Whether item order matters. |
| `uniqueItems` | boolean | Whether duplicates are allowed. |
| `minItems` | number | Minimum allowed items. |
| `maxItems` | number | Maximum allowed items. |
| `ownership` | enum | `linked` or `contained`. |

Legacy compatibility note:

- `relation.cardinality` remains accepted on `reference` fields as a deprecated alias for repeatability
- tooling should normalise `relation.cardinality: many` to `list: true`
- tooling should treat `relation.cardinality: one` as singular when `list` is omitted

## 11. List Handling

| Scenario | Approach |
|---|---|
| Primitive lists | `list: true` |
| Object lists | `list: true` |
| Reference lists | `list: true` |

Legacy cardinality mapping:

| Legacy Input | Canonical Interpretation |
|---|---|
| `relation.cardinality: one` | singular field |
| `relation.cardinality: many` | `list: true` |

## 12. Validation Specification

Example:

```yaml
validations:
  minLength: 5
  maxLength: 100
```

### Supported Validation Keys in 1.2.0

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

Validation semantics are intentionally lightweight in 1.2.0. CMS translators may need to map these into platform-specific constraints. See the deeper discussion in [docs/validations.md](../docs/validations.md).

## 13. Editorial Metadata

Model-level example:

```yaml
editorial:
  labelField: title
  preview:
    title: title
    description: summary
    image: heroImage
```

Field-level example:

```yaml
editorial:
  helpText: Used in URLs
```

Editorial metadata is non-structural and supports authoring and presentation concerns.

## 14. Governance Metadata

Example:

```yaml
governance:
  owner: platform-team
  status: active
  maturity: stable
```

Governance metadata is optional and is intended for operational ownership and lifecycle signalling.

## 15. Translation Hints

Example:

```yaml
translationHints:
  preferredRepresentation: embedded
```

Translation hints are non-authoritative. They inform downstream translators without changing the core meaning of the schema.

## 16. Rules and Constraints

### IDs

Model and field IDs:

- must be unique within their scope
- must be lowercase
- must use only alphanumeric characters, `_`, or `-`

### Object Fields

- must include `objectType`

### Reference Fields

- must include `targets`
- should use `list: true` when repeatable
- may include legacy `relation.cardinality` for compatibility
- conflicting `list` and `relation.cardinality` values should be treated as invalid

### Enum Fields

- must include `values`

### Rich Text Fields

- `richTextConfig` must only appear on `richText` fields
- `richTextConfig.embeds[*].targets` must be present when embed `kind` is `reference`

## 17. Non-Goals for 1.2.0

The following are explicitly out of scope in 1.2.0:

- permissions
- workflows
- environments
- CMS UI configuration
- custom logic
- computed fields

## 18. Translation Contract Guidance

Translation is intentionally separate from the core specification because it is not fully deterministic across CMS platforms.

At minimum, a translation contract should define:

- the CMMF input shape
- the target platform schema output
- a decisions log describing translator choices
- which translation decisions are fixed versus configurable

Examples of translator variation include:

- translating contained references into embedded objects
- translating contained references into separate content types
- normalising legacy `relation.cardinality` usage to `list`
- applying strict versus optimised output strategies
