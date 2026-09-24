import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('../', import.meta.url).pathname;
const cli = join(root, 'scripts/theme.mjs');

function run(command, out) {
  return spawnSync(process.execPath, [cli, command, '--out', out], {
    cwd: root,
    encoding: 'utf8',
  });
}

test('build produces a complete offline Obsidian theme package', () => {
  const out = mkdtempSync(join(tmpdir(), 'doodle-theme-'));
  const result = run('build', out);
  assert.equal(result.status, 0, result.stderr);

  const manifest = JSON.parse(readFileSync(join(out, 'manifest.json'), 'utf8'));
  assert.deepEqual(manifest, {
    name: 'Doodle Blocks Q',
    version: '0.1.0',
    minAppVersion: '1.13.7',
    author: 'CoffeeCheese',
  });

  const css = readFileSync(join(out, 'theme.css'), 'utf8');
  assert.match(css, /\.theme-light\s*\{/);
  assert.match(css, /\.theme-dark\s*\{/);
  assert.match(css, /data:font\/woff2;base64,/);
  assert.doesNotMatch(css, /(?:@import\s+|url\(['"]?\s*(?:https?:)?\/\/)/i);
  assert.deepEqual(readdirSync(join(out, 'licenses')).sort(), [
    'Fusion-Pixel-OFL-1.1.txt',
    'JetBrains-Mono-OFL-1.1.txt',
  ]);
  for (const license of readdirSync(join(out, 'licenses'))) {
    assert.match(readFileSync(join(out, 'licenses', license), 'utf8'), /SIL Open Font License, Version 1\.1/);
  }
  assert.match(readFileSync(join(out, 'SOURCES.md'), 'utf8'), /Fusion Pixel/);
});

test('rebuilding is deterministic and check rejects stale package output', () => {
  const out = mkdtempSync(join(tmpdir(), 'doodle-theme-'));
  assert.equal(run('build', out).status, 0);
  const first = readFileSync(join(out, 'theme.css'));
  writeFileSync(join(out, 'obsolete.css'), '/* previous build */\n');
  assert.equal(run('build', out).status, 0);
  assert.deepEqual(readFileSync(join(out, 'theme.css')), first);
  assert.equal(existsSync(join(out, 'obsolete.css')), false);
  assert.equal(run('check', out).status, 0);

  writeFileSync(join(out, 'theme.css'), '/* stale */\n');
  const stale = run('check', out);
  assert.notEqual(stale.status, 0);
  assert.match(stale.stderr, /out of date|stale/i);

  const unrelated = mkdtempSync(join(tmpdir(), 'unrelated-output-'));
  mkdirSync(join(unrelated, 'keep'));
  const refused = run('build', unrelated);
  assert.notEqual(refused.status, 0);
  assert.equal(existsSync(join(unrelated, 'keep')), true);
});

test('preview installs only the named theme package in a dev-test Vault', () => {
  const workspace = mkdtempSync(join(tmpdir(), 'doodle-preview-'));
  const vault = join(workspace, 'dev-test');
  const themes = join(vault, '.obsidian', 'themes');
  mkdirSync(join(themes, 'Another Theme'), { recursive: true });
  writeFileSync(join(vault, 'note.md'), '# Keep this note\n');
  writeFileSync(join(vault, '.obsidian', 'appearance.json'), '{"cssTheme":"Another Theme"}\n');
  writeFileSync(join(themes, 'Another Theme', 'theme.css'), '/* untouched */\n');

  const result = spawnSync(process.execPath, [cli, 'preview', '--vault', vault, '--once', '--out', join(workspace, 'package')], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(join(vault, 'note.md'), 'utf8'), '# Keep this note\n');
  assert.equal(readFileSync(join(vault, '.obsidian', 'appearance.json'), 'utf8'), '{"cssTheme":"Another Theme"}\n');
  assert.equal(readFileSync(join(themes, 'Another Theme', 'theme.css'), 'utf8'), '/* untouched */\n');
  assert.deepEqual(
    readFileSync(join(themes, 'Doodle Blocks Q', 'theme.css')),
    readFileSync(join(workspace, 'package', 'theme.css')),
  );

  const external = join(workspace, 'outside-theme');
  mkdirSync(external);
  writeFileSync(join(external, 'sentinel.txt'), 'unchanged\n');
  rmSync(join(themes, 'Doodle Blocks Q', 'licenses'), { recursive: true });
  symlinkSync(external, join(themes, 'Doodle Blocks Q', 'licenses'));
  const unsafe = spawnSync(process.execPath, [cli, 'preview', '--vault', vault, '--once', '--out', join(workspace, 'package')], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.notEqual(unsafe.status, 0);
  assert.match(unsafe.stderr, /unsafe directory/);
  assert.deepEqual(readdirSync(external), ['sentinel.txt']);
  assert.equal(readFileSync(join(external, 'sentinel.txt'), 'utf8'), 'unchanged\n');

  const otherVault = join(workspace, 'personal');
  mkdirSync(join(otherVault, '.obsidian'), { recursive: true });
  const refused = spawnSync(process.execPath, [cli, 'preview', '--vault', otherVault, '--once'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.notEqual(refused.status, 0);
  assert.deepEqual(readdirSync(join(otherVault, '.obsidian')), []);
});
