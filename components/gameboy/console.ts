import { BOOT } from "./boot-timeline";
import { gameControl, newGame, tickGame, type Game, type GameId } from "./games";
import { THEMES, type PaletteId } from "./themes";
import { projects } from "../../app/projects";
import { clientWork } from "../../app/client-work";

export type Control = "up" | "down" | "left" | "right" | "a" | "b" | "start" | "select" | "light";
export const BOOT_DURATION = BOOT.duration;
export const SCREEN_WIDTH = 324;
export const SCREEN_HEIGHT = 216;
export const MENU = ["About", "Work", "Education", "Contact", "Games", "Settings"] as const;
export type Section = (typeof MENU)[number];
export type Page = { kind: "games"; selected: number } | { kind: "settings"; selected: number } | { kind: "game"; game: Game } | { kind: "menu"; selected: number } | { kind: "list"; section: "Work" | "Contact"; selected: number } | { kind: "article"; id: string; scroll: number; link?: number };
export type ConsoleState = { page: Page; history: Page[]; palette: PaletteId; records: Record<GameId, number> };
export type ConsoleAction = { type: "home" } | { type: "tick" } | { type: "pause-game" } | { type: "palette"; palette: PaletteId } | { type: "restore"; palette: PaletteId; records: Record<GameId, number> } | { type: "control"; control: Control } | { type: "open"; page: Page } | { type: "scroll"; delta: number; limit: number } | { type: "link"; direction: number };
export type Entry = { id: string; title: string; subtitle: string; body: string; image?: string; links?: { label: string; url: string }[] };

const bodies: Record<string, string> = {
  bedrock: "A Markdown editor built around a simpler, faster writing environment.\n\nText-first interfaces, careful interaction design, and tools that stay out of the way.\n\nBuilt with React, Tailwind, TypeScript and Electron, with attention to the editing flow.",
  imagn: "An AI image editor and generator. Generation and editing share one flow.\n\nBuilt with Next.js, PostgreSQL, Drizzle, Clerk and Stripe.\n\nThe direction: more capable models, a better editing loop, and a cleaner experience.",
  garden: "A hexagonal tile puzzle game made for phones.\n\nInspired by Sigmar's Garden in Opus Magnum. Readable rules, a minimal interface, and a board that keeps the puzzle's bite.",
  fundamental: "A student startup I founded with five classmates in 2024 through Epitech's EIP program.\n\nWe wanted a crypto wallet that felt obvious to use, while keeping decentralization and self-custody.",
  "emoji-picker": "Match any color to the emoji with the closest average RGB value.\n\nI rendered each pictorial emoji using Apple's font, ignored transparent pixels, then calculated its average color.\n\nThe picker searches the resulting JSON dataset for the closest match.",
  "skribbl-chat": "A chatroom inspired by PictoChat and older handheld social software.\n\nImmediate, informal, and playful. A small project about presence, character, and fun.",
  raybeam: "A configurable C++ raytracer built with classmates in my third year at Epitech.\n\nSpheres, planes, cones, cylinders, lights, reflections and shadows, with an SFML camera window.\n\nOur first project at this scale taught me teamwork and how to ship beyond a simple MVP.",
  "desprets-net": "My personal corner of the web.\n\nIt has been a terminal, a quiet text-first site, and now a silver handheld.\n\nAn excuse to explore interfaces, interaction, and the things I enjoy building.",
  teiimo: "AI and data science engineering for Teiimo.\n\nPractical data, AI, and automation systems.",
  "protocol-guild": "Ethereum core protocol funding infrastructure.\n\nI built the blog system and page, letting the team publish governance updates and announcements as plain Markdown.\n\nAn entry can be pinned above a two-column grid.",
  "eth-investors-club": "A quarterly magazine for the Ethereum ecosystem.\n\nI maintained the website as a contract web and onchain developer.\n\nI also deployed an onchain article minting system that generated more than $150k in revenue.",
};
const images: Record<string, string> = { bedrock: "/bedrock_light.webp", imagn: "/imagn_light.webp", fundamental: "/fundamental_light.webp", "emoji-picker": "/emojipicker_light.webp", "skribbl-chat": "/skribbl.png" };
const extraLinks: Record<string, NonNullable<Entry["links"]>> = {
  teiimo: [{ label: "TEIIMO", url: "https://teiimo.com/" }],
  "protocol-guild": [{ label: "VISIT SITE", url: "https://www.protocolguild.org/" }, { label: "READ THE BLOG", url: "https://www.protocolguild.org/blog" }],
  "eth-investors-club": [{ label: "VISIT SITE", url: "https://www.ethinvestorsclub.com/" }, { label: "ETHEREUM", url: "https://ethereum.org/" }],
  "emoji-picker": [{ label: "EMOJI COLOR DATA", url: "https://github.com/bendsp/emoji-color-data" }],
  raybeam: [{ label: "ORIGINAL RELEASE", url: "https://github.com/bendsp/RayBeam/releases/tag/v0.1.0" }],
  "desprets-net": [{ label: "GET IN TOUCH", url: "https://x.com/messages/compose?recipient_id=1044316861444370436" }],
  garden: [{ label: "OPUS MAGNUM", url: "https://store.steampowered.com/app/558990/Opus_Magnum/" }],
  fundamental: [{ label: "EPITECH", url: "https://www.epitech.eu/" }],
};
export const work: Entry[] = [
  ...clientWork.map(item => ({ id: item.slug, title: item.title, subtitle: `${item.years} / CLIENT WORK`, body: bodies[item.slug] ?? item.description, links: extraLinks[item.slug] })),
  ...projects.map(item => ({ id: item.slug, title: item.title, subtitle: `${item.years} / PERSONAL PROJECT`, body: bodies[item.slug] ?? item.description, image: images[item.slug], links: [...(item.link ? [{ label: "VISIT SITE", url: item.link }] : []), ...(item.github ? [{ label: "SOURCE CODE", url: item.github }] : []), ...(extraLinks[item.slug] ?? [])] })),
];
export const contact: Entry[] = [
  { id: "email", title: "Email", subtitle: "THE BEST WAY TO REACH ME", body: "benjamin.desprets@epitech.eu", links: [{ label: "WRITE EMAIL", url: "mailto:benjamin.desprets@epitech.eu" }] },
  { id: "github", title: "GitHub", subtitle: "BENDSP", body: "github.com/bendsp", links: [{ label: "OPEN GITHUB", url: "https://github.com/bendsp" }] },
  { id: "x", title: "X / Twitter", subtitle: "BENDESPRETS", body: "x.com/bendesprets", links: [{ label: "OPEN PROFILE", url: "https://x.com/bendesprets" }] },
  { id: "linkedin", title: "LinkedIn", subtitle: "BENJAMINDESPRETS", body: "linkedin.com/in/benjamindesprets", links: [{ label: "OPEN PROFILE", url: "https://www.linkedin.com/in/benjamindesprets" }] },
];
export const articles: Entry[] = [
  { id: "about", image: "/pfp-380.webp", title: "About Ben", subtitle: "FULL-STACK DEVELOPER", body: "I'm Ben, a freelance developer focused on data and engaging design.\n\nI'm completing a master's in software engineering at Epitech and working at Teiimo as a data scientist and app developer.\n\nI build across frontend, backend, data and ML. I like clean, useful interfaces with a bit of character.", links: [{ label: "ON STAGE / GLAZE", url: "https://x.com/bendesprets/status/2036940492672324018?s=20" }] },
  { id: "education", title: "Education", subtitle: "PARIS / BERLIN / MONTREAL", body: "2024 - 2026\nMaster's in Software Engineering\nEpitech\n\nFull-stack development, software engineering and production systems.\n\n2024 - 2025\nCertificate in Management\nMcGill\n\nProject management, leadership, finance and business strategy.\n\n2020 - 2024\nBachelor's in Software Engineering\nEpitech\n\nInternational Track in Paris, Berlin and Montreal." },
  ...work, ...contact,
];
export function entryFor(id: string) { return articles.find(entry => entry.id === id) ?? articles[0]; }
export function entriesFor(section: "Work" | "Contact") { return section === "Work" ? work : contact; }
export function sectionPage(index: number): Page {
  const section = MENU[index % MENU.length];
  if (section === "Games") return { kind: "games", selected: 0 };
  if (section === "Settings") return { kind: "settings", selected: 0 };
  if (section === "Work" || section === "Contact") return { kind: "list", section, selected: 0 };
  return { kind: "article", id: section.toLowerCase(), scroll: 0 };
}
export function initialConsole(path: string, hash: string): ConsoleState {
  const route = path.replace(/^\/(projects\/)?/, "").replace(/\/$/, "") || hash.replace(/^#/, "");
  const id = route === "epitech" || route === "mcgill" ? "education" : route;
  const page: Page = id === "work" || id === "contact" ? { kind: "list", section: id === "work" ? "Work" : "Contact", selected: 0 } : articles.some(entry => entry.id === id) ? { kind: "article", id, scroll: 0 } : { kind: "menu", selected: 0 };
  return { page, history: [], palette: "color", records: {snake:0,tetris:0} };
}
export function consoleReducer(state: ConsoleState, action: ConsoleAction): ConsoleState {
  const page = state.page;
  const withGame = (game: Game): ConsoleState => game === (page.kind === "game" ? page.game : null) ? state : { ...state, page: {kind:"game",game}, records:game.score>state.records[game.kind]?{...state.records,[game.kind]:game.score}:state.records };
  if (action.type === "restore") return {...state,palette:action.palette,records:action.records};
  if (action.type === "palette") return {...state,palette:action.palette,page:page.kind === "settings" ? {...page,selected:THEMES.findIndex(theme=>theme.id===action.palette)} : page};
  if (action.type === "home") return {...state,page:{kind:"menu",selected:0},history:[]};
  if (action.type === "tick") return page.kind === "game" ? withGame(tickGame(page.game)) : state;
  if (action.type === "pause-game") return page.kind === "game" && page.game.status === "running" ? withGame({...page.game,status:"paused"}) : state;
  if (action.type === "open") {
    const next = action.page;
    const selected = page.kind === "menu" ? MENU.findIndex((_,i)=>{const target=sectionPage(i);return target.kind===next.kind&&(target.kind!=="article"||next.kind==="article"&&target.id===next.id)&&(target.kind!=="list"||next.kind==="list"&&target.section===next.section);}) : -1;
    const parent = page.kind === "menu" && selected >= 0 ? {...page,selected} : page.kind === "games" && next.kind === "game" ? {...page,selected:next.game.kind === "snake"?0:1} : page;
    return {...state,page:next.kind === "settings"?{...next,selected:THEMES.findIndex(theme=>theme.id===state.palette)}:next,history:[...state.history,parent]};
  }
  if (action.type === "scroll") return page.kind === "article" ? { ...state, page: { ...page, scroll: Math.max(0, Math.min(action.limit, page.scroll + action.delta)) } } : state;
  if (action.type === "link") {
    if (page.kind !== "article") return state;
    const length = entryFor(page.id).links?.length ?? 0;
    return length ? { ...state, page: { ...page, link: ((page.link ?? 0) + action.direction + length) % length } } : state;
  }
  const control = action.control;
  if (page.kind === "game") {
    if (control === "b" && page.game.status !== "running") return {...state,page:state.history.at(-1) ?? {kind:"games",selected:page.game.kind === "snake"?0:1},history:state.history.slice(0,-1)};
    return withGame(gameControl(page.game,control));
  }
  if (control === "select") return {...state,palette:THEMES[(THEMES.findIndex(theme=>theme.id===state.palette)+1)%THEMES.length].id};
  if (control === "b") return { ...state, page: state.history.at(-1) ?? { kind: "menu", selected: 0 }, history: state.history.slice(0, -1) };
  if (control === "start") return consoleReducer(state,{type:"home"});
  if (control === "a") {
    if (page.kind === "menu") return consoleReducer(state, { type: "open", page: sectionPage(page.selected) });
    if (page.kind === "games") return consoleReducer(state,{type:"open",page:{kind:"game",game:newGame(page.selected === 0 ? "snake" : "tetris")}});
    if (page.kind === "settings") return consoleReducer(state,{type:"palette",palette:THEMES[page.selected].id});
    if (page.kind === "list") return consoleReducer(state, { type: "open", page: { kind: "article", id: entriesFor(page.section)[page.selected].id, scroll: 0 } });
    return state;
  }
  if (page.kind !== "article" && ["up", "down", "left", "right"].includes(control)) {
    if (page.kind === "menu" || page.kind === "settings") {
      const length = page.kind === "menu" ? MENU.length : THEMES.length;
      const selected = control === "up" ? (page.selected-2+length)%length : control === "down" ? (page.selected+2)%length : page.selected^1;
      return {...state,page:{...page,selected}};
    }
    const length = page.kind === "games" ? 2 : entriesFor(page.section).length;
    const step = control === "up" || control === "left" ? -1 : 1;
    return { ...state, page: { ...page, selected: (page.selected + step + length) % length } };
  }
  return state;
}

export function keyControl(code: string): Control | undefined {
  const keys: Record<string, Control> = { ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right", KeyZ: "a", KeyJ: "a", Enter: "a", KeyX: "b", KeyK: "b", KeyB: "b", Backspace: "b", Escape: "b", Space: "start", ShiftLeft: "select", ShiftRight: "select" };
  return keys[code];
}
