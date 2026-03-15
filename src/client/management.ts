import { createHttpClient } from "./http.js";
import type { Config } from "../config/env.js";
import type {
  CountersResponse,
  CounterResponse,
  GoalsResponse,
} from "../types/api.js";

export interface ListCountersParams {
  page?: number | undefined;
  per_page?: number | undefined;
  status?: string | undefined;
  type?: string | undefined;
  search?: string | undefined;
  sort?: string | undefined;
}

export interface GetCounterParams {
  counter_id: number;
}

export interface ListGoalsParams {
  counter_id: number;
}

export function createManagementClient(config: Config) {
  const http = createHttpClient(config);

  async function listCounters(params: ListCountersParams): Promise<CountersResponse> {
    return http.getJson<CountersResponse>("/management/v1/counters", {
      page: params.page,
      per_page: params.per_page,
      status: params.status,
      type: params.type,
      search: params.search,
      sort: params.sort,
    });
  }

  async function getCounter(params: GetCounterParams): Promise<CounterResponse> {
    return http.getJson<CounterResponse>(`/management/v1/counter/${params.counter_id}`);
  }

  async function listGoals(params: ListGoalsParams): Promise<GoalsResponse> {
    return http.getJson<GoalsResponse>(
      `/management/v1/counter/${params.counter_id}/goals`,
    );
  }

  return { listCounters, getCounter, listGoals };
}
