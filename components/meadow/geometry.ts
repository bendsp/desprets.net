// World units are metres. The monitor face lies in the z = 0 plane.
type Point = [number, number, number];
type RGB = [number, number, number];

export function displaySize(portrait: boolean) {
  return portrait ? { w: 1.29, h: 2.05 } : { w: 2.58, h: 1.54 };
}
export const sill = 1.68;

function ground(x: number, z: number) {
  const field = Math.min(1, Math.hypot(x, z) / 8);
  return (
    field *
      (0.39 * Math.sin(x * 0.39 + z * 0.16) +
        0.28 * Math.sin(z * 0.42) +
        0.13 * Math.sin(x * 0.76 - z * 0.26)) +
    Math.min(0, z + 1) * 0.066
  );
}

export function makeMeadow(portrait: boolean) {
  let seed = 1065;
  const rand = () =>
    (seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296;
  const verts = new Float32Array(8 * 800000);
  let cursor = 0;
  // Interleaved position, base colour, wind weight and surface category.
  function vertex(p: Point, col: RGB, wind: number, kind: number) {
    verts[cursor++] = p[0];
    verts[cursor++] = p[1];
    verts[cursor++] = p[2];
    verts[cursor++] = col[0];
    verts[cursor++] = col[1];
    verts[cursor++] = col[2];
    verts[cursor++] = wind;
    verts[cursor++] = kind;
  }
  function tri(a: Point, b: Point, c: Point, col: RGB, kind: number) {
    vertex(a, col, 0, kind);
    vertex(b, col, 0, kind);
    vertex(c, col, 0, kind);
  }
  function quad(
    a: Point,
    b: Point,
    c: Point,
    d: Point,
    col: RGB,
    kind: number,
  ) {
    tri(a, b, c, col, kind);
    tri(a, c, d, col, kind);
  }
  function box(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    c: RGB,
  ) {
    const p = (i: number, j: number, k: number): Point => [
      x + (i * w) / 2,
      y + (j * h) / 2,
      z + (k * d) / 2,
    ];
    quad(p(-1, -1, 1), p(1, -1, 1), p(1, 1, 1), p(-1, 1, 1), c, 3);
    quad(p(-1, 1, 1), p(1, 1, 1), p(1, 1, -1), p(-1, 1, -1), c, 3);
    quad(p(-1, -1, -1), p(-1, -1, 1), p(-1, 1, 1), p(-1, 1, -1), c, 3);
    quad(p(1, -1, 1), p(1, -1, -1), p(1, 1, -1), p(1, 1, 1), c, 3);
  }
  const { w, h } = displaySize(portrait);
  const desk = portrait ? 2.24 : 3.58;
  const oak: RGB = [0.64, 0.45, 0.27],
    metal: RGB = [0.74, 0.75, 0.72];
  box(0, 0.92, 0, desk, 0.082, 1.1, oak);
  for (const side of [-1, 1])
    for (const end of [-1, 1]) {
      box(
        side * (desk / 2 - 0.12),
        0.44,
        end * 0.44,
        0.054,
        0.91,
        0.062,
        [0.12, 0.14, 0.13],
      );
    }
  // Extruded aluminium arm. The sloped arm connects a desk clamp to the VESA mount.
  function arm(a: Point, b: Point, r: number) {
    const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const ring = (p: Point, k: number): Point => {
      const t = (k * 2 * Math.PI) / 16,
        off = r * Math.cos(t);
      return [
        p[0] - Math.sin(angle) * off,
        p[1] + Math.cos(angle) * off,
        p[2] + Math.sin(t) * r,
      ];
    };
    for (let k = 0; k < 16; k++)
      quad(ring(a, k), ring(a, k + 1), ring(b, k + 1), ring(b, k), metal, 3);
  }
  const hinge: Point = [-0.17, 1.23, -0.32],
    elbow: Point = [w * 0.32, 1.68, -0.32];
  box(-0.17, 0.982, -0.32, 0.22, 0.041, 0.19, metal);
  arm([-0.17, 1.0, -0.32], hinge, 0.049);
  arm(hinge, elbow, 0.057);
  arm(elbow, [w * 0.32, 1.82, -0.32], 0.052);
  box(0.03, 1.86, -0.19, w * 0.66, 0.096, 0.24, metal);
  box(0, sill + h / 2, -0.055, w + 0.046, h + 0.046, 0.098, [0.18, 0.19, 0.18]);
  box(
    0,
    sill + h / 2,
    -0.001,
    w + 0.03,
    h + 0.03,
    0.012,
    [0.054, 0.058, 0.056],
  );

  for (let z = -40; z < 17; z += 1)
    for (let x = -50; x < 50; x += 1) {
      const p = (dx: number, dz: number): Point => [
        x + dx,
        ground(x + dx, z + dz),
        z + dz,
      ];
      quad(p(0, 0), p(0, 1), p(1, 1), p(1, 0), [0.31, 0.38, 0.15], 0);
    }

  // Overlapping ridgelines have independent silhouettes and atmospheric depth.
  for (let layer = 0; layer < 5; layer++) {
    const z = -37 - layer * 10;
    const ridge = (x: number) => {
      const u = x + layer * 7;
      return (
        1.25 +
        layer * 0.72 +
        1.35 * Math.sin(u * 0.105 + layer * 3.7) +
        0.71 * Math.cos(u * 0.25 + layer * 1.7) +
        0.29 * Math.sin(u * 0.68 + layer) +
        0.14 * Math.cos(u * 1.57) +
        0.045 * Math.sin(u * 4.6)
      );
    };
    const slope = (x: number, k: number): Point => {
      const fold =
        0.65 * Math.sin(x * 0.49 + layer) + 0.39 * Math.cos(x * 0.94 + layer);
      return [
        x,
        ridge(x) * (1 - k * 0.22) - k * (1.4 + fold * 0.55),
        z + k * (2.2 + fold),
      ];
    };
    for (let x = -132; x < 132; x += 0.63)
      for (let k = 0; k < 4; k++) {
        quad(
          slope(x, k),
          slope(x + 0.63, k),
          slope(x + 0.63, k + 1),
          slope(x, k + 1),
          [0.19 + layer * 0.034, 0.32 + layer * 0.025, 0.26 + layer * 0.057],
          4,
        );
      }
  }

  // Keep nearby plants in spatial batches so a phone only draws its slice of the field.
  const batches = [
    {
      first: 0,
      count: cursor / 8,
      x0: -Infinity,
      x1: Infinity,
      z0: -Infinity,
      z1: Infinity,
    },
  ];
  // Curved two-tone blades and irregular stands of oat grass.
  for (let clump = 0; clump < 10800; clump++) {
    const near = clump < 7500;
    const index = near ? clump : clump - 7500;
    const across = near ? 10 : 12,
      perTile = near ? 150 : 55;
    const tile = Math.floor(index / perTile);
    const dx = (near ? 25 : 65) / across,
      dz = (near ? 19 : 31) / 5;
    const x0 = ((tile % across) - across / 2) * dx,
      z0 = (near ? -9 : -29) + Math.floor(tile / across) * dz;
    if (index % perTile === 0)
      batches.push({
        first: cursor / 8,
        count: 0,
        x0: x0 - 0.5,
        x1: x0 + dx + 0.5,
        z0: z0 - 0.5,
        z1: z0 + dz + 0.5,
      });
    const x = x0 + rand() * dx,
      z = z0 + rand() * dz;
    if (Math.abs(x) < w * 0.49 && z > -0.55 && z < 0.43) continue;
    const y = ground(x, z);
    const patch = 0.5 + 0.5 * Math.sin(x * 0.76 + Math.sin(z * 0.62) * 2);
    const hue = rand() * 0.45 + patch * 0.42;
    const tall = (0.11 + rand() * 0.22) * (1 + patch * 0.44);
    const count = near ? 6 : 4;
    for (let blade = 0; blade < count; blade++) {
      const angle = rand() * 6.283;
      const bx = x + (rand() - 0.5) * 0.18,
        bz = z + (rand() - 0.5) * 0.18;
      const h = tall * (0.57 + rand() * 0.75);
      const dx = Math.cos(angle) * h * 0.52 + 0.035,
        dz = Math.sin(angle) * h * 0.41;
      const width = (0.006 + rand() * 0.009) * (near ? 1 : 1.75);
      const col: RGB = [
        0.19 + hue * 0.36,
        0.3 + hue * 0.25,
        0.075 + hue * 0.097,
      ];
      const base: Point = [bx, y - 0.012, bz],
        mid: Point = [bx + dx * 0.36, y + h * 0.58, bz + dz * 0.35];
      const tip: Point = [bx + dx, y + h, bz + dz];
      const a: Point = [base[0] - width, base[1], base[2]],
        b: Point = [base[0] + width, base[1], base[2]];
      const c: Point = [mid[0] + width * 0.52, mid[1], mid[2]],
        d: Point = [mid[0] - width * 0.52, mid[1], mid[2]];
      vertex(a, col, 0, 1);
      vertex(b, col, 0, 1);
      vertex(c, col, 0.43, 1);
      vertex(a, col, 0, 1);
      vertex(c, col, 0.43, 1);
      vertex(d, col, 0.43, 1);
      vertex(d, col, 0.43, 1);
      vertex(c, col, 0.43, 1);
      vertex(tip, col, 1, 1);
      if (blade === 0 && hue > 0.61 && rand() > 0.45) {
        const gold: RGB = [0.72, 0.64, 0.37];
        vertex(tip, gold, 1, 1);
        vertex([tip[0] + 0.009, tip[1] + 0.044, tip[2]], gold, 1.1, 1);
        vertex([tip[0] + 0.024, tip[1] + 0.11, tip[2]], gold, 1.2, 1);
      }
    }
  }

  batches.push({
    first: cursor / 8,
    count: 0,
    x0: -12,
    x1: 12,
    z0: -13,
    z1: 10,
  });
  // Flowers grow in little drifts; every head has an inclined disc and petals.
  for (let patch = 0; patch < 185; patch++) {
    const px = (rand() - 0.5) * 22,
      pz = rand() * 21 - 12;
    const poppy = rand() < 0.2;
    const count = 3 + Math.floor(rand() * 9);
    for (let j = 0; j < count; j++) {
      const x = px + (rand() - 0.5) * 1.6,
        z = pz + (rand() - 0.5) * 1.6;
      if (Math.abs(x) < w * 0.6 && z > -0.55 && z < 1.25) continue;
      const y = ground(x, z),
        h = 0.21 + rand() * 0.28,
        r = (poppy ? 0.055 : 0.032) * (0.67 + rand() * 0.69);
      const base: Point = [x, y, z],
        top: Point = [x + 0.03, y + h, z];
      const green: RGB = [0.23, 0.35, 0.1],
        petal: RGB = poppy ? [0.91, 0.23, 0.09] : [0.97, 0.91, 0.72];
      vertex(base, green, 0, 1);
      vertex([x + 0.009, y, z], green, 0, 1);
      vertex(top, green, 1, 1);
      const tilt = 0.2 + rand() * 0.77,
        rot = rand() * 6.28,
        n = poppy ? 6 : 10;
      const at = (a: number, rad: number, lift: number): Point => [
        top[0] + Math.cos(a) * rad,
        top[1] + Math.sin(a) * rad * tilt + lift,
        top[2] - Math.sin(a) * rad * (1 - tilt * 0.6),
      ];
      for (let k = 0; k < n; k++) {
        const a = rot + (k * 2 * Math.PI) / n,
          spread = (poppy ? 2.5 : 2.1) / n;
        const p = at(a, r, r * 0.14),
          l = at(a - spread, r * 0.81, r * 0.12),
          rr = at(a + spread, r * 0.83, r * 0.15);
        for (const v of [top, l, p, top, p, rr]) vertex(v, petal, 1, 2);
        const centre: RGB = poppy ? [0.24, 0.13, 0.09] : [0.98, 0.67, 0.11];
        for (const v of [
          at(a, 0, 0.004),
          at(a, r * 0.24, 0.004),
          at(a + (2 * Math.PI) / n, r * 0.24, 0.004),
        ])
          vertex(v, centre, 1, 2);
      }
    }
  }
  if (cursor > verts.length)
    throw new Error("Meadow mesh exceeded vertex budget");
  for (let i = 0; i < batches.length; i++)
    batches[i].count = (batches[i + 1]?.first ?? cursor / 8) - batches[i].first;
  return { vertices: verts.subarray(0, cursor), batches };
}
