import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createManagementClient } from "../../src/client/management.js";
import { loadConfig } from "../../src/config/env.js";
import { fixtureCountersResponse } from "../fixtures/index.js";

const testConfig = () =>
  loadConfig({
    YANDEX_METRICA_TOKEN: "test_token",
    YANDEX_METRICA_BASE_URL: "https://api-metrika.yandex.net",
  });

describe("listCounters (mocked)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(fixtureCountersResponse),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls correct endpoint and returns counters", async () => {
    const client = createManagementClient(testConfig());
    const result = await client.listCounters({});
    expect(result.counters).toHaveLength(1);
    expect(result.counters[0]?.id).toBe(12345678);

    const fetchMock = vi.mocked(fetch);
    const url = fetchMock.mock.calls[0]?.[0] as string;
    expect(url).toContain("/management/v1/counters");
  });

  it("passes page and per_page params", async () => {
    const client = createManagementClient(testConfig());
    await client.listCounters({ page: 2, per_page: 50 });

    const fetchMock = vi.mocked(fetch);
    const url = fetchMock.mock.calls[0]?.[0] as string;
    expect(url).toContain("page=2");
    expect(url).toContain("per_page=50");
  });

  it("sends Authorization header with OAuth token", async () => {
    const client = createManagementClient(testConfig());
    await client.listCounters({});

    const fetchMock = vi.mocked(fetch);
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = options.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("OAuth test_token");
  });
});
