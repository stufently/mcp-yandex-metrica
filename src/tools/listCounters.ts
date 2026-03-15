import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Config } from "../config/env.js";
import { listCountersSchema } from "../schemas/counter.js";
import { createManagementClient } from "../client/management.js";
import { mapError } from "../errors/mapError.js";

export function registerListCounters(server: McpServer, config: Config): void {
  server.registerTool(
    "yandex_metrica_list_counters",
    {
      description:
        "List all Yandex Metrica counters (tags/properties) accessible with the configured token. " +
        "Use this to discover available counter IDs before querying reports or logs.",
      inputSchema: listCountersSchema.shape,
    },
    async (args) => {
      try {
        const client = createManagementClient(config);
        const result = await client.listCounters({
          page: args.page,
          per_page: args.per_page,
          status: args.status,
          type: args.type,
          search: args.search,
          sort: args.sort,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return mapError(error);
      }
    },
  );
}
