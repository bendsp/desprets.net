import { oakPosition } from "./oak";
import { makeMeadow } from "./geometry";
import { lensY, type camera } from "./camera";
import { landFragment, landVertex, skyFragment, skyVertex } from "./shaders";

export async function createMeadowRenderer(
  gl: WebGLRenderingContext,
  signal: AbortSignal,
) {
  function program(vertex: string, fragment: string) {
    const context = gl;
    const result = context.createProgram()!;
    for (const [type, source] of [
      [context.VERTEX_SHADER, vertex],
      [context.FRAGMENT_SHADER, fragment],
    ] as const) {
      const shader = context.createShader(type)!;
      context.shaderSource(shader, source);
      context.compileShader(shader);
      context.attachShader(result, shader);
      context.deleteShader(shader);
    }
    context.bindAttribLocation(result, 0, "pos");
    context.bindAttribLocation(result, 1, "color");
    context.bindAttribLocation(result, 2, "plant");
    context.linkProgram(result);
    if (!context.getProgramParameter(result, context.LINK_STATUS)) {
      throw new Error(
        context.getProgramInfoLog(result) || "Scene shader unavailable",
      );
    }
    return {
      id: result,
      lens: context.getUniformLocation(result, "lens"),
      sun: context.getUniformLocation(result, "sun"),
      dusk: context.getUniformLocation(result, "dusk"),
      eye: context.getUniformLocation(result, "eye"),
      clock: context.getUniformLocation(result, "clock"),
    };
  }

  const sky = program(skyVertex, skyFragment),
    field = program(landVertex, landFragment);
  const triangle = gl.createBuffer(),
    mesh = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  let batches: ReturnType<typeof makeMeadow>["batches"] = [];
  async function loadTexture(
    program: WebGLProgram,
    name: string,
    unit: number,
    file: string,
  ) {
    const response = await fetch("/scene/" + file, { signal });
    if (!response.ok) throw new Error("Missing meadow texture: " + file);
    const url = URL.createObjectURL(await response.blob());
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      signal.throwIfAborted();
      gl.useProgram(program);
      gl.uniform1i(gl.getUniformLocation(program, name), unit);
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR,
      );
      for (const axis of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T])
        gl.texParameteri(gl.TEXTURE_2D, axis, gl.CLAMP_TO_EDGE);
      if (gl.getError() !== gl.NO_ERROR)
        throw new Error("Meadow texture upload failed");
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  await Promise.all([
    loadTexture(field.id, "flora", 0, "meadow-plants.webp"),
    loadTexture(field.id, "grass", 1, "grass.webp"),
    loadTexture(sky.id, "clouds", 2, "cloud-density.webp"),
    loadTexture(field.id, "twigs", 6, "oak-leaves.webp"),
    loadTexture(field.id, "trees", 4, "meadow-trees.webp"),
    loadTexture(field.id, "peaks", 5, "alpine-range.webp"),
    loadTexture(field.id, "legends", 3, "key-legends.webp"),
  ]);
  const touch = matchMedia("(any-pointer: coarse)");
  let previousOrientation: boolean | undefined;
  let width = 1,
    height = 1;

  function resize(w: number, h: number) {
    const portrait = w < h;
    if (previousOrientation !== portrait) {
      const data = makeMeadow(portrait);
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh);
      gl.bufferData(gl.ARRAY_BUFFER, data.vertices, gl.STATIC_DRAW);
      batches = data.batches;
      const [x, , z] = oakPosition(portrait);
      gl.useProgram(field.id);
      gl.uniform2f(gl.getUniformLocation(field.id, "oakRoot"), x, z);
      previousOrientation = portrait;
    }
    width = w;
    height = h;
    const density = Math.min(
      window.devicePixelRatio,
      touch.matches ? 1.25 : 1.5,
      Math.sqrt((touch.matches ? 620000 : 1350000) / (w * h)),
    );
    gl.canvas.width = Math.round(w * density);
    gl.canvas.height = Math.round(h * density);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }
  function paint(view: ReturnType<typeof camera>, dusk: number, time: number) {
    const context = gl;
    const elevation = 0.25 - 0.33 * dusk;
    const sx = Math.min(0.51, ((lensY * width) / height) * 0.77) - 0.008 * dusk,
      sy = Math.sin(elevation),
      sz = -Math.sqrt(1 - sx * sx - sy * sy);
    context.clear(context.DEPTH_BUFFER_BIT);
    context.disable(context.DEPTH_TEST);
    function bind(p: typeof sky) {
      context.useProgram(p.id);
      context.uniform2f(p.lens, (lensY * width) / height, lensY);
      context.uniform3f(p.sun, sx, sy, sz);
      context.uniform1f(p.dusk, dusk);
    }
    bind(sky);
    context.bindBuffer(context.ARRAY_BUFFER, triangle);
    context.enableVertexAttribArray(0);
    context.disableVertexAttribArray(1);
    context.disableVertexAttribArray(2);
    context.vertexAttribPointer(0, 2, context.FLOAT, false, 0, 0);
    context.drawArrays(context.TRIANGLES, 0, 3);
    bind(field);
    context.enable(context.DEPTH_TEST);
    context.uniform3f(field.eye, view.x, view.y, view.z);
    context.uniform1f(field.clock, time);
    context.bindBuffer(context.ARRAY_BUFFER, mesh);
    context.vertexAttribPointer(0, 3, context.FLOAT, false, 32, 0);
    context.enableVertexAttribArray(1);
    context.vertexAttribPointer(1, 3, context.FLOAT, false, 32, 12);
    context.enableVertexAttribArray(2);
    context.vertexAttribPointer(2, 2, context.FLOAT, false, 32, 24);
    for (const { first, count, x0, x1, z0 } of batches) {
      const distance = view.z - z0,
        halfWidth = (distance * lensY * width) / height;
      if (distance <= 0 || x1 < view.x - halfWidth || x0 > view.x + halfWidth)
        continue;
      context.drawArrays(context.TRIANGLES, first, count);
    }
  }
  return {
    resize,

    paint,
  };
}

export type MeadowRenderer = NonNullable<
  Awaited<ReturnType<typeof createMeadowRenderer>>
>;
