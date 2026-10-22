# CMMF Translation Contract 1.3.0-beta.1

**Status: experimental prerelease.** Applies to the exact `1.3.0-beta.1` input
version. Stable 1.2.0 remains available on the stable release and `main`.
Unsupported spec versions must be reported; a translator must not silently
interpret beta input as 1.2.0.

## Purpose

This document defines the minimum contract for translating CMMF models into a target CMS schema.

It does not define translator implementation details. It defines what a translator must accept, produce, and explain.

## Input

The translator must accept:

- one CMMF manifest
- one or more CMMF model files
- an explicit target platform identifier
- an optional translation mode
- optional translator configuration

For CMMF 1.3.0-beta.1, translators should treat field-level `list` as the canonical repeatability signal. Translators may also accept legacy `relation.cardinality` on reference fields for compatibility.

## Output

The translator must produce:

- target platform schema artefacts
- a decisions log
- validation errors and warnings, if any

## Decisions Log

The decisions log should record non-trivial translation choices, including:

- how `contained` ownership was represented
- how object structures were mapped
- how unsupported validations were handled
- the disposition of every model-level `validationHints` declaration
- how unsupported `richTextConfig` capabilities were handled
- whether legacy `relation.cardinality` input was normalised to `list`
- any target-required ID renaming, including the original and generated IDs
- any inferred defaults or fallbacks
- any platform limitations or lossy mappings

## Translation Modes

Suggested modes for future translators:

- `strict`: preserve intent as literally as possible
- `optimised`: adapt output for target-platform best fit

## Allowed Variation

The following may vary by translator and target platform:

- whether contained relationships become embedded objects or separate types
- how editorial metadata is represented
- how `richTextConfig` capabilities map onto target editor features
- how governance metadata is preserved or omitted
- how non-authoritative translation hints influence output

## Non-Negotiable Behaviour

A translator must not:

- mutate the meaning of the source model silently
- change ID casing unless required by the target platform
- rename IDs without logging the mapping and updating every reference
- silently merge distinct source IDs that collide after target-required renaming
- ignore required constraints without reporting them
- silently widen `richTextConfig` allowlists when the target editor cannot enforce them
- drop relationship semantics without a logged decision
- silently accept conflicting `list` and legacy `relation.cardinality` values on the same field
- silently drop a document-level validation hint, including prose or an unknown dialect
- treat a hint as permission to weaken authoritative field requirements

## Document-Level Hint Dispositions

Each hint must receive a record containing the source model ID, hint ID, a
disposition, and a non-empty reason. This is a required information contract;
the log's file format, filename, and property names are translator-defined.

| Disposition | Meaning |
|---|---|
| `mapped` | The declared intent and severity are preserved by the generated target checks, whether native or explicitly generated custom validation. |
| `degraded` | Part of the intent survives, but checks or severity are weakened; explain exactly what was lost. |
| `unmapped` | No usable target representation was produced; explain why. |

Preserving description text as editorial guidance without preserving the declared
checks is `degraded`. An unknown expression dialect may be `degraded` if meaningful
editorial guidance is generated, or `unmapped` otherwise. No dialect is implicitly
supported. Prose-only hints must also be accounted for; guidance alone is recorded
as `degraded` so it cannot be mistaken for generated validation.

Illustrative YAML (not a prescribed serialization):

```yaml
decisionsLog:
  - modelId: article
    hintId: external-requires-source
    disposition: degraded
    reason: >-
      This Contentful-targeting translator generated editorial help text only.
      It did not generate a custom app or other validation integration, so
      conditional non-empty source_url is not enforced.
  - modelId: article
    hintId: author-or-source
    disposition: mapped
    reason: >-
      Generated custom document validation checks non-empty author or source_url
      using the CMMF empty-value definition and reports the declared severity.
```

These are examples of translator output, not claims that CMMF provides a
Contentful integration or guarantees native support. If one hint cannot be fully
represented, the translator must report it even in an optimised translation.
Whether translation aborts is a documented translator policy; hint severity alone
does not require translation to abort.
