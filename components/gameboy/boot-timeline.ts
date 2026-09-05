/** Seconds, measured against the supplied GBA startup clip (CoWTz0jEfAI).
 * The screen sequence starts after the physical lid has opened. */
export const BOOT = {
  lidStart: .08, lidDuration: 1.12,
  screenOn: 1.22,
  letters: .33, letterFlight: .62,
  settled: 1.7, shineStart: 1.95, shineDuration: 1.2,
  fadeStart: 3.6, fadeDuration: .4,
  menuAt: 5.24, menuFade: .22,
  framingStart: .85, framingDuration: 1.95,
  duration: 5.5, reducedDuration: .65,
} as const;
export function bootStage(time: number, waiting: boolean, reduced: boolean) {
  if (waiting) return "closed";
  if (reduced) return "logo";
  if (time < BOOT.screenOn) return "opening";
  if (time < BOOT.screenOn + BOOT.settled) return "rainbow";
  return time < BOOT.menuAt ? "logo" : "menu";
}
