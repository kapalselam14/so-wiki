---
name: general-documenting
description: Create or update clear, reader-friendly project documentation such as README files, setup guides, contribution guides, changelogs, progress journals, feature summaries, and onboarding notes. Use for documentation aimed at users, students, contributors, or non-specialist readers; do not use for detailed API, database, architecture, or operational specifications.
---

# General Documenting

## Purpose

Produce documentation that helps a reader understand, start, use, contribute to, or follow the project without requiring deep knowledge of the implementation.

Always follow `AGENTS.md` and the repository's existing documentation style.

## Suitable documents

Use this skill for:

- root or package `README.md`
- getting-started guide
- local setup overview
- contribution guide
- feature overview
- project progress journal
- release notes
- changelog entry
- portfolio project description
- onboarding notes
- troubleshooting for common user-facing issues
- non-technical project summary

Use `technical-documenting` instead for detailed architecture, database, API, deployment, security, or operational documentation.

## Source-of-truth rules

Before writing:

1. Inspect the repository and relevant configuration.
2. Read existing documentation.
3. Verify commands from `package.json` or other configuration.
4. Verify file paths and environment-variable names.
5. Confirm current behaviour from code or tests.
6. Identify outdated statements.
7. Never invent setup steps, URLs, features, or commands.

If a statement cannot be verified, label it as a proposal or open item.

## Audience and purpose

Identify:

- intended reader
- what they need to accomplish
- assumed knowledge
- expected reading time
- whether the document is instructional, descriptive, or historical

Write for that audience. Explain project-specific terms on first use.

## Writing style

- Use plain, direct English.
- Prefer short paragraphs.
- Use descriptive headings.
- Use lists for steps and checks.
- Use code blocks for commands and examples.
- Keep terminology consistent with the interface and codebase.
- Avoid unexplained acronyms.
- Avoid marketing claims that cannot be demonstrated.
- Avoid excessive detail that belongs in technical references.

## README structure

For a general project README, prefer:

1. Project name
2. One-paragraph overview
3. Key features
4. Technology overview
5. Prerequisites
6. Local setup
7. Environment configuration
8. Run commands
9. Test commands
10. Project structure summary
11. Current status or roadmap
12. Contribution guidance
13. Known limitations
14. Licence or attribution, where applicable

Include only sections relevant to the project.

## Setup documentation

Setup steps must be:

- ordered
- copyable
- platform-aware where necessary
- explicit about working directory
- explicit about prerequisites
- safe for new contributors
- clear about which values belong in `.env` files
- free of real secrets

Use placeholders such as:

```env
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

Never include service credentials from a real environment.

## Progress journals

For development journals, include:

- date
- objective
- work completed
- decisions made
- problems encountered
- solutions or experiments
- test status
- next steps

Separate completed work from planned work.

## Changelog and release notes

Write observable changes under headings such as:

- Added
- Changed
- Fixed
- Deprecated
- Removed
- Security

Describe impact from the reader's perspective. Avoid implementation detail unless it helps users or contributors.

## Link and command checks

Where tools permit:

- verify relative links
- verify referenced files exist
- verify commands match scripts
- verify headings and anchors
- verify code blocks have suitable languages

Do not claim checks were run unless they were.

## Required output

When updating an existing document, report:

- document changed
- intended audience
- major additions or corrections
- claims verified from the repository
- items that remain uncertain

When drafting a new document, produce a complete, ready-to-save Markdown file.

## Quality checklist

Before finishing, confirm:

- The document answers the reader's likely first questions.
- Setup steps are complete and ordered.
- Commands are current.
- Terminology is consistent.
- No secrets are present.
- Links and paths are plausible and verified where possible.
- Planned features are not described as completed.
- Technical depth matches the audience.
