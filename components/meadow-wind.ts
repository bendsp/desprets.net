// Only the opening shot moves. Sample the baked plate at its native resolution
// so the cost of the wind pass stays bounded during the push towards the CRT.
export function startMeadowWind(land: HTMLElement, image: HTMLImageElement, portrait: boolean) {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
  if (!gl) return;

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const program = gl.createProgram()!;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, `attribute vec2 position;
      varying vec2 uv;
      void main() {
        uv = position * vec2(0.5, -0.5) + 0.5;
        gl_Position = vec4(position, 0., 1.);
      }`],
    [gl.FRAGMENT_SHADER, `precision mediump float;
      varying vec2 uv;
      uniform sampler2D plate;
      uniform vec4 caseBounds;
      uniform float horizon, time;
      void main() {
        vec2 p = uv;
        // Fade motion out at the case. The hills and the glass stay rigid.
        vec2 outside = max(caseBounds.xy - p, p - caseBounds.zw);
        float meadow = smoothstep(0., .035, max(outside.x, outside.y))
                     * smoothstep(horizon, 1., p.y);
        float envelope = smoothstep(0., .4, time) * (1. - smoothstep(3.1, 4.35, time));
        float gust = sin(p.x * 13. - time * 1.7 + p.y * 4.);
        float blades = sin(p.x * 67. + p.y * 21. - time * 2.4);
        p.x += meadow * envelope * (.0035 * gust + .0009 * blades);
        p.y += meadow * envelope * .0016 * cos(p.x * 17. - time * 1.7);
        // Close flowers travel out of frame faster than the distant meadow.
        p -= (uv - vec2(.5, .42)) * meadow * envelope * smoothstep(.9, 3.4, time) * .10;
        gl_FragColor = texture2D(plate, p);
      }`],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  const release = () => gl.getExtension("WEBGL_lose_context")?.loseContext();
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    release();
    return;
  }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform4fv(gl.getUniformLocation(program, "caseBounds"), portrait
    ? [.345, .373, .66, .591] : [.355, .185, .638, .805]);
  gl.uniform1f(gl.getUniformLocation(program, "horizon"), portrait ? .34 : .30);
  const time = gl.getUniformLocation(program, "time");
  gl.viewport(0, 0, canvas.width, canvas.height);
  const start = performance.now();
  let last = -100;
  let frame = 0;
  function draw(now: number) {
    if (now - last >= 32) {
      gl!.uniform1f(time, (now - start) / 1000);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      last = now;
    }
    frame = requestAnimationFrame(draw);
  }
  draw(start);
  land.append(canvas);
  return () => {
    cancelAnimationFrame(frame);
    canvas.remove();
    release();
  };
}
