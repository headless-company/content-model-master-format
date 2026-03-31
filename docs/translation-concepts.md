# Translation Concepts

## Why Translation Needs Its Own Mental Model

CMMF is designed as a source format, not as a direct declaration of one CMS implementation.

That means translation is not a mechanical copy step. It is a controlled decision-making process that maps source intent into a target platform.

## Why Translation Is Not Fully Deterministic

Two translators can produce different but valid outputs from the same CMMF input.

For example, a contained structure may become:

- an embedded object in one platform
- a separate content type in another
- a reusable block schema in a third

The important thing is not that every target looks the same. The important thing is that the source intent is preserved and translation decisions are explicit.

## What Translators Should Preserve

A translator should preserve:

- model identity
- field identity
- content structure
- relationship semantics
- meaningful validation intent
- important editorial metadata where feasible

## What Translators May Need to Decide

A translator may need to decide:

- whether to inline or split structures
- how to represent contained ownership
- how to handle unsupported validation features
- how to represent settings and taxonomy constructs
- how much to optimise for target-platform conventions

## Why a Decisions Log Matters

Without a decisions log, translators become black boxes. That makes debugging, governance, and architecture review much harder.

A good decisions log explains:

- which choices were fixed by spec
- which were inferred
- which were target-platform compromises
- which were lossy

## Recommended Modes

Future translators will likely benefit from explicit modes such as:

- `strict`
- `optimised`

`strict` focuses on preserving source intent as directly as possible. `optimised` allows more adaptation for target-platform fit, while still documenting those adaptations.
