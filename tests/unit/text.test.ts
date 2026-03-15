import { describe, it, expect } from "vitest";
import { makePreview } from "../../src/utils/text.js";

describe("makePreview", () => {
  it("returns full content when below limit", () => {
    const text = "line1\nline2\n";
    const result = makePreview(text);
    expect(result.truncated).toBe(false);
    expect(result.content).toBe(text);
    expect(result.original_byte_size).toBe(new TextEncoder().encode(text).byteLength);
  });

  it("truncates large content", () => {
    // Generate text larger than 50KB
    const line = "ym:s:visitID\tvalue123\n";
    const repeated = line.repeat(3000); // ~60KB
    const result = makePreview(repeated);
    expect(result.truncated).toBe(true);
    expect(result.preview_byte_size).toBeLessThan(result.original_byte_size);
    expect(result.content.length).toBeLessThan(repeated.length);
  });

  it("truncates at line boundary", () => {
    const line = "a".repeat(100) + "\n";
    const repeated = line.repeat(600); // ~60KB
    const result = makePreview(repeated);
    // Should end with newline (trimmed to last complete line)
    expect(result.content.endsWith("\n")).toBe(true);
  });
});
