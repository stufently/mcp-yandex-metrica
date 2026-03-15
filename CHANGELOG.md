# Changelog

All notable changes to this project will be documented in this file.

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
