# Seal Online Wiki

Seal Online Wiki is a full-stack learning project for building a structured, searchable reference site for Seal Online game data.

The project currently focuses on a read-only data flow:

```text
Fandom source data
  -> data-retrieval import pipeline
  -> Supabase PostgreSQL
  -> Fastify API
  -> planned Next.js web application
```

## Current Stack

- **Frontend:** Planned Next.js application with Tailwind CSS under `apps/web/`
- **Backend:** Node.js and Fastify under `backend/`
- **Database:** Supabase PostgreSQL
- **Data retrieval:** Node.js scripts under `data-retrieval/`
- **Testing:** Vitest for backend route tests
- **Package manager:** npm

## Current Status

The backend API now exists and exposes the first read-only monster and map endpoints. The frontend application has not been scaffolded yet; the planned direction is Next.js with Tailwind CSS, consuming the Fastify API rather than reading directly from Supabase.

## Project Goals

- Build a reliable Seal Online wiki experience for monsters, maps, drops, equipment, quests, NPCs, and related game data.
- Keep external data retrieval, backend API, and frontend UI as separate application modules.
- Use the project to deliberately practice data modelling, API design, testing, frontend design, documentation, and code review.
