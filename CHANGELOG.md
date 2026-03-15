# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-03-15

### Added
- MCP server with stdio transport for Yandex Metrica
- Counter tools: `list_counters`, `get_counter`, `list_goals`
- Reporting API tool: `get_report` with period comparison (`date1b`/`date2b`)
- Logs API tools: `evaluate`, `create`, `list`, `get`, `download_part`, `cancel`, `clean`
- Streaming download with 50KB preview mode and 10MB full mode cap
- SSRF guard: token only sent to `api-metrika.yandex.net`
- Automatic retry with exponential backoff for 429/500/502/503/504 (`Retry-After` respected)
- Runtime zod response validation for all API clients
- Strict TypeScript, ESLint, Prettier
- Vitest unit and integration tests (42 tests, no live API calls)
- Live test scaffolding (opt-in via `LIVE_TESTS=1`)
- Multi-stage Dockerfile (node:24-alpine), runs as non-root
- Docker image published to GHCR on every push to `main`
- GitHub Actions CI and Docker workflows
