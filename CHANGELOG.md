# Changelog

All notable changes to CMMF will be documented in this file.

## 1.3.0-beta.1 (prerelease)

### Added

- Optional model-level `validationHints` with required IDs and descriptions,
  severity, recursive structured conditions, and five presence-based actions.
- Mutually exclusive structured, named-dialect expression, and prose forms.
- Explicit empty-value, strict comparison, missing-value, and operator/type rules.
- Required per-hint translation dispositions with model/hint identity and reasons.
- Beta specification and translation contract, guide, examples, declaration checker,
  regression tests, and CI checks.

### Changed

- The feature branch's default schema, documentation, and example manifest target
  `1.3.0-beta.1`. Historical 1.1.0 and 1.2.0 specifications remain unchanged.
- Validation guidance distinguishes format, declaration semantics, and content checks.

### Fixed

- Incorporate the 1.2.1 ID casing fix: model, field, and hint IDs and all
  structured hint field references accept uppercase ASCII letters.
- Preserve case-sensitive identity and require logged, collision-checked
  target-required renaming. Add shared ID tests and beta reference regressions.
- This fix is on the feature branch after the published `v1.3.0-beta.1` tag;
  the existing tag remains immutable. See the beta testing guide for how to
  test the corrected branch.

### Migration and Release Notes

- Experimental prerelease on `feature/validation-hints`; not merged into `main`.
- Stable `v1.2.1` is canonical and GitHub's latest stable release. Consumers
  must explicitly opt into the beta and pin `specVersion: "1.3.0-beta.1"`.
- No stable `1.3.0` release exists. No beta request may silently fall back to 1.2.
- Field-level validations and existing structures retain their meaning. Adopting
  this feature does not require migrating models that stay on stable 1.2.
- The existing 1.2 JSON Schema permits unknown model properties, so it may silently
  accept `validationHints` without checking them. Acceptance is not feature support.
- Hints do not execute validation. The included checker validates declarations;
  Studio adoption and other consumer implementations are separate work.

## 1.2.1

### Fixed

- Allow uppercase ASCII letters in model and field IDs, including camelCase and
  PascalCase. IDs are case-sensitive and references preserve their casing.
- Require translators to record target-required ID renaming, update references,
  and detect collisions rather than silently merging distinct IDs.
- Add automated ID syntax and example validation checks to prevent regressions.

### Compatibility

- Existing lowercase IDs remain valid without changes. Historical 1.2.0
  specifications and release tags remain unchanged.
- Manifests adopting this patch declare `specVersion: "1.2.1"` and use the matching
  schema. Validators pinned to 1.2.0 still reject uppercase IDs.

## 1.2.0

### Changed

- Changed repeatability to use field-level `list` as the canonical convention for all field types, including `reference`.
- Changed the 1.2.0 specification and examples to use `list: true` for repeatable references instead of `relation.cardinality: many`.
- Changed reference documentation and the JSON Schema validator to describe `relation.cardinality` as a legacy compatibility alias.

### Migration Notes

- Reference fields that used `relation.cardinality: many` should migrate to `list: true`.
- Reference fields that used `relation.cardinality: one` can omit both `list` and `relation.cardinality`.
- Translators and validators should continue accepting legacy `relation.cardinality` on reference fields during migration.
- Models should treat conflicting `list` and `relation.cardinality` values as invalid.

## 1.1.0

### Added

- Added `richTextConfig` for `richText` fields to express intended editor capabilities through `marks`, `blocks`, and `embeds`.
- Added schema validation for `richTextConfig`, including conditional support for `asset` and `reference` embeds.
- Added translator contract guidance for handling unsupported or lossy `richTextConfig` mappings.

### Changed

- Changed `specVersion` from a numeric major version to a semver string, with `1.1.0` as the current version.
- Changed the normative spec and translation contract filenames to versioned `1.1.0` documents.
- Changed examples and reference docs to use semver-based spec versioning and `richTextConfig`.

### Migration Notes

- Legacy manifests may continue using `specVersion: 1` to indicate the original v1 release.
- Semver-based manifests should use a quoted string such as `specVersion: "1.1.0"`.
