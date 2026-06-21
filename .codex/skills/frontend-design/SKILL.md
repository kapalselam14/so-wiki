---
name: frontend-design
description: Design or refine responsive, accessible React interfaces for the Seal Online Wiki, including page structure, components, states, interactions, and visual verification. Use for new screens, redesigns, screenshot-to-UI work, component-system decisions, or substantial UX changes; do not use for backend-only tasks or tiny code changes with an already-defined UI.
---

# Frontend Design

## Purpose

Create frontend designs that are usable, responsive, accessible, visually coherent, and practical to implement in the existing React application.

Always follow `AGENTS.md`, existing design conventions, and relevant documentation.

## Operating mode

For substantial UI work, design before implementation.

Do not modify code unless implementation is explicitly requested. When implementation is requested, first present a concise design and component plan.

## Discovery

Before designing:

1. Read `AGENTS.md`, `README.md`, `PLAN.md`, and relevant UI documentation.
2. Inspect the current React and Vite structure.
3. Identify:
   - routing
   - existing layouts
   - component patterns
   - styling approach
   - tokens or theme variables
   - icon library
   - data-fetching pattern
   - form library
   - test tooling
4. Inspect comparable pages and reusable components.
5. If a screenshot or mockup is provided, analyse:
   - hierarchy
   - spacing
   - typography
   - colour roles
   - borders and elevation
   - responsive implications
   - interaction clues
6. Distinguish required behaviour from visual assumptions.

Do not replace an established design system without explicit approval.

## User and task focus

Define:

- target user
- primary task
- key information
- priority action
- secondary actions
- likely error or empty conditions
- mobile and desktop context
- accessibility needs

For the Seal Online Wiki, prioritise fast discovery and comparison of game information.

## Page-state requirements

Every data-driven screen must define:

- loading state
- error state
- empty state
- success state

Also define when relevant:

- partial-data state
- offline or reconnecting state
- permission state
- no-search-results state
- destructive-action confirmation
- optimistic-update rollback

## Information architecture

For each page, specify:

- page purpose
- title and orientation
- navigation context
- primary content region
- filters and search
- sorting
- pagination or infinite loading
- detail hierarchy
- related content
- primary and secondary actions

Avoid presenting all data at equal visual weight.

## Component planning

Identify:

- page components
- feature components
- reusable shared components
- presentational components
- data containers or hooks
- service calls
- state ownership
- error boundaries where useful

Prefer feature-based organisation and reuse existing components when they fit.

Do not introduce global state unless local or feature-level state is insufficient.

## Responsive design

Define behaviour for:

- narrow mobile
- tablet or intermediate widths
- desktop
- very wide screens where relevant

Specify:

- column collapse
- navigation behaviour
- table alternatives
- filter placement
- image sizing
- touch-target sizing
- overflow handling
- text wrapping
- sticky elements

Do not merely shrink desktop layouts.

## Accessibility

Check:

- semantic landmarks
- heading order
- labels for controls
- keyboard navigation
- visible focus
- colour contrast
- touch-target size
- alt text
- form error association
- screen-reader announcements for dynamic states
- reduced-motion considerations
- non-colour status indicators

Use native HTML elements before custom equivalents.

## Visual system

Reuse existing:

- colours
- spacing
- typography
- radii
- shadows
- breakpoints
- icons

When a design token is missing, propose one rather than scattering hard-coded values.

Avoid arbitrary decorative complexity that reduces readability.

## Data and API contract

For data-driven UI, define:

- endpoint used
- request parameters
- response fields required
- loading strategy
- caching needs
- pagination model
- filtering and sorting contract
- error behaviour
- missing-image behaviour

Do not design UI that depends on data the backend does not provide without identifying the required API change.

## Implementation guidance

When implementation is requested:

- use functional React components
- keep data access outside purely presentational components
- preserve existing routing and styling conventions
- avoid unrelated refactors
- add focused component or interaction tests
- verify all required states
- check browser console for new errors
- inspect at mobile and desktop widths

## Visual verification

After implementation, verify:

- no unexpected horizontal scrolling
- no clipped controls or text
- no overlapping elements
- consistent spacing
- readable line lengths
- stable layout during loading
- clear focus states
- correct image aspect ratios
- usable mobile controls
- empty and error states

Use screenshots or browser-based checks where available, but do not claim visual verification without performing it.

## Required output

For a design task, provide:

1. User goal
2. Current-state observations
3. Proposed information architecture
4. Page layout
5. Component tree
6. State model
7. Responsive behaviour
8. Accessibility requirements
9. Data/API requirements
10. Visual-system decisions
11. Implementation stages
12. Test and visual-verification plan
13. Acceptance criteria
14. Risks and open questions

## Acceptance criteria examples

Write observable criteria, such as:

- A user can filter monsters by level range and map.
- Search results provide a distinct no-results state.
- The monster list is usable at 375 px width without horizontal scrolling.
- Keyboard users can reach and operate every filter.
- A failed request shows a retry action.
- Loading does not cause major layout shift.
