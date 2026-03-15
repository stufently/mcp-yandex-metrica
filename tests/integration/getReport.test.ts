import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createReportingClient } from "../../src/client/reporting.js";
import { loadConfig } from "../../src/config/env.js";
import { fixtureReportResponse, fixtureComparisonResponse } from "../fixtures/index.js";

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
        headers: new Headers(),
        text: async () => JSON.stringify({ message: "Access denied", code: "forbidden" }),
      }),
    );

    const client = createReportingClient(testConfig());
    await expect(
      client.getReport({ ids: "12345678", metrics: "ym:s:visits" }),
    ).rejects.toMatchObject({ status: 403 });
  });
});

describe("getComparison (mocked)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls stat/v1/data/comparison endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(fixtureComparisonResponse),
      }),
    );

    const client = createReportingClient(testConfig());
    await client.getComparison({
      ids: "12345678",
      metrics: "ym:s:visits",
      date1_a: "2024-01-01",
      date2_a: "2024-01-07",
      date1_b: "2023-01-01",
      date2_b: "2023-01-07",
    });

    const fetchMock = vi.mocked(fetch);
    const url = fetchMock.mock.calls[0]?.[0] as string;
    expect(url).toContain("/stat/v1/data/comparison");
    expect(url).not.toContain("/stat/v1/data?");
  });

  it("passes segment A and B dates as separate params", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(fixtureComparisonResponse),
      }),
    );

    const client = createReportingClient(testConfig());
    await client.getComparison({
      ids: "12345678",
      metrics: "ym:s:visits",
      date1_a: "2024-01-01",
      date2_a: "2024-01-07",
      date1_b: "2023-01-01",
      date2_b: "2023-01-07",
    });

    const fetchMock = vi.mocked(fetch);
    const url = fetchMock.mock.calls[0]?.[0] as string;
    expect(url).toContain("date1_a=2024-01-01");
    expect(url).toContain("date2_a=2024-01-07");
    expect(url).toContain("date1_b=2023-01-01");
    expect(url).toContain("date2_b=2023-01-07");
  });

  it("returns metrics in {a, b} format", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(fixtureComparisonResponse),
      }),
    );

    const client = createReportingClient(testConfig());
    const result = await client.getComparison({
      ids: "12345678",
      metrics: "ym:s:visits",
      date1_a: "2024-01-01",
      date2_a: "2024-01-07",
      date1_b: "2023-01-01",
      date2_b: "2023-01-07",
    });

    const data = (result as typeof fixtureComparisonResponse).data;
    expect(data).toHaveLength(2);
    expect(data[0]?.metrics).toHaveProperty("a");
    expect(data[0]?.metrics).toHaveProperty("b");
    expect(data[0]?.metrics.a).toEqual([150]);
    expect(data[0]?.metrics.b).toEqual([120]);
  });

  it("rejects response with wrong metrics format", async () => {
    const badResponse = {
      ...fixtureComparisonResponse,
      data: [{ dimensions: [], metrics: [[150, 120]] }], // old wrong format
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(badResponse),
      }),
    );

    const client = createReportingClient(testConfig());
    await expect(
      client.getComparison({
        ids: "12345678",
        metrics: "ym:s:visits",
        date1_b: "2023-01-01",
        date2_b: "2023-01-07",
      }),
    ).rejects.toThrow("Unexpected response format");
  });

  it("passes filters_a and filters_b to comparison endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(fixtureComparisonResponse),
      }),
    );

    const client = createReportingClient(testConfig());
    await client.getComparison({
      ids: "12345678",
      metrics: "ym:s:visits",
      date1_b: "2023-01-01",
      date2_b: "2023-01-07",
      filters_a: "ym:s:trafficSource=='organic'",
      filters_b: "ym:s:trafficSource=='direct'",
    });

    const fetchMock = vi.mocked(fetch);
    const url = fetchMock.mock.calls[0]?.[0] as string;
    expect(url).toContain("filters_a=");
    expect(url).toContain("filters_b=");
  });
});
