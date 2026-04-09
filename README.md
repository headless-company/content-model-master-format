# Content Model Master Format (CMMF)

CMMF is a CMS-agnostic content modelling language for defining content structures, editorial intent, and translation-ready metadata in a portable format.

This repository contains the current 1.2.0 specification, reference documentation, a JSON Schema validator, and example model files.

## Start Here

- Read the documentation index in [docs/index.md](./docs/index.md).
- Read the normative spec in [spec/cmmf-v1.2.0.md](./spec/cmmf-v1.2.0.md).
- Review release history in [CHANGELOG.md](./CHANGELOG.md).
- Validate model files with [schemas/model.schema.json](./schemas/model.schema.json).
- Explore sample files under [examples](./examples/).
- Review visualisation guidance in [docs/visualisation.md](./docs/visualisation.md).

## Repository Layout

```text
.
|-- README.md
|-- docs
|-- examples
|-- schemas
`-- spec
```

## Why CMMF

CMMF gives teams a stable intermediate representation for content modelling. Instead of defining models directly in one CMS and inheriting its assumptions, teams can describe content once, preserve modelling intent, and translate that intent into different platforms with clearer rules and better tooling.
