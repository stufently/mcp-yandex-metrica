import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Config } from "../config/env.js";
import { cleanLogsRequestSchema } from "../schemas/logs.js";
import { createLogsClient } from "../client/logs.js";
import { mapError } from "../errors/mapError.js";

export function registerCleanLogsRequest(server: McpServer, config: Config): void {
  server.registerTool(
    "yandex_metrica_clean_logs_request",
    {
      description:
        "Clean (delete) the prepared log files for a processed Logs API export request. " +
        "Call this after downloading all parts to free up your export quota. " +
        "Only works on requests with status='processed'. " +
        "After cleaning, status changes to 'cleaned_by_user'.",
      inputSchema: cleanLogsRequestSchema.shape,
    },
    async (args) => {
      try {
        const client = createLogsClient(config);
        const result = await client.cleanLogsRequest({
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
