import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Config } from "../config/env.js";
import { downloadLogsPartSchema } from "../schemas/logs.js";
import { createLogsClient } from "../client/logs.js";
import { makePreview } from "../utils/text.js";
import { mapError } from "../errors/mapError.js";

export function registerDownloadLogsPart(server: McpServer, config: Config): void {
  server.registerTool(
    "yandex_metrica_download_logs_part",
    {
      description:
        "Download a specific part of a processed Logs API export request. " +
        "Returns TSV (tab-separated) data with a header row. " +
        "IMPORTANT: Parts can be very large (hundreds of MB). Use mode='preview' (default) to get the first ~50KB " +
        "plus metadata (truncated, total size). Use mode='full' only when you know the part is small. " +
        "Part numbers are 0-based and listed in the log_request_parts field of the request status. " +
        "Only available when request status='processed'.",
      inputSchema: downloadLogsPartSchema.shape,
    },
    async (args) => {
      try {
        const client = createLogsClient(config);
        const response = await client.downloadLogsPart({
          counter_id: args.counter_id,
          request_id: args.request_id,
          part_number: args.part_number,
        });

        const text = await response.text();

        if (args.mode === "full") {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    mode: "full",
                    content: text,
                    byte_size: new TextEncoder().encode(text).byteLength,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        // Default: preview mode
        const preview = makePreview(text);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  mode: "preview",
                  truncated: preview.truncated,
                  original_byte_size: preview.original_byte_size,
                  preview_byte_size: preview.preview_byte_size,
                  content: preview.content,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return mapError(error);
      }
    },
  );
}
