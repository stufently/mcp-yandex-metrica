# mcp-yandex-metrica

Read-only MCP server for the Yandex Metrica Reporting API and Logs API, designed for use with [Claude Code](https://claude.ai/claude-code) and [Codex CLI](https://openai.com/codex).

Runs locally over **stdio**. No web server, no persistent storage, no background daemons.

---

## Why this project exists

Yandex Metrica has two distinct APIs that serve different purposes:

- **Reporting API** (`/stat/v1/data`) — aggregated, sampled statistics. Use this to build reports, query traffic sources, behavior metrics, goal conversions, etc.
- **Logs API** (`/management/v1/counter/{id}/logrequests`) — raw, non-aggregated event export. Use this when you need row-level session or hit data for custom analytics pipelines.

This MCP server exposes both APIs as named tools that an LLM can call directly.

---

## Features

- 11 MCP tools covering counters, goals, reporting, and full Logs API lifecycle
- Authentication via environment variable only (no interactive OAuth)
- Minimal transformation — responses stay close to the Yandex API format
- Safe download behavior: logs parts default to 50KB preview + metadata
- Strict TypeScript, zod validation, clean error messages
- Multi-stage Docker image (node:24-alpine)
- Unit + mock integration tests, live test scaffolding
- GitHub Actions CI and Docker workflows

---

## Supported MCP Tools

### Counter & Metadata
| Tool | Description |
|------|-------------|
| `yandex_metrica_list_counters` | List accessible counters (tags) |
| `yandex_metrica_get_counter` | Get counter details by ID |
| `yandex_metrica_list_goals` | List goals for a counter |

### Reporting API (aggregated)
| Tool | Description |
|------|-------------|
| `yandex_metrica_get_report` | Run a Reporting API query |

> For period comparison, pass `date1b`/`date2b` to `yandex_metrica_get_report`. No separate tool needed — the Reporting API uses the same `/stat/v1/data` endpoint.

### Logs API (raw export)
| Tool | Description |
|------|-------------|
| `yandex_metrica_evaluate_logs_request` | Check if export is possible |
| `yandex_metrica_create_logs_request` | Create an async export request |
| `yandex_metrica_list_logs_requests` | List all requests for a counter |
| `yandex_metrica_get_logs_request` | Poll status of a request |
| `yandex_metrica_download_logs_part` | Download a processed part (TSV) |
| `yandex_metrica_cancel_logs_request` | Cancel a pending request |
| `yandex_metrica_clean_logs_request` | Clean processed files to free quota |

---

## Logs API Workflow

```
evaluate → create → [poll get until status=processed] → download parts → clean
```

The Logs API is asynchronous. After creating a request, poll `yandex_metrica_get_logs_request` until `status = "processed"`, then download each part listed in `log_request_parts`.

---

## Download Behavior

Raw log parts can be hundreds of MB. By default `yandex_metrica_download_logs_part` returns:

```json
{
  "mode": "preview",
  "truncated": true,
  "original_byte_size": 52428800,
  "preview_byte_size": 49980,
  "content": "ym:s:visitID\tym:s:date\t...\n..."
}
```

Set `mode: "full"` to get the entire content — only do this for small parts.

---

## Requirements

- Node.js 24+
- Yandex OAuth token with `metrika:read` scope

### How to get YANDEX_METRICA_TOKEN

1. Go to https://oauth.yandex.com/ → **Create app**
2. Fill in any name, select **For API access**
3. Under **Access** → enable `metrika:read`
4. Click **Create app**, copy the **ClientID**
5. Open in browser (replace `<ClientID>` with yours):
   ```
   https://oauth.yandex.com/authorize?response_type=token&client_id=<ClientID>
   ```
6. Authorize → copy the `access_token` from the URL fragment (`#access_token=...`)

### How to get YANDEX_METRICA_COUNTER_ID

The counter ID is the numeric ID of your Yandex Metrica tag (счётчик):

- Open https://metrika.yandex.ru — the counter ID is shown next to each tag
- Or look at the URL: `metrika.yandex.ru/dashboard?id=**12345678**`
- Or use the tool itself: call `yandex_metrica_list_counters` — it returns all counters with their IDs

> `YANDEX_METRICA_COUNTER_ID` is only needed for live tests (`npm run test:live`), not for normal server operation.

---

## Installation

```bash
git clone https://github.com/your-org/mcp-yandex-metrica.git
cd mcp-yandex-metrica
npm install
```

---

## Configuration

Copy `.env.example` to `.env` and set your token:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `YANDEX_METRICA_TOKEN` | **Yes** | — | OAuth token with `metrika:read` |
| `YANDEX_METRICA_TIMEOUT_MS` | No | `30000` | Request timeout in ms |
| `LOG_LEVEL` | No | `info` | Log level: debug, info, warn, error, silent |
| `YANDEX_METRICA_USER_AGENT` | No | `mcp-yandex-metrica/0.1.0` | Custom User-Agent |
| `YANDEX_METRICA_BASE_URL` | No | `https://api-metrika.yandex.net` | API base URL (tests only) |

---

## Local Development

```bash
# Development with hot reload
YANDEX_METRICA_TOKEN=your_token npm run dev

# Build
npm run build

# Run production build
YANDEX_METRICA_TOKEN=your_token npm start

# Lint
npm run lint

# Type check
npm run typecheck

# Tests (unit + mock integration, no live API calls)
npm test

# Live tests (requires real token and counter ID)
LIVE_TESTS=1 YANDEX_METRICA_TOKEN=your_token YANDEX_METRICA_COUNTER_ID=12345678 npm run test:live

# Format
npm run format
```

---

## Docker

```bash
# Build image
docker build -t mcp-yandex-metrica .

# Run (stdio-based — pipe input/output)
docker run -i \
  -e YANDEX_METRICA_TOKEN=your_token \
  mcp-yandex-metrica
```

## Docker Compose

```bash
# Create .env with your token first
cp .env.example .env

# Run
docker-compose run --rm mcp-yandex-metrica
```

---

## Claude Code Configuration

Add to your Claude Code MCP settings (e.g. `~/.claude/claude_desktop_config.json` or project `.mcp.json`):

### Using Node directly (after npm install + build)

```json
{
  "mcpServers": {
    "yandex-metrica": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-yandex-metrica/dist/index.js"],
      "env": {
        "YANDEX_METRICA_TOKEN": "your_oauth_token_here"
      }
    }
  }
}
```

### Using npx / tsx (development)

```json
{
  "mcpServers": {
    "yandex-metrica": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/mcp-yandex-metrica/src/index.ts"],
      "env": {
        "YANDEX_METRICA_TOKEN": "your_oauth_token_here"
      }
    }
  }
}
```

### Using Docker

```json
{
  "mcpServers": {
    "yandex-metrica": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "YANDEX_METRICA_TOKEN=your_oauth_token_here",
        "mcp-yandex-metrica:local"
      ]
    }
  }
}
```

---

## Example Prompts

```
List all my Yandex Metrica counters.

Show me visits and bounce rate for counter 12345678 for the last 7 days, broken down by date.

What were the top 10 traffic sources for counter 12345678 last month?

Create a logs export for counter 12345678 for visits from 2024-01-01 to 2024-01-07
with fields: visitID, date, clientID, startURL, trafficSource.

Check status of logs request 99001 for counter 12345678.

Download part 0 of logs request 99001 for counter 12345678 (preview only).
```

---

## Architecture

```
src/
  index.ts              Entry point, loads config, connects stdio transport
  config/env.ts         Zod-based environment config validation
  server/
    createServer.ts     Creates MCP Server instance
    registerTools.ts    Registers all tools with the server
  tools/                One file per MCP tool
  client/
    http.ts             Fetch-based HTTP client with auth, timeout, error handling
    management.ts       Counters and goals endpoints
    reporting.ts        Reporting API (/stat/v1/data)
    logs.ts             Logs API lifecycle endpoints
  schemas/              Zod schemas for tool input validation
  errors/               YandexApiError + error mapping
  types/api.ts          TypeScript types for Yandex API responses
  utils/
    arrays.ts           Array → comma-separated conversion
    text.ts             Text preview/truncation for large downloads
```

---

## Limitations

- **Read-only** (plus Logs API lifecycle operations which don't mutate counter data)
- **No comparison report tool** — use `yandex_metrica_get_report` with `date1b`/`date2b` params
- **No drilldown/pivot/bytime tools** in v1 — planned for v0.2
- **No caching** — every tool call hits the Yandex API
- **No retry logic** beyond the default fetch behavior
- **Large log parts** — use `mode: "full"` carefully; defaults to 50KB preview

---

## Testing

```bash
# Unit + mock integration (CI-safe, no real API calls)
npm test

# Live tests (hit real Yandex API)
LIVE_TESTS=1 \
YANDEX_METRICA_TOKEN=your_token \
YANDEX_METRICA_COUNTER_ID=12345678 \
npm run test:live
```

---

## CI / Docker Image

GitHub Actions workflows are in `.github/workflows/`:
- `ci.yml` — lint, typecheck, test, build on every push/PR
- `docker.yml` — build Docker image; push to GHCR on pushes to `main` and version tags

To publish, update `REGISTRY` and `IMAGE_NAME` in `docker.yml` or rely on `${{ github.repository }}` defaults.

---

## Security

- Token is passed via environment variable only — never hardcoded
- Token never appears in logs
- No write operations against Yandex Metrica counters (Logs lifecycle operations only manage temporary export jobs)
- Docker image runs as non-root (`node` user)

---

## License

MIT — see [LICENSE](./LICENSE)
