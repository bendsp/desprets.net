import { cubicBezier } from "framer-motion";

export const easeOut = cubicBezier(.23, 1, .32, 1);
export const easeInOut = cubicBezier(.77, 0, .175, 1);
export const progress = (time: number, start: number, duration: number) => Math.max(0, Math.min(1, (time - start) / duration));
export const lidAt = (time: number) => Math.PI / 2 + (-.24 - Math.PI / 2) * easeInOut(progress(time, .5, 1.8));
