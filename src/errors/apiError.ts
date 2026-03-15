export class YandexApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | undefined,
    message: string,
    public readonly details?: unknown,
    public readonly retryAfter?: number | undefined,
  ) {
    super(message);
    this.name = "YandexApiError";
  }
}
