type Point = [number, number, number];
type Colour = [number, number, number];
type Vertex = (p: Point, c: Colour, weight: number, kind: number) => void;
type Quad = (
  a: Point,
  b: Point,
  c: Point,
  d: Point,
  colour: Colour,
  kind: number,
) => void;

export function river(x: number) {
  return {
    z:
      -10.4 +
      4.3 * Math.sin(x * 0.24 + 0.63) +
      1.45 * Math.sin(x * 0.46 + 0.35),
    half: 1.08 + 0.27 * Math.cos(x * 0.33),
    level: -0.49 + Math.sin(x * 0.035) * 0.12,
  };
}

export function tree(
  vertex: Vertex,
  x: number,
  y: number,
  z: number,
  h: number,
  birch: boolean,
  flip: boolean,
  tint: number,
) {
  const half = h * (birch ? 0.38 : 0.61);
  const lo = birch ? 0.623 : 0.004,
    hi = birch ? 0.999 : 0.613;
  for (const [side, top] of [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 0],
    [1, 1],
    [0, 1],
  ]) {
    vertex(
      [x + (2 * side - 1) * half, y + top * h, z],
      [Boolean(side) !== flip ? hi : lo, top ? 0.003 : 0.997, tint],
      top * 0.28,
      8,
    );
  }
}

export function alpineRange(vertex: Vertex) {
  // The high massif sits well behind the two modelled foothills.
  for (let repeat = -1; repeat <= 1; repeat++) {
    const x = repeat * 130 - 65;
    for (const [side, top] of [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
      [1, 1],
      [0, 1],
    ]) {
      vertex(
        [x + 130 * side, -8 + top * 32, -65],
        [repeat === 0 ? side : 1 - side, 1 - top, 1],
        0,
        9,
      );
    }
  }
}

export function windmill(
  vertex: Vertex,
  quad: Quad,
  x: number,
  y: number,
  z: number,
) {
  const scale = 0.63;
  const point = (a: number, r: number, height: number): Point => [
    x + Math.cos(a) * r * scale,
    y + height * scale,
    z + Math.sin(a) * r * scale,
  ];
  function frustum(
    bottom: number,
    top: number,
    r0: number,
    r1: number,
    col: Colour,
  ) {
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8,
        b = ((i + 1) * Math.PI) / 8;
      quad(
        point(a, r0, bottom),
        point(b, r0, bottom),
        point(b, r1, top),
        point(a, r1, top),
        col,
        3,
      );
    }
  }
  frustum(-0.14, 0.24, 0.77, 0.73, [0.53, 0.49, 0.4]);
  frustum(0.24, 2.85, 0.73, 0.47, [0.89, 0.8, 0.63]);
  frustum(0.89, 0.94, 0.73, 0.73, [0.38, 0.32, 0.23]);
  frustum(2.05, 2.12, 0.64, 0.64, [0.43, 0.35, 0.25]);
  frustum(2.83, 2.94, 0.54, 0.54, [0.29, 0.22, 0.18]);
  frustum(2.94, 3.54, 0.56, 0.075, [0.48, 0.28, 0.18]);
  function opening(height: number, width: number, h: number, r: number) {
    const p = (dx: number, dy: number): Point => [
      x + dx * scale,
      y + (height + dy) * scale,
      z + r * scale,
    ];
    quad(
      p(-width / 2, 0),
      p(width / 2, 0),
      p(width / 2, h),
      p(-width / 2, h),
      [0.22, 0.2, 0.17],
      3,
    );
  }
  opening(0.02, 0.35, 0.71, 0.735);
  opening(1.23, 0.22, 0.32, 0.642);
  opening(2.07, 0.19, 0.27, 0.569);
  // Rotor vertices also carry their hub-relative coordinates so the four
  // lattice sails rotate together without rebuilding any geometry.
  const hub = y + 2.72 * scale;
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + 0.48;
    function blade(
      start: number,
      end: number,
      inner: number,
      outer: number,
      col: Colour,
      depth: number,
    ) {
      for (const [r, v] of [
        [start, inner],
        [end, inner],
        [end, outer],
        [start, inner],
        [end, outer],
        [start, outer],
      ]) {
        const dx = (Math.cos(a) * r - Math.sin(a) * v) * scale,
          dy = (Math.sin(a) * r + Math.cos(a) * v) * scale;
        vertex(
          [x + dx, hub + dy, z + depth * scale],
          [col[0], col[1], dy],
          dx,
          11,
        );
      }
    }
    blade(0.42, 1.78, 0.032, 0.31, [0.86, 0.76, 0.62], 0.78);
    blade(0, 1.91, -0.045, 0.047, [0.32, 0.24, 0.17], 0.8);
    blade(0.4, 1.9, 0.3, 0.326, [0.44, 0.33, 0.2], 0.8);
    for (let j = 0; j < 6; j++)
      blade(
        0.42 + j * 0.265,
        0.45 + j * 0.265,
        0.035,
        0.327,
        [0.45, 0.35, 0.23],
        0.81,
      );
  }
}
