const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { spawnSync } = require('node:child_process');

const output = mkdtempSync(join(tmpdir(), 'desprets-console-'));
const compiled = spawnSync(process.execPath, [require.resolve('typescript/bin/tsc'), '--module', 'commonjs', '--target', 'ES2022', '--skipLibCheck', '--outDir', output, 'components/gameboy/console.ts', 'components/gameboy/screen-font.ts'], { cwd: resolve(__dirname, '..'), encoding: 'utf8' });
assert.equal(compiled.status, 0, compiled.stdout + compiled.stderr);
const { consoleReducer: reduce, initialConsole, work, contact, articles, keyControl } = require(join(output, 'components/gameboy/console.js'));
const { wrapText, textWidth } = require(join(output, 'components/gameboy/screen-font.js'));
after(() => rmSync(output, { recursive: true, force: true }));
const control = (state, button) => reduce(state, { type: 'control', control: button });

test('the D-pad follows the physical arrangement of the six home tiles', () => {
  const home = initialConsole('/', '');
  assert.equal(control(home, 'right').page.selected, 1);
  assert.equal(control(home, 'down').page.selected, 2);
  assert.equal(control(control(home, 'right'), 'down').page.selected, 3);
  assert.equal(control(control(home, 'down'), 'up').page.selected, 0);
});

test('work browsing returns to the same selection and preserves the palette', () => {
  let state = control(control(initialConsole('/', ''), 'right'), 'a');
  assert.equal(state.page.section, 'Work');
  state = control(state, 'down');
  const selected = state.page.selected;
  state = control(control(state, 'a'), 'select');
  assert.equal(state.page.id, work[selected].id);
  state = control(state, 'b');
  assert.equal(state.page.selected, selected);
  assert.equal(state.palette, 'dmg');
  assert.equal(control(state, 'b').page.kind, 'menu');
});

test('long held input cannot scroll beyond either end of an article', () => {
  let state = initialConsole('/about', '');
  for (let i = 0; i < 100; i++) state = reduce(state, { type: 'scroll', delta: 32, limit: 380 });
  assert.equal(state.page.scroll, 380);
  for (let i = 0; i < 100; i++) state = reduce(state, { type: 'scroll', delta: -32, limit: 380 });
  assert.equal(state.page.scroll, 0);
});

test('project, section, hash, education and trailing-slash entry points resolve', () => {
  assert.equal(initialConsole('/projects/bedrock/', '').page.id, 'bedrock');
  assert.equal(initialConsole('/imagn', '').page.id, 'imagn');
  assert.equal(initialConsole('/work', '').page.section, 'Work');
  assert.equal(initialConsole('/', '#contact').page.section, 'Contact');
  assert.equal(initialConsole('/epitech', '').page.id, 'education');
  assert.equal(initialConsole('/mcgill', '').page.id, 'education');
});

test('each work/contact item is reachable and Start always returns home', () => {
  assert.equal(new Set(articles.map(entry => entry.id)).size, articles.length);
  for (const [section, entries] of [['Work', work], ['Contact', contact]]) {
    for (let selected = 0; selected < entries.length; selected++) {
      const state = { page: { kind: 'list', section, selected }, history: [], palette: 'color' };
      assert.equal(control(state, 'a').page.id, entries[selected].id);
      assert.deepEqual(control(control(state, 'a'), 'start').page, { kind: 'menu', selected: 0 });
    }
  }
});

test('keyboard directions and emulator action keys remain distinct', () => {
  for (const code of ['ArrowUp', 'KeyW']) assert.equal(keyControl(code), 'up');
  for (const code of ['ArrowDown', 'KeyS']) assert.equal(keyControl(code), 'down');
  for (const code of ['KeyZ', 'KeyJ', 'Enter']) assert.equal(keyControl(code), 'a');
  for (const code of ['KeyX', 'KeyK', 'KeyB', 'Backspace']) assert.equal(keyControl(code), 'b');
  assert.equal(keyControl('Space'), 'start');
  assert.equal(keyControl('KeyQ'), undefined);
});

test('screen text wraps long addresses and paragraphs without losing words or overflowing', () => {
  for (const entry of articles) {
    const lines = wrapText(entry.body, 288, 2);
    assert.ok(lines.every(line => textWidth(line, 2) <= 288), entry.id);
    assert.equal(lines.join('').replace(/\s/g, ''), entry.body.replace(/\s/g, ''), entry.id);
  }
  assert.deepEqual(wrapText('Ben\n\nDesprets', 288, 2), ['Ben', '', 'Desprets']);
});
const { newGame, tickGame, gameControl, pieceCells, ghostPiece, fits } = require(join(output, 'components/gameboy/games.js'));
const { THEMES } = require(join(output, 'components/gameboy/themes.js'));
const running = kind => ({...newGame(kind),status:'running'});

test('both settings carousels cycle independently through every finish',()=>{
  let state=initialConsole('/',''); state=control(control(state,'up'),'right'); assert.equal(state.page.selected,5);
  state=control(state,'a');assert.equal(state.page.kind,'settings');
  const { SHELLS } = require(join(output,'components/gameboy/shells.js'));
  for(let i=0;i<THEMES.length;i++){assert.equal(state.palette,THEMES[i].id);state=control(state,'right');assert.equal(state.shell,'platinum');}
  assert.equal(state.palette,'color');state=control(state,'left');assert.equal(state.palette,THEMES.at(-1).id);
  state=control(state,'down');assert.equal(state.page.selected,1);
  for(let i=0;i<SHELLS.length;i++){assert.equal(state.shell,SHELLS[i].id);state=control(state,'right');assert.equal(state.palette,THEMES.at(-1).id);}
  assert.equal(state.shell,'platinum');state=control(state,'left');assert.equal(state.shell,SHELLS.at(-1).id);
  state=reduce(state,{type:'settings-step',row:0,direction:1});assert.equal(state.palette,'color');assert.equal(state.page.selected,0);
  const restored=reduce(initialConsole('/',''),{type:'restore',palette:state.palette,shell:state.shell,records:{snake:10,tetris:20}});
  assert.equal(restored.shell,state.shell);assert.equal(restored.records.tetris,20);
  const legacy=reduce(initialConsole('/',''),{type:'restore',palette:'color',records:{snake:10,tetris:20}});assert.equal(legacy.shell,'platinum');
  assert.equal(articles.find(entry=>entry.id==='about').image,'/pfp-380.webp');
});
test('Snake rejects reversal and buffers quick turns across separate steps',()=>{
  let game=running('snake');const head=game.snake[0];
  assert.equal(gameControl(game,'left'),game);
  game=gameControl(gameControl(game,'up'),'left');game=tickGame(game);
  assert.deepEqual(game.snake[0],{x:head.x,y:head.y-1});game=tickGame(game);
  assert.deepEqual(game.snake[0],{x:head.x-1,y:head.y-1});
});
test('Snake grows and places food off its body, but dies at walls',()=>{
  let game=running('snake');game={...game,food:{x:8,y:8}};game=tickGame(game);
  assert.equal(game.score,10);assert.equal(game.snake.length,5);assert.ok(!game.snake.some(c=>c.x===game.food.x&&c.y===game.food.y));
  for(let i=0;i<30;i++)game=tickGame(game);assert.equal(game.status,'over');
});
test('Snake can move into its departing tail and wins when the board fills',()=>{
  let game={...running('snake'),snake:[{x:1,y:1},{x:1,y:2},{x:0,y:2},{x:0,y:1}],direction:'left',food:{x:8,y:8}};
  assert.equal(tickGame(game).status,'running');
  const snake=[];for(let y=0;y<16;y++)for(let x=0;x<20;x++)if(x!==0||y!==0)snake.push({x,y});
  game={...game,snake,direction:'left',food:{x:0,y:0}};assert.equal(tickGame(game).status,'won');
});
test('paused games remain frozen and can resume, retry, or quit',()=>{
  for(const kind of ['snake','tetris']){
    const game=gameControl(running(kind),'b');assert.equal(game.status,'paused');assert.equal(tickGame(game),game);
    assert.equal(gameControl(game,'start').status,'running');assert.equal(gameControl({...game,status:'over'},'a').score,0);
    let state=reduce(initialConsole('/',''),{type:'open',page:{kind:'games',selected:kind==='snake'?0:1}});
    state=control(state,'a');state=control(state,'a');state=control(state,'b');assert.equal(state.page.game.status,'paused');
    state=control(state,'b');assert.equal(state.page.kind,'games');
  }
});
test('Tetris starts with a seven-piece bag and hard-drops onto its landing guide',()=>{
  let game=running('tetris');assert.equal(new Set([game.active.kind,...game.queue.slice(0,6)]).size,7);
  const ghost=pieceCells(ghostPiece(game));game=gameControl(game,'select');
  assert.equal(game.board.flat().filter(Boolean).length,4);assert.ok(ghost.every(c=>game.board[c.y][c.x]));assert.ok(game.score>0);
});
test('Tetris clears four rows, scores them, and advances the level',()=>{
  let game=running('tetris');game={...game,lines:6,active:{kind:'I',rotation:1,x:2,y:16}};
  game.board=game.board.map((row,y)=>y>=16?row.map((_,x)=>x===4?0:1):row);
  game=gameControl(game,'select');assert.equal(game.lines,10);assert.equal(game.score,800);assert.equal(game.board.flat().filter(Boolean).length,0);
});
test('Tetris rotation respects walls and an obstructed spawn ends the game',()=>{
  let game={...running('tetris'),active:{kind:'T',rotation:0,x:0,y:5}};
  for(let i=0;i<5;i++)game=gameControl(game,'left');game=gameControl(game,'a');assert.ok(fits(game.board,game.active));
  game={...running('tetris'),active:{kind:'O',rotation:0,x:3,y:-1}};game.board[1]=Array(10).fill(1);
  assert.equal(tickGame(game).status,'over');
});
test('game ticks update best scores without losing them when leaving',()=>{
  let game={...running('snake'),food:{x:8,y:8}};
  let state={...initialConsole('/',''),page:{kind:'game',game}};state=reduce(state,{type:'tick'});assert.equal(state.records.snake,10);
  state=control(control(state,'b'),'b');assert.equal(state.records.snake,10);
});
test('long deterministic Tetris input sequences keep the board valid',()=>{
  let game=running('tetris');const actions=['left','right','a','down','select'];
  for(let i=0;i<500;i++){if(game.status==='over')game=gameControl(game,'a');game=gameControl(game,actions[(i*17+i*i)%actions.length]);game=tickGame(game);
    assert.equal(game.board.length,20);assert.ok(game.board.every(row=>row.length===10&&row.every(v=>Number.isInteger(v)&&v>=0&&v<=7)));
    if(game.status==='running')assert.ok(fits(game.board,game.active));assert.ok(Number.isSafeInteger(game.score)&&game.score>=0);
  }
});
