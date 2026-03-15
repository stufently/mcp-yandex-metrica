/**
 * Converts an array of strings to a comma-separated string for Yandex API query params.
 * Filters out empty strings.
 */
export function toCommaSeparated(arr: string[] | undefined): string | undefined {
  if (!arr || arr.length === 0) return undefined;
  const filtered = arr.filter((s) => s.trim().length > 0);
  return filtered.length > 0 ? filtered.join(",") : undefined;
}

/**
 * Builds a URLSearchParams from a params object, skipping undefined values.
 */
export function buildSearchParams(
  params: Record<string, string | number | boolean | undefined>,
): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    sp.set(key, String(value));
  }
  return sp;
}
