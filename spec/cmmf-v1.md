# Content Model Master Format (CMMF) v1

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
specVersion: 1
namespace: example.project
modelsPath: ./models
defaults:
  required: false
  localisation: false
```

### Manifest Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `specVersion` | number | yes | Spec version. In v1 this must be `1`. |
| `namespace` | string | yes | Unique namespace for the model set. |
| `modelsPath` | string | no | Relative path to model files. |
| `defaults` | object | no | Default values applied by tooling when omitted in model files. |

### Supported Defaults in v1

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
relation:
  cardinality: many
```

Requirements:

- `type` must be `reference`
- `targets` must be present
- `relation.cardinality` is recommended

### Enum Fields

Enum fields constrain values to a fixed set of allowed strings.

```yaml
type: enum
values: [draft, review, published]
```

Requirements:

- `type` must be `enum`
- `values` must be present

## 10. Relationship Specification

Example:

```yaml
relation:
  cardinality: many
  ordered: true
  uniqueItems: true
  ownership: contained
```

### Relationship Fields

| Field | Type | Description |
|---|---|---|
| `cardinality` | enum | `one` or `many`. |
| `ordered` | boolean | Whether item order matters. |
| `uniqueItems` | boolean | Whether duplicates are allowed. |
| `minItems` | number | Minimum allowed items. |
| `maxItems` | number | Maximum allowed items. |
| `ownership` | enum | `linked` or `contained`. |

## 11. List Handling

| Scenario | Approach |
|---|---|
| Primitive lists | `list: true` |
| Object lists | `list: true` |
| Reference lists | `relation.cardinality: many` |

## 12. Validation Specification

Example:

```yaml
validations:
  minLength: 5
  maxLength: 100
```

### Supported Validation Keys in v1

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

Validation semantics are intentionally lightweight in v1. CMS translators may need to map these into platform-specific constraints. See the deeper discussion in [docs/validations.md](/home/djeglin/projects/headlessCo/content-model-master-format/docs/validations.md).

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
- should include `relation.cardinality`

### Enum Fields

- must include `values`

## 17. Non-Goals for v1

The following are explicitly out of scope in v1:

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
- applying strict versus optimised output strategies
