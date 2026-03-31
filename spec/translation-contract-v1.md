# CMMF Translation Contract v1

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
- how governance metadata is preserved or omitted
- how non-authoritative translation hints influence output

## Non-Negotiable Behaviour

A translator must not:

- mutate the meaning of the source model silently
- ignore required constraints without reporting them
- drop relationship semantics without a logged decision
