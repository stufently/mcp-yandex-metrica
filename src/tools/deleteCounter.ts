import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Config } from "../config/env.js";
import { deleteCounterSchema } from "../schemas/counter.js";
import { createManagementClient } from "../client/management.js";
import { mapError } from "../errors/mapError.js";

export function registerDeleteCounter(server: McpServer, config: Config): void {
  server.registerTool(
    "yandex_metrica_delete_counter",
    {
      description:
        "Delete a Yandex Metrica counter. This action is irreversible — " +
        "the counter and all its data will be permanently removed.",
      inputSchema: deleteCounterSchema.shape,
    },
    async (args) => {
      try {
        const client = createManagementClient(config);
        await client.deleteCounter({ counter_id: args.counter_id });
        return {
          content: [
            {
              type: "text" as const,
              text: `Counter ${args.counter_id} deleted successfully.`,
            },
          ],
        };
      } catch (error) {
        return mapError(error);
      }
    },
  );
}
