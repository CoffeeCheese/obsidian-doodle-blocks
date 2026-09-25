# 字体来源与许可

`doodle-blocks-q-fonts.css` 把以下 WOFF2 字体以内嵌数据形式分发。Obsidian 将代码片段注入内联 `<style>`，相对路径字体 URL 无法解析；启用这个可选字体片段即可在任何 Vault 离线使用。两款字体均按 SIL Open Font License 1.1 分发，许可证原文见 `licenses/`。它们是视频风格的近似选择，无法据画面确认视频原字体。

| 内嵌字体 | 原始来源 | 处理 | 内嵌 WOFF2 SHA-256 |
| --- | --- | --- | --- |
| `Q Patrick` | [Google Fonts / Patrick Hand](https://github.com/google/fonts/tree/main/ofl/patrickhand)，2026-09-25 获取 `PatrickHand-Regular.ttf` | 使用 fontTools 4.66.0 / Brotli 1.2.0 转为 WOFF2，保留全部字形 | `86e08fa772337c9934f965eba799845d4842a7293d3bf454567ac158dc2736bf` |
| `Q Xiaolai` | [小赖字体 v3.126](https://github.com/lxgw/kose-font/releases/tag/v3.126) 的 `Xiaolai-Regular.ttf` | 使用同版工具转为 WOFF2，并保留 GB2312 字符、常用中文标点和部分补充字符；其余字形回退系统字体 | `5373146bca77e6555dff14d80e1d10c0c701af91fc1c77730d3a95f15e862e60` |

Patrick Hand 覆盖拉丁字符；小赖字体的内嵌子集覆盖 7547 个字符。缺少字体附件或某个字形时，主片段会回退到系统字体。两款字体都不在运行时联网。
