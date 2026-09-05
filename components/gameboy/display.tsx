"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { CanvasTexture, LinearFilter, NearestFilter, SRGBColorSpace } from "three";
import { DisplayRenderer, type Hit, type ScreenLayout } from "./display-renderer";
import { SCREEN_HEIGHT, SCREEN_WIDTH, type ConsoleState } from "./console";
import { progress } from "./boot";

type Props = { state: ConsoleState; time: MutableRefObject<number>; booting: boolean; power: boolean; bright: boolean; reduced: boolean; onHit: (action: Hit["action"]) => void; onScroll: (delta: number) => void; onTouch: (held: boolean) => void };

export function Display({ state, time, booting, power, bright, reduced, onHit, onScroll, onTouch }: Props) {
  const { invalidate } = useThree();
  const activeRenderer = useRef<DisplayRenderer | null>(null);
  const dirty = useRef(true); const layout = useRef<ScreenLayout>({ hits: [], limit: 0 });
  const touch = useRef<{ id: number; y: number; total: number }>();
  const { texture, output, context, bootFrame } = useMemo(() => {
    const output = document.createElement("canvas"); output.width = SCREEN_WIDTH * 3; output.height = SCREEN_HEIGHT * 3;
    const texture = new CanvasTexture(output); texture.colorSpace = SRGBColorSpace; texture.magFilter = NearestFilter; texture.minFilter = LinearFilter; texture.generateMipmaps = false;
    const bootFrame = document.createElement("canvas"); bootFrame.width = SCREEN_WIDTH; bootFrame.height = SCREEN_HEIGHT;
    return { texture, output, bootFrame, context: output.getContext("2d")! };
  }, []);
  useEffect(() => {
    const renderer = new DisplayRenderer(() => { dirty.current = true; invalidate(); });
    activeRenderer.current = renderer; dirty.current = true; invalidate();
    return () => { activeRenderer.current = null; renderer.dispose(); };
  }, [invalidate]);
  useEffect(() => () => texture.dispose(), [texture]);
  useEffect(() => { dirty.current = true; invalidate(); }, [state, power, bright, booting, reduced, invalidate]);
  useFrame(() => {
    const renderer = activeRenderer.current; if (!renderer) return;
    if (!dirty.current && !booting) return;
    if (power && booting) {
      renderer.boot(time.current, reduced);
      if (!reduced && time.current > 4.75 && time.current < 5.15) {
        // The OS wipes upward through the same physical display; it never becomes an HTML overlay.
        bootFrame.getContext("2d")!.drawImage(renderer.canvas, 0, 0);
        layout.current = renderer.draw(state);
        const ctx = renderer.canvas.getContext("2d")!; const reveal = Math.round(SCREEN_HEIGHT * progress(time.current, 4.75, .4));
        ctx.drawImage(bootFrame, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT - reveal, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT - reveal);
      } else if (!reduced && time.current >= 5.15) layout.current = renderer.draw(state);
    } else if (power) layout.current = renderer.draw(state);
    else { const ctx = renderer.canvas.getContext("2d")!; ctx.fillStyle = "#12252b"; ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT); }
    context.imageSmoothingEnabled = false; context.drawImage(renderer.canvas, 0, 0, output.width, output.height);
    // Each logical pixel has a fine horizontal gate and RGB-column boundary, visible only up close.
    context.fillStyle = "#10252d"; context.globalAlpha = .07;
    for (let y = 2; y < output.height; y += 3) context.fillRect(0, y, output.width, 1);
    context.globalAlpha = .025;
    for (let x = 2; x < output.width; x += 3) context.fillRect(x, 0, 1, output.height);
    context.globalAlpha = 1;
    if (!bright && power) { context.fillStyle = "#12252b88"; context.fillRect(0, 0, output.width, output.height); }
    texture.needsUpdate = true; dirty.current = false;
  });
  const release = (event: ThreeEvent<PointerEvent>) => {
    const held = touch.current; if (!held) return;
    event.stopPropagation(); touch.current = undefined; onTouch(false);
    (event.target as Element).releasePointerCapture?.(event.pointerId);
    if (held.total > 5 || !event.uv || booting || !power) return;
    const x = event.uv.x * SCREEN_WIDTH; const y = (1 - event.uv.y) * SCREEN_HEIGHT;
    const hit = layout.current.hits.find(hit => x >= hit.x && x <= hit.x + hit.w && y >= hit.y && y <= hit.y + hit.h);
    if (hit) onHit(hit.action);
  };
  return <group position={[0, 1.83, .208]}>
    <mesh
      onPointerOver={event => { event.stopPropagation(); document.body.style.cursor = booting ? "default" : "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = "auto"; }}
      onPointerDown={event => {
        event.stopPropagation(); if (booting || !power) return;
        touch.current = { id: event.pointerId, y: event.clientY, total: 0 }; onTouch(true);
        (event.target as Element).setPointerCapture?.(event.pointerId);
      }}
      onPointerMove={event => {
        const held = touch.current; if (!held || held.id !== event.pointerId) return;
        event.stopPropagation(); const delta = held.y - event.clientY; held.y = event.clientY; held.total += Math.abs(delta);
        if (held.total > 5 && delta) onScroll(delta * .7);
      }}
      onPointerUp={release} onPointerCancel={event => { event.stopPropagation(); touch.current = undefined; onTouch(false); }}
      onClick={event => event.stopPropagation()}>
      <planeGeometry args={[2.65, 1.7667]} /><meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
    <mesh position={[0, 0, .003]} raycast={() => null}>
      <planeGeometry args={[2.65, 1.7667]} /><meshPhysicalMaterial color="#b8d7e7" transparent opacity={.035} metalness={.12} roughness={.16} clearcoat={1} envMapIntensity={1.4} depthWrite={false} />
    </mesh>
  </group>;
}
