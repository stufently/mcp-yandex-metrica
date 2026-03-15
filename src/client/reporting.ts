import { createHttpClient } from "./http.js";
import type { Config } from "../config/env.js";
import type { ReportResponse } from "../types/api.js";
import {
  reportResponseSchema,
  comparisonResponseSchema,
  validateResponse,
} from "../schemas/responses.js";

export interface GetReportParams {
  ids: string;
  metrics: string;
  dimensions?: string | undefined;
  date1?: string | undefined;
  date2?: string | undefined;
  filters?: string | undefined;
  sort?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  accuracy?: string | undefined;
  currency?: string | undefined;
  attribution?: string | undefined;
  lang?: string | undefined;
  include_undefined?: boolean | undefined;
  preset?: string | undefined;
}

export interface GetComparisonParams {
  ids: string;
  metrics: string;
  dimensions?: string | undefined;
  date1_a?: string | undefined;
  date2_a?: string | undefined;
  date1_b?: string | undefined;
  date2_b?: string | undefined;
  filters?: string | undefined;
  filters_a?: string | undefined;
  filters_b?: string | undefined;
  sort?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  accuracy?: string | undefined;
  include_undefined?: boolean | undefined;
  lang?: string | undefined;
  preset?: string | undefined;
}

export function createReportingClient(config: Config) {
  const http = createHttpClient(config);

  async function getReport(params: GetReportParams): Promise<ReportResponse> {
    const raw = await http.getJson<unknown>("/stat/v1/data", {
      ids: params.ids,
      metrics: params.metrics,
      dimensions: params.dimensions,
      date1: params.date1,
      date2: params.date2,
      filters: params.filters,
      sort: params.sort,
      limit: params.limit,
      offset: params.offset,
      accuracy: params.accuracy,
      currency: params.currency,
      attribution: params.attribution,
      lang: params.lang,
      include_undefined: params.include_undefined,
      preset: params.preset,
    });
    return validateResponse(reportResponseSchema, raw, "getReport") as unknown as ReportResponse;
  }

  async function getComparison(params: GetComparisonParams): Promise<unknown> {
    const raw = await http.getJson<unknown>("/stat/v1/data/comparison", {
      ids: params.ids,
      metrics: params.metrics,
      dimensions: params.dimensions,
      date1_a: params.date1_a,
      date2_a: params.date2_a,
      date1_b: params.date1_b,
      date2_b: params.date2_b,
      filters: params.filters,
      filters_a: params.filters_a,
      filters_b: params.filters_b,
      sort: params.sort,
      limit: params.limit,
      offset: params.offset,
      accuracy: params.accuracy,
      include_undefined: params.include_undefined,
      lang: params.lang,
      preset: params.preset,
    });
    return validateResponse(comparisonResponseSchema, raw, "getComparison");
  }

  return { getReport, getComparison };
}
