# Tasks

## Completed — 2026-03-15 (runtime validation)

| Task | Status |
|------|--------|
| Create `src/schemas/responses.ts` with zod schemas and `validateResponse` helper | Done |
| Update `management.ts` to validate all API responses via zod | Done |
| Update `reporting.ts` to validate all API responses via zod | Done |
| Update `logs.ts` to validate all API responses via zod | Done |

## Completed — 2026-03-15 (security/reliability patch)

| Task | Status |
|------|--------|
| Add `retryAfter` field to `YandexApiError` | Done |
| Rewrite `http.ts`: SSRF guard, retry logic, `Retry-After` header | Done |

## Completed — 2026-03-15 (initial)

| Task | Status |
|------|--------|
| Project setup (package.json, tsconfig, eslint, prettier) | Done |
| Core infrastructure (config, types, errors, utils) | Done |
| HTTP client layer (http, management, reporting, logs) | Done |
| Zod schemas (common, counter, report, logs) | Done |
| MCP tools — counter (list, get, goals) | Done |
| MCP tools — reporting (get_report) | Done |
| MCP tools — logs lifecycle (7 tools) | Done |
| Server registration and index.ts | Done |
| Unit tests | Done |
| Mock integration tests | Done |
| Live test scaffolding | Done |
| Dockerfile (multi-stage, node:22-alpine) | Done |
| docker-compose.yml | Done |
| GitHub Actions CI workflow | Done |
| GitHub Actions Docker workflow | Done |
| README.md | Done |
