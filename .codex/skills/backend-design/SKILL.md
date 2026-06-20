---
name: backend-design
description: Design or evaluate backend architecture for the Seal Online Wiki, including Fastify APIs, service boundaries, Supabase schemas, data access, validation, security, and external-data pipelines. Use for backend planning, architecture changes, API design, database design, or cross-module backend decisions; do not use for frontend-only work or routine implementation that already has an approved design.
---

# Backend Design

## Purpose

Design backend changes that are secure, maintainable, testable, and consistent with the repository's existing architecture.

This project normally uses:

- Node.js
- Fastify
- Supabase PostgreSQL
- Shared validation schemas where appropriate
- A data-retrieval pipeline that fetches, parses, normalises, validates, and loads external game data

Always follow the repository `AGENTS.md` and any nested instructions.

## Operating mode

Default to analysis and design.

Do not modify production code unless the user or parent agent explicitly requests implementation. When implementation is requested, produce the design first and obtain a clear scope before editing.

## Required discovery

Before proposing a design:

1. Read `AGENTS.md`, `PLAN.md`, `README.md`, and relevant files under `docs/`.
2. Inspect the current directory structure.
3. Trace the existing request or data flow end to end.
4. Inspect at least one similar module, endpoint, table, migration, or importer.
5. Identify existing conventions for:
   - routes
   - controllers
   - services
   - repositories
   - schemas
   - error responses
   - logging
   - tests
6. Confirm the package manager and available scripts.
7. Separate confirmed facts from assumptions.

Do not invent components that have not been found in the repository.

## Design principles

Prefer the smallest architecture that clearly solves the problem.

Use this flow where it adds value:

`Route -> Controller -> Service -> Repository -> Database`

Apply the responsibilities below:

- **Route:** route registration and request/response schema attachment
- **Controller:** HTTP coordination and status selection
- **Service:** business rules and orchestration
- **Repository:** database access
- **Schema:** request, response, and external-data validation

For genuinely small features, fewer layers are acceptable when they remain clear and testable.

## API design checklist

For each new or changed endpoint, define:

- HTTP method and path
- Purpose
- Authentication or authorisation requirements
- Route parameters
- Query parameters
- Request body
- Validation rules
- Response shape
- Success status
- Error statuses
- Pagination, filtering, and sorting behaviour
- Idempotency expectations
- Rate-limit considerations
- Backward-compatibility impact

Use consistent response structures and do not expose internal database errors or stack traces.

## Database design checklist

For each schema change, define:

- Tables and columns
- Data types
- Primary keys
- Foreign keys
- Nullability
- Defaults
- Unique constraints
- Check constraints
- Indexes
- Cascade behaviour
- Timestamps
- Source or provenance fields
- Row Level Security implications
- Migration and rollback approach
- Seed-data impact
- Duplicate-import prevention

Use new Supabase migrations. Never propose editing a migration that may already have been applied.

Use `snake_case` for database tables and columns unless the repository has a documented alternative.

## External-data pipeline

Design external data handling as separate stages:

1. Fetch
2. Parse
3. Normalise
4. Validate
5. Load

For each stage, specify:

- input
- output
- error behaviour
- retries or rate limiting
- logging
- test fixtures
- duplicate handling
- partial-failure strategy

Treat all third-party data as untrusted. Never write unvalidated external records directly to the database.

## Security review

Consider:

- secret exposure
- Supabase service-role key placement
- authentication and authorisation
- input validation
- unsafe HTML or URLs
- injection risks
- over-broad database privileges
- sensitive logging
- denial-of-service risks
- dependency risks
- rate limits

Frontend code must never receive a Supabase service-role key.

## Reliability and observability

Define where relevant:

- structured logs
- request identifiers
- failure metrics
- health checks
- retry rules
- timeouts
- circuit-breaker needs
- dead-letter or failed-record handling
- operational recovery steps

Do not add infrastructure complexity unless the problem justifies it.

## Testing strategy

Specify relevant tests:

- schema and validation tests
- service unit tests
- repository integration tests
- Fastify route tests
- migration checks
- authorisation tests
- duplicate-import tests
- fixture-based parser tests
- failure-path tests

Include expected commands when known, but do not claim they were run unless they were actually executed.

## Required output

Produce a backend design containing:

1. Problem summary
2. Confirmed current state
3. Assumptions and open questions
4. Constraints
5. Recommended design
6. Alternatives considered
7. API contract
8. Database impact
9. Data-flow description
10. Security considerations
11. Error-handling strategy
12. Testing strategy
13. Migration and rollback plan
14. Files likely to change
15. Ordered implementation stages
16. Acceptance criteria
17. Risks and follow-up work

Use diagrams in Mermaid only when they materially clarify the design and the repository supports Markdown rendering.

## Handoff

End with a concise handoff for the Implementer:

- approved scope
- files likely to change
- implementation order
- tests required
- commands to run
- decisions that must not be changed without replanning
