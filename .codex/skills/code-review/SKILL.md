---
name: code-review
description: Perform a read-only review of a branch, commit, pull request, or working-tree diff for correctness, regressions, security, data integrity, architecture violations, and missing tests. Use after implementation or before merge; do not use to implement fixes or to report subjective style preferences as defects.
---

# Code Review

## Purpose

Provide an independent, evidence-based review of changed code.

Remain read-only. Do not edit files, apply patches, install packages, or quietly fix findings.

Always follow `AGENTS.md` and relevant repository documentation.

## Establish review scope

Determine what is being reviewed:

- working-tree changes
- staged changes
- a commit
- a branch compared with its base
- a pull request
- specified files

Identify the intended behaviour and acceptance criteria. If they are unavailable, infer cautiously from the task and existing tests, and label that inference.

Inspect:

- the full diff
- enough surrounding code to understand behaviour
- related schemas, migrations, tests, and documentation
- callers and consumers of changed APIs
- existing conventions in comparable modules

Do not review only the changed lines when surrounding behaviour affects correctness.

## Review priorities

Review in this order:

1. Functional correctness
2. Behaviour regressions
3. Security
4. Authentication and authorisation
5. Input and external-data validation
6. Database integrity
7. Migration safety
8. API compatibility
9. Concurrency, idempotency, and duplicate handling
10. Error handling
11. Missing or insufficient tests
12. Operational reliability
13. Maintainability risks with practical impact

Avoid reporting formatting, naming preferences, or theoretical improvements unless they create a concrete risk.

## Project-specific checks

### Backend

Check that:

- Fastify inputs are validated.
- Status codes and response shapes are consistent.
- Business logic is not unnecessarily embedded in routes.
- Internal database errors are not exposed.
- secrets are not logged or returned.
- pagination and filtering handle boundaries.
- external calls have appropriate error handling.
- imports are safe to rerun where required.

### Database

Check that:

- schema changes use a new migration.
- constraints match application assumptions.
- foreign keys and delete behaviour are safe.
- indexes support expected queries.
- uniqueness prevents duplicates.
- nullable fields are intentional.
- RLS and privileges are considered.
- migrations are deployable against existing data.
- rollback or forward-fix risks are understood.

### Frontend

Check that:

- data fetching uses the intended API boundary.
- loading, error, empty, and success states work.
- stale state or race conditions are considered.
- forms and user input are validated.
- accessibility regressions are avoided.
- responsive layouts are not obviously broken.
- service-role or private credentials are absent.

### Data retrieval

Check that:

- fetch, parse, normalise, validate, and load stages remain separated.
- malformed and missing fields are handled.
- tests use stable fixtures.
- rate limits and retries are reasonable.
- duplicate imports are prevented.
- partial failures are observable.

## Security checks

Look for:

- committed secrets
- injection vulnerabilities
- unsafe URL or HTML handling
- missing authorisation
- privilege escalation
- overly broad service-role use
- path traversal
- insecure file handling
- sensitive logs
- denial-of-service vectors
- unsafe dependency use

Report only plausible risks supported by the code.

## Test assessment

For each changed behaviour, determine whether tests cover:

- happy path
- invalid input
- missing resource
- empty result
- boundary value
- failure path
- regression scenario
- authorisation where relevant

Do not assume a passing test suite proves correctness. Review whether the tests meaningfully assert behaviour.

## Severity

Use:

- **Critical:** likely severe security compromise, irreversible data loss, or system-wide outage
- **High:** likely user-visible failure, major security issue, significant data corruption, or broken core flow
- **Medium:** credible defect or regression with contained impact
- **Low:** minor but real correctness, reliability, or maintainability risk

Do not inflate severity.

## Finding format

List findings from highest to lowest severity.

For every finding include:

- **Severity**
- **Location:** file and relevant symbol or line
- **Problem**
- **Impact**
- **Evidence or reproduction scenario**
- **Focused recommendation**

Example:

```text
[High] Duplicate import can overwrite unrelated equipment
Location: data-retrieval/src/loaders/equipment.loader.js — upsertEquipment()

Problem:
The upsert conflict target uses `name` only, but equipment names are not unique
across categories.

Impact:
Importing a same-named item from another category can update the wrong record.

Evidence:
...

Recommendation:
Use a composite unique constraint and matching conflict target for
(category_id, normalized_name).
```

## Avoid false positives

Before reporting a finding:

1. Confirm the behaviour in code.
2. Check whether validation or protection exists elsewhere.
3. Inspect relevant tests.
4. Consider the actual runtime and data model.
5. State uncertainty when confirmation is not possible.

Do not invent missing requirements.

## Output

Use this structure:

1. Findings
2. Open questions or assumptions
3. Test gaps
4. Review scope
5. Overall merge assessment

If there are no meaningful findings, state:

> No material correctness, security, data-integrity, or regression issues were identified in the reviewed scope.

Then describe what was reviewed and any checks that could not be completed.

Do not provide a long praise section. Do not modify the implementation.
