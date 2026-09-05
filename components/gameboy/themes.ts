export const THEMES = [
  { id:"color", name:"Original", paper:"#eeeede", ink:"#24374d", muted:"#68777a", soft:"#d8ddcd", accent:"#446cbe", highlight:"#f3c568" },
  { id:"dmg", name:"Classic", paper:"#c3ce72", ink:"#253b25", muted:"#5b702f", soft:"#a4b65b", accent:"#46602b", highlight:"#d9e39a" },
  { id:"glacier", name:"Glacier", paper:"#dceaf1", ink:"#233958", muted:"#627c99", soft:"#bbd2e5", accent:"#456caa", highlight:"#f3f8ff" },
  { id:"berry", name:"Berry", paper:"#f2dce8", ink:"#45233f", muted:"#966781", soft:"#ddb9cf", accent:"#995078", highlight:"#ffdf9f" },
  { id:"crimson", name:"Crimson", paper:"#fff0e9", ink:"#541b24", muted:"#915a61", soft:"#efd0cb", accent:"#c8203c", highlight:"#ffe2a0" },
  { id:"mint", name:"Mint", paper:"#e3f3e9", ink:"#173e36", muted:"#56796c", soft:"#bbdccc", accent:"#247665", highlight:"#f4e5a8" },
  { id:"violet", name:"Violet", paper:"#ede7fa", ink:"#35264c", muted:"#76648f", soft:"#d3c5ea", accent:"#7545b0", highlight:"#ffe3a0" },
  { id:"midnight", name:"Midnight", paper:"#172333", ink:"#e5edf7", muted:"#a0b2c8", soft:"#2c3d53", accent:"#a8c6f5", highlight:"#604126" },
] as const;
export type PaletteId = typeof THEMES[number]["id"];
export type Palette = { paper:string; ink:string; muted:string; soft:string; accent:string; highlight:string };
export function themeFor(id: PaletteId): Palette { return THEMES.find(theme=>theme.id===id) ?? THEMES[0]; }
export function isPalette(value: unknown): value is PaletteId { return THEMES.some(theme=>theme.id===value); }
