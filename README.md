# Doodle Blocks Q

适用于 Obsidian 桌面端默认主题的 Q 风格 CSS 代码片段。它提供奶油纸与深色纸面、墨线分界、黄色活动标签、青色文件选中态和原生控件反馈。外观参数可由 [Style Settings](https://github.com/community-archive/obsidian-style-settings) 调整；没有该插件时也能使用默认样式。

## 安装

1. 在 Obsidian「设置 → 外观」中选择**默认主题**。
2. 把 [doodle-blocks-q.css](snippets/doodle-blocks-q.css) 复制到目标 Vault 的 `.obsidian/snippets/`。该文件可单独使用。
3. 若需要视频风格的中英手写标题，再复制 [doodle-blocks-q-fonts.css](snippets/doodle-blocks-q-fonts.css) 到同一目录。它包含离线字体，中文子集覆盖常用字；不启用时标题回退到系统字体。
4. 在「设置 → 外观 → CSS 样式代码片段」刷新列表并启用 `doodle-blocks-q`。复制了字体附件时，再启用 `doodle-blocks-q-fonts`。**无需安装 npm 依赖或构建。**
5. 可选：安装并启用 Style Settings 社区插件，在「Style Settings → Doodle Blocks Q」调整浅深色纸面、墨色、青色、黄色、短标题字体、选中阴影和控件触感。设置变更会立即应用，默认不覆盖 Obsidian 自己的强调色。

更新时替换这两个 CSS 文件，在 Obsidian 中刷新代码片段。撤销时停用这两个片段即可恢复默认主题外观；Style Settings 插件可以继续保留。个人设置值由插件保存在 Vault 内，需要完全重置时可在 Q 分组中恢复默认值。

## 代码块工作台

围栏代码采用 Q 原型 B「工作台条带」：阅读视图有青色顶部条带、墨线、浅青纸面和短硬阴影；无数字行号时不保留空白行号栏。原生复制按钮显示为原型的“复制代码 ↗”文字按钮。长行在代码块内横向滚动；实时预览沿用 Obsidian 的折行和围栏编辑行为，并在原生语言或复制标记旁呈现相同配色。行内代码只使用紧凑的浅黄纸签；源码模式保留原始 Markdown 围栏。

代码块沿用现有 Style Settings 的纸面、墨色、青色和黄色选项，无须安装额外插件。阅读视图用通用 `CODE` 标签；原型里的数字行号、总行数、折行开关与视图切换控件未加入片段，因为原生代码节点不能让纯 CSS 在编辑、折行和滚动后可靠维持这些数据。嵌套代码与窄桌面窗口的实际验收及可见差异见[验收记录](docs/q-code-blocks-validation.md)。

## 视频细节与 CSS 位置

活动顶部标签采用视频中的黄色纸签，普通按钮使用纸白内面与墨线，主操作按钮使用青绿色。按钮在悬停和按下时改变短硬阴影，不移动控件；设置滑杆保留 Obsidian 的尺寸和拖动行为，用墨边白色滑块与青色进度呈现。视频里的卡通角色、手机预览、旋转和抖动属于被编辑的内容，没有加入笔记工作区。设置中的「减少控件触感」与系统减少动态偏好可关闭装饰过渡。

`snippets/` 是可编辑源码，也是用户直接复制的发布文件；Style Settings 声明与样式在同一份 CSS 中。目前不需要把 CSS 搬进 `src/`，也不需要生成第二份样式文件。将来确实需要拆包或生成不同产物时，再建立明确的构建流程。

## 字体与兼容性

短标题字体参考原视频的手写字形，使用 Patrick Hand 与小赖字体的近似组合；视频原字体无法确认。笔记正文沿用 Obsidian 的正文字体设置，代码沿用等宽字体设置。字体附件把字体内嵌在 CSS 中，因为 Obsidian 会以内联样式注入代码片段，相对路径字体 URL 不能稳定加载。字体来源、子集范围和 SHA-256 见 [SOURCES.md](snippets/fonts/SOURCES.md)。

目前在 Obsidian 1.13.7 桌面端与默认主题下验收。移动端、其他主题和社区插件内部界面不在本项目的验收范围内。macOS 由系统绘制的右键菜单没有可供 CSS 片段修改的应用内节点；其余原生菜单与建议列表使用可用的 Q 样式。

## 许可证

项目 CSS 与文档采用 [MIT 许可证](LICENSE)。随字体附件分发的两款字体分别受 [Patrick Hand OFL 1.1](snippets/fonts/licenses/PatrickHand-OFL.txt) 与 [小赖字体 OFL 1.1](snippets/fonts/licenses/Xiaolai-OFL.txt) 约束。
