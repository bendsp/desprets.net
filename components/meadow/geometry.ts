import { displaySize, sill } from "./camera";
import { growOak, oakPosition } from "./oak";
import { alpineRange, river, tree, windmill } from "./valley";
import { addDeskAccessories } from "./desk-accessories";
// World units are metres. The monitor face lies in the z = 0 plane.
type Point = [number, number, number];
type RGB = [number, number, number];

function ground(x: number, z: number) {
  const field = Math.min(1, Math.hypot(x, z) / 8);
  const upland =
    field *
      (0.39 * Math.sin(x * 0.39 + z * 0.16) +
        0.28 * Math.sin(z * 0.42) +
        0.13 * Math.sin(x * 0.76 - z * 0.26)) +
    Math.min(0, z + 1) * 0.066;
  const stream = river(x),
    d = Math.abs(z - stream.z) - stream.half;
  if (d >= 1.7) return upland;
  if (d < 0) return stream.level + 0.07 + 0.55 * Math.max(-1, d / 0.29);
  const t = d / 1.7;
  return (
    stream.level + 0.07 + (upland - stream.level - 0.07) * (t * t * (3 - 2 * t))
  );
}

export function makeMeadow(portrait: boolean) {
  let seed = 1065;
  const rand = () =>
    (seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296;
  const verts = new Float32Array(8 * 152000);
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
  addDeskAccessories(box, quad, desk, vertex);
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

  box(0, sill + h / 2, 0.0056, w, h, 0.001, [0.066, 0.078, 0.092]);

  // Each terrain column follows the banks; water and shoreline share their bends.
  for (let x = -50; x < 50; x += 0.75) {
    function column(u: number): Point[] {
      const s = river(u),
        near = s.z + s.half,
        far = s.z - s.half;
      const zs = Array.from(
        { length: 14 },
        (_, i) => -40 + ((far - 1.7 + 40) * i) / 13,
      );
      zs.push(far, far + 0.29, near - 0.29, near);
      for (let i = 0; i <= 10; i++)
        zs.push(near + 1.7 + ((18 - near - 1.7) * i) / 10);
      return zs.map((z) => [u, ground(u, z), z]);
    }
    const a = column(x),
      b = column(x + 0.75);
    for (let j = 1; j < a.length; j++)
      quad(a[j - 1], a[j], b[j], b[j - 1], [0.31, 0.38, 0.15], 0);
    const water = (u: number, side: number): Point => {
      const s = river(u);
      return [u, s.level, s.z + side * (s.half - 0.02)];
    };
    quad(
      water(x, -1),
      water(x, 1),
      water(x + 0.75, 1),
      water(x + 0.75, -1),
      [0.32, 0.54, 0.56],
      10,
    );
  }
  alpineRange(vertex);
  const millX = portrait ? 2.55 : 6.7;
  const millZ = river(millX).z - river(millX).half - 5.25;
  windmill(vertex, quad, millX, ground(millX, millZ), millZ);
  for (let i = 0; i < 65; i++) {
    const x = (rand() - 0.5) * 64,
      z = river(x).z - river(x).half - 2.4 - rand() * 8;
    if (Math.abs(x - millX) < 2.0 || Math.abs(x) < 2.3) continue;
    tree(
      vertex,
      x,
      ground(x, z) - 0.08,
      z,
      0.8 + rand() * 1.65,
      rand() > 0.54,
      rand() > 0.5,
      0.73 + rand() * 0.2,
    );
  }

  // Overlapping ridgelines have independent silhouettes and atmospheric depth.
  for (let layer = 0; layer < 2; layer++) {
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
    for (let i = 0; i < 215; i++) {
      const x = (rand() - 0.5) * 100;
      const [px, py, pz] = slope(x, rand() * 2.8);
      tree(
        vertex,
        px,
        py - 0.1,
        pz,
        0.54 + rand() * 0.68,
        rand() > 0.6,
        rand() > 0.5,
        0.78,
      );
    }
    for (let x = -132; x < 132; x += 1.23)
      for (let k = 0; k < 4; k++) {
        quad(
          slope(x, k),
          slope(x + 1.23, k),
          slope(x + 1.23, k + 1),
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
  const [oakX, , oakZ] = oakPosition(portrait);
  const canopy = {
    first: cursor / 8,
    count: 0,
    x0: Infinity,
    x1: -Infinity,
    z0: Infinity,
    z1: -Infinity,
  };
  growOak(
    (point, colour, wind, kind) => {
      canopy.x0 = Math.min(canopy.x0, point[0]);
      canopy.x1 = Math.max(canopy.x1, point[0]);
      canopy.z0 = Math.min(canopy.z0, point[2]);
      canopy.z1 = Math.max(canopy.z1, point[2]);
      vertex(point, colour, wind, kind);
    },
    [oakX, ground(oakX, oakZ) - 0.06, oakZ],
  );
  batches.push(canopy);
  // Grass blades are pre-rendered into two cutout textures on a shared atlas.
  for (let clump = 0; clump < 3900; clump++) {
    const near = clump < 2700;
    const index = near ? clump : clump - 2700;
    const across = near ? 10 : 12,
      perTile = near ? 54 : 20;
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
    const stream = river(x);
    if (Math.abs(z - stream.z) < stream.half + 0.18) continue;
    if (Math.abs(x) < w * 0.49 && z > -0.55 && z < 0.43) continue;
    const y = ground(x, z);
    const patch = 0.5 + 0.5 * Math.sin(x * 0.76 + Math.sin(z * 0.62) * 2);
    const height = (0.2 + rand() * 0.25) * (1 + patch * 0.28);
    const half = (0.23 + rand() * 0.19) * (near ? 1 : 1.42);
    const twist = (rand() - 0.5) * 0.32;
    const cell = rand() < patch ? 1 : 0,
      flip = rand() > 0.5;
    const u0 = (cell + (flip ? 0.994 : 0.006)) * 0.5,
      u1 = (cell + (flip ? 0.006 : 0.994)) * 0.5;
    const tint = 0.84 + 0.15 * rand();
    const l: Point = [x - half, y - 0.04, z - twist],
      r: Point = [x + half, y - 0.04, z + twist];
    const tl: Point = [l[0] + 0.025, y + height, l[2]],
      tr: Point = [r[0] + 0.025, y + height, r[2]];
    vertex(l, [u0, 0.998, tint], 0, 6);
    vertex(r, [u1, 0.998, tint], 0, 6);
    vertex(tr, [u1, 0.002, tint], 1, 6);
    vertex(l, [u0, 0.998, tint], 0, 6);
    vertex(tr, [u1, 0.002, tint], 1, 6);
    vertex(tl, [u0, 0.002, tint], 1, 6);
  }

  batches.push({
    first: cursor / 8,
    count: 0,
    x0: -14,
    x1: 14,
    z0: -16,
    z1: 10,
  });
  // Small textured clumps have their own roots, inclination and wind response.
  for (let patch = 0; patch < 540; patch++) {
    const px = (rand() - 0.5) * 24,
      pz = rand() * 24 - 14;
    const species = rand();
    const cell = species < 0.22 ? 0 : species < 0.31 ? 1 : 2;
    const count = 2 + Math.floor(rand() * 7);
    for (let stem = 0; stem < count; stem++) {
      const x = px + (rand() - 0.5) * 1.6,
        z = pz + (rand() - 0.5) * 1.5;
      const stream = river(x);
      if (Math.abs(z - stream.z) < stream.half + 0.24) continue;
      const y = ground(x, z) - 0.025;
      const h = (cell === 2 ? 0.69 : 0.52) * (0.6 + rand() * 0.7);
      const half = h * (0.24 + rand() * 0.23),
        lean = (rand() - 0.5) * 0.19,
        twist = (rand() - 0.5) * 0.34;
      const left: Point = [x - half, y, z - twist],
        right: Point = [x + half, y, z + twist];
      const topLeft: Point = [left[0] + lean, y + h, left[2] - 0.036];
      const topRight: Point = [right[0] + lean, y + h, right[2] - 0.036];
      const flip = rand() > 0.5,
        u0 = (cell + (flip ? 0.985 : 0.015)) / 3,
        u1 = (cell + (flip ? 0.015 : 0.985)) / 3;
      const tint = 0.76 + rand() * 0.23;
      vertex(left, [u0, 0.998, tint], 0, 5);
      vertex(right, [u1, 0.998, tint], 0, 5);
      vertex(topRight, [u1, 0.002, tint], 1, 5);
      vertex(left, [u0, 0.998, tint], 0, 5);
      vertex(topRight, [u1, 0.002, tint], 1, 5);
      vertex(topLeft, [u0, 0.002, tint], 1, 5);
    }
  }
  if (cursor > verts.length)
    throw new Error("Meadow mesh exceeded vertex budget");
  for (let i = 0; i < batches.length; i++)
    batches[i].count = (batches[i + 1]?.first ?? cursor / 8) - batches[i].first;
  return { vertices: verts.subarray(0, cursor), batches };
}
