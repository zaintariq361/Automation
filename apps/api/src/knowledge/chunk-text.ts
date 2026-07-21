/** Splits text into ~chunkSize-character chunks on paragraph/sentence boundaries where possible. */
export function chunkText(text: string, chunkSize = 800, overlap = 100): string[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (clean.length <= chunkSize) return [clean];

  const chunks: string[] = [];
  let start = 0;

  while (start < clean.length) {
    let end = Math.min(start + chunkSize, clean.length);
    if (end < clean.length) {
      const boundary = clean.lastIndexOf("\n", end);
      const sentenceBoundary = clean.lastIndexOf(". ", end);
      const cut = Math.max(boundary, sentenceBoundary);
      if (cut > start + chunkSize * 0.5) end = cut + 1;
    }
    chunks.push(clean.slice(start, end).trim());
    start = end - overlap;
    if (start <= 0 || end === clean.length) start = end;
  }

  return chunks.filter((c) => c.length > 0);
}
