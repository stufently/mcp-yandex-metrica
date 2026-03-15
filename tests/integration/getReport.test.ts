import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createReportingClient } from "../../src/client/reporting.js";
import { loadConfig } from "../../src/config/env.js";
import { fixtureReportResponse } from "../fixtures/index.js";

const testConfig = () =>
  loadConfig({
    YANDEX_METRICA_TOKEN: "test_token",
    YANDEX_METRICA_BASE_URL: "https://api-metrika.yandex.net",
  });

describe("getReport (mocked)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(fixtureReportResponse),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls stat/v1/data endpoint", async () => {
    const client = createReportingClient(testConfig());
    const result = await client.getReport({
      ids: "12345678",
      metrics: "ym:s:visits",
      date1: "2024-01-01",
      date2: "2024-01-07",
    });
    expect(result.data).toHaveLength(2);
    expect(result.total_rows).toBe(7);

    const fetchMock = vi.mocked(fetch);
    const url = fetchMock.mock.calls[0]?.[0] as string;
    expect(url).toContain("/stat/v1/data");
    expect(url).toContain("ids=12345678");
    expect(url).toContain("metrics=ym%3As%3Avisits");
  });

  it("includes optional dimensions and sort", async () => {
    const client = createReportingClient(testConfig());
    await client.getReport({
      ids: "12345678",
      metrics: "ym:s:visits",
      dimensions: "ym:s:date",
      sort: "-ym:s:visits",
    });

    const fetchMock = vi.mocked(fetch);
    const url = fetchMock.mock.calls[0]?.[0] as string;
    expect(url).toContain("dimensions=");
    expect(url).toContain("sort=");
  });

  it("handles API error response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: async () => JSON.stringify({ message: "Access denied", code: "forbidden" }),
      }),
    );

    const client = createReportingClient(testConfig());
    await expect(
      client.getReport({ ids: "12345678", metrics: "ym:s:visits" }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
