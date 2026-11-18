// Branches are tapered tubes. Each terminal twig bears folded leaf sprays with
// their own orientation; the crown has open space between its main limbs.
type V = [number, number, number];
type Vertex = (p: V, colour: V, wind: number, material: number) => void;
const add = (a: V, b: V, s = 1): V => [
  a[0] + b[0] * s,
  a[1] + b[1] * s,
  a[2] + b[2] * s,
];
const cross = (a: V, b: V): V => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
function unit(v: V): V {
  const n = Math.hypot(...v) || 1;
  return [v[0] / n, v[1] / n, v[2] / n];
}
export const oakPosition = (portrait: boolean): V => [
  portrait ? -3.35 : -5.55,
  0,
  -5.35,
];

export function growOak(vertex: Vertex, root: V) {
  let seed = 4721;
  const random = () =>
    (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  function wood(path: V[], radii: number[], sides: number) {
    let previous: V[] = [];
    path.forEach((p, i) => {
      const tangent = unit(
        add(
          path[Math.min(i + 1, path.length - 1)],
          path[Math.max(i - 1, 0)],
          -1,
        ),
      );
      const u = unit(cross(tangent, [0, 0, 1])),
        v = cross(tangent, u);
      const ring = Array.from({ length: sides }, (_, j) => {
        const a = (j * 2 * Math.PI) / sides,
          r =
            radii[i] *
            (1 + 0.1 * Math.cos(3 * a + 0.6) + 0.055 * Math.sin(5 * a));
        return add(add(p, u, r * Math.cos(a)), v, r * Math.sin(a));
      });
      if (i)
        for (let j = 0; j < sides; j++) {
          const k = (j + 1) % sides;
          const tone = 0.91 + 0.08 * Math.sin(j * 4.2);
          const colour: V = [0.38 * tone, 0.31 * tone, 0.22 * tone];
          for (const point of [
            previous[j],
            previous[k],
            ring[k],
            previous[j],
            ring[k],
            ring[j],
          ])
            vertex(point, colour, 0, 13);
        }
      previous = ring;
    });
  }
  // Project the sprays onto a grid facing the afternoon sun. A spray behind
  // another limb is in shade even if its own leaves are facing the light.
  const sprays: {
    base: V;
    dir: V;
    across: V;
    len: number;
    variation: number;
  }[] = [];
  const light = unit([0.48, 0.37, -0.8]);
  const lightRight = unit(cross(light, [0, 1, 0]));
  const lightUp = cross(lightRight, light);
  const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const gridSize = 64;
  const cellSize = 0.2;
  const index = (p: V) => {
    const local = add(p, root, -1);
    return [
      Math.floor(32 + dot(local, lightRight) / cellSize),
      Math.floor(16 + dot(local, lightUp) / cellSize),
    ];
  };
  const front = new Float32Array(gridSize * gridSize).fill(-Infinity);
  function leaves(base: V, az: number, rise: number, len: number) {
    const dir = unit([Math.cos(az), rise, Math.sin(az)]);
    const across = unit([-Math.sin(az), random() - 0.5, Math.cos(az)]);
    const center = add(base, dir, len * 0.54);
    const [x, y] = index(center);
    const cell = y * gridSize + x;
    front[cell] = Math.max(front[cell], dot(center, light));
    sprays.push({ base, dir, across, len, variation: random() });
  }
  function drawSpray({
    base,
    dir,
    across,
    len,
    variation,
  }: (typeof sprays)[number]) {
    const normal = unit(cross(dir, across));
    const center = add(base, dir, len * 0.54);
    const [x, y] = index(center);
    let exposure = 0;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const thickness = Math.max(
          0,
          front[(y + dy) * gridSize + x + dx] - dot(center, light) - 0.18,
        );
        exposure += Math.exp(-1.55 * thickness) / 9;
      }
    const tint = (0.39 + 0.76 * exposure) * (0.89 + 0.15 * variation);
    const at = (u: number, v: number): V =>
      add(
        add(add(base, dir, len * v), across, (u - 0.5) * len * 0.98),
        normal,
        (1 - Math.abs(2 * u - 1)) * len * 0.12 * v,
      );
    for (const u of [0, 0.5]) {
      for (const [s, t] of [
        [u, 0],
        [u + 0.5, 0],
        [u + 0.5, 1],
        [u, 0],
        [u + 0.5, 1],
        [u, 1],
      ]) {
        vertex(at(s, t), [s, 1 - t, tint], 0.1 + t * 0.32, 12);
      }
    }
  }
  function limb(
    start: V,
    angle: number,
    rise: number,
    len: number,
    radius: number,
    depth: number,
  ) {
    const az = angle + (random() - 0.5) * 0.66;
    const mid = add(
      start,
      unit([Math.cos(angle), rise * 0.74, Math.sin(angle)]),
      len * 0.47,
    );
    const end = add(
      mid,
      unit([Math.cos(az), rise + 0.32, Math.sin(az)]),
      len * 0.54,
    );
    wood(
      [start, mid, end],
      [radius, radius * 0.81, radius * (depth ? 0.57 : 0.18)],
      depth > 1 ? 7 : 4,
    );
    if (depth) {
      limb(
        end,
        az + (random() - 0.5) * 0.72,
        rise * 0.66 + 0.31,
        len * (0.67 + random() * 0.15),
        radius * 0.61,
        depth - 1,
      );
      limb(
        add(mid, add(end, mid, -1), 0.56),
        az + 0.65 + random() * 0.85,
        rise * 0.45 + random() * 0.73 - 0.21,
        len * (0.54 + random() * 0.22),
        radius * 0.48,
        depth - 1,
      );
      limb(
        mid,
        az - 0.74 - random() * 0.8,
        rise * 0.48 + random() * 0.57 - 0.34,
        len * (0.52 + random() * 0.22),
        radius * 0.46,
        depth - 1,
      );
    } else {
      for (let j = 0; j < 11; j++) {
        const t = (j + 0.5) / 11;
        const base = add(mid, add(end, mid, -1), t);
        leaves(
          base,
          az + (j % 2 ? 1 : -1) * (0.3 + random() * 1.85),
          -0.89 + random() * 2.55,
          0.31 + random() * 0.3,
        );
      }
    }
  }
  const trunk: V[] = [
    root,
    add(root, [-0.03, 0.32, -0.03]),
    add(root, [0.075, 0.89, -0.06]),
    add(root, [0.025, 1.45, 0.06]),
    add(root, [0.18, 2.07, 0.04]),
    add(root, [0.11, 2.63, -0.07]),
  ];
  wood(trunk, [0.46, 0.33, 0.285, 0.25, 0.175, 0.105], 13);
  for (let i = 0; i < 7; i++) {
    const a = i * 2.399 + 0.26;
    const tip = add(root, [Math.cos(a) * 0.77, -0.07, Math.sin(a) * 0.75]);
    wood(
      [
        add(root, [0, 0.26, 0]),
        add(root, [Math.cos(a) * 0.41, 0.06, Math.sin(a) * 0.4]),
        tip,
      ],
      [0.165, 0.11, 0.006],
      6,
    );
  }
  for (let i = 0; i < 8; i++) {
    const t = i / 7,
      base = add(trunk[2], add(trunk[5], trunk[2], -1), t);
    limb(
      base,
      i * 2.399 + 0.34,
      0.26 + 1.38 * t + 0.26 * Math.cos(i * 1.8),
      1.55 + 0.3 * Math.cos(i * 1.32) + random() * 0.22,
      0.15 - 0.048 * t,
      3,
    );
  }
  limb(trunk[5], 1.8, 3.3, 1.46, 0.11, 3);
  sprays.forEach(drawSpray);
}
