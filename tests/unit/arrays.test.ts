import { describe, it, expect } from "vitest";
import { toCommaSeparated, buildSearchParams } from "../../src/utils/arrays.js";

describe("toCommaSeparated", () => {
  it("joins array into comma-separated string", () => {
    expect(toCommaSeparated(["a", "b", "c"])).toBe("a,b,c");
  });

  it("returns undefined for empty array", () => {
    expect(toCommaSeparated([])).toBeUndefined();
  });

  it("returns undefined for undefined input", () => {
    expect(toCommaSeparated(undefined)).toBeUndefined();
  });

  it("filters empty strings", () => {
    expect(toCommaSeparated(["a", "", "b"])).toBe("a,b");
  });

  it("returns undefined if all entries are empty", () => {
    expect(toCommaSeparated(["", " "])).toBeUndefined();
  });
});

describe("buildSearchParams", () => {
  it("builds URLSearchParams from object", () => {
    const sp = buildSearchParams({ a: "1", b: 2, c: true });
    expect(sp.get("a")).toBe("1");
    expect(sp.get("b")).toBe("2");
    expect(sp.get("c")).toBe("true");
  });

  it("skips undefined values", () => {
    const sp = buildSearchParams({ a: "x", b: undefined });
    expect(sp.has("b")).toBe(false);
    expect(sp.get("a")).toBe("x");
  });
});
