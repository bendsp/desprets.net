import { BOOT } from "./boot-timeline";
import { themeFor } from "./themes";
import { rect, center, header, footer, scrollbar, shortened, type Hit, type ScreenLayout } from "./screen-ui";
import { drawGame, drawGames, drawSettings } from "./game-display";
export type { Hit, ScreenLayout } from "./screen-ui";
import { articles, entryFor, entriesFor, MENU, SCREEN_WIDTH as W, SCREEN_HEIGHT as H, sectionPage, type ConsoleState, type Entry } from "./console";
import { pixelText as text, textWidth, wrapText } from "./pixel-font";
import { easeOut, progress } from "./boot";

const icons = [
  "000111000/001111100/001111100/000111000/000010000/011111110/111111111/111111111",
  "011100000/111110000/111111111/100000001/100000001/100000001/111111111/000000000",
  "000010000/001111100/111111111/001111100/001111101/001111101/000111001/000000001",
  "000000000/111111111/110000011/101000101/100101001/100010001/100000001/111111111",
  "000000000/011111110/110000011/101000101/111100011/101001001/110000011/011111110",
  "000111000/010111010/111000111/110010011/110010011/111000111/010111010/000111000",
];
function icon(ctx: CanvasRenderingContext2D, index: number, x: number, y: number, scale: number, color: string) {
  ctx.fillStyle = color;
  icons[index].split("/").forEach((row, dy) => [...row].forEach((v, dx) => { if (v === "1") ctx.fillRect(x + dx * scale, y + dy * scale, scale, scale); }));
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
    const p = themeFor(palette);
    const shades = [p.ink,p.muted,p.accent,p.soft,p.paper].map(hex => [1,3,5].map(start => parseInt(hex.slice(start,start+2),16)));
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
    const ctx = this.ctx; const p = themeFor(state.palette); const hits: Hit[] = []; const page = state.page;
    ctx.imageSmoothingEnabled = false; rect(ctx, 0, 0, W, H, p.paper);
    if (page.kind === "menu") {
      header(ctx, "DESPRETS.NET", p);
      text(ctx, "BEN DESPRETS", 14, 31, 1, p.muted);
      text(ctx, "HOME", 284, 31, 1, p.muted);
      MENU.forEach((section, index) => {
        const x = 14 + index % 2 * 154; const y = 46 + Math.floor(index / 2) * 48; const active = index === page.selected;
        rect(ctx, x + 2, y + 2, 142, 41, p.soft); rect(ctx, x, y, 142, 41, active ? p.accent : p.soft);
        if (active) { rect(ctx, x, y, 3, 41, p.highlight); rect(ctx, x + 2, y + 2, 138, 1, "#ffffff30"); }
        icon(ctx, index, x + 9, y + 13, 2, active ? p.highlight : p.muted);
        text(ctx, section, x + 34, y + 15, 2, active ? p.paper : p.ink);
        hits.push({ x, y, w: 142, h: 41, action: { page: sectionPage(index) } });
      });
      footer(ctx, p, "OPEN", "BACK", hits);
      return { hits, limit: 0 };
    }
    if (page.kind === "games") return drawGames(ctx,state,page,p);
    if (page.kind === "settings") return drawSettings(ctx,state,page,p);
    if (page.kind === "game") return drawGame(ctx,state,page.game,p);
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
    const ctx = this.ctx; const t = reduced ? 3.3 : time - BOOT.screenOn;
    const paper = "#faf7fc", blue = "#243cba";
    rect(ctx,0,0,W,H,t < 0 ? "#15272d" : paper);
    if (t < 0) return;
    const fade = reduced ? 0 : progress(t,BOOT.fadeStart,BOOT.fadeDuration);
    ctx.save(); ctx.globalAlpha = 1-fade;
    const word = "Ben Desprets", scale = 4, left = (W-textWidth(word,scale))/2;
    // Fit every glyph into the same arrival window before the original highlight.
    const stagger = (BOOT.settled-BOOT.letters-BOOT.letterFlight) / (word.length-1);
    const colors = ["#2543c7","#159cdc","#16bdaa","#3bcc44","#d3d70b","#ffa821","#f14c63","#ed33c6"];
    let x = left;
    [...word].forEach((letter,index)=>{
      const flight = progress(t,BOOT.letters+index*stagger,BOOT.letterFlight);
      if (flight <= 0) { x += textWidth(letter,scale)+scale; return; }
      const p = easeOut(flight), size = 1+(1-p)*1.8;
      const y = 87+(1-p)*70-Math.sin(p*Math.PI)*55;
      ctx.save(); ctx.translate(x+(1-p)*220,y); ctx.transform(1,0,-.12,1,0,0); ctx.scale(size,size);
      text(ctx,letter,0,0,scale,flight >= 1 ? blue : colors[Math.min(colors.length-1,Math.floor((1-flight)*colors.length))]);
      ctx.restore(); x += textWidth(letter,scale)+scale;
    });
    // The original's highlight travels through the settled word before the chime finishes.
    const shine = progress(t,BOOT.shineStart,BOOT.shineDuration);
    if (shine > 0 && shine < 1) {
      const sweep = left-44+shine*(textWidth(word,scale)+88);
      for (const [offset,width,color] of [[-26,16,"#8259d4"],[-10,13,"#d65be0"],[3,8,"#f9c9f5"],[11,13,"#cf63db"],[24,12,"#8761d2"]] as const) {
        ctx.save(); ctx.beginPath(); ctx.rect(sweep+offset,84,width,43); ctx.clip();
        ctx.translate(left,87); ctx.transform(1,0,-.12,1,0,0); text(ctx,word,0,0,scale,color); ctx.restore();
      }
    }
    ctx.globalAlpha = (1-fade)*progress(t,.05,.18);
    center(ctx,"desprets.net",165,1,"#cc43bc"); ctx.restore();
  }
}

export function articleLayout(entry: Entry) {
  const title = wrapText(entry.title, 290, 2); const subtitle = wrapText(entry.subtitle, 290, 1); const body = wrapText(entry.body, 288, 2);
  const height = title.length * 19 + 6 + subtitle.length * 11 + 24 + (entry.image ? entry.id === "about" ? 75 : 113 : 0) + body.reduce((sum, line) => sum + (line ? 20 : 11), 0) + 11 + (entry.links?.length ?? 0) * 34;
  return { title, subtitle, body, limit: Math.max(0, height - 151) };
}
