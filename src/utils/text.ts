const PREVIEW_BYTE_LIMIT = 50_000; // 50 KB

export interface TextPreview {
  content: string;
  truncated: boolean;
  original_byte_size: number;
  preview_byte_size: number;
}

/**
 * Creates a preview of potentially large text content.
 * Returns first PREVIEW_BYTE_LIMIT bytes if content exceeds the limit.
 */
export function makePreview(text: string): TextPreview {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  const originalSize = bytes.byteLength;

  if (originalSize <= PREVIEW_BYTE_LIMIT) {
    return {
      content: text,
      truncated: false,
      original_byte_size: originalSize,
      preview_byte_size: originalSize,
    };
  }

  const previewBytes = bytes.slice(0, PREVIEW_BYTE_LIMIT);
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const previewText = decoder.decode(previewBytes);

  // Trim to last complete line to avoid cutting mid-row
  const lastNewline = previewText.lastIndexOf("\n");
  const trimmed = lastNewline > 0 ? previewText.slice(0, lastNewline + 1) : previewText;

  return {
    content: trimmed,
    truncated: true,
    original_byte_size: originalSize,
    preview_byte_size: encoder.encode(trimmed).byteLength,
  };
}
