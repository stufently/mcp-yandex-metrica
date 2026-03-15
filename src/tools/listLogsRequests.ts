import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Config } from "../config/env.js";
import { listLogsRequestsSchema } from "../schemas/logs.js";
import { createLogsClient } from "../client/logs.js";
import { mapError } from "../errors/mapError.js";

export function registerListLogsRequests(server: McpServer, config: Config): void {
  server.registerTool(
    "yandex_metrica_list_logs_requests",
    {
      description:
        "List all Logs API export requests for a counter. " +
        "Returns all requests regardless of status: created, awaiting_retry, processed, canceled, cleaned_by_user, cleaned_automatically_as_too_old.",
      inputSchema: listLogsRequestsSchema.shape,
    },
    async (args) => {
      try {
        const client = createLogsClient(config);
        const result = await client.listLogsRequests(args.counter_id);
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return mapError(error);
      }
    },
  );
}
