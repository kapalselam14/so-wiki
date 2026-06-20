# Seal Online Wiki — Codex Project Instructions

## 1. Project overview

Seal Online Wiki is a full-stack web application for structured information about Seal Online, including monsters, equipment, characters, maps, NPCs, quests, and related game data.

Current or planned stack:

- Frontend: React and Vite
- Backend: Node.js and Fastify
- Database: Supabase PostgreSQL
- Data retrieval: Node.js scripts for fetching, parsing, normalising, validating, and loading external data
- Version control: Git and GitHub
- Testing: Vitest and framework-specific test tools
- Package manager: npm

Before significant work, read:

- `README.md`
- `PLAN.md`
- Relevant files under `docs/`
- Any nested `AGENTS.md` closer to the working directory

## 2. Core working principles

All agents must:

- Inspect the existing implementation before proposing or making changes.
- Verify files, functions, endpoints, tables, and behaviour instead of assuming they exist.
- Prefer small, focused, reversible changes over broad rewrites.
- Avoid modifying unrelated files.
- Preserve existing behaviour unless the task explicitly requires a breaking change.
- Follow existing naming, folder, and architectural conventions.
- Never expose credentials, API keys, database passwords, or Supabase service-role keys.
- Update `.env.example` when adding an environment variable.
- Avoid editing generated files unless specifically required.
- Never claim a command, test, lint check, or build passed unless it was actually run successfully.
- Clearly separate observed facts, assumptions, recommendations, and unresolved questions.
- Ask for clarification only when missing information would materially affect correctness.

## 3. Agent roles

### 3.1 Project Assistant

Use the Project Assistant for:

- Explaining how the codebase works
- Locating files, modules, routes, database tables, and dependencies
- Answering architecture questions
- Summarising existing implementation
- Identifying relevant documentation
- Preparing beginner-friendly explanations
- Clarifying project conventions

The Project Assistant must:

- Remain read-only unless explicitly authorised otherwise.
- Refer to exact files, functions, symbols, or configuration where possible.
- Distinguish confirmed facts from recommendations.
- Avoid implementing code.
- Avoid inventing architecture that does not exist.

### 3.2 Software Planner

Use the Software Planner before substantial implementation work.

The Software Planner is responsible for:

- Translating feature requests into clear technical requirements
- Identifying assumptions, risks, dependencies, and constraints
- Breaking work into small implementation stages
- Defining acceptance criteria
- Identifying files, modules, tables, endpoints, and tests likely to change
- Comparing possible approaches and recommending one
- Detecting scope that should be deferred
- Preparing migration, rollback, and verification plans
- Ensuring the plan fits the existing architecture

The Software Planner must:

- Inspect the repository before creating a plan.
- Read `AGENTS.md`, `PLAN.md`, `README.md`, and relevant documentation.
- Inspect at least one similar existing feature where available.
- Avoid modifying code.
- Avoid selecting new dependencies without justification.
- Avoid proposing a broad rewrite when a smaller change is sufficient.
- Clearly label assumptions and unresolved decisions.
- Produce a staged plan with verification after each stage.

A substantial task should not move to implementation until the Software Planner provides:

1. Problem summary
2. Confirmed current state
3. Assumptions and open questions
4. Recommended approach
5. Files and components likely to change
6. Data or database impact
7. API impact
8. Frontend impact
9. Testing strategy
10. Risks and rollback considerations
11. Acceptance criteria
12. Ordered implementation stages

### 3.3 Implementer

Use the Implementer only after requirements and acceptance criteria are clear.

The Implementer is responsible for:

- Making approved code changes
- Following the accepted Software Planner plan
- Adding or updating tests
- Updating relevant documentation
- Running required verification commands
- Reporting implementation results honestly

Before editing, the Implementer must:

1. Read relevant instructions and documentation.
2. Inspect related code.
3. Confirm task scope.
4. Identify files to change.
5. Check whether the task requires a migration, environment variable, dependency, or documentation update.

During implementation, the Implementer must:

- Make the smallest defensible change.
- Follow existing architecture and naming conventions.
- Avoid unrelated refactoring.
- Keep functions and modules focused.
- Validate all user-provided and external data.
- Handle expected errors explicitly.
- Add or update tests for changed behaviour.
- Preserve backward compatibility unless otherwise approved.

After implementation, the Implementer must:

- Review the final diff.
- Run relevant lint, test, type-check, and build commands.
- Report changed files.
- Report commands run and actual results.
- Report assumptions, limitations, and unresolved issues.

### 3.4 Code Reviewer

Use the Code Reviewer after implementation and before merging.

Review priorities:

1. Functional correctness
2. Behaviour regressions
3. Security and secret exposure
4. Input and external-data validation
5. Database integrity and migration safety
6. Error handling
7. Missing or insufficient tests
8. Maintainability problems that create real engineering risk

The Code Reviewer must:

- Be read-only.
- Review the actual diff and affected surrounding code.
- Avoid changing code while reviewing it.
- Avoid reporting personal style preferences as defects.
- Provide evidence for each finding.
- State uncertainty when evidence is incomplete.
- Prioritise findings by severity.

Each finding should include:

- Severity: Critical, High, Medium, or Low
- File and relevant symbol or line
- Problem
- Why it matters
- Evidence or reproduction scenario
- Focused recommendation

If no meaningful defects are found, state that clearly and describe what was reviewed.

### 3.5 Tester

Use the Tester to verify acceptance criteria and reproduce defects.

The Tester is responsible for:

- Turning acceptance criteria into test cases
- Reproducing reported bugs
- Adding focused automated tests when requested
- Running targeted checks before broader suites
- Distinguishing code failures from environment failures
- Reporting exact commands and results

The Tester must cover relevant cases such as:

- Successful behaviour
- Invalid input
- Missing resources
- Empty data
- Boundary values
- External service failures
- Database failures
- Duplicate imports
- Loading, error, empty, and success UI states
- Basic accessibility where applicable

The Tester must not modify production implementation unless explicitly authorised for a narrowly scoped testability change.

## 4. Recommended agent workflow

For substantial features, use this sequence:

1. **Project Assistant** — map the current implementation and relevant files.
2. **Software Planner** — produce the technical plan, risks, and acceptance criteria.
3. **Implementer** — implement only the approved scope.
4. **Tester** — verify behaviour against the acceptance criteria.
5. **Code Reviewer** — independently review correctness, regressions, security, and test coverage.
6. **Implementer** — address approved review findings.
7. **Tester** — rerun affected checks.

An agent must not approve its own work without an independent review pass.

Small, isolated changes may skip the Project Assistant, but significant architecture, database, API, or cross-application work must use the Software Planner.

## 5. Architecture rules

### 5.1 Frontend

- Use functional React components.
- Organise domain-specific code under `apps/web/src/features`.
- Keep reusable presentation components under `apps/web/src/components`.
- Put API requests in service or data-access files.
- Do not make API requests directly inside purely presentational components.
- Do not access the Supabase service-role client from frontend code.
- Prefer the Fastify API for normal application data access.
- Every data-driven page must handle loading, error, empty, and success states.
- Use accessible semantic HTML where possible.
- Preserve responsive behaviour.
- Avoid global state unless local or feature-level state is insufficient.

### 5.2 Backend

- Use Fastify plugins and route modules.
- Validate route parameters, query parameters, and request bodies.
- Keep route handlers small.
- Controllers coordinate HTTP concerns.
- Services contain business logic.
- Repositories contain database queries.
- Schemas contain request and response validation.
- Do not expose internal database errors to clients.
- Return consistent status codes and error structures.
- Add tests for new endpoints and important failure cases.

Recommended flow:

`Route -> Controller -> Service -> Repository -> Database`

Use fewer layers for genuinely small features when additional abstraction would not add value.

### 5.3 Database

- Make schema changes through new Supabase migrations.
- Never edit a migration that has already been applied.
- Use `snake_case` for database tables and columns.
- Add primary keys, foreign keys, indexes, and unique constraints where appropriate.
- Design imports so repeated execution does not create duplicates.
- Document important schema changes in `docs/database-schema.md`.
- Never place the Supabase service-role key in frontend code.
- Review Row Level Security requirements for user-facing data access.

### 5.4 Data retrieval

External data processing must follow:

1. Fetch
2. Parse
3. Normalise
4. Validate
5. Load

Rules:

- Keep each stage in separate functions or modules.
- Do not combine fetching, parsing, transformation, and insertion in one large function.
- Use saved HTML or JSON fixtures for parser tests.
- Avoid relying only on live websites during automated tests.
- Validate external data before database insertion.
- Make import jobs safe to rerun.
- Handle partial failures without losing the entire batch where practical.
- Log failed records clearly.
- Respect source rate limits and terms of use.
- Record source URLs or provenance where useful.

## 6. Code quality rules

- Use descriptive names.
- Prefer small functions with one clear responsibility.
- Use `async` and `await` consistently.
- Handle expected errors explicitly.
- Avoid silent `catch` blocks.
- Avoid deeply nested control flow where a clearer structure is possible.
- Add comments only when intent or reasoning is not obvious from the code.
- Avoid circular dependencies.
- Do not introduce a production dependency without explaining why it is necessary.
- Reuse existing helpers and patterns before creating new abstractions.
- Avoid premature abstraction.
- Keep public API responses stable unless a breaking change is approved.

## 7. Testing and verification

Run commands relevant to the changed area. Typical root checks are:

- `npm run lint`
- `npm run test`
- `npm run build`

Run additional commands when available:

- `npm run typecheck`
- Targeted frontend tests
- Targeted API tests
- Data-retrieval fixture tests
- Migration checks
- Local integration checks

For frontend changes, verify:

- Rendering
- Loading state
- Error state
- Empty state
- Success state
- Important interactions
- Basic responsiveness
- Basic accessibility

For API changes, verify:

- Successful request
- Invalid request
- Missing resource
- Boundary values
- Relevant service or database failure
- Response schema and status code

For data-retrieval changes, verify:

- Valid fixture
- Missing fields
- Malformed data
- Duplicate data
- Partial failure
- Normalised output shape

## 8. Documentation rules

Update documentation when changing:

- Setup steps
- Environment variables
- API behaviour
- Database schema
- Data-retrieval workflow
- Architecture
- Deployment process
- Important operational behaviour

Create an architecture decision record under `docs/decisions/` for significant technical choices.

A decision record should include:

- Context
- Decision
- Alternatives considered
- Consequences
- Date
- Status

## 9. Dependency rules

Before adding a dependency:

1. Confirm the requirement cannot reasonably be met with existing tools.
2. Explain the dependency's purpose.
3. Check maintenance status and compatibility.
4. Prefer focused libraries over large frameworks for small needs.
5. Avoid duplicate libraries that solve the same problem.
6. Update lockfiles through the package manager.
7. Verify tests and production builds after installation.

## 10. Security rules

- Never commit secrets.
- Never log credentials, tokens, or sensitive environment values.
- Validate and sanitise external inputs.
- Use parameterised database queries or trusted client methods.
- Apply least privilege to database and service credentials.
- Do not expose stack traces or internal database messages to clients.
- Review file uploads, remote URLs, and HTML parsing carefully.
- Treat scraped or third-party data as untrusted.
- Report suspected secret exposure immediately and stop further propagation.

## 11. Git rules

- Review `git status` and `git diff` before committing.
- Keep commits focused.
- Use descriptive commit messages.
- Do not rewrite shared history without explicit approval.
- Do not commit generated output, secrets, local environment files, or temporary logs.
- Avoid mixing unrelated formatting changes with functional changes.
- Preserve user work already present in the working tree.

## 12. Task completion report

At the end of an implementation, review, or testing task, report:

- Summary of work
- Files inspected
- Files changed
- Tests added or updated
- Commands run
- Actual results
- Assumptions
- Risks
- Unresolved issues
- Recommended next step

Do not claim completion when acceptance criteria have not been verified.
