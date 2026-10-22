<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/brand/assets/cmmf-expanded-gradient-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/brand/assets/cmmf-expanded-gradient-light.svg">
  <img alt="CMMF — Content Model Master Format" src="docs/brand/assets/cmmf-expanded-gradient-light.svg" width="550">
</picture>

# Content Model Master Format (CMMF)

CMMF is a CMS-agnostic content modelling language for defining content structures, editorial intent, and translation-ready metadata in a portable format.

This branch contains **CMMF 1.3.0-beta.1**, an experimental prerelease adding
model-level `validationHints` for conditional and cross-field intent. The default
specification, documentation, JSON Schema, checker, and examples all target this beta.

**The canonical stable version remains 1.2.1.** Use
[the stable release](https://github.com/headless-company/content-model-master-format/releases/tag/v1.2.1)
or [`main`](https://github.com/headless-company/content-model-master-format/tree/main)
for stable material. This feature branch is not merged into `main`.

## Start Here

- Read the documentation index in [docs/index.md](./docs/index.md).
- Read the normative spec in [spec/cmmf-v1.3.0-beta.1.md](./spec/cmmf-v1.3.0-beta.1.md).
- Read the [document-level validation hints guide](./docs/document-validation-hints.md).
- Review the [beta translation contract](./spec/translation-contract-v1.3.0-beta.1.md).
- Review release history in [CHANGELOG.md](./CHANGELOG.md).
- Validate model files with [schemas/model.schema.json](./schemas/model.schema.json).
- Explore sample files under [examples](./examples/).
- Review visualisation guidance in [docs/visualisation.md](./docs/visualisation.md).

The branch includes the **1.2.1 ID casing fix**: model and field IDs support
camelCase and PascalCase and are case-sensitive. Stable patch material is in
[the 1.2.1 specification](./spec/cmmf-v1.2.1.md). The published `v1.3.0-beta.1`
tag predates this fix; use the feature branch instructions in the beta guide
to test it.

## Try the Beta

```sh
git clone --branch v1.3.0-beta.1 https://github.com/headless-company/content-model-master-format.git
cd content-model-master-format
npm ci
npm run check
node scripts/validate-models.mjs --manifest /path/to/manifest.yaml
```

Requires Node.js 22 or later. Declare `specVersion: "1.3.0-beta.1"` in beta
manifests. The checker validates declarations, not content, and never executes
expressions. See [beta adoption and release policy](./docs/beta-testing.md) for
pinned schema URLs, consumer guidance, and limitations. No stable `1.3.0` is
published; tools must not silently substitute another version.

## Repository Layout

```text
.
|-- README.md
|-- docs
|-- examples
|-- schemas
|-- scripts
|-- test
`-- spec
```

## Why CMMF

CMMF gives teams a stable intermediate representation for content modelling. Instead of defining models directly in one CMS and inheriting its assumptions, teams can describe content once, preserve modelling intent, and translate that intent into different platforms with clearer rules and better tooling.
