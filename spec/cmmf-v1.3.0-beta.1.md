# Content Model Master Format (CMMF) 1.3.0-beta.1

**Status: experimental prerelease.** This branch and its default schema, documentation,
and examples describe 1.3.0-beta.1. The canonical stable release remains
[1.2.1](https://github.com/headless-company/content-model-master-format/releases/tag/v1.2.1).
Use the exact prerelease version in manifests; selecting this beta must never fall
back to 1.2.0. No stable 1.3.0 release exists yet.

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
specVersion: "1.3.0-beta.1"
namespace: example.project
modelsPath: ./models
defaults:
  required: false
  localisation: false
```

### Manifest Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `specVersion` | string | yes | Semver spec version. In CMMF 1.3.0-beta.1 this must be `"1.3.0-beta.1"`. |
| `namespace` | string | yes | Unique namespace for the model set. |
| `modelsPath` | string | no | Relative path to model files. |
| `defaults` | object | no | Default values applied by tooling when omitted in model files. |

Legacy compatibility note:

- pre-semver manifests may use `specVersion: 1` to indicate the original v1 release
- semver-based manifests should use a quoted string such as `"1.3.0-beta.1"`

### Supported Defaults in 1.3.0-beta.1

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
- `validationHints` — non-empty array of document-level validation hints (section 12).

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

### Supported Validation Keys in 1.3.0-beta.1

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

Validation semantics are intentionally lightweight in 1.3.0-beta.1. CMS translators may need to map these into platform-specific constraints. See the deeper discussion in [docs/validations.md](../docs/validations.md).

### Document-Level Validation Hints

An optional model-level `validationHints` array declares conditional and cross-field
validation intent. It is non-authoritative: a valid hint does not itself enforce
content constraints. CMMF defines its declaration and meaning, not an evaluation
engine. Malformed declarations are invalid CMMF; content that fails a well-formed
hint does not invalidate the model definition. Field-level constraints continue
to belong in field-level `validations`.

```yaml
validationHints:
  - id: external-requires-source
    description: External articles must provide a source URL.
    when:
      field: article_type
      equals: external
    then:
      require: [source_url]
```

The referenced fields must be declared in the same model's `fields` array.

#### Hint Properties

| Property | Type | Required | Meaning |
|---|---|---|---|
| `id` | string | yes | Unique within the model; uses the model/field ID syntax. |
| `description` | string | yes | Human-readable intent, containing at least one non-whitespace character. |
| `severity` | enum | no | `error` (default), `warning`, or `info`; intended severity of a content violation, not translation failure. |
| `when` | condition | no | Trigger for a structured consequence. Omission means unconditional. |
| `then` | action object | when `when` is present | Structured assertions. |
| `expression` | expression object | no | A complete rule in an explicitly named dialect. |

Exactly one representation is permitted per hint:

- structured: `then`, optionally with `when`
- expression: `expression`, with neither `when` nor `then`
- prose: neither `when`, `then`, nor `expression`

Unknown properties in hints, predicates, combinators, actions, and expression
wrappers are invalid. This closed vocabulary does not restrict dialect-specific
properties inside `expression.rule`.

#### Conditions

A predicate contains `field` (a direct field ID) and exactly one operator:

| Operator | Operand | Meaning |
|---|---|---|
| `equals`, `notEquals` | string, number, boolean, or null | Type-sensitive scalar equality or inequality; no coercion. |
| `in`, `notIn` | non-empty array of unique scalars | Scalar value belongs, or does not belong, to the set; type-sensitive. |
| `isEmpty`, `isNotEmpty` | literal `true` | Value is empty or non-empty. |
| `matches` | regex string | Plain-text value matches an ECMAScript pattern, without delimiters or flags; substring matching unless anchored. |
| `gt`, `gte`, `lt`, `lte` | number | Numeric comparison with a constant. |

Alternatively a condition is exactly one combinator, without `field` or other keys:

- `allOf: [condition, ...]` — every condition holds; array must be non-empty
- `anyOf: [condition, ...]` — at least one condition holds; array must be non-empty
- `not: condition` — logical negation

Combinators may nest recursively; no fixed nesting depth is imposed by the format.

Operator compatibility is a semantic requirement:

- `equals`, `notEquals`, `in`, and `notIn` apply only to singular `string`, `text`,
  `slug`, `enum`, `number`, `boolean`, `date`, and `datetime` fields. Non-null
  operands must match the field's scalar type: number for `number`, boolean for
  `boolean`, string for the others. Null is allowed as a literal comparison value.
- `matches` applies only to singular `string`, `text`, `slug`, and `enum` fields.
  Patterns must be syntactically valid. A translator unable to preserve pattern
  behaviour must record the loss rather than silently substituting a pattern.
- Numeric comparisons apply only to singular `number` fields. They do not compare
  date strings or coerce text to numbers.
- Emptiness predicates and all actions support every field type, including lists.
- Repeatability follows `list` and the legacy reference cardinality rules in
  section 11. Scalar operators are not list-membership operators.

Only direct field IDs in this model may be referenced. Nested paths, inspecting
list elements, field-to-field comparisons, and cross-document lookups are outside
the structured vocabulary in this beta.

#### Empty and Missing Values

Empty means: the field is absent, or its value is `null`, the empty string `""`,
or an empty list `[]`. `false`, `0`, whitespace-only strings, and objects (including
`{}`) count as non-empty. This is a presence test, not a test of content validity.

An absent field makes every comparison predicate false, including `notEquals`
and `notIn`. Use `isEmpty` explicitly when absence should trigger a condition.
An explicit null can match a null literal; it differs from an absent field for
comparisons. A present value with an incompatible type makes a comparison false,
including negative comparisons. Other empty values are compared normally where
the operator supports their type. `not` always negates the inner condition,
including a false condition caused by an absent field.

#### Actions

`then` is a non-empty object containing one or more of these actions. Every action
contains a non-empty array of unique direct field IDs. All actions in the object
apply together when `when` holds, or unconditionally if `when` is omitted.

| Action | Meaning |
|---|---|
| `require` | Every listed field must be non-empty, not merely have a key. |
| `forbid` | Every listed field must be empty. |
| `atLeastOneOf` | At least one listed field must be non-empty. |
| `atMostOneOf` | At most one listed field may be non-empty. |
| `exactlyOneOf` | Exactly one listed field must be non-empty. |

These are advisory assertions, not mutations: `forbid` must not delete content.
Hints never weaken field-level `required` or `validations`. Tools may diagnose
contradictory intent; this beta does not require a satisfiability solver.

#### Expressions

```yaml
validationHints:
  - id: quarterly-price-bound
    description: Quarterly price must exceed three times the monthly price.
    expression:
      dialect: jsonlogic
      rule: {">": [{"var": "quarterly_price"}, {"*": [3, {"var": "monthly_price"}]}]}
```

`expression` requires `dialect` and `rule`. Dialect names use lower-kebab-case
matching `^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$`; the vocabulary is open. `rule` may be
any JSON value allowed by that dialect. `jsonlogic` is an example of an existing
language, not a preferred language or a core CMMF dependency.

An expression is a complete assertion under its dialect's semantics, rather than
a trigger for a separate `then`. CMMF defines no coercion, truthiness, or emptiness
overrides for expression languages. No evaluator or dialect support is required.
Expressions are explicitly non-portable and best-effort; no core CMMF tool may
assume they are arbitrary executable scripts. Tools must not execute unknown
dialects. Their scope is still one document: cross-document queries and external
side effects are out of scope. Dialect-aware tools own deeper rule validation.

#### Declaration Checks and Translation

JSON Schema checks declaration shape, including required IDs, closed vocabularies,
and exclusive representations. Semantic checks must additionally verify unique
hint IDs, existing field references, operator/type compatibility, operand types,
and regex syntax. Neither check evaluates content. Prose and expressions cannot
be checked for arbitrary field references by the core schema or semantic checker.

Every hint, including prose-only hints and unknown expression dialects, must receive
a translation disposition: `mapped`, `degraded`, or `unmapped`, identifying both
model ID and hint ID and giving a reason. Editorial guidance without preservation
of the declared checks is `degraded`, not `mapped`. See the
[beta translation contract](./translation-contract-v1.3.0-beta.1.md).

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
- must be non-empty and use only ASCII letters (`A-Z`, `a-z`), digits (`0-9`), `_`, or `-`
- are case-sensitive: `pageTitle` and `pagetitle` are distinct IDs
- must preserve their original casing wherever referenced

Camel case, Pascal case, snake case, and kebab case are all permitted. Translators
must preserve ID casing unless the target platform requires a different form.
Any renaming must be recorded in the decisions log, applied consistently to all
references, and checked for collisions; conflicting IDs must not be silently merged.

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

### Document-Level Validation Hints

- `validationHints`, when present, must be non-empty
- every hint must have an ID unique within its model and a meaningful description
- structured conditions and actions must reference fields in the same model
- operator and operand types must follow section 12
- structured, expression, and prose representations must not be mixed in one hint
- a malformed declaration is invalid regardless of its intended content severity

## 17. Non-Goals for 1.3.0-beta.1

The following are explicitly out of scope in 1.3.0-beta.1:

- permissions
- workflows
- environments
- CMS UI configuration
- custom logic
- computed fields

Document-level validation hints are declarative only. This beta does not define
an evaluation engine, run arbitrary scripts, or support rules spanning documents.
Named expression dialects are non-portable escape hatches, not core custom logic.

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
