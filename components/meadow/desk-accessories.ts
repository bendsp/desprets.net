type Point = [number, number, number];
type Color = [number, number, number];
type Quad = (
  a: Point,
  b: Point,
  c: Point,
  d: Point,
  color: Color,
  kind: number,
) => void;
type Box = (
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  color: Color,
) => void;

export function addDeskAccessories(
  box: Box,
  quad: Quad,
  deskWidth: number,
  vertex: (p: Point, col: Color, wind: number, kind: number) => void,
) {
  const padWidth = Math.min(deskWidth * 0.9, 2.13);
  const padDepth = (padWidth * 4) / 9;
  const padY = 0.974;
  const front = 0.515;
  const padZ = front - padDepth / 2;
  // QcK XXL: a thin rubber edge around a charcoal cloth top.
  box(0, padY - 0.008, padZ, padWidth, 0.014, padDepth, [0.051, 0.055, 0.058]);
  box(
    0,
    padY,
    padZ,
    padWidth - 0.008,
    0.006,
    padDepth - 0.008,
    [0.105, 0.111, 0.116],
  );
  const ink: Color = [0.76, 0.78, 0.77];
  const logoX = -padWidth / 2 + 0.075,
    logoZ = front - 0.061;
  function ring(x: number, z: number, r: number, inner: number) {
    const point = (angle: number, radius: number): Point => [
      x + Math.cos(angle) * radius,
      padY + 0.0045,
      z + Math.sin(angle) * radius,
    ];
    for (let part = 0; part < 24; part++) {
      const a = (part * Math.PI) / 12,
        b = ((part + 1) * Math.PI) / 12;
      quad(point(a, r), point(b, r), point(b, inner), point(a, inner), ink, 3);
    }
  }
  ring(logoX, logoZ, 0.031, 0.02);
  ring(logoX, logoZ, 0.012, 0.004);
  ring(logoX - 0.029, logoZ - 0.029, 0.0056, 0);
  box(logoX - 0.032, padY + 0.004, logoZ, 0.015, 0.002, 0.009, ink);
  box(logoX, padY + 0.004, logoZ - 0.032, 0.009, 0.002, 0.015, ink);

  // ANSI K8 Pro: separated function row, six navigation keys, inverted-T arrows.
  const pitch = padWidth * 0.024,
    keyWidth = pitch * 0.91,
    left = -pitch * 12.45;
  const rear = padZ - 0.12,
    deck = padY + 0.055;
  box(
    left + pitch * 9.22,
    deck - 0.021,
    rear + pitch * 2.94,
    pitch * 19.1,
    0.065,
    pitch * 7.1,
    [0.083, 0.088, 0.096],
  );
  let keyIndex = 0;
  function key(
    unit: number,
    row: number,
    span = 1,
    accent = false,
    modifier = false,
  ) {
    const x = left + (unit + span / 2) * pitch,
      z = rear + row * pitch;
    const y = deck + (6 - row) * 0.002;
    const half = (pitch * span - 0.003) * 0.5,
      depth = keyWidth * 0.5;
    const c: Color = accent
      ? [0.77, 0.224, 0.15]
      : modifier
        ? [0.233, 0.255, 0.278]
        : [0.345, 0.37, 0.398];
    const at = (i: number, j: number, top: boolean): Point => [
      x + i * (half - (top ? 0.003 : 0)),
      y + (top ? 0.031 : 0.009),
      z + j * (depth - (top ? 0.004 : 0)),
    ];
    for (const [a, b] of [
      [
        [-1, -1],
        [1, -1],
      ],
      [
        [1, -1],
        [1, 1],
      ],
      [
        [1, 1],
        [-1, 1],
      ],
      [
        [-1, 1],
        [-1, -1],
      ],
    ]) {
      quad(
        at(a[0], a[1], false),
        at(b[0], b[1], false),
        at(b[0], b[1], true),
        at(a[0], a[1], true),
        c,
        3,
      );
    }
    const cell = keyIndex++;
    for (const [i, j] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, -1],
      [1, 1],
      [-1, 1],
    ]) {
      const u = ((cell % 16) + (i + 1) * 0.47 + 0.03) / 16,
        v = (Math.floor(cell / 16) + (j + 1) * 0.47 + 0.03) / 8;
      vertex(at(i, j, true), [u, v, accent ? 1 : modifier ? 0.5 : 0], 0, 7);
    }
  }
  key(0, 0, 1, true);
  for (const start of [2, 6.5, 11])
    for (let k = 0; k < 4; k++) key(start + k, 0, 1, false, true);
  for (let k = 0; k < 3; k++) key(15.55 + k, 0, 1, false, true);
  const rows = [
    [...Array(13).fill(1), 2],
    [1.5, ...Array(12).fill(1), 1.5],
    [1.75, ...Array(11).fill(1), 2.25],
    [2.25, ...Array(10).fill(1), 2.75],
    [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25],
  ];
  rows.forEach((row, r) => {
    let unit = 0;
    for (const span of row) {
      key(unit, r + 1.55, span, r === 2 && span === 2.25, span !== 1);
      unit += span;
    }
  });
  for (const r of [1.55, 2.55, 5.55])
    for (let k = 0; k < 3; k++) key(15.55 + k, r, 1, false, true);
  key(16.55, 4.55, 1, false, true);

  // Graphite right-handed Lift. The crown leans over the thumb scoop; the
  // split button shell and wheel follow the same sloping face.
  const mx = padWidth * 0.283,
    mz = padZ + 0.065;
  const height = 0.164;
  function mousePoint(t: number, a: number): Point {
    const radius = Math.sqrt(Math.max(0, 1 - t * t));
    const thumb =
      Math.max(0, -Math.cos(a)) * 0.033 * Math.exp(-((t - 0.21) ** 2) / 0.04);
    return [
      mx + t * 0.04 + Math.cos(a) * (0.081 * radius + thumb),
      padY + 0.005 + height * t,
      mz + 0.121 * radius * Math.sin(a) + 0.018 * t,
    ];
  }
  for (let level = 0; level < 12; level++)
    for (let side = 0; side < 28; side++) {
      const a = (2 * Math.PI * side) / 28,
        b = (2 * Math.PI * (side + 1)) / 28;
      const t = level / 12,
        next = (level + 1) / 12;
      const face = Math.cos(a) > 0.05 && Math.sin(a) < 0.6;
      const rib = 0.007 * Math.cos(level * Math.PI);
      const color: Color = face
        ? [0.29, 0.303, 0.308]
        : [0.22 + rib, 0.23 + rib, 0.235 + rib];
      quad(
        mousePoint(t, a),
        mousePoint(t, b),
        mousePoint(next, b),
        mousePoint(next, a),
        color,
        3,
      );
    }
  box(
    mx + 0.055,
    padY + 0.158,
    mz - 0.025,
    0.026,
    0.016,
    0.048,
    [0.093, 0.1, 0.11],
  );
}
