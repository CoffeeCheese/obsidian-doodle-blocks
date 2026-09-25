import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const probe = `JSON.stringify((()=>{
  const pre = document.querySelector('.markdown-preview-view pre');
  const code = pre?.querySelector('code');
  const button = pre?.querySelector('.copy-code-button');
  if (!pre || !code || !button) return null;
  const preStyle = getComputedStyle(pre);
  const preRect = pre.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  return {
    gutterPaint: preStyle.backgroundImage,
    codeInset: code.getBoundingClientRect().left + parseFloat(getComputedStyle(code).paddingLeft) - preRect.left,
    buttonLabel: getComputedStyle(button, '::after').content,
    buttonWidth: buttonRect.width,
    buttonTop: buttonRect.top - preRect.top,
    buttonBottom: buttonRect.bottom - preRect.top,
    iconDisplay: getComputedStyle(button.querySelector('svg')).display,
    nativeButton: button.tagName === 'BUTTON'
  };
})())`;

const output = execFileSync('obsidian', ['vault=dev-test', 'eval', `code=${probe}`], { encoding: 'utf8' });
const result = JSON.parse(output.replace(/^=>\s*/, '').trim());
assert.ok(result, '真实 Obsidian 阅读视图中必须存在带原生复制按钮的代码块');
console.log(result);
assert.equal(result.gutterPaint, 'none', '无行号时不应绘制空白行号栏');
assert.ok(result.codeInset <= 22, '代码正文不应为行号栏额外让位');
assert.equal(result.nativeButton, true, '保留 Obsidian 原生复制按钮');
assert.equal(result.buttonLabel, '"复制代码 ↗"', '复制按钮需要显示原型的完整文字标签');
assert.equal(result.iconDisplay, 'none', '不要在文字按钮旁保留大图标');
assert.ok(result.buttonWidth >= 70, '复制按钮宽度应容纳文字标签');
assert.ok(result.buttonTop <= 8 && result.buttonBottom <= 38, '复制按钮应嵌入顶部工具条');
