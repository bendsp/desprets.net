"use client";
import { BOOT, bootStage } from "./boot-timeline";
import { gameDelay, newGame } from "./games";
import { THEMES, isPalette } from "./themes";


import { Suspense, useCallback, useEffect, useReducer, useRef, useState, type ComponentRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Scan, Orbit, RotateCcw, SkipForward, Volume2, VolumeX, ExternalLink } from "lucide-react";
import { Vector3 } from "three";
import { Handheld } from "./handheld";
import { Display } from "./display";
import { articleLayout, type Hit } from "./display-renderer";
import { BOOT_DURATION, consoleReducer, entriesFor, entryFor, initialConsole, keyControl, MENU, sectionPage, type Control } from "./console";
import { easeInOut, progress } from "./boot";
import { useStartupSound } from "./startup-sound";

type OrbitControlsImpl = ComponentRef<typeof OrbitControls>;
type CameraMotion = { returning: boolean; dragging: boolean };

function CameraRig({ elapsed, waiting, sticky, article, reset, reduced, booting, time, onBootEnd, onStage, controls, motion }: {
  elapsed: () => number; waiting: boolean;
  sticky: boolean; reset: number; reduced: boolean; booting: boolean; time: MutableRefObject<number>; onBootEnd: () => void;
  article: boolean;
  onStage: (stage: string) => void;
  controls: React.RefObject<OrbitControlsImpl>; motion: MutableRefObject<CameraMotion>;
}) {
  const { camera, size, invalidate } = useThree();
  useEffect(() => { invalidate(); }, [waiting, invalidate]);
  const targets = useRef({ read: new Vector3(), readLook: new Vector3(), hero: new Vector3(), heroLook: new Vector3(), overview: new Vector3(), overviewLook: new Vector3() });
  useEffect(() => {
    const aspect = size.width / size.height; const t = targets.current;
    const distance = Math.max(article ? 7.8 : 8.65, (article ? 5.75 : 6.45) / aspect);
    t.readLook.set(0, article ? 1.25 : 1.12, -.8); t.read.copy(t.readLook).add(new Vector3(0, .238, .971).multiplyScalar(distance));
    const factor = Math.max(1, .8 / aspect);
    t.heroLook.set(0, .15, 0); t.hero.set(5.0 * factor, 5.8 * factor, 7.6 * factor);
    t.overviewLook.set(0, 1.17, -.15); t.overview.set(5.4 * factor, 5.1 * factor, 8.6 * factor);
    motion.current.returning = true; invalidate();
  }, [size.width, size.height, reset, sticky, article, motion, invalidate]);
  useFrame((_, delta) => {
    const orbit = controls.current; if (!orbit) return;
    const t = targets.current;
    if (booting) {
      time.current = waiting ? 0 : Math.min(reduced ? BOOT.reducedDuration : BOOT_DURATION, elapsed());
      onStage(bootStage(time.current, waiting, reduced));
      if (reduced && !waiting) { camera.position.copy(t.read); orbit.target.copy(t.readLook); }
      else {
        const opening = easeInOut(progress(time.current, BOOT.lidStart, BOOT.lidDuration));
        const framing = easeInOut(progress(time.current, BOOT.framingStart, BOOT.framingDuration));
        camera.position.copy(t.hero).lerp(t.overview, opening).lerp(t.read, framing);
        orbit.target.copy(t.heroLook).lerp(t.overviewLook, opening).lerp(t.readLook, framing);
      }
      orbit.update(); if (!waiting) invalidate();
      if (time.current >= (reduced ? BOOT.reducedDuration : BOOT_DURATION)) onBootEnd();
      return;
    }
    if (!motion.current.returning || motion.current.dragging) return;
    const position = sticky ? t.read : t.overview; const look = sticky ? t.readLook : t.overviewLook;
    const blend = reduced ? 1 : 1 - Math.exp(-7 * Math.min(delta, .05));
    camera.position.lerp(position, blend); orbit.target.lerp(look, blend); orbit.update();
    if (camera.position.distanceTo(position) + orbit.target.distanceTo(look) < .001) motion.current.returning = false;
    else invalidate();
  }, -0.5);
  return null;
}

export default function GameboyScene({ initialPath, initialHash }: { initialPath: string; initialHash: string }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const orbitOrigin = useRef({azimuth:0,polar:0});
  const touchingNow = useRef(false);
  const motion = useRef<CameraMotion>({ returning: true, dragging: false });
  const time = useRef(0); const audio = useRef<AudioContext | null>(null);
  const held = useRef(new Map<string, { control: Control; started: number; last: number }>());
  const releasedVisuals = useRef(new Set<Control>());
  const pulses = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const snap = useRef<ReturnType<typeof setTimeout>>(); const wheelTime = useRef(0);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [state, dispatch] = useReducer(consoleReducer, undefined, () => initialConsole(initialPath, initialHash));
  const [booting, setBooting] = useState(true);
  const [waiting, setWaiting] = useState(true);
  const starting = useRef(false);
  const [stage, setStage] = useState("closed");
  const [sticky, setSticky] = useState(true);
  const [open, setOpen] = useState(true); const [power, setPower] = useState(true);
  const [sound, setSound] = useState(true); const [bright, setBright] = useState(true);
  const [reset, setReset] = useState(0); const [pressed, setPressed] = useState<ReadonlySet<Control>>(new Set());
  const [touching, setTouching] = useState(false); const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const startup = useStartupSound(sound, reduced);
  const stopStartup = startup.stop;
  const startSound = startup.start;
  const startOpening = useCallback(() => {
    if (starting.current) return;
    starting.current = true;
    // Resume on the actual gesture, before any awaited loading or React update.
    void startSound().catch(() => {}).finally(() => { starting.current = false; setWaiting(false); });
  }, [startSound]);
  const current = useRef(state); current.current = state;
  const available = !booting && power && open;
  const availableRef = useRef(available); availableRef.current = available;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("desprets-console-v1") ?? "null");
      if (saved && typeof saved === "object") {
        const score = (value: unknown) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : 0;
        dispatch({type:"restore",palette:isPalette(saved.palette)?saved.palette:"color",records:{snake:score(saved.records?.snake),tetris:score(saved.records?.tetris)}});
      }
    } catch { /* Storage may be unavailable in a private browser. */ }
    setPreferencesLoaded(true);
  }, []);
  useEffect(() => {
    if (!preferencesLoaded) return;
    try { localStorage.setItem("desprets-console-v1",JSON.stringify({palette:state.palette,records:state.records})); } catch { /* The console also works without persistence. */ }
  }, [preferencesLoaded,state.palette,state.records]);
  const game = state.page.kind === "game" ? state.page.game : null;
  const gameRunning = game?.status === "running";
  const cadence = game ? gameDelay(game) : 0;
  useEffect(() => {
    if (!available || !gameRunning) return;
    const timer = setInterval(() => dispatch({type:"tick"}),cadence);
    return () => clearInterval(timer);
  }, [available,gameRunning,cadence]);
  useEffect(() => { if (!available) dispatch({type:"pause-game"}); }, [available]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches); query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  const clickSound = useCallback((pitch = 520, duration = .055) => {
    if (!sound) return;
    const context = audio.current ?? new AudioContext(); audio.current = context; void context.resume().catch(() => {});
    if (context.state !== "running") return;
    const oscillator = context.createOscillator(); const gain = context.createGain();
    oscillator.type = "triangle"; oscillator.frequency.setValueAtTime(pitch, context.currentTime);
    gain.gain.setValueAtTime(.027, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + duration);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + duration);
  }, [sound]);
  const openLink = useCallback((url: string) => { window.open(url, "_blank", "noopener,noreferrer"); }, []);
  const perform = useCallback((control: Control) => {
    if (!availableRef.current) return;
    if (control === "light") { setBright(value => !value); return; }
    const page = current.current.page;
    if (page.kind === "article") {
      const entry = entryFor(page.id); const limit = articleLayout(entry).limit;
      if (control === "up" || control === "down") { dispatch({ type: "scroll", delta: control === "up" ? -32 : 32, limit }); return; }
      if (control === "left" || control === "right") {
        if (page.scroll >= limit && entry.links?.length) dispatch({ type: "link", direction: control === "left" ? -1 : 1 });
        else dispatch({ type: "scroll", delta: control === "left" ? -128 : 128, limit });
        return;
      }
      if (control === "a") {
        if (page.scroll >= limit && entry.links?.length) openLink(entry.links[page.link ?? 0].url);
        else dispatch({ type: "scroll", delta: 128, limit });
        return;
      }
    }
    dispatch({ type: "control", control });
  }, [openLink]);
  const syncPressed = useCallback(() => setPressed(new Set([...held.current.values()].map(value => value.control).concat([...releasedVisuals.current]))), []);
  const release = useCallback((source: string) => {
    const value = held.current.get(source); if (!value) return;
    held.current.delete(source);
    const remaining = 140 - (performance.now() - value.started);
    if (remaining > 0 && remaining <= 140) {
      const visual = `visual-${value.control}`; clearTimeout(pulses.current.get(visual)); releasedVisuals.current.add(value.control);
      pulses.current.set(visual, setTimeout(() => { releasedVisuals.current.delete(value.control); pulses.current.delete(visual); syncPressed(); }, remaining));
    }
    syncPressed();
  }, [syncPressed]);
  const press = useCallback((control: Control, source: string) => {
    if (!availableRef.current || held.current.has(source)) return;
    const now = performance.now(); held.current.set(source, { control, started: now, last: now }); syncPressed(); perform(control); clickSound(control === "b" ? 330 : 520);
  }, [perform, syncPressed, clickSound]);
  const pulse = useCallback((control: Control) => {
    const source = `pulse-${control}`; clearTimeout(pulses.current.get(source));
    if (held.current.has(source)) { release(source); }
    press(control, source); pulses.current.set(source, setTimeout(() => { release(source); pulses.current.delete(source); }, 140));
  }, [press, release]);
  const clearHeld = useCallback(() => { held.current.clear(); releasedVisuals.current.clear(); syncPressed(); touchingNow.current = false; setTouching(false); }, [syncPressed]);
  useEffect(() => {
    if (!available) { clearHeld(); return; }
    const repeat = setInterval(() => {
      const now = performance.now();
      for (const value of held.current.values()) {
        if (!(current.current.page.kind === "game" && current.current.page.game.kind === "tetris" && value.control === "up") && ["up", "down", "left", "right"].includes(value.control) && now - value.started > 300 && now - value.last > 85) { perform(value.control); value.last = now; }
      }
    }, 40);
    return () => clearInterval(repeat);
  }, [available, perform, clearHeld]);
  const scroll = useCallback((delta: number) => {
    if (!availableRef.current || !delta) return;
    const page = current.current.page;
    if (page.kind === "game") return;
    if (page.kind === "article") {
      dispatch({ type: "scroll", delta, limit: articleLayout(entryFor(page.id)).limit });
      const control = delta < 0 ? "up" : "down"; const source = "scroll";
      clearTimeout(pulses.current.get(source)); held.current.set(source, { control, started: performance.now() + 10000, last: 0 }); syncPressed();
      pulses.current.set(source, setTimeout(() => { release(source); pulses.current.delete(source); }, 140));
    } else if (performance.now() - wheelTime.current > 140) { wheelTime.current = performance.now(); pulse(delta < 0 ? "up" : "down"); }
  }, [pulse, release, syncPressed]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && (event.target.closest("input,textarea,select") || (["Enter", "Space"].includes(event.code) && event.target.closest("button,a")))) return;
      if (waiting) {
        if (["Enter", "Space"].includes(event.code) && !event.repeat) { event.preventDefault(); startOpening(); }
        return;
      }
      const control = keyControl(event.code); if (!control) return;
      event.preventDefault(); if (event.repeat) return;
      if (booting && event.code === "Escape") { stopStartup(); time.current = BOOT_DURATION; setBooting(false); setReset(value => value + 1); return; }
      press(control, `key-${event.code}`);
    };
    const keyup = (event: KeyboardEvent) => release(`key-${event.code}`);
    const pointerup = (event: PointerEvent) => { release(`pointer-${event.pointerId}`); setTouching(false); };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.target instanceof HTMLElement && event.target.closest(".sp-accessible")) return;
      event.preventDefault(); scroll(event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 150 : .5));
    };
    const pause = () => { clearHeld(); dispatch({type:"pause-game"}); };
    const visibility = () => { if (document.hidden) pause(); };
    window.addEventListener("keydown", keydown); window.addEventListener("keyup", keyup); window.addEventListener("pointerup", pointerup); window.addEventListener("pointercancel", pointerup);
    window.addEventListener("blur", pause); window.addEventListener("wheel", wheel, { passive: false }); document.addEventListener("visibilitychange", visibility);
    return () => { window.removeEventListener("keydown", keydown); window.removeEventListener("keyup", keyup); window.removeEventListener("pointerup", pointerup); window.removeEventListener("pointercancel", pointerup); window.removeEventListener("blur", pause); window.removeEventListener("wheel", wheel); document.removeEventListener("visibilitychange", visibility); };
  }, [press, release, scroll, booting, clearHeld, stopStartup, waiting, startOpening]);
  useEffect(() => {
    const timers = pulses.current;
    return () => { clearTimeout(snap.current); timers.forEach(clearTimeout); void audio.current?.close(); document.body.style.cursor = "auto"; };
  }, []);
  const bootEnd = useCallback(() => { setBooting(false); }, []);
  const replay = () => {
    stopStartup(); clearHeld(); clearTimeout(snap.current); setOpen(true); setPower(true); setSticky(true);
    dispatch({ type: "home" }); time.current = 0; motion.current = { returning: true, dragging: false }; setBooting(true); setWaiting(true); startOpening();
  };
  const onHit = (action: Hit["action"]) => {
    if (!available) return;
    if ("control" in action) pulse(action.control);
    else if ("palette" in action) { pulseVisualA(); dispatch({type:"palette",palette:action.palette}); }
    else if ("url" in action) { pulseVisualA(); openLink(action.url); }
    else { pulseVisualA(); dispatch({ type: "open", page: action.page }); }
  };
  const pulseVisualA = () => {
    const source = "screen-a"; clearTimeout(pulses.current.get(source)); held.current.set(source, { control: "a", started: performance.now(), last: 0 }); syncPressed(); clickSound();
    pulses.current.set(source, setTimeout(() => { release(source); pulses.current.delete(source); }, 140));
  };
  const toggleOpen = () => { if (waiting) { startOpening(); return; } if (booting) return; setOpen(value => !value); setSticky(false); setReset(value => value + 1); clickSound(260); };
  const isHardwareHeld = [...held.current.keys()].some(source => source.startsWith("pointer-"));
  const page = state.page; const entry = page.kind === "article" ? entryFor(page.id) : undefined;
  const screenName = entry?.title ?? (page.kind === "list" ? page.section : page.kind === "game" ? page.game.kind.toUpperCase() : page.kind === "settings" ? "Settings" : page.kind === "games" ? "Games" : "Ben Desprets");

  return <div className="sp-experience" data-ready={ready} data-phase={waiting ? "closed" : booting ? "boot" : "ready"} data-boot-stage={booting ? stage : "ready"} data-page={page.kind === "article" ? page.id : page.kind === "list" ? page.section : page.kind === "game" ? page.game.kind : page.kind} data-scroll={page.kind === "article" ? page.scroll : 0} data-selected={"selected" in page ? page.selected : page.kind === "article" ? page.link ?? 0 : 0} data-pressed={[...pressed].join(",")} data-palette={state.palette} data-game-status={game?.status} data-score={game?.score} data-lines={game?.kind === "tetris" ? game.lines : undefined}>
    <Canvas shadows dpr={[1, 1.8]} frameloop="demand" camera={{ position: [5, 5.8, 7.6], fov: 34, near: .1, far: 100 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} onCreated={({ gl }) => { gl.setClearColor("#171e24", 0); setReady(true); }}>
      <color attach="background" args={["#171e24"]} /><fog attach="fog" args={["#171e24", 20, 48]} />
      <ambientLight intensity={.38} />
      <directionalLight position={[-4, 8, 5]} intensity={2.8} color="#f4f5ff" />
      <directionalLight position={[5, 3, -4]} intensity={2.3} color="#a6c8ef" />
      <spotLight position={[-4, 6, 1]} color="#e0e6ec" intensity={36} angle={.8} penumbra={1} distance={18} />
      <CameraRig elapsed={startup.elapsed} waiting={waiting} sticky={sticky} article={page.kind === "article" || page.kind === "game"} reset={reset} reduced={reduced} booting={booting} time={time} onBootEnd={bootEnd} onStage={setStage} controls={controls} motion={motion} />
      <Suspense fallback={null}>
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={5} color="#ffffff" position={[-4, 5, 3]} scale={[4, 6, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={3} color="#a8c8f0" position={[5, 2, -3]} scale={[2, 8, 1]} target={[0, 1, 0]} />
          <Lightformer form="rect" intensity={2} color="#fff2e1" position={[1, 7, 4]} scale={[7, 2, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={.7} position={[0, 1, 8]} scale={[6, 6, 1]} target={[0, 1, 0]} />
        </Environment>
        <Handheld waiting={waiting} onStart={startOpening} time={time} booting={booting} open={open} power={power} reduced={reduced} pressed={pressed} onControl={pulse} onPress={press} onRelease={release} onFold={toggleOpen} onPower={() => { if (!booting) { setPower(value => !value); clickSound(250); } }} display={<Display state={state} time={time} booting={booting} power={power} bright={bright} reduced={reduced} onHit={onHit} onSwipe={pulse} onScroll={scroll} onTouch={value => { touchingNow.current = value; setTouching(value); }} />} />
        <ContactShadows position={[0, -.37, 0]} opacity={.62} scale={14} blur={2.4} far={5} resolution={512} frames={Infinity} color="#060b13" />
      </Suspense>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.39, 0]} receiveShadow><planeGeometry args={[200, 200]} /><meshStandardMaterial color="#28323c" roughness={.82} metalness={.15} /></mesh>
      <OrbitControls ref={controls} makeDefault enabled={!booting && !touching && !isHardwareHeld} enableZoom={false} enablePan={false} enableDamping dampingFactor={.09} minDistance={2} maxDistance={100} minPolarAngle={.15} maxPolarAngle={1.7} onStart={() => {
        if (touchingNow.current || [...held.current.keys()].some(source=>source.startsWith("pointer-"))) return;
        clearTimeout(snap.current); motion.current.dragging = true; motion.current.returning = false;
        orbitOrigin.current = {azimuth:controls.current?.getAzimuthalAngle() ?? 0,polar:controls.current?.getPolarAngle() ?? 0};
      }} onChange={() => {
        const orbit = controls.current;
        if (!orbit || !motion.current.dragging || touchingNow.current || [...held.current.keys()].some(source=>source.startsWith("pointer-"))) return;
        if (Math.abs(orbit.getAzimuthalAngle()-orbitOrigin.current.azimuth)+Math.abs(orbit.getPolarAngle()-orbitOrigin.current.polar)>.01) dispatch({type:"pause-game"});
      }} onEnd={() => {
        if (!motion.current.dragging) return;
        motion.current.dragging = false;
        if (sticky) snap.current = setTimeout(() => setReset(value => value + 1), 1800);
      }} />
    </Canvas>
    <div className="sp-vignette" aria-hidden="true" />
    {waiting && <button className="sp-open-hint" onClick={startOpening}>Tap to open</button>}
    <div className="sp-toolbar" role="toolbar" aria-label="Scene controls">
      <button disabled={booting} aria-label={sticky ? "Inspect handheld freely" : "Return to reading view"} title={sticky ? "Inspect handheld freely" : "Return to reading view"} aria-pressed={!sticky} onClick={() => { if (sticky) dispatch({type:"pause-game"}); setOpen(true); setSticky(value => !value); setReset(value => value + 1); }}>{sticky ? <Orbit /> : <Scan />}</button>
      <button disabled={waiting} aria-label={booting ? "Skip startup" : "Replay startup"} title={booting ? "Skip startup · Esc" : "Replay startup"} onClick={booting ? () => { stopStartup(); time.current = BOOT_DURATION; setBooting(false); setReset(value => value + 1); } : replay}>{booting ? <SkipForward /> : <RotateCcw />}</button>
      <button aria-label={sound ? "Mute sound" : "Enable sound"} title={sound ? "Mute sound" : "Enable sound"} aria-pressed={sound} onClick={() => { if (!sound) { audio.current ??= new AudioContext(); void audio.current.resume().catch(() => {}); } setSound(value => !value); }}>{sound ? <Volume2 /> : <VolumeX />}</button>
      <span className="sp-toolbar-divider" /><a href={`${initialPath}?flat=1${initialHash}`} aria-label="Open portfolio without 3D" title="Open portfolio without 3D"><ExternalLink /></a>
    </div>
    {available && <section className="sp-accessible" aria-label="Portfolio screen">
      <h1 aria-live="polite">{screenName}</h1>
      {entry ? <><p>{entry.body}</p>{entry.links?.map(link => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}</a>)}</> : page.kind === "menu" ? MENU.map((label, index) => <button key={label} onClick={() => dispatch({ type: "open", page: sectionPage(index) })}>{label}</button>) : page.kind === "list" ? entriesFor(page.section).map(item => <button key={item.id} onClick={() => dispatch({ type: "open", page: { kind: "article", id: item.id, scroll: 0 } })}>{item.title}</button>) : page.kind === "games" ? (["snake","tetris"] as const).map(kind => <button key={kind} onClick={() => dispatch({type:"open",page:{kind:"game",game:newGame(kind)}})}>{kind}</button>) : page.kind === "settings" ? THEMES.map(theme => <button key={theme.id} aria-pressed={state.palette === theme.id} onClick={() => dispatch({type:"palette",palette:theme.id})}>{theme.name}</button>) : game ? <><p>{game.status}. Score {game.score}. Best {state.records[game.kind]}.</p><button onClick={() => pulse("a")}>{game.status === "running" ? game.kind === "tetris" ? "Rotate" : "Pause" : "Play or resume"}</button><button onClick={() => pulse("b")}>{game.status === "running" ? "Pause" : "Quit game"}</button></> : null}
      <p>Arrow keys or WASD to move. Z or Enter is A. X or Backspace is B. Space returns home, or pauses a game. Shift changes palette, or hard-drops a Tetris piece. In games, B pauses; B again exits. Drag outside the screen to rotate.</p>
    </section>}
    <div className="sp-keyboard-controls">{(["up", "down", "left", "right", "a", "b", "start", "select", "light"] as const).map(control => <button key={control} disabled={!available} onClick={() => pulse(control)}>{control}</button>)}</div>
  </div>;
}
