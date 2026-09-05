export const THEMES = [
  { id:"color", name:"Original", paper:"#eeeede", ink:"#24374d", muted:"#68777a", soft:"#d8ddcd", accent:"#446cbe", highlight:"#f3c568" },
  { id:"pocket", name:"Pocket", paper:"#c4d59b", ink:"#263c31", muted:"#5a7650", soft:"#a1b879", accent:"#426249", highlight:"#d5e4af" },
  { id:"dmg", name:"Classic", paper:"#c3ce72", ink:"#253b25", muted:"#5b702f", soft:"#a4b65b", accent:"#46602b", highlight:"#d9e39a" },
  { id:"glacier", name:"Glacier", paper:"#dceaf1", ink:"#233958", muted:"#627c99", soft:"#bbd2e5", accent:"#456caa", highlight:"#f3f8ff" },
  { id:"berry", name:"Berry", paper:"#f2dce8", ink:"#45233f", muted:"#966781", soft:"#ddb9cf", accent:"#995078", highlight:"#ffdf9f" },
  { id:"amber", name:"Amber", paper:"#242c29", ink:"#efd6a0", muted:"#ba9d6b", soft:"#3c4538", accent:"#72582d", highlight:"#ffc76e" },
] as const;
export type PaletteId = typeof THEMES[number]["id"];
export type Palette = { paper:string; ink:string; muted:string; soft:string; accent:string; highlight:string };
export function themeFor(id: PaletteId): Palette { return THEMES.find(theme=>theme.id===id) ?? THEMES[0]; }
export function isPalette(value: unknown): value is PaletteId { return THEMES.some(theme=>theme.id===value); }
