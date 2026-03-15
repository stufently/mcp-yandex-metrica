import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Config } from "../config/env.js";
import { createLogsRequestSchema } from "../schemas/logs.js";
import { createLogsClient } from "../client/logs.js";
import { toCommaSeparated } from "../utils/arrays.js";
import { mapError } from "../errors/mapError.js";

export function registerCreateLogsRequest(server: McpServer, config: Config): void {
  server.registerTool(
    "yandex_metrica_create_logs_request",
    {
      description:
        "Create a Yandex Metrica Logs API export request for raw non-aggregated data. " +
        "The request is processed asynchronously — poll status with yandex_metrica_get_logs_request until status='processed', " +
        "then download parts with yandex_metrica_download_logs_part, then clean with yandex_metrica_clean_logs_request. " +
        "source='visits' exports session-level data; source='hits' exports pageview-level data. " +
        "Note: date2 cannot be the current day. Fields must use the 'ym:s:' (visits) or 'ym:pv:' (hits) prefix.",
      inputSchema: createLogsRequestSchema.shape,
    },
    async (args) => {
      try {
        const client = createLogsClient(config);
        const result = await client.createLogsRequest({
          counter_id: args.counter_id,
          date1: args.date1,
          date2: args.date2,
          source: args.source,
          fields: toCommaSeparated(args.fields) ?? "",
          attribution: args.attribution,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return mapError(error);
      }
    },
  );
}
