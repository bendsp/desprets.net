// Keep the same paragraph below the sticky header when the document reflows.
export type ReadingPosition = {
  element: HTMLElement;
  fraction: number;
  gap: number;
};

function readingLine(surface: HTMLElement) {
  const framed = surface.closest("[data-framed]");
  const bounds = surface.getBoundingClientRect();
  const scale = framed ? bounds.width / surface.offsetWidth : 1;
  const top = framed ? bounds.top : 0;
  const header = surface.querySelector("header")?.getBoundingClientRect();
  return { y: Math.max(top, header?.bottom ?? top) + 8 * scale, scale };
}

export function capturePosition(surface: HTMLElement): ReadingPosition | null {
  if ((surface.closest("[data-framed]") ? surface.scrollTop : scrollY) < 2)
    return null;
  const { y, scale } = readingLine(surface);
  // At the bottom of the plain page the browser cannot align a short final
  // section with the header. Keep the selected section when entering the CRT.
  if (
    location.hash &&
    !surface.closest("[data-framed]") &&
    scrollY + innerHeight >= document.documentElement.scrollHeight - 2
  ) {
    const target = document.getElementById(location.hash.slice(1));
    const rect = target?.getBoundingClientRect();
    if (target && rect && rect.top >= y && rect.bottom <= innerHeight)
      return { element: target, fraction: 0, gap: 0 };
  }
  for (const element of surface.querySelectorAll<HTMLElement>(
    "main h1, main h2, main h3, main p, main li, main tr, main figure, footer",
  )) {
    const rect = element.getBoundingClientRect();
    if (rect.height && rect.bottom >= y)
      return {
        element,
        fraction: Math.max(0, (y - rect.top) / rect.height),
        gap: Math.max(0, rect.top - y) / scale,
      };
  }
  return null;
}

export function offsetInView(position: ReadingPosition, surface: HTMLElement) {
  const rect = position.element.getBoundingClientRect();
  const { y, scale } = readingLine(surface);
  return (
    (rect.top + position.fraction * rect.height - y) / scale - position.gap
  );
}
