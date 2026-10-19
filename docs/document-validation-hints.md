# Document-Level Validation Hints

**Experimental: CMMF 1.3.0-beta.1.** This branch defaults to the beta throughout.
Declare `specVersion: "1.3.0-beta.1"` in the manifest. Stable 1.2.0 remains
canonical on `main`; adopting hints requires explicitly selecting the beta.

## Why Model-Level Hints Exist

Some intent belongs to a whole document: an external article needs a source URL;
an article needs an author or a source; search exclusion needs an explanation.
Field-level `validations` cannot describe these dependencies by themselves.

`validationHints` captures that intent without promising universal CMS support.
A hint does not enforce content checks by itself. Translators must explain what
they preserved, weakened, or could not map. Studio and other editors can use the
structured declarations without executing expressions.

## Three Representations

Every hint requires an `id` and meaningful `description`. IDs use the same syntax
as field IDs and are unique within the model. Severity defaults to `error`, with
`warning` and `info` also available. Each hint uses exactly one representation.

### Structured Intent

```yaml
validationHints:
  - id: external-requires-source
    description: External articles must provide a source URL.
    when:
      field: article_type
      equals: external
    then:
      require: [source_url]

  - id: author-or-source
    description: Provide an author or a source URL.
    then:
      atLeastOneOf: [author, source_url]
```

`when` is optional; `then` is required for structured hints. Conditions can nest
using `allOf`, `anyOf`, and `not`. Predicates have a direct `field` ID and exactly
one operator. Actions are `require`, `forbid`, `atLeastOneOf`, `atMostOneOf`, and
`exactlyOneOf`. Multiple actions in one `then` apply together. `forbid` describes
an expected empty field; it never authorises deletion of content.

All structured references resolve to fields in the same model. No nested paths,
list-element inspection, or cross-document rules are supported by this vocabulary.

### Existing Expression Languages

```yaml
validationHints:
  - id: quarterly-price-bound
    description: Quarterly price must exceed three times the monthly price.
    expression:
      dialect: jsonlogic
      rule: {">": [{"var": "quarterly_price"}, {"*": [3, {"var": "monthly_price"}]}]}
```

Expressions use an existing, explicitly declared language. CMMF does not invent
an expression language or require any implementation. `jsonlogic` is an example,
not a preferred default. The `rule` follows that dialect's semantics, including
its own truthiness and coercion. CMMF's structured emptiness rules do not override
them. Rules may concern only the current document, without external side effects.

An expression is the whole assertion; it cannot share a hint with `when` or
`then`. Expressions are best-effort and non-portable. Unknown dialects must never
be executed. The core checker validates the wrapper, not the dialect's rule.

### Prose

```yaml
validationHints:
  - id: check-source-rights
    description: Confirm permission to republish external source material.
    severity: info
```

Prose keeps intent available when no structured declaration fits. It still has an
ID, and translators must still log its disposition. A prose hint must not have a
`when`: a trigger without a consequence would be ambiguous.

## Presence Is Not Truthiness

`require` means non-empty, not just that a key exists. Empty means absent, `null`,
`""`, or `[]`. `false`, `0`, whitespace-only strings, and `{}` are non-empty.
All actions and the `isEmpty` / `isNotEmpty` predicates use that definition.

Comparisons do not coerce types: `1` differs from `"1"`. They apply to singular
scalar fields; numeric comparisons apply only to numbers. `in` compares a scalar
with a set, rather than inspecting list members. `matches` applies to plain-text
fields and uses an ECMAScript regex string without delimiters or flags.

An absent field makes comparison predicates false, even `notEquals` and `notIn`.
Use `isEmpty` to test absence explicitly. `not` negates normally, so
`not: {field: article_type, equals: external}` is true if `article_type` is absent.
Null can be compared explicitly; incompatible present types make comparisons false.
The [normative spec](../spec/cmmf-v1.3.0-beta.1.md#conditions) defines the type matrix.

## Declaration Validity and Translation

A malformed hint makes the declaration invalid regardless of its severity.
A valid hint whose assertion fails for some content does not make the model
definition invalid. See [the three validation concerns](./validations.md).

The schema checks structure. The declaration checker adds field resolution,
unique IDs, type compatibility, and regex syntax. Neither evaluates content or
expressions. Try the [article](../examples/models/article.yaml) and
[subscription](../examples/models/subscription.yaml) examples with `npm run validate`.

Every translated hint must have a disposition identifying the model and hint,
with a reason: `mapped`, `degraded`, or `unmapped`. Guidance text without preserved
checks is `degraded`; an unknown dialect without usable output is `unmapped`.
See the [worked log](./translation-concepts.md#document-level-hint-decisions) and
[translation contract](../spec/translation-contract-v1.3.0-beta.1.md).
