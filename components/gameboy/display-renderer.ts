import { articles, entryFor, entriesFor, MENU, SCREEN_WIDTH as W, SCREEN_HEIGHT as H, type ConsoleState, type Page, type Entry } from "./console";
import { pixelText as text, textWidth, wrapText } from "./pixel-font";
import { easeOut, progress } from "./boot";

export type Hit = { x: number; y: number; w: number; h: number; action: { page: Page } | { url: string } | { control: "a" | "b" } };
export type ScreenLayout = { hits: Hit[]; limit: number };
type Palette = { paper: string; ink: string; muted: string; soft: string; accent: string; highlight: string };
const palettes: Record<ConsoleState["palette"], Palette> = {
  color: { paper: "#eeeede", ink: "#24374d", muted: "#68777a", soft: "#d8ddcd", accent: "#446cbe", highlight: "#f3c568" },
  pocket: { paper: "#c4d59b", ink: "#263c31", muted: "#5a7650", soft: "#a1b879", accent: "#426249", highlight: "#d5e4af" },
};
const icons = [
  "000111000/001111100/001111100/000111000/000010000/011111110/111111111/111111111",
  "011100000/111110000/111111111/100000001/100000001/100000001/111111111/000000000",
  "000010000/001111100/111111111/001111100/001111101/001111101/000111001/000000001",
  "000000000/111111111/110000011/101000101/100101001/100010001/100000001/111111111",
];
function icon(ctx: CanvasRenderingContext2D, index: number, x: number, y: number, scale: number, color: string) {
  ctx.fillStyle = color;
  icons[index].split("/").forEach((row, dy) => [...row].forEach((v, dx) => { if (v === "1") ctx.fillRect(x + dx * scale, y + dy * scale, scale, scale); }));
}
function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function center(ctx: CanvasRenderingContext2D, value: string, y: number, scale: number, color: string) { text(ctx, value, (W - textWidth(value, scale)) / 2, y, scale, color); }
function shortened(value: string, width: number, scale = 2) { let result = value; while (textWidth(result, scale) > width) result = result.slice(0, -1); return result.length < value.length ? `${result.slice(0, -2)}..` : result; }
function header(ctx: CanvasRenderingContext2D, label: string, p: Palette) {
  rect(ctx, 0, 0, W, 23, p.ink);
  [0, 1, 2].forEach(i => rect(ctx, 10 + i * 4, 8, 2, 7, p.highlight));
  text(ctx, label, 30, 8, 1, p.paper);
  rect(ctx, 293, 7, 19, 9, p.paper); rect(ctx, 312, 10, 2, 3, p.paper); rect(ctx, 295, 9, 15, 5, p.ink);
  [0, 1, 2].forEach(i => rect(ctx, 296 + i * 5, 9, 4, 5, p.highlight));
}
function footer(ctx: CanvasRenderingContext2D, p: Palette, a: string, b: string, hits: Hit[]) {
  rect(ctx, 0, 194, W, 22, p.ink);
  rect(ctx, 10, 200, 11, 11, p.highlight); text(ctx, "A", 13, 202, 1, p.ink); text(ctx, a, 27, 202, 1, p.paper);
  rect(ctx, 187, 200, 11, 11, p.soft); text(ctx, "B", 190, 202, 1, p.ink); text(ctx, b, 204, 202, 1, p.paper);
  hits.push({ x: 0, y: 194, w: 180, h: 22, action: { control: "a" } }, { x: 181, y: 194, w: 143, h: 22, action: { control: "b" } });
}
function scrollbar(ctx: CanvasRenderingContext2D, current: number, max: number, y: number, h: number, p: Palette) {
  rect(ctx, 313, y, 3, h, p.soft);
  const thumb = Math.max(10, Math.round(h * h / (h + max)));
  rect(ctx, 313, y + Math.round(max ? current / max * (h - thumb) : 0), 3, thumb, p.accent);
}

export class DisplayRenderer {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private images = new Map<string, HTMLImageElement>();
  private portraits = new Map<string, HTMLCanvasElement>();
  private disposed = false;
  constructor(onImage: () => void) {
    this.canvas = document.createElement("canvas"); this.canvas.width = W; this.canvas.height = H;
    this.ctx = this.canvas.getContext("2d")!;
    for (const src of new Set(["/pfp-380.webp", ...articles.flatMap(item => item.image ? [item.image] : [])])) {
      const image = new Image();
      image.onload = () => { if (!this.disposed) { this.images.set(src, image); onImage(); } };
      image.src = src;
    }
  }
  dispose() { this.disposed = true; this.images.clear(); this.portraits.clear(); }
  private portrait(palette: ConsoleState["palette"]) {
    const cached = this.portraits.get(palette); if (cached) return cached;
    const image = this.images.get("/pfp-380.webp"); if (!image) return;
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 56;
    const ctx = canvas.getContext("2d")!; ctx.drawImage(image, 0, 0, 56, 56);
    const data = ctx.getImageData(0, 0, 56, 56);
    const shades = palette === "color" ? [[36, 55, 77], [85, 104, 111], [156, 167, 149], [216, 221, 205], [243, 197, 104]] : [[38, 60, 49], [66, 98, 73], [90, 118, 80], [161, 184, 121], [196, 213, 155]];
    const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (let i = 0; i < data.data.length; i += 4) {
      const x = i / 4 % 56; const y = Math.floor(i / 4 / 56);
      const luma = .2126 * data.data[i] + .7152 * data.data[i + 1] + .0722 * data.data[i + 2] + (bayer[y % 4 * 4 + x % 4] - 7.5) * 3;
      const shade = shades[Math.max(0, Math.min(4, Math.floor(luma / 52)))];
      data.data[i] = shade[0]; data.data[i + 1] = shade[1]; data.data[i + 2] = shade[2];
    }
    ctx.putImageData(data, 0, 0); this.portraits.set(palette, canvas); return canvas;
  }
  draw(state: ConsoleState): ScreenLayout {
    const ctx = this.ctx; const p = palettes[state.palette]; const hits: Hit[] = []; const page = state.page;
    ctx.imageSmoothingEnabled = false; rect(ctx, 0, 0, W, H, p.paper);
    if (page.kind === "menu") {
      header(ctx, "DESPRETS.NET", p);
      rect(ctx, 16, 36, 66, 66, p.ink); rect(ctx, 18, 38, 62, 62, p.highlight);
      const portrait = this.portrait(state.palette); if (portrait) ctx.drawImage(portrait, 21, 41);
      text(ctx, "BEN", 98, 34, 3, p.ink); text(ctx, "DESPRETS", 98, 61, 3, p.ink);
      text(ctx, "FULL-STACK DEVELOPER", 99, 93, 1, p.muted);
      MENU.forEach((section, index) => {
        const x = 14 + index % 2 * 154; const y = 115 + Math.floor(index / 2) * 37; const active = index === page.selected;
        rect(ctx, x + 2, y + 2, 142, 30, p.soft); rect(ctx, x, y, 142, 30, active ? p.accent : p.soft);
        if (active) { rect(ctx, x, y, 3, 30, p.highlight); rect(ctx, x + 2, y + 2, 138, 1, "#ffffff30"); }
        icon(ctx, index, x + 9, y + 7, 2, active ? p.highlight : p.muted);
        text(ctx, section, x + 34, y + 9, 2, active ? p.paper : p.ink);
        hits.push({ x, y, w: 142, h: 30, action: { page: section === "Work" || section === "Contact" ? { kind: "list", section, selected: 0 } : { kind: "article", id: section.toLowerCase(), scroll: 0 } } });
      });
      footer(ctx, p, "OPEN", "BACK", hits);
      return { hits, limit: 0 };
    }
    if (page.kind === "list") {
      const entries = entriesFor(page.section); const first = Math.max(0, Math.min(entries.length - 4, page.selected - 2));
      header(ctx, `BEN / ${page.section.toUpperCase()}`, p);
      text(ctx, page.section, 14, 32, 2, p.ink);
      const count = `${String(page.selected + 1).padStart(2, "0")} / ${String(entries.length).padStart(2, "0")}`;
      text(ctx, count, W - 17 - textWidth(count), 37, 1, p.muted);
      entries.slice(first, first + 4).forEach((entry, index) => {
        const y = 57 + index * 33; const selected = first + index === page.selected;
        if (selected) { rect(ctx, 9, y, 297, 31, p.accent); rect(ctx, 9, y, 3, 31, p.highlight); }
        text(ctx, selected ? ">" : String(first + index + 1).padStart(2, "0"), 18, y + 7, 1, selected ? p.highlight : p.muted);
        text(ctx, shortened(entry.title, 257), 36, y + 4, 2, selected ? p.paper : p.ink);
        text(ctx, shortened(entry.subtitle, 257, 1), 36, y + 22, 1, selected ? p.soft : p.muted);
        hits.push({ x: 9, y, w: 297, h: 31, action: { page: { kind: "article", id: entry.id, scroll: 0 } } });
      });
      if (entries.length > 4) scrollbar(ctx, page.selected, entries.length - 1, 58, 127, p);
      footer(ctx, p, "OPEN", "BACK", hits);
      return { hits, limit: 0 };
    }
    const entry = entryFor(page.id); const layout = articleLayout(entry);
    const scroll = Math.max(0, Math.min(page.scroll, layout.limit));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 28, W, 161); ctx.clip();
    let y = 34 - scroll;
    for (const line of layout.title) { text(ctx, line, 14, y, 2, p.ink); y += 19; }
    y += 6;
    for (const line of layout.subtitle) { text(ctx, line, 14, y, 1, p.muted); y += 11; }
    y += 10; rect(ctx, 14, y, 290, 1, p.soft); y += 13;
    if (entry.image) {
      if (entry.id === "about") {
        const portrait = this.portrait(state.palette);
        rect(ctx, 15, y + 2, 58, 58, p.ink); if (portrait) ctx.drawImage(portrait, 16, y + 3);
        text(ctx, "Ben", 88, y + 10, 2, p.ink); text(ctx, "Desprets", 88, y + 30, 2, p.ink);
        y += 75;
      } else {
        const image = this.images.get(entry.image); rect(ctx, 14, y, 290, 100, p.soft);
        if (image) { const ratio = Math.min(286 / image.width, 96 / image.height); ctx.drawImage(image, 16 + (286 - image.width * ratio) / 2, y + 2 + (96 - image.height * ratio) / 2, image.width * ratio, image.height * ratio); }
        y += 113;
      }
    }
    for (const line of layout.body) { if (line) text(ctx, line, 14, y, 2, p.ink); y += line ? 20 : 11; }
    y += 11;
    entry.links?.forEach((link, index) => {
      const selected = index === (page.link ?? 0);
      rect(ctx, 14, y, 290, 28, selected ? p.accent : p.soft);
      text(ctx, ">", 24, y + 8, 2, selected ? p.highlight : p.ink); text(ctx, link.label, 43, y + 10, 1, selected ? p.paper : p.ink);
      const visibleY = Math.max(28, y); const visibleHeight = Math.min(189, y + 28) - visibleY;
      if (visibleHeight > 0) hits.push({ x: 14, y: visibleY, w: 290, h: visibleHeight, action: { url: link.url } });
      y += 34;
    });
    ctx.restore();
    header(ctx, `BEN / ${shortened(entry.title.toUpperCase(), 251, 1)}`, p);
    if (layout.limit) scrollbar(ctx, scroll, layout.limit, 32, 152, p);
    footer(ctx, p, scroll >= layout.limit && entry.links?.length ? "OPEN LINK" : "SCROLL", "BACK", hits);
    return { hits, limit: layout.limit };
  }
  boot(time: number, reduced: boolean) {
    const ctx = this.ctx; const t = reduced ? 4.25 : time;
    rect(ctx, 0, 0, W, H, t < 1.8 ? "#15272d" : "#f3f4e8");
    if (t < 1.8) return;
    const colors = ["#d95d72", "#ecaa54", "#c2bf54", "#60ab82", "#5698c4", "#8374be"];
    const word = "DESPRETS"; const scale = 5; const left = (W - textWidth(word, scale)) / 2;
    let x = left;
    [...word].forEach((letter, index) => {
      const p = easeOut(progress(t, 2.15 + index * .055, .9));
      const y = 84 - (1 - p) * (100 + index * 8);
      // Six offset colors converge into the lettering, like light settling in an LCD.
      for (let band = 5; band >= 0; band--) {
        const spread = (1 - easeOut(progress(t, 2.7 + index * .04, .95))) * (band + 1) * 8;
        text(ctx, letter, x + spread * .2, y - spread, scale, colors[band]);
      }
      text(ctx, letter, x, y, scale, t > 3.7 ? "#4668aa" : colors[index % colors.length]);
      x += textWidth(letter, scale) + scale;
    });
    if (t > 3.5) {
      ctx.globalAlpha = progress(t, 3.5, .45); center(ctx, "desprets.net", 132, 1, "#56677c");
      center(ctx, "BEN DESPRETS", 180, 1, "#85908d"); ctx.globalAlpha = 1;
    }
  }
}

export function articleLayout(entry: Entry) {
  const title = wrapText(entry.title, 290, 2); const subtitle = wrapText(entry.subtitle, 290, 1); const body = wrapText(entry.body, 288, 2);
  const height = title.length * 19 + 6 + subtitle.length * 11 + 24 + (entry.image ? entry.id === "about" ? 75 : 113 : 0) + body.reduce((sum, line) => sum + (line ? 20 : 11), 0) + 11 + (entry.links?.length ?? 0) * 34;
  return { title, subtitle, body, limit: Math.max(0, height - 151) };
}
