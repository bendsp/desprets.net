import { BOOT } from "./boot-timeline";
import { cubicBezier } from "framer-motion";

export const easeOut = cubicBezier(.23, 1, .32, 1);
export const easeInOut = cubicBezier(.77, 0, .175, 1);
export const progress = (time: number, start: number, duration: number) => Math.max(0, Math.min(1, (time - start) / duration));
// A 140-degree opening keeps the screen and control deck visible together.
export const OPEN_LID_ANGLE = -50 * Math.PI / 180;
export const lidAt = (time: number) => Math.PI / 2 + (OPEN_LID_ANGLE - Math.PI / 2) * easeInOut(progress(time, BOOT.lidStart, BOOT.lidDuration));
