# Seal Online Wiki — Development Plan

> This document defines the current active milestone for the Seal Online Wiki project.
>
> Keep this file focused on the first backend-server milestone. Move completed milestones to `docs/plans/archive/` when they are no longer active.

---

## 1. Document Control

- **Status:** Active
- **Owner:** pempekRebus
- **Created:** 2026-06-16
- **Last updated:** 2026-06-20
- **Target completion:** 2026-07-31
- **Related issue/branch:** main
- **Primary agent:** software-planner
- **Supporting agents:** project-assistant, implementer, tester, reviewer
- **Relevant skills:** backend-design, code-building, code-review, technical-documenting

---

## 2. Product Vision

Build a reliable and searchable Seal Online information platform that helps players discover and compare structured game data such as:

- Monsters
- Equipment
- Characters and classes
- Maps
- NPCs
- Quests
- Item drops
- Game mechanics

The application should provide structured, consistent, and maintainable information through a web frontend backed by a clear API contract and a normalized data model.

### Learning objective

This project is also a deliberate practice project. Each milestone should improve practical skill in planning, data retrieval, database modelling, API design, implementation, testing, debugging, documentation, and code review.

---

## 3. Project Context

### Current technology stack

- **Frontend:** Planned React and Vite application, not yet present in this repository
- **Backend:** Planned Node.js and Fastify application, not yet present in this repository
- **Database:** Supabase PostgreSQL, with schema and import-time database setup owned by `data-retrieval/`
- **Data retrieval:** Node.js scripts under `data-retrieval/`
- **Validation:** OpenAPI contract exists; no dedicated runtime validation library is present yet
- **Testing:** Backend route tests now exist under `backend/test/`; `data-retrieval/package.json` currently exposes `db:init` and `import:monsters`
- **Package manager:** npm
- **Version control:** Git and GitHub

### Current architecture confirmed in the repository

```text
Fandom API
   |
   v
Fetch -> Parse -> Normalise -> Validate -> Load
                                          |
                                          v
                      Supabase PostgreSQL
                  schema/init owned by data-retrieval
                                          |
                                          v
                                Planned Fastify API
                                          |
                                          v
                                 Planned React Web
```

### Current state

The repository currently contains the data foundation for the backend milestone, but not the backend server itself.

- `data-retrieval/src/clients/fandomClient.js` fetches Fandom HTML through the Fandom API.
- `data-retrieval/src/parsers/monsterParser.js` parses monster sections and normalizes drops, locations, levels, images, and source URLs.
- `data-retrieval/src/services/monsterImportService.js` orchestrates fetch, snapshot, parse, and save flow.
- `data-retrieval/src/repositories/monsterImportRepository.js` writes normalized data into Supabase tables.
- `data-retrieval/src/database/initdb.js` initializes the database from the schema file for the data-retrieval workflow.
- `data-retrieval/database/schema.json` defines the logical normalized schema.
- `data-retrieval/database/schema.sql` creates the current destructive rebuild schema, including RLS public-read policies.
- `docs/openapi.yaml` already defines the first small read-only API contract for:
  - `GET /api/monsters`
  - `GET /api/monsters/{slug}`
  - `GET /api/maps`
- `backend/` now contains the first Fastify app, route modules, controllers, services, repositories, schemas, and tests for the monster/map read API.

### Confirmed gaps

- The project still needs live database integration verification against imported Supabase data.
- The project needs independent review before this backend milestone is considered merge-ready.
- The project needs any final OpenAPI adjustments if real database verification reveals response-shape drift.

---

## 4. Active Milestone

### Milestone name

**First Read-Only Fastify Backend for Monster and Map Data**

### Objective

Design and implement the first backend server for the project in Node.js and Fastify, using the existing normalized Supabase schema as the source of truth and exposing a small read-only API for monsters and maps.

### User value

This milestone gives the future frontend a stable data service instead of coupling UI work directly to Supabase tables or data-retrieval scripts. It also gives users a predictable API surface for browsing monster summaries, monster details, and map lists.

### Business or portfolio value

- Demonstrates end-to-end backend design from contract to implementation
- Demonstrates structured database access over a normalized schema
- Demonstrates API modelling, error handling, and pagination/filter design
- Demonstrates practical Fastify architecture using route, controller, service, and repository responsibilities
- Creates a stable foundation for future frontend and additional entity domains

---

## 5. Scope

### In scope

- Create the first Fastify backend package for the repo
- Implement read-only endpoints for monsters and maps
- Keep the OpenAPI contract aligned with the implemented backend
- Keep database schema, destructive initialization, and import writes inside `data-retrieval/`
- Add backend-side validation for parameters and query strings
- Add repository queries for list and detail reads against the normalized schema
- Add targeted backend tests for success, invalid input, missing resource, and failure paths
- Add backend setup and architecture documentation needed for local development

### Out of scope

- Write, update, delete, or admin endpoints
- Authentication and user accounts
- Frontend page implementation
- New scraper/parser features unrelated to backend consumption
- Expanding the API to NPCs, quests, characters, or full equipment browsing
- Replacing the data-retrieval pipeline
- Moving schema ownership or destructive database initialization into the backend API package

### Non-goals

- This milestone does not attempt to solve the full application architecture in one pass.
- This milestone does not require a shared monorepo package system beyond what is necessary to create the API package cleanly.
- This milestone does not require a public deployment pipeline yet.

---

## 6. Requirements

### Functional requirements

- **FR-01:** The backend must expose `GET /api/monsters` and return a paginated list of monster summaries.
- **FR-02:** `GET /api/monsters` must support the first approved filters from `docs/openapi.yaml`: `search`, `element`, `level_min`, `level_max`, `map_slug`, and `source_page`.
- **FR-03:** The backend must expose `GET /api/monsters/{slug}` and return one monster with `found_at` and categorized `drops`.
- **FR-04:** The backend must expose `GET /api/maps` and return a paginated list of maps with optional `search`.
- **FR-05:** The backend must validate route and query inputs and return a consistent `400` error structure for invalid requests.
- **FR-06:** The backend must return `404` for missing monster slugs.
- **FR-07:** The backend must read from the existing normalized schema without changing importer behaviour.
- **FR-08:** The backend must keep `docs/openapi.yaml` aligned with any final contract adjustments approved during implementation.

### Non-functional requirements

- **NFR-01 — Reliability:** Database failures must not leak raw errors or stack traces to clients.
- **NFR-02 — Performance:** List endpoints must be paginated with default size `20` and maximum size `100`, matching the current contract.
- **NFR-03 — Security:** No Supabase service-role key or database secret may be exposed to frontend code or committed files.
- **NFR-04 — API clarity:** The first backend iteration must remain small and well documented rather than trying to solve every entity domain at once.
- **NFR-05 — Maintainability:** Backend code should follow a clear structure where routes, controllers, services, repositories, and schemas remain understandable and testable.
- **NFR-06 — Observability:** The API should support request logging and clear failure reporting suitable for local debugging.
- **NFR-07 — Compatibility:** The backend must work in the current npm and Node.js ESM repository style.

### Constraints

- The current repo does not yet contain a Fastify app.
- The current repo does not yet contain backend lint, build, or test scripts at the root.
- The current source of truth for API behaviour is `docs/openapi.yaml`.
- The current source of truth for the monster/map/drop data model is `data-retrieval/database/schema.json` and `schema.sql`.
- The current importer uses a Supabase service-role client for writes; the API must not reuse that pattern in any client-facing context.
- The current schema rebuild file is destructive by design and should not become part of normal API runtime behaviour.
- Application modules should remain separated: `data-retrieval/` owns external-data ingestion and database setup, and the backend API owns request handling and read access only.

---

## 7. Assumptions and Open Questions

### Assumptions

- **A-01:** The first backend release only needs monster and map read endpoints.
- **A-02:** Imported monster data already in Supabase is the canonical source for API responses.
- **A-03:** The current OpenAPI draft is intentionally small and should stay small for the first backend iteration.
- **A-04:** The database implementation should stay under `data-retrieval/` so each application module has a clear responsibility.

### Open questions

- **Q-01:** Which server-side data-access strategy should the API use?
  - **Owner:** software-planner
  - **Decision needed by:** 2026-06-22
  - **Status:** Resolved
  - **Resolution:** Use a server-side repository layer with parameterized PostgreSQL queries through `pg` for the first iteration. This gives clearer control over pagination, filtering, joins, and categorized drop aggregation than a first-pass Supabase client query layer.

- **Q-02:** Which runtime validation approach should the API use?
  - **Owner:** software-planner
  - **Decision needed by:** 2026-06-22
  - **Status:** Resolved
  - **Resolution:** Prefer Fastify-native JSON Schema validation for the first iteration to keep dependencies small and stay close to the existing OpenAPI contract.

- **Q-03:** Does this milestone require frontend implementation?
  - **Owner:** product scope
  - **Decision needed by:** 2026-06-20
  - **Status:** Resolved
  - **Resolution:** No. Frontend implementation is explicitly out of scope for this milestone. Only frontend impact and consumer contract alignment need to be considered.

- **Q-04:** Which application module owns database schema initialization and import writes?
  - **Owner:** software-planner
  - **Decision needed by:** 2026-06-20
  - **Status:** Resolved
  - **Resolution:** `data-retrieval/` owns database schema files, destructive initialization, and import writes. The backend API must treat the database as an existing read model and must not run schema rebuilds or imports at runtime.

---

## 8. Recommended Technical Approach

### Summary

Build a small contract-first Fastify API in the existing `backend/` application folder. Keep the first version read-only and focused on `monsters` and `maps`. Use Fastify route modules with JSON Schema validation, thin controllers, service orchestration where needed, and repository queries over the normalized Supabase PostgreSQL schema using `pg`. Keep schema initialization and import writes inside `data-retrieval/`; the API package should only read from the existing database. Keep `docs/openapi.yaml` as the public contract and align runtime response shapes to it.

### Backend approach

- Routes:
  - `GET /api/monsters`
  - `GET /api/monsters/:slug`
  - `GET /api/maps`
- Controllers:
  - Parse validated Fastify request inputs
  - Call services
  - Return `200`, `400`, `404`, or `500` with stable response shapes
- Services:
  - Apply pagination defaults
  - Coordinate detail expansion for locations and categorized drops
  - Keep HTTP concerns out of repository code
- Repositories:
  - Execute parameterized SQL
  - Provide focused read methods such as:
    - `listMonsters`
    - `countMonsters`
    - `findMonsterBySlug`
    - `findMonsterLocations`
    - `findMonsterDrops`
    - `listMaps`
    - `countMaps`
- Schemas:
  - Fastify JSON Schemas mirroring the current OpenAPI contract
  - Shared pagination and error schema helpers where useful
- Error handling:
  - Validation errors -> `400`
  - Missing monster -> `404`
  - Unexpected repository/service failures -> `500`
  - Response structure:
    - success responses: `{ data, meta? }`
    - error responses: `{ error: { code, message } }`

### Database approach

- New tables:
  - None planned for the first backend iteration
- Modified tables:
  - None planned initially
- New constraints:
  - None planned initially
- New indexes:
  - None planned initially; current schema already includes indexes on core monster, map, and join-table lookup paths
- Migration:
  - No schema migration is required to start the first read-only backend
  - For the current modular structure, schema rebuild files remain under `data-retrieval/database/`
  - If production-safe migrations are needed later, decide whether to add a dedicated migration workflow under `data-retrieval/database/migrations/` instead of moving database ownership into the API package
- Duplicate prevention:
  - Already handled by the importer schema and unique indexes
- Row Level Security:
  - Existing schema enables public read RLS policies
  - The backend should still keep database credentials server-side and should not depend on frontend direct access

### Data-retrieval approach

This milestone treats the current importer and database setup as an upstream module rather than redesigning it. The `data-retrieval/` app owns schema files, destructive database initialization, external-data ingestion, and write-side repository code.

1. **Fetch**
   - Input: page names from `data-retrieval/src/config/pages.js`
   - Output: Fandom HTML via `fandomClient.js`
   - Failure behaviour: fetch errors stop the current page import and are logged

2. **Parse**
   - Input: HTML snapshots
   - Output: normalized monster objects from `monsterParser.js`
   - Failure behaviour: malformed sections are skipped by parser logic or surface as parsing failures

3. **Normalise**
   - Input: parsed sections
   - Output: canonical names, slugs, categorized drops, locations, levels, images, and source references
   - Failure behaviour: partial normalization issues should be visible in logs or saved snapshots

4. **Validate**
   - Schema: currently implicit in parser and repository shape, plus `schema.json` as logical contract
   - Invalid-record handling: importer logs failed saves per monster

5. **Load**
   - Insert/upsert strategy: `upsert` core entities by slug and replace join-table rows per monster
   - Duplicate handling: unique indexes plus replacement strategy
   - Partial-failure handling: per-monster save failures are logged without aborting the full batch

No structural importer changes are required for this milestone unless backend implementation reveals a genuine data-shape mismatch.

### Frontend approach

- Route:
  - No frontend route implementation in this milestone
- Consumer contract expected later:
  - Monster list page consuming `GET /api/monsters`
  - Monster detail page consuming `GET /api/monsters/:slug`
  - Map list/filter UI consuming `GET /api/maps`
- Required states for future consumer:
  - Loading
  - Error
  - Empty
  - Success
- Accessibility:
  - Not directly implemented in this milestone, but the API contract should remain stable and predictable for future frontend use

### Shared code

- Shared schemas:
  - `docs/openapi.yaml` remains the contract source of truth during this milestone
- Shared types:
  - Deferred until the repo has both backend and frontend code that clearly benefit from a shared package
- Shared constants:
  - Pagination defaults may live in the API package first and only become shared if duplication becomes real

---

## 9. Alternatives Considered

### Option A — Fastify API with `pg` repository layer

**Description:**  
Create a dedicated Fastify API package and use parameterized PostgreSQL queries in repositories for list filters, counts, joins, and detail aggregation.

**Advantages:**

- Strong control over SQL, filtering, joins, and pagination
- Clear repository abstraction for normalized schema reads
- Easier to shape nested detail responses from join tables
- Avoids overloading the importer’s Supabase write client with API responsibilities

**Disadvantages:**

- Requires adding backend package structure and `pg` runtime wiring
- Requires connection management and careful local environment setup

### Option B — Fastify API with `@supabase/supabase-js` query layer

**Description:**  
Create the Fastify API but read data through a server-side Supabase client instead of direct SQL queries.

**Advantages:**

- Reuses a dependency already present in the repo
- Aligns naturally with Supabase-managed access patterns
- Can respect RLS cleanly when configured with non-privileged credentials

**Disadvantages:**

- More awkward for complex detail shaping and filtered joins over normalized drop tables
- Less transparent when debugging query behaviour for contract-first API work

### Decision

> **Selected:** Option A — Fastify API with `pg` repository layer  
> **Reason:** The first backend milestone is small but query-shape-heavy. Explicit SQL in a repository layer gives the cleanest path for paginated list filters, monster detail joins, and categorized drop assembly while staying close to the normalized schema already defined in the repo.

Record any later change to this decision in `docs/decisions/`.

---

## 10. Impact Analysis

### Files likely to change

```text
backend/
  package.json
  .env.example
  src/
    app.js
    server.js
    config/
      env.js
    db/
      pool.js
    routes/
      monsterRoutes.js
      mapRoutes.js
    controllers/
      monsterController.js
      mapController.js
    services/
      monsterService.js
      mapService.js
    repositories/
      monsterRepository.js
      mapRepository.js
    schemas/
      commonSchemas.js
      entitySchemas.js
      monsterSchemas.js
      mapSchemas.js
  test/
    monsters.test.js
    monster-detail.test.js
    maps.test.js

docs/
  openapi.yaml
  backend-api.md

README.md
```

Paths under `backend/` are first backend implementation files.

### API impact

- New endpoints:
  - `GET /api/monsters`
  - `GET /api/monsters/:slug`
  - `GET /api/maps`
- Changed endpoints:
  - None; the API does not exist yet
- Deprecated endpoints:
  - None
- Backward-compatibility risk:
  - Low, because this is the first backend release
- Consumer impact:
  - Future frontend work can depend on a stable API base instead of direct database access

### Database impact

- New schema:
  - None planned initially
- Existing-data migration:
  - None required to start
- Module ownership:
  - Database schema files and destructive initialization stay inside `data-retrieval/`
  - The backend API must not run `db:init`, import jobs, or schema rebuilds as part of startup
- Seed-data impact:
  - The backend depends on imported monster data already being present
- Rollback risk:
  - Low if no migration is added
- Expected query impact:
  - New read traffic on monsters, maps, locations, and drops tables

### Frontend impact

- New pages:
  - None in this milestone
- Changed components:
  - None in this milestone
- Routing impact:
  - Future frontend routes can be designed against the API contract
- State-management impact:
  - Future frontend will need list/detail loading states based on the new endpoints
- Accessibility impact:
  - No direct frontend implementation yet
- Responsive-design impact:
  - No direct frontend implementation yet

### Operational impact

- New environment variables:
  - `DATABASE_CONNECTION_STRING`
  - `PORT`
  - `HOST`
  - `LOG_LEVEL` or equivalent if adopted
  - `CORS_ORIGIN` if browser access requires explicit CORS control
- New dependencies:
  - Fastify
  - `pg`
  - Possibly a minimal Fastify plugin such as `@fastify/cors` if needed
- Deployment changes:
  - Introduces a backend runtime process for the first time
- Logging changes:
  - Adds request logging and service/repository error handling
- Monitoring changes:
  - None required beyond local logging for the first iteration
- Data backfill:
  - None; existing importer is expected to populate data

---

## 11. Implementation Stages

Each stage should be small enough to review and verify independently.

### Stage 0 — Discovery and contract alignment

**Goal:** Confirm the actual repository starting point and lock the first backend scope.

**Tasks:**

- [x] Read relevant instructions and documentation
- [x] Inspect importer, schema contract, and first OpenAPI draft
- [x] Confirm the milestone is read-only and monster/map focused
- [ ] Approve final package location and minimal dependency set

**Verification:**

- [x] Current-state findings documented in `PLAN.md`
- [x] Initial API scope aligned to `docs/openapi.yaml`
- [ ] Plan approved for implementation

---

### Stage 1 — API package scaffolding

**Goal:** Create the Fastify package structure and local runtime entry points.

**Tasks:**

- [x] Create `backend/` package structure
- [x] Add package scripts for local run and test
- [x] Add environment loading and configuration checks
- [x] Add Fastify app bootstrap and route registration
- [x] Add database pool setup using server-side `pg` access

**Verification:**

- [x] API package dependencies install successfully
- [x] Missing environment values fail clearly through configuration checks
- [x] App bootstrap is testable without opening a real port

---

### Stage 2 — Repository and service layer

**Goal:** Implement the read path for monsters and maps over the normalized schema.

**Tasks:**

- [x] Add repository queries for monster list, monster detail, and maps list
- [x] Add pagination, search, filter, and count support
- [x] Add detail aggregation for monster locations and categorized drops
- [x] Add service-layer response shaping where helpful

**Verification:**

- [ ] Repository methods return the expected shape for live imported data
- [x] Pagination metadata is computed correctly in route tests
- [x] Invalid filter combinations are rejected consistently

---

### Stage 3 — Routes, validation, and error handling

**Goal:** Expose stable Fastify endpoints matching the approved contract.

**Tasks:**

- [x] Add route schemas for monsters and maps
- [x] Add controllers
- [x] Attach validation and response schemas
- [x] Add global error handling for validation, not found, and unexpected failures
- [x] Keep `docs/openapi.yaml` unchanged because no approved contract details changed

**Verification:**

- [x] `GET /api/monsters` returns `200` with `{ data, meta }` in route tests
- [x] `GET /api/monsters/:slug` returns `200` or `404` correctly in route tests
- [x] `GET /api/maps` returns `200` with `{ data, meta }` in route tests
- [x] Invalid query values return `400` in route tests
- [x] Internal database errors do not leak raw details in route tests

---

### Stage 4 — Testing and documentation

**Goal:** Make the first backend iteration reviewable and repeatable.

**Tasks:**

- [x] Add Fastify route tests
- [x] Cover service-level response shaping through route tests
- [x] Document backend setup, scripts, and environment variables
- [x] Review implementation against the consumer-facing contract

**Verification:**

- [x] Targeted backend tests pass
- [x] Backend documentation matches actual package structure and commands
- [x] Final diff excludes unrelated changes and secrets

---

## 12. Testing Strategy

### Unit tests

- Pagination and filter normalization helpers
- Service-level response shaping for monster detail drops and locations

### Integration tests

- Repository queries against representative seeded data or a controlled test database
- Fastify `inject` tests for route behaviour and response shapes

### Frontend tests

- No frontend tests in this milestone

### Data-retrieval tests

- Existing importer behaviour should remain unaffected
- If backend implementation reveals a data-shape issue, add fixture-based parser or repository regression tests in follow-up work

### Manual verification

- Start the API locally with valid environment values
- Hit `GET /api/monsters` with default pagination
- Hit `GET /api/monsters/{slug}` with a known slug and an unknown slug
- Hit `GET /api/maps` with and without `search`
- Verify invalid `page`, `page_size`, and level-range input returns `400`

### Required commands

Current commands already present in the repo:

```bash
npm --prefix data-retrieval run db:init
npm --prefix data-retrieval run import:monsters
```

Commands to add as part of this milestone:

```bash
npm --prefix backend run dev
npm --prefix backend run test
```

The repo does not currently expose root-level `lint`, `typecheck`, or `build` scripts. If those checks are added during implementation, record the exact commands and results in the completion report.

---

## 13. Acceptance Criteria

- **AC-01:** Given imported data exists, when `GET /api/monsters` is called with no filters, then the API returns `200` with paginated monster summaries and valid pagination metadata.
- **AC-02:** Given valid query filters, when `GET /api/monsters` is called with `search`, `element`, `level_min`, `level_max`, `map_slug`, or `source_page`, then the API returns filtered results without changing the response shape.
- **AC-03:** Given a valid existing slug, when `GET /api/monsters/{slug}` is called, then the API returns `200` with one monster including `found_at` and categorized `drops`.
- **AC-04:** Given a missing slug, when `GET /api/monsters/{slug}` is called, then the API returns `404` with the documented error structure.
- **AC-05:** Given invalid pagination or filter input, when a list endpoint is called, then the API returns `400` with a stable validation error structure.
- **AC-06:** Given imported map data exists, when `GET /api/maps` is called, then the API returns `200` with paginated map summaries.
- **AC-07:** The backend implementation does not expose raw database errors, stack traces, Supabase service-role keys, or committed secrets.
- **AC-08:** `docs/openapi.yaml` and backend setup documentation match the implemented API behaviour.
- **AC-09:** The importer scripts continue to remain the upstream data source and are not broken by backend work.
- **AC-10:** Database schema files, destructive initialization, and import write logic remain owned by `data-retrieval/`; the backend API only performs read operations.

### Definition of done

This milestone is complete only when:

- [ ] All acceptance criteria are verified
- [ ] Targeted backend tests pass
- [ ] Required backend scripts exist and run successfully
- [ ] Review findings are resolved or explicitly accepted
- [ ] Documentation is updated
- [ ] No secrets are exposed
- [ ] Final diff contains no unrelated changes

---

## 14. Risks and Mitigations

| ID | Risk | Probability | Impact | Mitigation | Owner | Status |
|---|---|---:|---:|---|---|---|
| R-01 | The OpenAPI contract drifts from implementation | Medium | High | Treat `docs/openapi.yaml` as a gated artifact and update it in the same change set as route/schema updates | software-planner / implementer | Open |
| R-02 | Supabase direct database connectivity causes local connection issues | Medium | High | Prefer a server-side connection string that works in the user environment, including the pooler path if needed | implementer | Open |
| R-03 | No existing backend test harness slows verification | High | Medium | Start with Fastify `inject` tests and minimal package scripts early in the milestone | implementer / tester | Open |
| R-04 | Monster detail aggregation becomes messy over normalized drop tables | Medium | Medium | Keep repository queries focused and move response shaping into service logic where it improves clarity | implementer | Open |

### Rollback or recovery approach

- Database:
  - No rollback needed if no migration is introduced
  - If new indexes or schema changes are later added, use a new rollback migration rather than editing `schema.sql`
- API:
  - Remove or disable the new API package if startup or query logic is faulty
- Frontend:
  - No frontend rollback required in this milestone
- Import process:
  - Keep importer code isolated; do not couple API runtime to destructive schema rebuild or import execution
- Deployment:
  - No deployment rollback plan required yet beyond not releasing the backend package

---

## 15. Dependencies

### Internal dependencies

- `docs/openapi.yaml`
- `data-retrieval/database/schema.json`
- `data-retrieval/database/schema.sql`
- `data-retrieval/src/repositories/monsterImportRepository.js`
- Existing imported data in Supabase

### External dependencies

- Supabase PostgreSQL
- Fandom API as the upstream data source for importer-only workflows
- npm packages required for the API package:
  - `fastify`
  - `pg`
  - optional minimal Fastify plugins if implementation actually requires them

### Dependency decisions

For every new production dependency added during implementation, record:

- Purpose
- Alternatives considered
- Maintenance status
- Security considerations
- Runtime impact

Do not add a dependency that duplicates behaviour already covered by Fastify or the chosen database client.

---

## 16. Agent Assignment

| Work item | Primary role | Supporting skill | Output |
|---|---|---|---|
| Repository mapping and current-state confirmation | project-assistant | technical-documenting (closest fit) | Current-state summary |
| Backend design and milestone planning | software-planner | backend-design | Approved implementation plan |
| Backend implementation | implementer | code-building | Fastify package, queries, routes, and tests |
| Verification | tester | no dedicated testing skill yet; `code-building` is fallback context only | Test report |
| Independent review | reviewer | code-review | Prioritised findings |
| Backend setup and contract documentation | implementer or project-assistant | technical-documenting | Updated backend docs |

---

## 17. Progress Tracker

| Stage | Status | Owner | Started | Completed | Notes |
|---|---|---|---|---|---|
| Discovery and contract alignment | Completed | software-planner | 2026-06-20 | 2026-06-20 | Scope confirmed for read-only monster/map API |
| API package scaffolding | Completed | implementer | 2026-06-20 | 2026-06-20 | `backend/` package created |
| Repository and service layer | Completed | implementer | 2026-06-20 | 2026-06-20 | Read repositories and response shaping added |
| Routes, validation, and error handling | Completed | implementer | 2026-06-20 | 2026-06-20 | Fastify schemas and error handling added |
| Testing and documentation | Completed | tester / implementer | 2026-06-20 | 2026-06-20 | Route tests and `docs/backend-api.md` added |
| Review | Not started | reviewer | | | After implementation |

Valid statuses:

- Not started
- In progress
- Blocked
- In review
- Completed
- Deferred

---

## 18. Decision Log

| Date | Decision | Reason | Owner | Related ADR |
|---|---|---|---|---|
| 2026-06-20 | Keep the first backend iteration read-only and limited to monsters and maps | Matches the existing OpenAPI draft and keeps scope reviewable | software-planner | Pending |
| 2026-06-20 | Use a contract-first Fastify backend with a repository layer over `pg` | Gives clearer control over normalized-schema reads, filters, and nested detail shaping | software-planner | Pending |
| 2026-06-20 | Defer frontend implementation from this milestone | The repo does not yet contain the web app, and backend design is the current priority | software-planner | N/A |
| 2026-06-20 | Keep database implementation ownership inside `data-retrieval/` | Preserves modular application boundaries: ingestion/setup writes live with data retrieval, API runtime remains read-only | software-planner | Pending |

If these decisions become long-term architecture commitments, promote them into ADR files under `docs/decisions/`.

---

## 19. Change Log

### 2026-06-16

- Created the initial milestone plan template.

### 2026-06-20

- Replaced generic placeholders with a repository-grounded backend-server milestone.
- Aligned the plan to the actual current repo state: importer and schema exist, Fastify backend does not yet exist, and the first API contract is defined in `docs/openapi.yaml`.
- Clarified that `data-retrieval/` owns database schema files, destructive initialization, and import writes, while the backend API owns read-only request handling.

---

## 20. Completion Summary

Complete this section when the milestone is finished.

### Delivered

- First Fastify backend package
- First read-only monster and map API

### Files and modules changed

- To be completed at milestone close

### Verification performed

- To be completed at milestone close

### Known limitations

- First iteration intentionally limited to monsters and maps
- Frontend implementation is deferred

### Deferred work

- Additional entity domains such as NPCs, quests, and characters
- Shared schema/type package if duplication becomes real

### Recommended next milestone

**Frontend integration for monster and map browsing**

Reason:

> Once the backend contract is implemented and verified, the next highest-value step is to build the first frontend pages against the stable API instead of expanding backend scope too early.
