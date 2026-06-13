#!/usr/bin/env node
import sharp from "sharp";

const width = 1200;
const height = 630;

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const textBlock = (lines, x, y, fontSize, lineHeight, fill, weight = 400) =>
  `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="${weight}" fill="${fill}">
    ${lines
      .map(
        (line, index) =>
          `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(
            line,
          )}</tspan>`,
      )
      .join("")}
  </text>`;

const svg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#f8f5ef"/>
  <style>
    text {
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      letter-spacing: 0;
    }
  </style>
  ${textBlock(["Ben Desprets"], 86, 130, 76, 88, "#121212", 500)}
  ${textBlock(
    [
      "Freelance developer focused",
      "on building clean, useful",
      "software. I like working on",
      "frontend, backend, data and ML.",
    ],
    88,
    246,
    38,
    54,
    "#5f5c57",
  )}
  ${textBlock(["desprets.net"], 88, 520, 35, 42, "#171717", 600)}
</svg>`);

await sharp({
  create: {
    width,
    height,
    channels: 3,
    background: "#f8f5ef",
  },
})
  .composite([
    {
      input: svg,
      left: 0,
      top: 0,
    },
    {
      input: await sharp("public/pfp.jpg")
        .resize(420, 420, { fit: "cover" })
        .jpeg({ quality: 92 })
        .toBuffer(),
      left: 690,
      top: 105,
    },
  ])
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile("public/og.jpg");
