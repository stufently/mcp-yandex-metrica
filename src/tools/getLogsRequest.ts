import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Config } from "../config/env.js";
import { getLogsRequestSchema } from "../schemas/logs.js";
import { createLogsClient } from "../client/logs.js";
import { mapError } from "../errors/mapError.js";

export function registerGetLogsRequest(server: McpServer, config: Config): void {
  server.registerTool(
    "yandex_metrica_get_logs_request",
    {
      description:
        "Get the status and details of a specific Logs API export request. " +
        "Poll this until status='processed' before downloading parts. " +
        "Once processed, the response includes log_request_parts with part numbers and sizes. " +
        "Status lifecycle: created → awaiting_retry → processed (or canceled). " +
        "After download, use yandex_metrica_clean_logs_request to free up quota.",
      inputSchema: getLogsRequestSchema.shape,
    },
    async (args) => {
      try {
        const client = createLogsClient(config);
        const result = await client.getLogsRequest({
          counter_id: args.counter_id,
          request_id: args.request_id,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return mapError(error);
      }
    },
  );
}
