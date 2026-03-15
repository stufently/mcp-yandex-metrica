import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Config } from "../config/env.js";
import { evaluateLogsRequestSchema } from "../schemas/logs.js";
import { createLogsClient } from "../client/logs.js";
import { toCommaSeparated } from "../utils/arrays.js";
import { mapError } from "../errors/mapError.js";

export function registerEvaluateLogsRequest(server: McpServer, config: Config): void {
  server.registerTool(
    "yandex_metrica_evaluate_logs_request",
    {
      description:
        "Check whether a Logs API export request can be created for the given parameters. " +
        "Returns whether the request is possible and the maximum number of days that can be exported. " +
        "Call this before yandex_metrica_create_logs_request to avoid creating requests that will fail. " +
        "Workflow: evaluate → create → poll with get_logs_request → download parts → clean.",
      inputSchema: evaluateLogsRequestSchema.shape,
    },
    async (args) => {
      try {
        const client = createLogsClient(config);
        const result = await client.evaluateLogsRequest({
          counter_id: args.counter_id,
          date1: args.date1,
          date2: args.date2,
          source: args.source,
          fields: toCommaSeparated(args.fields) ?? "",
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return mapError(error);
      }
    },
  );
}
