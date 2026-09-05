"use client";

import { useCallback, useEffect, useRef } from "react";

/** User-supplied cue: https://youtu.be/CoWTz0jEfAI. */
export function useStartupSound(enabled: boolean, reduced: boolean) {
  const context = useRef<AudioContext | null>(null);
  const source = useRef<AudioBufferSourceNode | null>(null);
  const bytes = useRef<Promise<ArrayBuffer | null>>();
  const generation = useRef(0);
  const cancelPreparation = useRef<(() => void) | null>(null);
  useEffect(() => {
    // Fetch early; decoding happens in the context unlocked by the opening tap.
    bytes.current = fetch("/audio/gameboy-startup.mp3", { signal: AbortSignal.timeout(8000) })
      .then(response => response.ok ? response.arrayBuffer() : null).catch(() => null);
  }, []);
  const stop = useCallback(() => {
    generation.current++;
    cancelPreparation.current?.(); cancelPreparation.current = null;
    source.current?.stop(); source.current?.disconnect(); source.current = null;
  }, []);
  const start = useCallback(async () => {
    stop();
    if (!enabled) return;
    const attempt = generation.current;
    // Must run synchronously inside the user's pointer/keyboard event.
    const player = context.current ?? new AudioContext(); context.current = player;
    const resumed = player.resume().catch(() => {});
    const cancelled = new Promise<void>(resolve => { cancelPreparation.current = resolve; });
    const prepare = async () => {
      const data = await bytes.current;
      await resumed;
      if (!data || attempt !== generation.current || player.state !== "running") return;
      try {
        const buffer = await player.decodeAudioData(data.slice(0));
        if (attempt !== generation.current) return;
        const cue = player.createBufferSource(); cue.buffer = buffer;
        cue.connect(player.destination); source.current = cue;
        cue.start(player.currentTime + (reduced ? 0 : 2.15));
      } catch { /* A failed audio asset must not prevent opening the portfolio. */ }
    };
    await Promise.race([prepare(), cancelled]);
    if (attempt === generation.current) cancelPreparation.current = null;
  }, [enabled, reduced, stop]);
  useEffect(() => { if (!enabled) stop(); }, [enabled, stop]);
  useEffect(() => () => { stop(); void context.current?.close().catch(() => {}); context.current = null; }, [stop]);
  return { start, stop };
}
