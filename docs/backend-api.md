# Backend API

This document describes the first backend API module for the Seal Online Wiki project.

## Module Boundary

The backend API is a read-only application module. It serves imported Seal Online data from Supabase PostgreSQL through HTTP endpoints.

Database schema setup and import writes remain owned by `data-retrieval/`:

- `data-retrieval/database/schema.json`
- `data-retrieval/database/schema.sql`
- `data-retrieval/src/database/initdb.js`
- `data-retrieval/src/repositories/monsterImportRepository.js`

The backend must not run destructive database initialization or import jobs during API startup.

## Location

The API module lives in `backend/`.

```text
backend/
  src/
    app.js
    server.js
    config/
    controllers/
    db/
    repositories/
    routes/
    schemas/
    services/
  test/
```

## Environment

Create `backend/.env` from `backend/.env.example`.

```env
DATABASE_CONNECTION_STRING=postgresql://user:<password>@host:5432/database
HOST=127.0.0.1
PORT=3000
LOG_LEVEL=info
DB_SSL=true
```

Do not commit real credentials.

## Scripts

Run commands from the repository root with npm's `--prefix` option.

```bash
npm --prefix backend run dev
npm --prefix backend run start
npm --prefix backend run test
```

## Endpoints

The first API iteration implements the contract in `docs/openapi.yaml`.

- `GET /api/monsters`
- `GET /api/monsters/:slug`
- `GET /api/maps`

Successful list endpoints return:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total_items": 0,
    "total_pages": 0
  }
}
```

Errors use:

```json
{
  "error": {
    "code": "bad_request",
    "message": "page must be greater than or equal to 1"
  }
}
```
