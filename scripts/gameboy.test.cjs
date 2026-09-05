const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { spawnSync } = require('node:child_process');

const output = mkdtempSync(join(tmpdir(), 'desprets-console-'));
const compiled = spawnSync(process.execPath, [require.resolve('typescript/bin/tsc'), '--module', 'commonjs', '--target', 'ES2022', '--skipLibCheck', '--outDir', output, 'components/gameboy/console.ts', 'components/gameboy/pixel-font.ts'], { cwd: resolve(__dirname, '..'), encoding: 'utf8' });
assert.equal(compiled.status, 0, compiled.stdout + compiled.stderr);
const { consoleReducer: reduce, initialConsole, work, contact, articles, keyControl } = require(join(output, 'components/gameboy/console.js'));
const { wrapText, textWidth } = require(join(output, 'components/gameboy/pixel-font.js'));
after(() => rmSync(output, { recursive: true, force: true }));
const control = (state, button) => reduce(state, { type: 'control', control: button });

test('the D-pad follows the physical arrangement of the four home tiles', () => {
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
  assert.equal(state.palette, 'pocket');
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

test('bitmap text wraps long addresses and paragraphs without losing words or overflowing', () => {
  for (const entry of articles) {
    const lines = wrapText(entry.body, 288, 2);
    assert.ok(lines.every(line => textWidth(line, 2) <= 288), entry.id);
    assert.equal(lines.join('').replace(/\s/g, ''), entry.body.replace(/\s/g, ''), entry.id);
  }
  assert.deepEqual(wrapText('Ben\n\nDesprets', 288, 2), ['Ben', '', 'Desprets']);
});
