# obsidian-doodle-blocks

obsidian-doodle-blocks 是一个面向 Obsidian 的主题项目。

当前设计方向是 Q「压合积木」：沿用 B 原型中贴合 Obsidian 原生结构的连续工作区，将纸质积木的触感用于按钮、状态和设置界面。

## 本地构建与预览

需要 Node.js 和 npm。运行 `npm ci` 后：

```sh
npm run build
npm run check
npm test
```

构建生成 `dist/Doodle Blocks Q/`，其中 `manifest.json` 和 `theme.css` 可作为 Obsidian 主题安装，目录内还保留项目与字体的授权信息。`check` 对照当前源码和资源逐字节检查整个主题包，缺失或过期产物会使命令失败。

在本机 `dev-test` Vault 中持续预览：

```sh
npm run preview -- --vault '/absolute/path/to/dev-test'
```

预览命令先构建，再把主题包同步到该 Vault 的 `.obsidian/themes/Doodle Blocks Q/`，并持续监听主题源码变化。按 Ctrl+C 停止。也可将本机绝对路径放在 `DOODLE_VAULT_PATH` 环境变量中，或加 `--once` 只安装一次。Vault 路径请保存在本机，不写入仓库。首次安装后，在 Obsidian 的「设置 → 外观 → 主题」中选择 Doodle Blocks Q；命令不会改动外观设置、笔记或其他主题。

## 许可证

项目源码采用 [MIT 许可证](LICENSE)。仓库中的 Fusion Pixel 和 JetBrains Mono 字体遵循各自的 SIL Open Font License 1.1；来源及许可证文本见 [字体来源说明](src/assets/fonts/SOURCES.md)。
