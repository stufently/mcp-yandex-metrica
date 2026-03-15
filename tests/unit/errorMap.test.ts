import { describe, it, expect } from "vitest";
import { mapError } from "../../src/errors/mapError.js";
import { YandexApiError } from "../../src/errors/apiError.js";

describe("mapError", () => {
  it("maps YandexApiError 401 with auth guidance", () => {
    const err = new YandexApiError(401, "unauthorized", "Unauthorized");
    const result = mapError(err);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("401");
    expect(result.content[0].text).toContain("metrika:read");
  });

  it("maps YandexApiError 404", () => {
    const err = new YandexApiError(404, undefined, "Not found");
    const result = mapError(err);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("404");
  });

  it("maps YandexApiError 429 rate limit", () => {
    const err = new YandexApiError(429, "quota_exceeded", "Too many requests");
    const result = mapError(err);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("429");
  });

  it("maps YandexApiError 500", () => {
    const err = new YandexApiError(500, undefined, "Internal server error");
    const result = mapError(err);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("500");
  });

  it("maps timeout error", () => {
    const err = new Error("Request timed out after 30000ms");
    const result = mapError(err);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("timed out");
  });

  it("maps generic Error", () => {
    const err = new Error("something went wrong");
    const result = mapError(err);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("something went wrong");
  });

  it("maps unknown errors", () => {
    const result = mapError("string error");
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("string error");
  });

  it("includes error code when present", () => {
    const err = new YandexApiError(400, "invalid_params", "Bad request");
    const result = mapError(err);
    expect(result.content[0].text).toContain("invalid_params");
  });
});
