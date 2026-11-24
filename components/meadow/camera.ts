export function displaySize(portrait: boolean) {
  return portrait ? { w: 1.29, h: 2.05 } : { w: 2.58, h: 1.54 };
}
export const sill = 1.68;

export const lensY = 0.46;
export function framing(width: number, height: number) {
  const portrait = width < height;
  const { w, h } = displaySize(portrait);
  const closeScale = Math.min(
    (width * (portrait ? 0.89 : 0.885)) / w,
    (height * (portrait ? 0.76 : 0.83)) / h,
  );
  const wideScale = Math.min(
    (width * (portrait ? 0.39 : 0.255)) / w,
    (height * 0.35) / h,
  );
  return { w, h, closeScale, wideScale };
}
export function camera(
  width: number,
  height: number,
  approach: number,
  exit: number,
) {
  const { w, h, closeScale, wideScale } = framing(width, height);
  const focus = approach * (1 - exit);
  const scale = wideScale + (closeScale - wideScale) * focus;
  const x = (width < height ? 0.12 : 0.32) * (1 - approach) + 0.31 * exit;
  const y = sill + h * 0.5 - 0.1 * (1 - focus);
  const z = height / (2 * lensY * scale);
  return {
    x,
    y,
    z,
    pixelsPerMetre: scale,
    scale: scale / closeScale,
    left: width / 2 - (w * 0.5 + x) * scale,
    top: height / 2 - (sill + h - y) * scale,
  };
}
