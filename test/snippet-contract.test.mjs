import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));
const snippet = readFileSync(join(root, 'snippets/doodle-blocks.css'), 'utf8');
const fontSnippet = readFileSync(join(root, 'snippets/doodle-blocks-fonts.css'), 'utf8');
const sources = readFileSync(join(root, 'snippets/fonts/SOURCES.md'), 'utf8');

test('release is directly installable as CSS snippets without the retired theme package', () => {
  assert.match(snippet, /\/\* @settings\s+name: Doodle Blocks\s+id: doodle-blocks\s+settings:/);
  assert.ok(!existsSync(join(root, 'package.json')));
  assert.ok(!existsSync(join(root, 'src/manifest.json')));
  assert.ok(!existsSync(join(root, 'dist/Doodle Blocks/manifest.json')));
  assert.doesNotMatch(snippet, /@import\s|url\(["']?https?:/i);
});

test('both offline font payloads match the documented sources and licenses', () => {
  const payloads = [...fontSnippet.matchAll(/src: url\("data:font\/woff2;base64,([A-Za-z0-9+/=]+)"\)/g)];
  assert.equal(payloads.length, 2);

  for (const match of payloads) {
    const font = Buffer.from(match[1], 'base64');
    assert.equal(font.subarray(0, 4).toString(), 'wOF2');
    const digest = createHash('sha256').update(font).digest('hex');
    assert.ok(sources.includes(digest), `undocumented font payload ${digest}`);
  }

  assert.ok(existsSync(join(root, 'snippets/fonts/licenses/PatrickHand-OFL.txt')));
  assert.ok(existsSync(join(root, 'snippets/fonts/licenses/Xiaolai-OFL.txt')));
  assert.doesNotMatch(fontSnippet, /url\(["']?https?:/i);
});
