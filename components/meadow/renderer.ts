import { oakPosition } from "./oak";
import { displaySize, makeMeadow, sill } from "./geometry";
import { landFragment, landVertex, skyFragment, skyVertex } from "./shaders";

export function createMeadowRenderer(
  canvas: HTMLCanvasElement,
  onTextureReady: () => void,
) {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: true,
    powerPreference: "low-power",
  });
  if (!gl || !gl.getExtension("OES_standard_derivatives")) return null;

  function program(vertex: string, fragment: string) {
    const context = gl!;
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
  function loadTexture(
    id: WebGLProgram,
    name: string,
    unit: number,
    path: string,
  ) {
    const context = gl!;
    const texture = context.createTexture();
    context.useProgram(id);
    context.uniform1i(context.getUniformLocation(id, name), unit);
    const bind = () => {
      context.activeTexture(context.TEXTURE0 + unit);
      context.bindTexture(context.TEXTURE_2D, texture);
    };
    bind();
    context.texImage2D(
      context.TEXTURE_2D,
      0,
      context.RGBA,
      1,
      1,
      0,
      context.RGBA,
      context.UNSIGNED_BYTE,
      new Uint8Array(4),
    );
    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_MIN_FILTER,
      context.LINEAR,
    );
    for (const axis of [context.TEXTURE_WRAP_S, context.TEXTURE_WRAP_T])
      context.texParameteri(context.TEXTURE_2D, axis, context.CLAMP_TO_EDGE);
    const image = new Image();
    image.onload = () => {
      bind();
      context.texImage2D(
        context.TEXTURE_2D,
        0,
        context.RGBA,
        context.RGBA,
        context.UNSIGNED_BYTE,
        image,
      );
      context.generateMipmap(context.TEXTURE_2D);
      context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_MIN_FILTER,
        context.LINEAR_MIPMAP_LINEAR,
      );
      onTextureReady();
    };
    image.src = "/scene/" + path;
    return () => {
      image.onload = null;
      context.deleteTexture(texture);
    };
  }
  const textures = [
    loadTexture(field.id, "flora", 0, "meadow-plants.webp"),
    loadTexture(field.id, "grass", 1, "grass.webp"),
    loadTexture(sky.id, "clouds", 2, "cloud-density.webp"),
    loadTexture(field.id, "twigs", 6, "oak-leaves.webp"),
    loadTexture(field.id, "trees", 4, "meadow-trees.webp"),
    loadTexture(field.id, "peaks", 5, "alpine-range.webp"),
    loadTexture(field.id, "legends", 3, "key-legends.webp"),
  ];
  const touch = matchMedia("(any-pointer: coarse)");
  let previousOrientation: boolean | undefined;
  let width = 1,
    height = 1;
  const lensY = 0.46;
  function resize(w: number, h: number) {
    const portrait = w < h;
    if (previousOrientation !== portrait) {
      const data = makeMeadow(portrait);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, mesh);
      gl!.bufferData(gl!.ARRAY_BUFFER, data.vertices, gl!.STATIC_DRAW);
      batches = data.batches;
      const [x, , z] = oakPosition(portrait);
      gl!.useProgram(field.id);
      gl!.uniform2f(gl!.getUniformLocation(field.id, "oakRoot"), x, z);
      previousOrientation = portrait;
    }
    width = w;
    height = h;
    const density = Math.min(
      window.devicePixelRatio,
      touch.matches ? 1.25 : 1.5,
      Math.sqrt((touch.matches ? 620000 : 1350000) / (w * h)),
    );
    canvas.width = Math.round(w * density);
    canvas.height = Math.round(h * density);
    gl!.viewport(0, 0, canvas.width, canvas.height);
  }
  function framing() {
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
  function camera(approach: number, exit: number) {
    const { w, h, closeScale, wideScale } = framing();
    const focus = approach * (1 - exit);
    const scale = wideScale + (closeScale - wideScale) * focus;
    const x = (width < height ? 0.12 : 0.32) * (1 - approach) + 0.31 * exit;
    const y = sill + h * 0.5 - 0.1 * (1 - focus);
    const z = height / (2 * lensY * scale);
    return {
      x,
      y,
      z,
      scale: scale / closeScale,
      left: width / 2 - (w * 0.5 + x) * scale,
      top: height / 2 - (sill + h - y) * scale,
    };
  }
  function paint(view: ReturnType<typeof camera>, dusk: number, time: number) {
    const context = gl!;
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
    framing,
    camera,
    paint,
    dispose() {
      textures.forEach((dispose) => dispose());
      gl.deleteBuffer(triangle);
      gl.deleteBuffer(mesh);
      gl.deleteProgram(sky.id);
      gl.deleteProgram(field.id);
    },
  };
}
