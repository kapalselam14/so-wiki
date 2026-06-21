---
name: code-building
description: Implement an approved software change in the Seal Online Wiki with focused edits, tests, verification, and documentation. Use when requirements and acceptance criteria are clear and code must be created, modified, refactored, or fixed; do not use when the task still needs architecture planning or when only a review is requested.
---

# Code Building

## Purpose

Implement approved work safely and predictably while preserving unrelated behaviour.

Always follow the repository `AGENTS.md`, the accepted implementation plan, and any nested instructions.

## Preconditions

Before editing:

1. Read the task, acceptance criteria, and approved plan.
2. Read `AGENTS.md` and relevant documentation.
3. Inspect the existing implementation and related tests.
4. Check `git status` and preserve existing user work.
5. Identify the smallest set of files that must change.
6. Confirm whether the task requires:
   - a database migration
   - an environment variable
   - a new dependency
   - API-contract changes
   - documentation updates
7. State material assumptions before relying on them.

If architecture or requirements are still unclear, stop and request the `software-planner` role or the `backend-design`/`frontend-design` skill as appropriate.

## Implementation principles

- Make the smallest defensible change.
- Follow existing architecture and naming conventions.
- Avoid unrelated refactoring.
- Preserve public behaviour unless a breaking change is explicitly approved.
- Reuse existing helpers and patterns before adding abstractions.
- Keep functions focused.
- Validate user input and external data.
- Handle expected failures explicitly.
- Do not add silent `catch` blocks.
- Do not expose secrets, stack traces, or internal database errors.
- Do not modify generated files unless required.
- Do not add a production dependency without justification.
- Update `.env.example` when introducing an environment variable.
- Use a new migration for database schema changes.
- Do not edit an already-applied migration.

## Work in checkpoints

For a non-trivial task, implement in small checkpoints:

1. Shared types or schemas
2. Database migration or repository changes
3. Service and business logic
4. API routes or controllers
5. Frontend data access
6. UI behaviour
7. Tests
8. Documentation
9. Final verification

Adjust the order to match actual dependencies.

After each checkpoint, inspect the diff and run the narrowest useful test.

## Backend rules

Where the repository follows layered Fastify modules:

- routes register endpoints and schemas
- controllers handle HTTP coordination
- services contain business logic
- repositories perform data access
- schemas validate requests and responses

Keep route handlers small. Use fewer layers only when the existing codebase does so and the feature is genuinely simple.

## Frontend rules

- Use functional React components.
- Put domain code in the relevant feature directory.
- Keep presentational components separate from data-access logic where practical.
- Access normal application data through the API.
- Implement loading, error, empty, and success states.
- Preserve keyboard accessibility and semantic HTML.
- Check responsive behaviour for affected layouts.

## Data-retrieval rules

Keep the pipeline separated:

`Fetch -> Parse -> Normalise -> Validate -> Load`

Use saved fixtures for parser tests. Make imports safe to rerun and protect against duplicates.

## Tests

Add or update focused tests for changed behaviour.

Cover applicable cases:

- success
- invalid input
- missing resource
- empty data
- boundary values
- duplicate operations
- external-service failure
- database failure
- loading and error UI states
- regression of the reported bug

A bug fix should normally include a regression test that fails before the fix and passes after it.

## Verification

Run the narrowest relevant checks first, then broader checks.

Typical commands include:

- `npm run lint`
- `npm run test`
- `npm run typecheck`
- `npm run build`

Use repository-specific commands discovered from `package.json`.

Do not state that a command passed unless it was run successfully. Distinguish:

- code failures
- test failures
- environmental failures
- missing tooling
- unrelated pre-existing failures

## Diff review

Before finishing:

1. Run `git diff --check` where available.
2. Review `git diff`.
3. Confirm no secret or local environment file was added.
4. Confirm no unrelated file was changed.
5. Confirm generated output was not committed unintentionally.
6. Confirm acceptance criteria are addressed.
7. Confirm documentation is current.

## Completion report

Report:

- summary
- files changed
- behaviour added or changed
- migrations created
- dependencies added, with justification
- tests added or updated
- exact commands run
- actual results
- assumptions
- limitations
- unresolved issues
- recommended next step

Do not mark the task complete if acceptance criteria were not verified.
