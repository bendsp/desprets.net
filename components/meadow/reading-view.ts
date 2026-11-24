import { camera, framing } from "./camera";
import type { MeadowRenderer } from "./renderer";
import {
  capturePosition,
  offsetInView,
  type ReadingPosition,
} from "./reading-position";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (t: number) => t * t * (3 - 2 * t);

export function enterReadingView(
  track: HTMLElement,
  surface: HTMLElement,
  stage: HTMLElement,
  poster: HTMLImageElement,
  position: ReadingPosition | null,
) {
  let renderer: MeadowRenderer | undefined;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const touch = matchMedia("(any-pointer: coarse)");
  let dirty = true,
    lastApproach = -1,
    lastExit = -1;
  let intro = 0,
    read = 0,
    outro = 0,
    frame = 0,
    timer = 0;
  function requestDraw() {
    clearTimeout(timer);
    if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
  }
  let lastWidth = 0,
    lastHeight = 0;
  function draw(now: number) {
    frame = 0;
    const y = window.scrollY;
    const approach = intro ? ease(clamp(y / intro)) : 1;
    const exit = outro ? clamp((y - intro - read) / outro) : 0;
    const reading = y >= intro && y <= intro + read;
    const off =
      !reduced.matches &&
      y + window.innerHeight >= document.documentElement.scrollHeight - 1;
    if (surface.classList.contains("monitor-off") !== off)
      surface.classList.toggle("monitor-off", off);
    const ambient =
      !!renderer && !touch.matches && !reduced.matches && !reading && !off;
    if (dirty || approach !== lastApproach || exit !== lastExit || ambient) {
      const view = camera(
        lastWidth,
        lastHeight,
        approach,
        reduced.matches ? 0 : ease(exit),
      );
      surface.style.transform = `translate3d(${view.left}px, ${view.top}px, 0) scale(${view.scale})`;
      if (!renderer || !track.hasAttribute("data-ready")) {
        // Match the monitor in the baked still to the live camera at any aspect ratio.
        const portrait = lastWidth < lastHeight;
        const sourceWidth = portrait ? 390 : 1440,
          sourceHeight = portrait ? 844 : 900;
        const opening = camera(sourceWidth, sourceHeight, 0, 0);
        const zoom = view.pixelsPerMetre / opening.pixelsPerMetre;
        poster.style.width = sourceWidth + "px";
        poster.style.height = sourceHeight + "px";
        poster.style.transform = `translate3d(${view.left - opening.left * zoom}px, ${view.top - opening.top * zoom}px, 0) scale(${zoom})`;
      }
      renderer?.paint(view, exit, reduced.matches ? 0 : now * 0.001);
      dirty = false;
      lastApproach = approach;
      lastExit = exit;
    }
    surface.scrollTop = Math.min(read, Math.max(0, y - intro));
    if (ambient) timer = window.setTimeout(requestDraw, 80);
  }
  function measure() {
    if (matchMedia("print").matches) return;
    const width = document.documentElement.clientWidth,
      height = stage.clientHeight;
    const changingSize = width !== lastWidth || height !== lastHeight;
    const reading =
      lastWidth > 0 &&
      window.scrollY >= intro &&
      window.scrollY <= intro + read;
    const position = changingSize && reading ? capturePosition(surface) : null;
    if (changingSize) {
      dirty = true;
      renderer?.resize(width, height);
      lastWidth = width;
      lastHeight = height;
      const { w, h, closeScale } = framing(width, height);
      surface.style.width = w * closeScale + "px";
      surface.style.height = h * closeScale + "px";
    }
    const about = surface.querySelector<HTMLElement>("#about");
    const photo = surface.querySelector<HTMLElement>(
      "#about .prose-figure img",
    );
    const caption = surface.querySelector<HTMLElement>(
      "#about .prose-figure figcaption",
    );

    // offsetTop is in layout pixels, independent of camera zoom and scroll.
    if (about && photo && caption) {
      surface.style.setProperty(
        "--about-room",
        Math.max(0, surface.clientHeight - about.offsetTop) + "px",
      );
      let top = 0;
      for (
        let node: HTMLElement | null = photo;
        node && node !== surface;
        node = node.offsetParent as HTMLElement | null
      )
        top += node.offsetTop;
      const room =
        surface.clientHeight -
        top -
        caption.offsetHeight -
        parseFloat(getComputedStyle(caption).marginTop) -
        12;
      surface.style.setProperty(
        "--portrait-room",
        Math.max(64, Math.floor(room)) + "px",
      );
    }
    intro =
      reduced.matches || location.pathname !== "/"
        ? 0
        : Math.round(height * 0.88);
    read = Math.max(0, surface.scrollHeight - surface.clientHeight);
    outro = reduced.matches ? 0 : Math.round(height * 1.14);
    track.style.height = window.innerHeight + intro + read + outro + "px";
    if (position) restore(position);
    requestDraw();
  }
  function goTo(target: HTMLElement, behavior: ScrollBehavior) {
    const scale = surface.getBoundingClientRect().width / surface.offsetWidth;
    const offset =
      (target.getBoundingClientRect().top -
        surface.getBoundingClientRect().top) /
        scale +
      surface.scrollTop -
      (parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
    window.scrollTo({
      top: intro + Math.min(read, Math.max(0, offset)),
      behavior,
    });
  }
  // The browser restores document scroll for Back and Forward. Explicit
  // links open a fresh page at its reading position inside the monitor.
  let restoringPath: string | undefined;
  function restoreHistory() {
    restoringPath = location.pathname;
  }
  function anchor(ev: Event) {
    const link = (ev.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (
      !link ||
      ev.defaultPrevented ||
      (ev instanceof MouseEvent &&
        (ev.metaKey || ev.ctrlKey || ev.altKey || ev.shiftKey))
    )
      return;
    restoringPath = undefined;
    const url = new URL(link.href);
    if (
      url.origin !== location.origin ||
      url.pathname !== location.pathname ||
      !url.hash
    )
      return;
    const target = document.getElementById(url.hash.slice(1));
    if (!target) return;
    ev.preventDefault();
    ev.stopPropagation();
    history.pushState(null, "", url.hash);
    goTo(target, reduced.matches ? "instant" : "smooth");
  }
  function hash() {
    const target = document.getElementById(location.hash.slice(1));
    if (target) goTo(target, "instant");
  }
  function focus(ev: FocusEvent) {
    const target = ev.target as HTMLElement;
    if (target.matches(":focus-visible")) goTo(target, "instant");
  }
  function restore(position: ReadingPosition) {
    const offset = offsetInView(position, surface);
    window.scrollTo({
      top: intro + Math.min(read, Math.max(0, surface.scrollTop + offset)),
      behavior: "instant",
    });
  }

  function stop() {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    window.removeEventListener("scroll", requestDraw);
    document.removeEventListener("visibilitychange", requestDraw);
    observer.disconnect();
    cancelAnimationFrame(measureFrame);
    reduced.removeEventListener("change", measure);
    window.removeEventListener("resize", measure);
    window.removeEventListener("hashchange", hash);
    window.removeEventListener("popstate", restoreHistory, true);
    surface.removeEventListener("click", anchor, true);
    surface.removeEventListener("focusin", focus);

    track.removeAttribute("data-ready");
    track.removeAttribute("data-framed");
    track.removeAttribute("style");
    surface.removeAttribute("style");
    surface.classList.remove("monitor-off");
  }
  let measureFrame = 0;
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(measureFrame);
    measureFrame = requestAnimationFrame(measure);
  });

  // The root layout owns the canvas. A route change replaces only its live
  // document; measure that document and synchronize scrolling before paint.
  function routeChanged() {
    measure();
    if (location.hash) hash();
    else if (restoringPath !== location.pathname)
      window.scrollTo({ top: intro, behavior: "instant" });
    restoringPath = undefined;
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    draw(performance.now());
  }
  track.dataset.framed = "";
  measure();
  if (position) {
    cancelAnimationFrame(frame);
    draw(performance.now());
    restore(position);
  } else if (location.hash) hash();
  cancelAnimationFrame(frame);
  draw(performance.now());
  window.addEventListener("scroll", requestDraw, { passive: true });
  document.addEventListener("visibilitychange", requestDraw);
  observer.observe(surface.firstElementChild!);
  observer.observe(stage);
  window.addEventListener("resize", measure);
  reduced.addEventListener("change", measure);
  window.addEventListener("hashchange", hash);
  window.addEventListener("popstate", restoreHistory, true);
  surface.addEventListener("click", anchor, true);
  surface.addEventListener("focusin", focus);
  function showRenderer(live: MeadowRenderer) {
    renderer = live;
    live.resize(lastWidth, lastHeight);
    dirty = true;
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    draw(performance.now());
    track.dataset.ready = "true";
  }
  return { stop, routeChanged, showRenderer };
}
