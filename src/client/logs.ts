import { createHttpClient } from "./http.js";
import type { Config } from "../config/env.js";
import type {
  LogRequestResponse,
  LogRequestsResponse,
  LogRequestEvaluationResponse,
  LogSource,
} from "../types/api.js";

export interface LogsRequestParams {
  counter_id: number;
  date1: string;
  date2: string;
  source: LogSource;
  fields: string;
  attribution?: string | undefined;
}

export interface LogsEvaluateParams {
  counter_id: number;
  date1: string;
  date2: string;
  source: LogSource;
  fields: string;
}

export interface LogsRequestIdParams {
  counter_id: number;
  request_id: number;
}

export interface DownloadLogsPartParams {
  counter_id: number;
  request_id: number;
  part_number: number;
}

export function createLogsClient(config: Config) {
  const http = createHttpClient(config);

  const base = (counterId: number) =>
    `/management/v1/counter/${counterId}/logrequests`;

  const req = (counterId: number, requestId: number) =>
    `/management/v1/counter/${counterId}/logrequest/${requestId}`;

  async function evaluateLogsRequest(
    params: LogsEvaluateParams,
  ): Promise<LogRequestEvaluationResponse> {
    return http.getJson<LogRequestEvaluationResponse>(
      `${base(params.counter_id)}/evaluate`,
      {
        date1: params.date1,
        date2: params.date2,
        source: params.source,
        fields: params.fields,
      },
    );
  }

  async function createLogsRequest(params: LogsRequestParams): Promise<LogRequestResponse> {
    return http.postJson<LogRequestResponse>(base(params.counter_id), {
      date1: params.date1,
      date2: params.date2,
      source: params.source,
      fields: params.fields,
      attribution: params.attribution,
    });
  }

  async function listLogsRequests(counterId: number): Promise<LogRequestsResponse> {
    return http.getJson<LogRequestsResponse>(base(counterId));
  }

  async function getLogsRequest(params: LogsRequestIdParams): Promise<LogRequestResponse> {
    return http.getJson<LogRequestResponse>(req(params.counter_id, params.request_id));
  }

  async function downloadLogsPart(params: DownloadLogsPartParams): Promise<Response> {
    return http.getRaw(
      `${req(params.counter_id, params.request_id)}/part/${params.part_number}/download`,
    );
  }

  async function cancelLogsRequest(params: LogsRequestIdParams): Promise<LogRequestResponse> {
    return http.postJson<LogRequestResponse>(`${req(params.counter_id, params.request_id)}/cancel`);
  }

  async function cleanLogsRequest(params: LogsRequestIdParams): Promise<LogRequestResponse> {
    return http.postJson<LogRequestResponse>(`${req(params.counter_id, params.request_id)}/clean`);
  }

  return {
    evaluateLogsRequest,
    createLogsRequest,
    listLogsRequests,
    getLogsRequest,
    downloadLogsPart,
    cancelLogsRequest,
    cleanLogsRequest,
  };
}
