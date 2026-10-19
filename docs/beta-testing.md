# Adopting the 1.3 Beta

This release is **1.3.0-beta.1**, published from `feature/validation-hints` as a
GitHub prerelease. It is not merged into `main`. Stable `v1.2.0` remains canonical
and retains GitHub's Latest stable status. This branch defaults to the beta;
there is no second feature flag or 1.2 fallback inside the beta.

## RFC and Implementation

This beta implements [RFC #1: document-level validation hints](https://github.com/headless-company/content-model-master-format/issues/1).
The implementation was introduced in commit
[`a0c7a3d`](https://github.com/headless-company/content-model-master-format/commit/a0c7a3d87fe46d74b5e78ac851e8b156201376a4).
The beta specification resolves the RFC's open questions: hint IDs are required,
structured and expression forms cannot share a hint, and translation dispositions
must identify both model and hint with a reason. The normative beta documents
define the implemented behaviour where the original proposal differs.

The RFC remains open while the beta is tested. This branch's draft PR is for
review; merging and stable promotion remain separate decisions.

## Pin the Source and Manifest

Use tag `v1.3.0-beta.1` for reproducible testing, rather than the moving branch.
The manifest must declare the exact version:

```yaml
specVersion: "1.3.0-beta.1"
namespace: example.beta
modelsPath: ./models
```

Version-pinned resources:

- [Model schema](https://raw.githubusercontent.com/headless-company/content-model-master-format/v1.3.0-beta.1/schemas/model.schema.json)
- [Specification](https://github.com/headless-company/content-model-master-format/blob/v1.3.0-beta.1/spec/cmmf-v1.3.0-beta.1.md)
- [Translation contract](https://github.com/headless-company/content-model-master-format/blob/v1.3.0-beta.1/spec/translation-contract-v1.3.0-beta.1.md)

Consumers requesting this beta must load its schema and specification together.
Do not validate a beta manifest using the 1.2 schema: that schema allows unknown
properties and can silently ignore hints. Do not treat structural acceptance by
an old schema as compatibility. A generic stable/latest selection continues to
select 1.2. If a UI offers a shorthand such as “1.3 beta”, resolve it explicitly to
`1.3.0-beta.1` and persist the exact version. Bare `1.3` or `1.3.0` is not a beta
manifest version and must not imply an unpublished stable release.

## Check Declarations

From a checkout of the beta tag, with Node.js 22 or later:

```sh
npm ci
npm run check
node scripts/validate-models.mjs --manifest /path/to/manifest.yaml
```

`npm run check` runs regression tests and validates the bundled example set.
The CLI exits nonzero for invalid declarations, parsing errors, and unsupported
manifest versions. It does not evaluate content, execute expressions, or rewrite
files. [Validation guidance](./validations.md) lists its precise scope.

## Studio Integration Checklist

This release supplies the specification and declarations; it does not modify Studio.
When adopting it in Studio:

- Explicitly select and record the beta version; keep stable projects on their
  declared version without silently upgrading them.
- Load the beta schema, preserve hints on import/export, and expose stable hint IDs.
- Check declaration shape and semantic errors without implying that content checks
  are running. The checker exports `validateModel(model)` for declaration checks.
- Present structured, expression, and prose hints as distinct forms. Preserve
  unknown expression dialects without executing them.
- Test absent/null/empty values, `false` and `0`, nested conditions, list presence,
  malformed references, and unknown dialects against the normative meanings.
- If Studio generates translator output, record every hint's disposition and reason.

## Iteration and Promotion

Further experiments should use new immutable tags such as `v1.3.0-beta.2` and
matching manifest/schema/spec versions. Never move an existing beta tag. Keep beta
releases marked prerelease and excluded from Latest stable. Promotion to stable
1.3.0 and merging into `main` require a later explicit decision after testing;
publishing this beta does not perform either action. The public documentation site
is not changed by this release.
