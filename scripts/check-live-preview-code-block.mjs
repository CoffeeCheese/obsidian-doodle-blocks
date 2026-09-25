import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const fixturePath = `Theme Debug/Doodle Blocks 临时代码检查-${process.pid}.md`;
const fixture = '# 代码块回归\n\n```javascript\nconst theme = "Doodle Blocks";\n```\n';
const evaluate = code => execFileSync('obsidian', ['vault=dev-test', 'eval', `code=${code}`], {
  encoding: 'utf8'
}).replace(/^=>\s*/, '').trim();
const vaultRoot = JSON.parse(evaluate('JSON.stringify(app.vault.adapter.basePath)'));
const fixtureFile = join(vaultRoot, fixturePath);

try {
  writeFileSync(fixtureFile, fixture);
  let indexed = false;
  for (let attempt = 0; attempt < 30 && !indexed; attempt++) {
    indexed = JSON.parse(evaluate(`JSON.stringify({found:!!app.vault.getAbstractFileByPath(${JSON.stringify(fixturePath)})})`)).found;
    if (!indexed) await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.equal(indexed, true, '临时笔记应进入 Obsidian Vault 索引');
  execFileSync('obsidian', ['vault=dev-test', 'open', `path=${fixturePath}`, 'newtab']);
  let mode;
  for (let attempt = 0; attempt < 10; attempt++) {
    const state = JSON.parse(evaluate('JSON.stringify({path:app.workspace.activeLeaf?.view?.file?.path,mode:app.workspace.activeLeaf?.view?.getMode?.()})'));
    if (state.path === fixturePath && state.mode) { mode = state.mode; break; }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (mode === 'preview') execFileSync('obsidian', ['vault=dev-test', 'command', 'id=markdown:toggle-preview']);
  assert.equal(JSON.parse(evaluate('JSON.stringify({mode:app.workspace.activeLeaf?.view?.getMode?.()})')).mode, 'source',
    '回归笔记应以实时预览打开');

  const probe = `JSON.stringify((()=>{
    const leaf = app.workspace.getLeavesOfType('markdown').find(leaf =>
      leaf.view.file?.path === ${JSON.stringify(fixturePath)});
    const line = leaf?.view.containerEl.querySelector('.is-live-preview .HyperMD-codeblock-begin');
    const flair = line?.querySelector('.code-block-flair');
    if (!line || !flair) return null;
    const bar = line.getBoundingClientRect();
    const label = flair.getBoundingClientRect();
    return {
      language: flair.textContent.trim(),
      languageInset: label.left - bar.left,
      barWidth: bar.width,
      copyLabel: getComputedStyle(flair, '::after').content,
      labelWidth: label.width,
      barHeight: bar.height,
      languageHit: document.elementFromPoint(bar.left + 70, bar.top + 19) === flair,
      copyHit: document.elementFromPoint(bar.right - 55, bar.top + 19) === flair
    };
  })())`;
  let result = null;
  for (let attempt = 0; attempt < 10 && !result; attempt++) {
    result = JSON.parse(evaluate(probe));
    if (!result) await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(result, '真实 Obsidian 实时预览中必须存在 JavaScript 围栏');
  console.log(result);
  assert.equal(result.language, 'JavaScript');
  assert.ok(result.languageInset <= 36, '语言应位于条带左侧');
  assert.equal(result.copyLabel, '"复制代码 ↗"', '条带右侧应提供清晰的复制提示');
  assert.ok(result.labelWidth >= 100, '语言与复制提示应留有可辨认的空间');
  assert.ok(result.barHeight >= 38, '条带应为语言与复制按钮留足高度');
  assert.equal(result.languageHit, false, '语言区域应允许编辑器接收点击');
  assert.equal(result.copyHit, true, '复制按钮区域应命中原生复制控件');
} finally {
  const cleanup = `(async()=>{
    const leaf = app.workspace.getLeavesOfType('markdown').find(leaf =>
      leaf.view.file?.path === ${JSON.stringify(fixturePath)});
    leaf?.detach();
    const file = app.vault.getAbstractFileByPath(${JSON.stringify(fixturePath)});
    if (file) await app.vault.delete(file);
    return 'closed';
  })()`;
  evaluate(cleanup);
  if (existsSync(fixtureFile)) unlinkSync(fixtureFile);
}
