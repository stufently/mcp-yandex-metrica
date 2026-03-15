# TODO

## Infrastructure
- [ ] **April 2026**: Upgrade Docker base image and CI to Node 26 LTS once it releases (scheduled April 2026)

## v0.2.0 Candidates
- [ ] Reporting API: drilldown endpoint (`/stat/v1/data/drilldown`)
- [ ] Reporting API: bytime endpoint (`/stat/v1/data/bytime`)
- [ ] Reporting API: pivot table endpoint
- [ ] Logs API: streaming/chunked output for very large parts
- [x] Retry with exponential backoff for 429 and transient 5xx
- [ ] Publish to npm as CLI-installable package
- [ ] Publish Docker image to GHCR on releases

## Completed
- [x] Counter tools (list, get, goals)
- [x] Reporting API basic tool
- [x] Logs API full lifecycle
- [x] Preview/full download modes
- [x] Unit and integration tests
- [x] Docker and CI
