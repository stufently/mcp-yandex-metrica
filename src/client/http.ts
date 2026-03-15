import { YandexApiError } from "../errors/apiError.js";
import { buildSearchParams } from "../utils/arrays.js";
import type { Config } from "../config/env.js";

export type Params = Record<string, string | number | boolean | undefined>;

interface YandexErrorBody {
  message?: string;
  code?: string;
  errors?: Array<{ error_type?: string; message?: string }>;
}

async function parseErrorBody(response: Response): Promise<YandexErrorBody> {
  try {
    const text = await response.text();
    return JSON.parse(text) as YandexErrorBody;
  } catch {
    return {};
  }
}

function buildErrorMessage(body: YandexErrorBody, fallback: string): string {
  if (body.message) return body.message;
  if (body.errors && body.errors.length > 0) {
    return body.errors.map((e) => e.message ?? e.error_type ?? "unknown").join("; ");
  }
  return fallback;
}

export function createHttpClient(config: Config) {
  const baseHeaders: Record<string, string> = {
    Authorization: `OAuth ${config.YANDEX_METRICA_TOKEN}`,
    "User-Agent": config.YANDEX_METRICA_USER_AGENT,
    Accept: "application/json",
  };

  async function request(
    method: "GET" | "POST",
    path: string,
    params?: Params,
  ): Promise<Response> {
    const url = new URL(path, config.YANDEX_METRICA_BASE_URL);

    if (params) {
      const sp = buildSearchParams(params);
      sp.forEach((value, key) => url.searchParams.set(key, value));
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.YANDEX_METRICA_TIMEOUT_MS);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: baseHeaders,
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await parseErrorBody(response);
        const message = buildErrorMessage(body, `HTTP ${response.status} ${response.statusText}`);
        throw new YandexApiError(response.status, body.code, message, body.errors);
      }

      return response;
    } catch (err) {
      if (err instanceof YandexApiError) throw err;
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`Request timed out after ${config.YANDEX_METRICA_TIMEOUT_MS}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  async function getJson<T>(path: string, params?: Params): Promise<T> {
    const response = await request("GET", path, params);
    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(`Failed to parse JSON response: ${text.slice(0, 200)}`);
    }
  }

  async function postJson<T>(path: string, params?: Params): Promise<T> {
    const response = await request("POST", path, params);
    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(`Failed to parse JSON response: ${text.slice(0, 200)}`);
    }
  }

  async function getRaw(path: string, params?: Params): Promise<Response> {
    return request("GET", path, params);
  }

  return { getJson, postJson, getRaw };
}

export type HttpClient = ReturnType<typeof createHttpClient>;
