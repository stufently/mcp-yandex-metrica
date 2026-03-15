/**
 * Live integration tests against the real Yandex Metrica API.
 *
 * These tests are skipped in CI by default.
 * To run locally:
 *   LIVE_TESTS=1 YANDEX_METRICA_TOKEN=<token> YANDEX_METRICA_COUNTER_ID=<id> npm run test:live
 */
import { describe, it, expect, beforeAll } from "vitest";
import { createManagementClient } from "../../src/client/management.js";
import { createReportingClient } from "../../src/client/reporting.js";
import { createLogsClient } from "../../src/client/logs.js";
import { loadConfig } from "../../src/config/env.js";

const LIVE = process.env["LIVE_TESTS"] === "1";
const COUNTER_ID = parseInt(process.env["YANDEX_METRICA_COUNTER_ID"] ?? "0", 10);

const maybeIt = LIVE ? it : it.skip;

describe("Live API tests", () => {
  let config: ReturnType<typeof loadConfig>;

  beforeAll(() => {
    if (!LIVE) return;
    if (!process.env["YANDEX_METRICA_TOKEN"]) {
      throw new Error("YANDEX_METRICA_TOKEN is required for live tests");
    }
    if (!COUNTER_ID) {
      throw new Error("YANDEX_METRICA_COUNTER_ID is required for live tests");
    }
    config = loadConfig();
  });

  maybeIt("listCounters returns at least one counter", async () => {
    const client = createManagementClient(config);
    const result = await client.listCounters({ per_page: 10 });
    expect(result.counters.length).toBeGreaterThan(0);
  });

  maybeIt("getCounter returns counter details", async () => {
    const client = createManagementClient(config);
    const result = await client.getCounter({ counter_id: COUNTER_ID });
    expect(result.counter.id).toBe(COUNTER_ID);
  });

  maybeIt("listGoals returns goals array", async () => {
    const client = createManagementClient(config);
    const result = await client.listGoals({ counter_id: COUNTER_ID });
    expect(Array.isArray(result.goals)).toBe(true);
  });

  maybeIt("getReport returns visits data", async () => {
    const client = createReportingClient(config);
    const result = await client.getReport({
      ids: String(COUNTER_ID),
      metrics: "ym:s:visits",
      date1: "7daysAgo",
      date2: "yesterday",
      limit: 10,
    });
    expect(Array.isArray(result.data)).toBe(true);
    expect(typeof result.total_rows).toBe("number");
  });

  maybeIt("evaluateLogsRequest returns evaluation", async () => {
    const client = createLogsClient(config);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().slice(0, 10);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = weekAgo.toISOString().slice(0, 10);

    const result = await client.evaluateLogsRequest({
      counter_id: COUNTER_ID,
      date1: weekStr,
      date2: dateStr,
      source: "visits",
      fields: "ym:s:visitID,ym:s:date,ym:s:clientID",
    });
    expect(typeof result.log_request_evaluation.possible).toBe("boolean");
    expect(typeof result.log_request_evaluation.max_possible_day_quantity).toBe("number");
  });

  maybeIt("listLogsRequests returns requests array", async () => {
    const client = createLogsClient(config);
    const result = await client.listLogsRequests(COUNTER_ID);
    expect(Array.isArray(result.requests)).toBe(true);
  });
});
