"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";

/** User-supplied cue: https://youtu.be/CoWTz0jEfAI. Starts with the rainbow lettering. */
export function useStartupSound(time: MutableRefObject<number>, booting: boolean, reduced: boolean, enabled: boolean) {
  const element = useRef<HTMLAudioElement>(null);
  const paused = useRef(false);
  const generation = useRef(0);
  const [awaitingTap, setAwaitingTap] = useState(false);
  const stop = useCallback(() => {
    generation.current++;
    element.current?.pause();
    paused.current = false;
    setAwaitingTap(false);
  }, []);
  const play = useCallback(() => {
    const player = element.current;
    if (!player) return;
    const attempt = ++generation.current;
    paused.current = true;
    void player.play().then(() => {
      if (attempt !== generation.current) return;
      paused.current = false;
      setAwaitingTap(false);
    }).catch((error: unknown) => {
      if (attempt !== generation.current) return;
      if (error instanceof DOMException && error.name === "NotAllowedError") setAwaitingTap(true);
      else { paused.current = false; setAwaitingTap(false); }
    });
  }, []);
  useEffect(() => {
    if (!enabled) { stop(); return; }
    if (!booting) return;
    let frame = 0;
    const cue = reduced ? 0 : 2.15;
    // Enabling sound after the cue must not replay it out of sync.
    if (time.current > cue + .3) return;
    const tick = () => {
      if (time.current < cue) { frame = requestAnimationFrame(tick); return; }
      if (element.current) element.current.currentTime = 0;
      play();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [booting, reduced, enabled, play, stop, time]);
  useEffect(() => {
    const player = element.current;
    const attempts = generation;
    return () => { attempts.current++; player?.pause(); paused.current = false; };
  }, []);
  return { element, paused, awaitingTap, play, stop };
}
