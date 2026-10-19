# Repository and File Structure

## Recommended Layout

```text
.
|-- README.md
|-- docs
|-- examples
|   |-- manifest.yaml
|   `-- models
|-- schemas
|-- scripts
|-- test
`-- spec
```

## Why the `examples` Folder Exists

The `examples` folder exists to demonstrate the format, not to define the repository itself.

Using `examples` instead of `content-model` makes that intent explicit:

- it tells readers these files are illustrative
- it avoids implying there is only one valid project structure
- it creates room for future example sets without changing the core spec

## Folder Roles

### `docs`

Contains explanatory documentation. These files answer "why," "when," and "how should I think about this?"

### `spec`

Contains normative material. These files answer "what is the format?" and "what are the formal rules?"

### `schemas`

Contains machine-readable validators such as JSON Schema.

### `examples`

Contains example manifests and model definitions that show the specification in practice.

## Manifest and Models

The example content set uses:

- [examples/manifest.yaml](../examples/manifest.yaml) for project-level defaults and discovery
- [examples/models](../examples/models/) for individual model definitions

## Why Separate Docs from Spec

A common documentation failure is forcing one file to do both teaching and formal definition. That usually makes it too shallow for learners and too vague for implementers.

Separating `docs` from `spec` helps in two ways:

- the spec can stay crisp and authoritative
- the docs can go deeper on rationale, tradeoffs, and interpretation

## Beta Declaration Tooling

This branch targets 1.3.0-beta.1. `scripts/validate-models.mjs` checks beta model
declarations, and `test/` contains schema and semantic regression tests. These
are specification support tools, not a content evaluation engine or CMS translator.
See [beta adoption](./beta-testing.md) for exact source/version selection.
