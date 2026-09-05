"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three";
import { DisplayRenderer, type Hit, type ScreenLayout } from "./display-renderer";
import { SCREEN_HEIGHT, SCREEN_WIDTH, type ConsoleState, type Control } from "./console";
import { THEMES } from "./themes";
import { SHELLS } from "./shells";
import { BOOT } from "./boot-timeline";
import { progress } from "./boot";

type Props = { state: ConsoleState; time: MutableRefObject<number>; booting: boolean; power: boolean; bright: boolean; reduced: boolean; onHit: (action: Hit["action"]) => void; onSwipe: (control: Control) => void; onScroll: (delta: number) => void; onTouch: (held: boolean) => void };

export function Display({ state, time, booting, power, bright, reduced, onHit, onSwipe, onScroll, onTouch }: Props) {
  const { invalidate } = useThree();
  const activeRenderer = useRef<DisplayRenderer | null>(null);
  const carousel = useRef({indices:[0,0],offsets:[0,0],active:false});
  const dirty = useRef(true); const layout = useRef<ScreenLayout>({ hits: [], limit: 0 });
  const touch = useRef<{ id: number; x: number; y: number; total: number; row:0|1 }>();
  const { texture, output, context } = useMemo(() => {
    const output = document.createElement("canvas"); output.width = SCREEN_WIDTH * 3; output.height = SCREEN_HEIGHT * 3;
    const texture = new CanvasTexture(output); texture.colorSpace = SRGBColorSpace; texture.magFilter = LinearFilter; texture.minFilter = LinearFilter; texture.generateMipmaps = false;
    return { texture, output, context: output.getContext("2d")! };
  }, []);
  useEffect(() => {
    const renderer = new DisplayRenderer(() => { dirty.current = true; invalidate(); });
    activeRenderer.current = renderer; dirty.current = true; invalidate();
    return () => { activeRenderer.current = null; renderer.dispose(); };
  }, [invalidate]);
  useEffect(() => () => texture.dispose(), [texture]);
  useEffect(() => { dirty.current = true; invalidate(); }, [state, power, bright, booting, reduced, invalidate]);
  useFrame((_, delta) => {
    const motion=carousel.current;
    if(motion.offsets.some(offset=>offset!==0))dirty.current=true;
    if(state.page.kind==="settings") {
      const indices=[THEMES.findIndex(t=>t.id===state.palette),SHELLS.findIndex(t=>t.id===state.shell)];
      indices.forEach((index,row)=>{
        const length=row===0?THEMES.length:SHELLS.length;
        let step=index-motion.indices[row];
        if(step>length/2)step-=length;if(step<-length/2)step+=length;
        if(step && motion.active && !reduced)motion.offsets[row]=Math.sign(step)*190;
        motion.indices[row]=index;
        motion.offsets[row]=reduced?0:motion.offsets[row]*Math.exp(-22*Math.min(delta,.05));
        if(Math.abs(motion.offsets[row])<.2)motion.offsets[row]=0;
      });
      motion.active=true;
    } else {motion.active=false;motion.offsets=[0,0];}
    const sliding=motion.offsets.some(offset=>offset!==0);
    if(sliding){dirty.current=true;invalidate();}
    const renderer = activeRenderer.current; if (!renderer) return;
    if (!dirty.current && !booting) return;
    if (power && booting) {
      renderer.boot(time.current, reduced);
      if (!reduced && time.current >= BOOT.menuAt) {
        layout.current = renderer.draw(state,motion.offsets);
        const ctx = renderer.canvas.getContext("2d")!;
        ctx.globalAlpha = 1-progress(time.current, BOOT.menuAt, BOOT.menuFade);
        ctx.fillStyle = "#faf7fc"; ctx.fillRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT); ctx.globalAlpha = 1;
      }
    } else if (power) layout.current = renderer.draw(state,motion.offsets);
    else { const ctx = renderer.canvas.getContext("2d")!; ctx.fillStyle = "#12252b"; ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT); }
    context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high"; context.drawImage(renderer.canvas, 0, 0, output.width, output.height);
    // Each logical pixel has a fine horizontal gate and RGB-column boundary, visible only up close.
    context.fillStyle = "#10252d"; context.globalAlpha = .025;
    for (let y = 2; y < output.height; y += 3) context.fillRect(0, y, output.width, 1);
    context.globalAlpha = .008;
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
        touch.current = { id: event.pointerId, x: event.clientX, y: event.clientY, total: 0, row:event.uv && (1-event.uv.y)*SCREEN_HEIGHT>=108?1:0 }; onTouch(true);
        (event.target as Element).setPointerCapture?.(event.pointerId);
      }}
      onPointerMove={event => {
        const held = touch.current; if (!held || held.id !== event.pointerId) return;
        event.stopPropagation();
        if (state.page.kind === "settings") {
          const dx=event.clientX-held.x,dy=event.clientY-held.y;
          held.total=Math.max(held.total,Math.abs(dx)+Math.abs(dy));
          if(Math.max(Math.abs(dx),Math.abs(dy))>=48){
            if(Math.abs(dx)>Math.abs(dy))onHit({settingsRow:held.row,direction:dx<0?1:-1});
            else onSwipe(dy<0?"down":"up");
            held.x=event.clientX;held.y=event.clientY;held.total+=Math.abs(dx)+Math.abs(dy);
          }
          return;
        }
        if (state.page.kind === "game") {
          const dx = event.clientX-held.x, dy = event.clientY-held.y;
          if (Math.max(Math.abs(dx),Math.abs(dy)) >= 16) { onSwipe(Math.abs(dx)>Math.abs(dy)?dx>0?"right":"left":dy>0?"down":"up"); held.x=event.clientX; held.y=event.clientY; held.total+=Math.abs(dx)+Math.abs(dy); }
          return;
        }
        const delta = held.y - event.clientY; held.y = event.clientY; held.total += Math.abs(delta);
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
