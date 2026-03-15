# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-03-15

### Added
- `src/schemas/responses.ts`: zod schemas for all API response shapes with `.passthrough()` to tolerate extra fields
- `validateResponse()` helper that throws descriptive errors on schema mismatches
- Runtime response validation in `management.ts`, `reporting.ts`, and `logs.ts` for all API calls

### Fixed
- `YandexApiError`: added `retryAfter` field to carry parsed `Retry-After` delay
- `http.ts`: added SSRF guard (`assertSafeHost`) blocking token leakage to non-Yandex hosts
- `http.ts`: added automatic retry with exponential backoff for 429/500/502/503/504
- `http.ts`: `Retry-After` response header parsed and respected in retry delay
- `http.ts`: request timeout via `AbortController` extracted into `attemptRequest` helper

## [0.1.0] - 2026-03-15

### Added
- Initial release
- MCP server with stdio transport for Yandex Metrica
- Counter tools: list_counters, get_counter, list_goals
- Reporting API tool: get_report (aggregated statistics)
- Logs API tools: evaluate, create, list, get, download_part, cancel, clean
- Download preview mode (50KB default) with optional full mode
- Strict TypeScript, ESLint, Prettier
- Vitest unit and integration tests with mock HTTP
- Live test scaffolding (requires token + counter_id)
- Multi-stage Dockerfile (node:22-alpine)
- Docker Compose for local use
- GitHub Actions CI and Docker workflows
