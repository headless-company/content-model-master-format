# Changelog

All notable changes to CMMF will be documented in this file.

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
