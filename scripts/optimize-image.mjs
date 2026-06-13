#!/usr/bin/env node
// Generate the 1x/2x WebP variants that <Figure> expects.
//
//   pnpm img <source> <base-name> [display-width]
//
//   pnpm img ~/Downloads/photo.jpg garden-board 380
//     -> public/garden-board-380.webp   (1x)
//     -> public/garden-board-760.webp   (2x)
//
// Then in MDX:
//   <Figure src="/garden-board" alt="..." width={380} height={285} />
// (height = width / aspect ratio; the script prints it for you)

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const [source, baseName, displayWidth = "380"] = process.argv.slice(2);

if (!source || !baseName) {
  console.error("usage: pnpm img <source> <base-name> [display-width]");
  process.exit(1);
}

const width = Number(displayWidth);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(scriptDir, "..", "public");
await mkdir(outDir, { recursive: true });

const { width: srcW, height: srcH } = await sharp(source).metadata();
if (!srcW || !srcH) {
  throw new Error(`Could not read image dimensions from ${source}`);
}
const displayHeight = Math.round((width * srcH) / srcW);

for (const [w, quality] of [
  [width, 82],
  [width * 2, 75],
]) {
  if (w > srcW) {
    console.warn(`warning: upscaling ${srcW}px source to ${w}px`);
  }
  const out = path.join(outDir, `${baseName}-${w}.webp`);
  const { size } = await sharp(source)
    .resize(w)
    .webp({ quality, effort: 6 })
    .toFile(out);
  console.log(`${out}  ${(size / 1024).toFixed(1)} KB`);
}

console.log(
  `\n<Figure src="/${baseName}" alt="..." width={${width}} height={${displayHeight}} />`,
);
