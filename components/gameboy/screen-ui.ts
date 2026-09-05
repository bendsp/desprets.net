import { SCREEN_WIDTH as W, type Page, type Control } from "./console";
import type { Palette, PaletteId } from "./themes";
import { screenText as text, textWidth } from "./screen-font";
export type Hit = { x:number; y:number; w:number; h:number; action: {page:Page} | {url:string} | {control:Control} | {palette:PaletteId} };
export type ScreenLayout = { hits:Hit[]; limit:number };
export function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
export function center(ctx: CanvasRenderingContext2D, value: string, y: number, scale: number, color: string) { text(ctx, value, (W - textWidth(value, scale)) / 2, y, scale, color); }
export function shortened(value: string, width: number, scale = 2) { let result = value; while (textWidth(result, scale) > width) result = result.slice(0, -1); return result.length < value.length ? `${result.slice(0, -2)}..` : result; }
export function header(ctx: CanvasRenderingContext2D, label: string, p: Palette) {
  rect(ctx, 0, 0, W, 23, p.ink);
  [0, 1, 2].forEach(i => rect(ctx, 10 + i * 4, 8, 2, 7, p.highlight));
  text(ctx, label, 30, 8, 1, p.paper);
  rect(ctx, 293, 7, 19, 9, p.paper); rect(ctx, 312, 10, 2, 3, p.paper); rect(ctx, 295, 9, 15, 5, p.ink);
  [0, 1, 2].forEach(i => rect(ctx, 296 + i * 5, 9, 4, 5, p.highlight));
}
export function footer(ctx: CanvasRenderingContext2D, p: Palette, a: string, b: string, hits: Hit[]) {
  rect(ctx, 0, 194, W, 22, p.ink);
  rect(ctx, 10, 200, 11, 11, p.highlight); text(ctx, "A", 13, 202, 1, p.ink); text(ctx, a, 27, 202, 1, p.paper);
  rect(ctx, 187, 200, 11, 11, p.soft); text(ctx, "B", 190, 202, 1, p.ink); text(ctx, b, 204, 202, 1, p.paper);
  hits.push({ x: 0, y: 194, w: 180, h: 22, action: { control: "a" } }, { x: 181, y: 194, w: 143, h: 22, action: { control: "b" } });
}
export function scrollbar(ctx: CanvasRenderingContext2D, current: number, max: number, y: number, h: number, p: Palette) {
  rect(ctx, 313, y, 3, h, p.soft);
  const thumb = Math.max(10, Math.round(h * h / (h + max)));
  rect(ctx, 313, y + Math.round(max ? current / max * (h - thumb) : 0), 3, thumb, p.accent);
}

