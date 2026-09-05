// Logical screen coordinates stay stable while the canvas renders at 3x resolution.
let measuring: CanvasRenderingContext2D | null = null;
const widths = new Map<string,number>();
const font = (scale: number) => `${scale >= 3 ? 700 : 500} ${10*scale}px Arial, Helvetica, sans-serif`;
export function textWidth(text: string, scale = 1) {
  if (typeof document === "undefined") return text.length*6*scale; // Conservative non-rendering layout estimate.
  measuring ??= document.createElement("canvas").getContext("2d");
  if (!measuring) return text.length*6*scale;
  const key = `${scale}:${text}`; const cached = widths.get(key); if (cached !== undefined) return cached;
  measuring.font = font(scale); measuring.fontKerning = "none";
  const width = measuring.measureText(text).width;
  if (widths.size > 2048) widths.clear(); widths.set(key,width); return width;
}
export function screenText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, scale: number, color: string) {
  ctx.font = font(scale); ctx.fontKerning = "none"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color; ctx.fillText(text,x,y+7.5*scale);
}
export function wrapText(text: string, width: number, scale: number) {
  return text.split("\n").flatMap(paragraph => {
    if (!paragraph) return [""];
    const lines: string[] = []; let line = "";
    for (const word of paragraph.split(/\s+/)) {
      if (textWidth(line ? `${line} ${word}` : word, scale) > width && line) { lines.push(line); line = ""; }
      if (textWidth(word, scale) > width) {
        for (const letter of word) { if (textWidth(line + letter, scale) > width) { lines.push(line); line = ""; } line += letter; }
      } else line += (line ? " " : "") + word;
    }
    if (line) lines.push(line);
    return lines;
  });
}
