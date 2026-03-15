import { createHttpClient } from "./http.js";
import type { Config } from "../config/env.js";
import type { ReportResponse } from "../types/api.js";

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
  date1b?: string | undefined;
  date2b?: string | undefined;
  preset?: string | undefined;
}

export function createReportingClient(config: Config) {
  const http = createHttpClient(config);

  async function getReport(params: GetReportParams): Promise<ReportResponse> {
    return http.getJson<ReportResponse>("/stat/v1/data", {
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
      date1b: params.date1b,
      date2b: params.date2b,
      preset: params.preset,
    });
  }

  return { getReport };
}
