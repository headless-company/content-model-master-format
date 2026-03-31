# Model Kinds

## What Kinds Are

A model `kind` describes the role a model plays in the content system.

Kinds are not just labels for organisation. They express architectural intent that can guide validation, translation, and platform-specific modelling decisions.

## Why Kinds Matter

Without kinds, every model looks like just another structure with fields. That hides an important distinction between things like:

- a publishable standalone entry
- a reusable component
- an embedded object
- a taxonomy or classification structure
- a singleton settings model

By making those roles explicit, CMMF allows tools and translators to treat models differently while preserving a shared source definition.

## Supported Kinds in v1

### `entry`

An `entry` is standalone content.

Typical characteristics:

- can often exist independently
- usually has its own editorial lifecycle
- is commonly translated into a top-level content type in a CMS

Examples:

- article
- page
- person

### `component`

A `component` is a reusable composable block.

Typical characteristics:

- designed to be assembled into larger content structures
- may be reused across entries
- may translate into a component/block type, or sometimes into a full type depending on CMS capabilities

This kind is valuable because many CMSs distinguish between content entries and composable blocks, but they do so differently.

### `object`

An `object` represents an embedded structure.

Typical characteristics:

- carries structure but is not inherently standalone
- often travels as part of another model
- may translate to an inline object, embedded type, or separate reusable schema depending on the target platform

This is one of the most important examples of why `kind` exists. The source intent may say "this is an object-shaped structure," while a translator may still choose between:

- an inline embedded object
- a reusable embedded schema
- a dedicated content type if the target platform requires it

The source kind preserves the conceptual role even when implementation choices differ.

### `taxonomy`

A `taxonomy` is a classification model.

Typical characteristics:

- used to categorise or organise content
- often behaves differently from editorial entries
- may translate into tags, categories, or dedicated classification types

### `settings`

A `settings` model represents singleton or global configuration.

Typical characteristics:

- intended to exist once per environment, locale, or project scope
- often maps to global settings in a CMS
- may need special translator behaviour to enforce singleton semantics

## What Kinds Allow Us to Do

Kinds create space for intelligent tooling. For example, a translator can use kind information to:

- decide whether a model should become a top-level content type
- decide whether a model is more naturally embedded than linked
- apply platform-specific conventions to taxonomies and settings
- generate clearer diagrams and editor documentation
- run better model-quality checks

## Kinds and Translation

Kinds do not fully determine translation output. They guide it.

For example, an `object` kind might become:

- an inline object in Sanity
- a nested object schema in another system
- a separate content type in a platform that does not support rich embedded structures

Likewise, a `component` might become:

- a block schema
- a modular content type
- a union of reusable element definitions

The value of CMMF is that the source role stays consistent even when the translation shape changes.

## Kinds and Validation

Kinds also create future opportunities for validation rules such as:

- warning when a `settings` model is not marked singleton in translation
- flagging references from `object` models that make embedding semantics unclear
- detecting `taxonomy` models that are being treated as generic entries without classification intent
