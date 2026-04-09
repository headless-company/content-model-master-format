# Why CMMF Exists

## The Problem

Most content models are created inside a specific CMS. That makes the model inseparable from the implementation details of that platform.

In practice, this creates a few recurring problems:

- the same conceptual model is expressed differently in every CMS
- migration work becomes harder because model meaning is implicit
- architecture reviews focus on platform constraints instead of content intent
- tooling becomes platform-specific instead of model-centric

## The Purpose of CMMF

CMMF exists to provide a stable intermediate representation for content modelling.

That means it aims to describe:

- what content exists
- how pieces of content relate to each other
- what structure is essential
- what editorial metadata matters
- what implementation decisions are still open to translators

## Why This Matters

By separating modelling intent from CMS implementation, CMMF makes it easier to:

- compare modelling strategies before committing to a platform
- generate schemas for multiple CMS targets
- validate model quality earlier
- detect poor modelling patterns such as over-normalisation or uncontrolled polymorphism
- document architecture in a way that survives platform changes

## Why You Would Use It

You would use CMMF if you want one or more of the following:

- a master model definition that outlives any individual CMS
- a source format for generators, validators, or visualisation tools
- a shared language for content architects, engineers, and platform teams
- clearer translation boundaries between core modelling and platform-specific implementation

## Why It Is More Than YAML

Although CMMF is expressed in YAML or JSON-compatible structures, it is not "just a config file." It is a modelling language.

That distinction matters because:

- the format itself will need versioning
- backwards compatibility needs to be considered
- format migrations may be needed over time
- translation behaviour needs contracts, not ad hoc assumptions

## What CMMF Does Not Try to Solve in 1.2.0

Version 1 deliberately avoids becoming an all-purpose CMS definition language.

It does not attempt to model:

- permissions
- workflows
- environment management
- CMS UI layouts
- custom executable logic
- computed fields

Those concerns may matter in delivery systems, but they are intentionally outside the core purpose of CMMF.
