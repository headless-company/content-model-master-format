# Relationships and Composition

## Why Relationships Need to Be Explicit

Relationships are one of the areas where CMS platforms diverge most.

If a source model only says "this field points to another thing" without saying how that relationship behaves, translators are forced to guess. CMMF makes relationship intent explicit so that downstream choices can be made deliberately and logged clearly.

## Object Versus Reference

The first important distinction is between `object` and `reference`.

### `object`

Use `object` when the field is conceptually embedded structure.

This usually means:

- it exists as part of the parent content
- it does not have an independent editorial identity
- its lifecycle is typically tied to the parent

### `reference`

Use `reference` when the field points to another model with its own identity.

This usually means:

- the related content can exist independently
- the related content may be reused elsewhere
- editorial ownership may be separate from the parent entry

## Relationship Options

The `relation` object adds more detail to reference semantics.

### `cardinality`

Defines whether the relationship is singular or plural.

- `one`
- `many`

This helps translators choose between single-reference and list/reference-array constructs.

### `ownership`

Defines the intended ownership model.

- `linked`
- `contained`

`linked` means the related item is conceptually separate. `contained` means the parent conceptually owns the related item, even if the target CMS forces that content into a separate implementation shape.

This is especially important because two translators might implement `contained` differently while still preserving the same source intent.

### `ordered`

Indicates whether order matters.

This matters for:

- page composition
- curated lists
- sequences and journeys

### `uniqueItems`

Indicates whether duplicates are allowed.

### `minItems` and `maxItems`

Define list size constraints.

## Why `contained` Is Valuable

`contained` is one of the most important signals in the model because it separates conceptual ownership from technical implementation.

For example, a contained relationship might become:

- a nested embedded structure in one CMS
- a separate type hidden behind a parent editor in another
- a first-class content type with translator-managed containment rules in a more limited platform

Without an explicit containment signal, those translations can drift in meaning.

## Lists in CMMF

CMMF intentionally handles lists in two different ways:

- primitives and objects use `list: true`
- references use `relation.cardinality: many`

This distinction helps preserve the difference between "a list of values or embedded structures" and "a plural relationship to independent content."

## What Explicit Relationships Enable

Stronger relationship modelling enables better tools, including:

- translators that can explain their decisions
- validation that detects suspicious patterns
- diagrams that distinguish embedding from linking
- architecture reviews that focus on modelling intent instead of raw field syntax
