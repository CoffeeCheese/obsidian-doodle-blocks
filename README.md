# Doodle Blocks

适用于 Obsidian 桌面端默认主题的 Doodle Blocks 风格 CSS 代码片段。它提供奶油纸与深色纸面、墨线分界、黄色活动标签与强调色、青色选中框和原生控件反馈。外观参数可由 [Style Settings](https://github.com/community-archive/obsidian-style-settings) 调整；没有该插件时也能使用默认样式。

## 安装

1. 在 Obsidian「设置 → 外观」中选择**默认主题**。
2. 把 [doodle-blocks.css](snippets/doodle-blocks.css) 复制到目标 Vault 的 `.obsidian/snippets/`。该文件可单独使用。
3. 若需要视频风格的中英手写标题，再复制 [doodle-blocks-fonts.css](snippets/doodle-blocks-fonts.css) 到同一目录。它包含离线字体，中文子集覆盖常用字；不启用时标题回退到系统字体。
4. 在「设置 → 外观 → CSS 样式代码片段」刷新列表并启用 `doodle-blocks`。复制了字体附件时，再启用 `doodle-blocks-fonts`。**无需安装 npm 依赖或构建。**
5. 可选：安装并启用 Style Settings 社区插件，在「Style Settings → Doodle Blocks」调整浅深色纸面、墨色、选中青色、主题黄色、短标题字体、选中阴影和控件触感。设置变更会立即应用；启用片段后，主题黄色会覆盖 Obsidian 原有的紫色强调色。

更新时替换这两个 CSS 文件，在 Obsidian 中刷新代码片段。撤销时停用这两个片段即可恢复默认主题外观；Style Settings 插件可以继续保留。由旧版文件名迁移时，先停用并移除旧片段，再启用新文件，避免重复加载。Style Settings 的配置标识已随名称更新；若曾自定义颜色、字体或控件选项，请在 Doodle Blocks 分组重新设置。

## Homepage 工作台

项目另附一份可作为启动页的 [Doodle Blocks 工作台笔记](homepage/Doodle%20Blocks%20工作台.md) 和专用的 [工作台样式片段](snippets/doodle-blocks-homepage.css)。它们是可选附件，主题 CSS 单独使用时不依赖 Homepage。工作台采用方案 A 的仪表盘布局：顶部总览当天，下面依次是常用插件入口、今日及逾期任务、项目任务完成数、知识库指标、最近笔记和本周日记。快速入口中「工作量洞察」和「AI 助手」排在最前。数据在当前 Vault 内由 DataviewJS 和 Obsidian 元数据读取，按钮调用已启用插件的 Obsidian 命令；不会把笔记内容发送到本项目。项目卡片只展示 Project Manager 中有未完成任务的最近项目，任务完成数由该插件状态计算。

安装工作台：

1. 在目标 Vault 安装并启用 [Homepage](https://github.com/mirnovov/obsidian-homepage) 与 Dataview，并在 Dataview 设置中启用 JavaScript 查询。
2. 把 `homepage/Doodle Blocks 工作台.md` 复制到 Vault 根目录；把 `snippets/doodle-blocks-homepage.css` 复制到 `.obsidian/snippets/` 并启用。工作台片段只作用于带 `doodle-homepage` 属性的阅读视图。
3. 在 Homepage 设置中选「File → Doodle Blocks 工作台」，开启「Open on startup」，视图选「Reading view」。建议启动和手动打开都选「Keep open notes」，以便保留已有标签。可启用「Refresh Dataview」。
4. QuickAdd 若尚无 Choice，先从工作台点击「配置快速记录」，添加一个 Capture；完成后「快速记录」按钮会启用。

由旧工作台升级时，重命名原笔记，并在 Homepage 设置中把启动文件改为 `Doodle Blocks 工作台.md`；替换笔记内容后刷新 Dataview。

当前只在 Obsidian 桌面端验证。没有任务、项目或最近笔记时会显示明确空状态；QuickAdd 未配置 Choice 时显示配置入口。日期卡片可打开已有日记，今天没有日记时可通过「日记」命令创建；其他日期没有日记时会提示使用日记插件创建。顶部时间是打开工作台时的时间，重新打开或刷新 Dataview 后更新。

## 新标签页

桌面端的新标签页是一张 Doodle Blocks 涂鸦本纸页：黄色书签、装订孔、青色页边线和浅色纸纹围住原生的「创建新文件」「打开文件」「关闭标签页」操作。装饰不会拦截点击；窄分栏和矮窗口中纸页会缩排并允许纵向滚动。浅色与深色外观沿用同一套 Doodle Blocks 配色，其他视图的空状态不受影响。

## 代码块工作台

围栏代码采用 Q 原型 B「工作台条带」：阅读视图有青色顶部条带、墨线、浅青纸面和短硬阴影；无数字行号时不保留空白行号栏。原生复制按钮显示为原型的“复制代码 ↗”文字按钮。长行在代码块内横向滚动；实时预览沿用 Obsidian 的折行和围栏编辑行为，并在原生语言或复制标记旁呈现相同配色。行内代码只使用紧凑的浅黄纸签；源码模式保留原始 Markdown 围栏。

代码块沿用现有 Style Settings 的纸面、墨色、青色和黄色选项，无须安装额外插件。阅读视图根据 Obsidian 的围栏语言类名显示 JavaScript、CSS、Python 等常见语言；没有语言或暂未映射的语言回退为 `CODE`。纯 CSS 不能从 `language-xxx` 类名中截取任意语言名。原型里的数字行号、总行数、折行开关与视图切换控件未加入片段，因为原生代码节点不能让纯 CSS 在编辑、折行和滚动后可靠维持这些数据。嵌套代码与窄桌面窗口的实际验收及可见差异见[验收记录](docs/doodle-blocks-code-blocks-validation.md)。

## 视频细节与 CSS 位置

活动顶部标签采用视频中的黄色纸签，普通按钮使用纸白内面与墨线，主操作按钮使用主题黄色。按钮在悬停和按下时改变短硬阴影，不移动控件；设置滑杆保留 Obsidian 的尺寸和拖动行为，用墨边白色滑块与黄色进度呈现。视频里的卡通角色、手机预览、旋转和抖动属于被编辑的内容，没有加入笔记工作区。设置中的「减少控件触感」与系统减少动态偏好可关闭装饰过渡。

`snippets/` 是可编辑源码，也是用户直接复制的发布文件；Style Settings 声明与样式在同一份 CSS 中。目前不需要把 CSS 搬进 `src/`，也不需要生成第二份样式文件。将来确实需要拆包或生成不同产物时，再建立明确的构建流程。

笔记中的链接与任务勾选使用适合浅深色纸面的青色；Callout 保留 Obsidian 的语义色背景和图标，并提高标题文字对比度。文件树、设置分类、菜单选中项与键盘焦点保留青色；开关和原生强调色采用黄色，黄色上的文字使用深墨色。

## 字体与兼容性

短标题字体参考原视频的手写字形，使用 Patrick Hand 与小赖字体的近似组合；视频原字体无法确认。笔记正文沿用 Obsidian 的正文字体设置，代码沿用等宽字体设置。字体附件把字体内嵌在 CSS 中，因为 Obsidian 会以内联样式注入代码片段，相对路径字体 URL 不能稳定加载。字体来源、子集范围和 SHA-256 见 [SOURCES.md](snippets/fonts/SOURCES.md)。

目前在 Obsidian 1.13.7 桌面端与默认主题下验收。移动端、其他主题和社区插件内部界面不在本项目的验收范围内。macOS 由系统绘制的右键菜单没有可供 CSS 片段修改的应用内节点；其余原生菜单与建议列表使用可用的 Doodle Blocks 样式。

## 许可证

项目 CSS 与文档采用 [MIT 许可证](LICENSE)。随字体附件分发的两款字体分别受 [Patrick Hand OFL 1.1](snippets/fonts/licenses/PatrickHand-OFL.txt) 与 [小赖字体 OFL 1.1](snippets/fonts/licenses/Xiaolai-OFL.txt) 约束。
