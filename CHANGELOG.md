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

### Migration and Release Notes

- Experimental prerelease on `feature/validation-hints`; not merged into `main`.
- Stable `v1.2.0` remains canonical and GitHub's latest stable release. Consumers
  must explicitly opt into the beta and pin `specVersion: "1.3.0-beta.1"`.
- No stable `1.3.0` release exists. No beta request may silently fall back to 1.2.
- Field-level validations and existing structures retain their meaning. Adopting
  this feature does not require migrating models that stay on stable 1.2.
- The existing 1.2 JSON Schema permits unknown model properties, so it may silently
  accept `validationHints` without checking them. Acceptance is not feature support.
- Hints do not execute validation. The included checker validates declarations;
  Studio adoption and other consumer implementations are separate work.

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
