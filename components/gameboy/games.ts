import type { Control } from "./console";

export type GameId = "snake" | "tetris";
export type GameStatus = "ready" | "running" | "paused" | "over" | "won";
export type Cell = { x: number; y: number };
type Direction = "up" | "down" | "left" | "right";
export type SnakeGame = { kind: "snake"; status: GameStatus; score: number; seed: number; snake: Cell[]; food: Cell | null; direction: Direction; turns: Direction[] };
export const SNAKE_W = 20, SNAKE_H = 16;
export const PIECES = ["I", "J", "L", "O", "S", "T", "Z"] as const;
export type PieceKind = typeof PIECES[number];
export type FallingPiece = { kind: PieceKind; rotation: number; x: number; y: number };
export type TetrisGame = { kind: "tetris"; status: GameStatus; score: number; seed: number; lines: number; board: number[][]; active: FallingPiece; queue: PieceKind[] };
export type Game = SnakeGame | TetrisGame;
const shapes: Record<PieceKind, number[][]> = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]], L: [[0,0,1],[1,1,1],[0,0,0]],
  O: [[1,1],[1,1]], S: [[0,1,1],[1,1,0],[0,0,0]],
  T: [[0,1,0],[1,1,1],[0,0,0]], Z: [[1,1,0],[0,1,1],[0,0,0]],
};
function random(seed: number): [number, number] { const next = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return [next / 4294967296, next]; }
function foodFor(snake: Cell[], seed: number): { food: Cell | null; seed: number } {
  const occupied = new Set(snake.map(c => c.y * SNAKE_W + c.x)); const free: Cell[] = [];
  for (let y = 0; y < SNAKE_H; y++) for (let x = 0; x < SNAKE_W; x++) if (!occupied.has(y * SNAKE_W + x)) free.push({x,y});
  const [value, next] = random(seed); return { food: free[Math.floor(value * free.length)] ?? null, seed: next };
}
function bag(seed: number): { pieces: PieceKind[]; seed: number } {
  const pieces = [...PIECES];
  for (let i = pieces.length - 1; i > 0; i--) { const [value, next] = random(seed); seed = next; const j = Math.floor(value * (i + 1)); [pieces[i], pieces[j]] = [pieces[j], pieces[i]]; }
  return { pieces, seed };
}
export function newGame(kind: GameId, seed = 197989): Game {
  if (kind === "snake") { const snake = [{x:7,y:8},{x:6,y:8},{x:5,y:8},{x:4,y:8}]; return { kind, status: "ready", score: 0, direction: "right", turns: [], snake, ...foodFor(snake,seed) }; }
  const first = bag(seed), second = bag(first.seed); const [piece, ...queue] = [...first.pieces, ...second.pieces];
  return { kind, status: "ready", score: 0, seed: second.seed, lines: 0, board: Array.from({length:20},()=>Array(10).fill(0)), active: {kind:piece,rotation:0,x:3,y:-1}, queue };
}
export function pieceCells(piece: FallingPiece): Cell[] {
  let matrix = shapes[piece.kind];
  for (let i = 0; i < piece.rotation % 4; i++) matrix = matrix[0].map((_, x) => matrix.map(row => row[x]).reverse());
  return matrix.flatMap((row,y) => row.flatMap((v,x) => v ? [{ x:piece.x+x, y:piece.y+y }] : []));
}
export function fits(board: number[][], piece: FallingPiece) { return pieceCells(piece).every(c => c.x >= 0 && c.x < 10 && c.y < 20 && (c.y < 0 || board[c.y][c.x] === 0)); }
export function ghostPiece(game: TetrisGame) { let piece = game.active; while (fits(game.board,{...piece,y:piece.y+1})) piece = {...piece,y:piece.y+1}; return piece; }
export function gameDelay(game: Game) { return game.kind === "snake" ? Math.max(70, 185 - Math.floor(game.score / 30) * 12) : Math.max(90, Math.round(760 * .82 ** Math.floor(game.lines / 10))); }
function lock(game: TetrisGame): TetrisGame {
  const cells = pieceCells(game.active); if (cells.some(c => c.y < 0)) return {...game,status:"over"};
  const board = game.board.map(row=>[...row]); cells.forEach(c => { board[c.y][c.x] = PIECES.indexOf(game.active.kind)+1; });
  const remaining = board.filter(row => row.some(v => !v)); const cleared = 20 - remaining.length;
  while (remaining.length < 20) remaining.unshift(Array(10).fill(0));
  let queue = [...game.queue], seed = game.seed;
  if (queue.length < 8) { const next = bag(seed); queue.push(...next.pieces); seed = next.seed; }
  const kind = queue.shift()!; const active = {kind,rotation:0,x:3,y:-1};
  return {...game,board:remaining,active,queue,seed,lines:game.lines+cleared,score:game.score+[0,100,300,500,800][cleared]*(1+Math.floor(game.lines/10)),status:fits(remaining,active)?"running":"over"};
}
export function tickGame(game: Game): Game {
  if (game.status !== "running") return game;
  if (game.kind === "tetris") { const active = {...game.active,y:game.active.y+1}; return fits(game.board,active) ? {...game,active} : lock(game); }
  const [direction = game.direction, ...turns] = game.turns; const delta = { up:[0,-1],down:[0,1],left:[-1,0],right:[1,0] }[direction];
  const head = {x:game.snake[0].x+delta[0],y:game.snake[0].y+delta[1]}; const eating = head.x === game.food?.x && head.y === game.food?.y;
  const body = eating ? game.snake : game.snake.slice(0,-1);
  if (head.x < 0 || head.x >= SNAKE_W || head.y < 0 || head.y >= SNAKE_H || body.some(c=>c.x===head.x&&c.y===head.y)) return {...game,status:"over",turns:[]};
  const snake = [head,...body]; const food = eating ? foodFor(snake,game.seed) : {food:game.food,seed:game.seed};
  return {...game,...food,snake,direction,turns,score:game.score+(eating?10:0),status:food.food?"running":"won"};
}
export function gameControl(game: Game, control: Control): Game {
  if (control === "start" || control === "b") {
    if (game.status === "running") return {...game,status:"paused"};
    if (control === "start" && game.status === "paused") return {...game,status:"running"};
    return game;
  }
  if (game.status !== "running") {
    if (control !== "a") return game;
    return game.status === "paused" || game.status === "ready" ? {...game,status:"running"} : {...newGame(game.kind,game.seed),status:"running"};
  }
  if (game.kind === "snake") {
    if (control === "a") return {...game,status:"paused"};
    if (!["up","down","left","right"].includes(control) || game.turns.length >= 2) return game;
    const direction = control as Direction, last = game.turns.at(-1) ?? game.direction;
    const opposite: Record<Direction,Direction> = {up:"down",down:"up",left:"right",right:"left"};
    return direction === last || direction === opposite[last] ? game : {...game,turns:[...game.turns,direction]};
  }
  if (control === "select") { const active = ghostPiece(game); return lock({...game,active,score:game.score+(active.y-game.active.y)*2}); }
  if (control === "a" || control === "up") {
    const rotation = (game.active.rotation+1)%4;
    for (const [x,y] of [[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1],[0,-2]]) { const active = {...game.active,rotation,x:game.active.x+x,y:game.active.y+y}; if(fits(game.board,active)) return {...game,active}; }
    return game;
  }
  if (["left","right","down"].includes(control)) { const active = {...game.active,x:game.active.x+(control==="left"?-1:control==="right"?1:0),y:game.active.y+(control==="down"?1:0)}; return fits(game.board,active)?{...game,active,score:game.score+(control==="down"?1:0)}:game; }
  return game;
}
