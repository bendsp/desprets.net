"use client";

import { Suspense, useCallback, useEffect, useRef, useState, type ComponentRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Maximize2, Minimize2, RotateCcw, Volume2, VolumeX, Power, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Vector3 } from "three";
import { Handheld } from "./handheld";

export type Control = "up" | "down" | "left" | "right" | "a" | "b" | "start" | "select" | "light";
type OrbitControlsImpl = ComponentRef<typeof OrbitControls>;
const sections = ["about", "work", "education", "contact"];

function CameraRig({ focus, reset, reduced, controls }: { focus: boolean; reset: number; reduced: boolean; controls: React.RefObject<OrbitControlsImpl> }) {
  const { camera, size, invalidate } = useThree();
  const animating = useRef(true);
  const targetPosition = useRef(new Vector3());
  const targetLook = useRef(new Vector3());
  useEffect(() => {
    const aspect = size.width / size.height;
    if (focus) {
      const distance = Math.max(3.55, 4.8 / aspect);
      targetLook.current.set(0, 2.047, -1.855);
      targetPosition.current.copy(targetLook.current).add(new Vector3(0, .238 * distance, .971 * distance));
    } else {
      const factor = aspect < .8 ? 1.26 : 1;
      targetPosition.current.set(5.4 * factor, 5.1 * factor, 8.6 * factor);
      targetLook.current.set(0, 1.17, -.15);
    }
    animating.current = true;
    invalidate();
  }, [focus, reset, size.width, size.height, invalidate]);
  useFrame((_, delta) => {
    const orbit = controls.current;
    if (!animating.current || !orbit) return;
    const blend = reduced ? 1 : 1 - Math.exp(-5 * Math.min(delta, .05));
    camera.position.lerp(targetPosition.current, blend);
    orbit.target.lerp(targetLook.current, blend);
    orbit.update();
    if (camera.position.distanceTo(targetPosition.current) < .001) animating.current = false;
    else invalidate();
  });
  return null;
}

export default function GameboyScene({ initialPath }: { initialPath: string }) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const controls = useRef<OrbitControlsImpl>(null);
  const audio = useRef<AudioContext | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout>>();
  const [focus, setFocus] = useState(false);
  const [open, setOpen] = useState(true);
  const [power, setPower] = useState(true);
  const [sound, setSound] = useState(false);
  const [bright, setBright] = useState(true);
  const [reset, setReset] = useState(0);
  const [pressed, setPressed] = useState<Control | null>(null);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync(); query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const clickSound = useCallback((pitch = 650) => {
    if (!sound) return;
    const context = audio.current ?? new AudioContext();
    audio.current = context;
    void context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(pitch, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(180, context.currentTime + .045);
    gain.gain.setValueAtTime(.045, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .065);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.start(); oscillator.stop(context.currentTime + .07);
  }, [sound]);

  const interact = useCallback((control: Control) => {
    setPressed(control);
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => setPressed(null), 160);
    clickSound();
    if (control === "light") { setBright(value => !value); return; }
    if (!power || !open) return;
    const frame = iframe.current?.contentWindow;
    if (!frame) return;
    if (control === "up" || control === "down") {
      frame.scrollBy({ top: control === "up" ? -145 : 145, behavior: reduced ? "instant" : "smooth" });
    } else if (control === "left" || control === "right") {
      const current = sections.indexOf(frame.location.hash.slice(1));
      const next = (Math.max(0, current) + (control === "right" ? 1 : -1) + sections.length) % sections.length;
      const section = frame.document.getElementById(sections[next]);
      if (section) {
        section.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
        frame.history.replaceState(null, "", `#${sections[next]}`);
        frame.dispatchEvent(new HashChangeEvent("hashchange"));
      } else frame.location.href = `/?screen=1#${sections[next]}`;
    } else if (control === "a" || control === "start") {
      setFocus(value => !value);
    } else if (control === "b") {
      if (focus) setFocus(false);
      else frame.location.href = "/?screen=1";
    } else if (control === "select") {
      frame.document.querySelector<HTMLButtonElement>('button[aria-label*="theme" i][aria-pressed="false"]')?.click();
    }
  }, [clickSound, focus, open, power, reduced]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const keys: Record<string, Control> = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", a: "a", b: "b", Enter: "start", Shift: "select" };
      if (event.key === "Escape") { setFocus(false); return; }
      if (event.target instanceof HTMLElement && event.target.closest("button,a,input,textarea")) return;
      const control = keys[event.key];
      if (control) { event.preventDefault(); interact(control); }
    };
    const message = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.source === iframe.current?.contentWindow && event.data?.type === "sp:unfocus") setFocus(false);
    };
    window.addEventListener("keydown", keydown);
    window.addEventListener("message", message);
    return () => { window.removeEventListener("keydown", keydown); window.removeEventListener("message", message); };
  }, [interact]);
  useEffect(() => () => { clearTimeout(pressTimer.current); void audio.current?.close(); }, []);

  const toggleOpen = () => { setFocus(false); setOpen(value => !value); clickSound(430); };
  const resetView = () => { setFocus(false); setOpen(true); setReset(value => value + 1); };

  return (
    <div className="sp-experience" data-focused={focus} data-ready={ready}>
      <Canvas shadows dpr={[1, 1.8]} frameloop="demand" camera={{ position: [5.4, 5.1, 8.6], fov: 34, near: .1, far: 70 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} onCreated={({ gl }) => { gl.setClearColor("#171e24", 0); setReady(true); }}>
        <color attach="background" args={["#171e24"]} />
        <fog attach="fog" args={["#171e24", 16, 34]} />
        <ambientLight intensity={.38} />
        <directionalLight position={[-4, 8, 5]} intensity={2.8} color="#f4f5ff" />
        <directionalLight position={[5, 3, -4]} intensity={2.3} color="#a6c8ef" />
        <spotLight position={[-4, 6, 1]} color="#e0e6ec" intensity={36} angle={.8} penumbra={1} distance={18} />
        <Suspense fallback={null}>
          <Environment resolution={256}>
            <Lightformer form="rect" intensity={5} color="#ffffff" position={[-4, 5, 3]} scale={[4, 6, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={3} color="#a8c8f0" position={[5, 2, -3]} scale={[2, 8, 1]} target={[0, 1, 0]} />
            <Lightformer form="rect" intensity={2} color="#fff2e1" position={[1, 7, 4]} scale={[7, 2, 1]} target={[0, 0, 0]} />
            <Lightformer form="rect" intensity={.7} position={[0, 1, 8]} scale={[6, 6, 1]} target={[0, 1, 0]} />
          </Environment>
          <Handheld iframe={iframe} initialPath={initialPath} open={open} power={power} bright={bright} focus={focus} reduced={reduced} pressed={pressed} onControl={interact} onFold={toggleOpen} onPower={() => { setPower(value => !value); clickSound(380); }} onFocus={() => { setFocus(true); clickSound(); }} />
          <ContactShadows position={[0, -.37, 0]} opacity={.62} scale={14} blur={2.4} far={5} resolution={512} frames={reduced ? 1 : Infinity} color="#060b13" />
        </Suspense>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.39, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#28323c" roughness={.82} metalness={.15} />
        </mesh>
        <OrbitControls ref={controls} makeDefault enabled={!focus} enablePan={false} enableDamping dampingFactor={.08} minDistance={5.5} maxDistance={15} minPolarAngle={.3} maxPolarAngle={Math.PI / 2.05} target={[0, 1.17, -.15]} />
        <CameraRig focus={focus} reset={reset} reduced={reduced} controls={controls} />
      </Canvas>
      <div className="sp-vignette" aria-hidden="true" />
      <div className="sp-toolbar" role="toolbar" aria-label="Handheld controls">
        <button aria-label={focus ? "Return to scene" : "Focus screen"} title={focus ? "Return to scene · Esc" : "Focus screen · Enter"} aria-pressed={focus} onClick={() => { setOpen(true); setFocus(value => !value); }}>{focus ? <Minimize2 /> : <Maximize2 />}</button>
        <button aria-label="Reset camera" title="Reset camera" onClick={resetView}><RotateCcw /></button>
        <span className="sp-toolbar-divider" />
        <button aria-label={open ? "Close handheld" : "Open handheld"} title={open ? "Close handheld" : "Open handheld"} aria-pressed={!open} onClick={toggleOpen}>{open ? <ChevronDown /> : <ChevronUp />}</button>
        <button aria-label={power ? "Turn power off" : "Turn power on"} title={power ? "Turn power off" : "Turn power on"} aria-pressed={power} onClick={() => { setPower(value => !value); clickSound(380); }}><Power /></button>
        <button aria-label={sound ? "Mute sound" : "Enable sound"} title={sound ? "Mute sound" : "Enable sound"} aria-pressed={sound} onClick={() => setSound(value => !value)}>{sound ? <Volume2 /> : <VolumeX />}</button>
        <span className="sp-toolbar-divider" />
        <a href={`${initialPath}?flat=1`} aria-label="Open portfolio without 3D" title="Open portfolio without 3D"><ExternalLink /></a>
      </div>
      <div className="sp-keyboard-controls">
        {(["up", "down", "left", "right", "a", "b", "start", "select", "light"] as const).map(control => <button key={control} onClick={() => interact(control)}>{control}</button>)}
      </div>
    </div>
  );
}
