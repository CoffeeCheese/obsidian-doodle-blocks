---
cssclasses:
  - doodle-homepage
---

```dataviewjs
// Doodle Blocks 工作台只读 Vault 元数据。按钮仅执行本地 Obsidian 命令或打开笔记。
const host = dv.container;
host.classList.add("doodle-home");
const now = new Date();
const today = dv.date("today");
const todayKey = today.toISODate();
const weekStart = today.minus({ days: (now.getDay() + 6) % 7 });
const weekEnd = weekStart.plus({ days: 6 });
const dateLabel = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(now);
const timeLabel = new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
const dateKey = date => date?.toISODate?.() ?? null;
const ready = id => Boolean(app.commands.commands[id]);
const allFiles = app.vault.getMarkdownFiles();
const files = allFiles.filter(file => file.path !== dv.current().file.path);
const recent = [...files].sort((a, b) => b.stat.mtime - a.stat.mtime).slice(0, 5);
const changed = files.filter(file => file.stat.mtime >= now.getTime() - 7 * 86400000).length;
const tags = Object.keys(app.metadataCache.getTags() ?? {}).length;
const quickAddReady = Boolean(app.plugins.plugins.quickadd?.settings?.choices?.length);
const dailyOptions = app.internalPlugins.plugins["daily-notes"]?.instance?.options ?? {};
const dailyPath = date => `${dailyOptions.folder ? `${dailyOptions.folder.replace(/\/$/, "")}/` : ""}${window.moment(date.toISODate()).format(dailyOptions.format || "YYYY-MM-DD")}.md`;
const dailyFile = date => app.vault.getAbstractFileByPath(dailyPath(date));
const todayDaily = dailyFile(today);
const tasks = dv.pages().file.tasks.where(task => !task.completed).array();
const due = task => dateKey(task.due);
const scheduled = task => dateKey(task.scheduled);
const inWeek = key => key && key >= weekStart.toISODate() && key <= weekEnd.toISODate();
const groups = {
  today: tasks.filter(task => due(task) === todayKey || scheduled(task) === todayKey || task.path === todayDaily?.path),
  overdue: tasks.filter(task => due(task) && due(task) < todayKey),
  week: tasks.filter(task => inWeek(due(task)) || inWeek(scheduled(task)))
};
const taskMeta = task => due(task) && due(task) < todayKey ? `逾期 ${due(task)}` : due(task) === todayKey ? "今天到期" : scheduled(task) === todayKey ? "今天计划" : due(task) ? `到期 ${due(task)}` : scheduled(task) ? `计划 ${scheduled(task)}` : "今日日记";

// Project Manager 的索引可用时读取任务状态；插件未启用或接口变化时显示空状态。
const pm = app.plugins.plugins["project-manager"];
let projects = [], activeProjects = null;
try {
  if (pm?.index?.projectRefs && pm?.index?.tasks) {
    const refs = pm.index.projectRefs();
    const complete = new Set((pm.settings?.statuses ?? []).filter(status => status.complete).map(status => status.id));
    const counts = new Map();
    for (const task of pm.index.tasks.values()) {
      if (task.archived || !task.projectPath) continue;
      const count = counts.get(task.projectPath) ?? { total: 0, done: 0 };
      count.total++;
      if (complete.has(task.status)) count.done++;
      counts.set(task.projectPath, count);
    }
    const active = refs.filter(ref => counts.has(ref.path) && counts.get(ref.path).total > counts.get(ref.path).done);
    activeProjects = active.length;
    projects = active.sort((a, b) => (app.vault.getAbstractFileByPath(b.path)?.stat?.mtime ?? 0) - (app.vault.getAbstractFileByPath(a.path)?.stat?.mtime ?? 0)).slice(0, 3).map(ref => ({ ...ref, ...counts.get(ref.path) }));
  }
} catch (error) { console.warn("Doodle Blocks 工作台：项目数据暂不可用", error); }

host.innerHTML = `
  <section class="doodle-home-hero" aria-labelledby="doodle-home-title">
    <div class="doodle-home-hero-copy"><p class="doodle-home-kicker">DOODLE DESK / TODAY</p><h1 id="doodle-home-title">把今天放在<span>眼前</span>。</h1><p>任务、近期变化和常用入口，都在这一页。</p></div>
    <div class="doodle-home-hero-time" aria-label="打开工作台时的日期和时间"><strong>${timeLabel}</strong><span>${dateLabel}</span></div>
  </section>
  <div class="doodle-home-grid">
    <section class="doodle-home-card doodle-home-quick-card" aria-labelledby="doodle-home-quick-title"><header class="doodle-home-card-head"><div><h2 id="doodle-home-quick-title">快速入口</h2><small>常用插件</small></div></header><div class="doodle-home-actions"></div><p class="doodle-home-hint"></p></section>
    <section class="doodle-home-card doodle-home-tasks-card" aria-labelledby="doodle-home-tasks-title"><header class="doodle-home-card-head"><div><h2 id="doodle-home-tasks-title">待办与提醒</h2><small>Tasks / 当前 Vault</small></div><button type="button" class="doodle-home-link" data-command="obsidian-tasks-plugin:quick-search">打开 ↗</button></header><div class="doodle-home-task-filters" role="group" aria-label="任务范围"></div><div class="doodle-home-task-list"></div><button type="button" class="doodle-home-action doodle-home-task-more" data-command="obsidian-tasks-plugin:quick-search">打开完整任务列表 <span aria-hidden="true">↗</span></button></section>
    <section class="doodle-home-card doodle-home-projects-card" aria-labelledby="doodle-home-projects-title"><header class="doodle-home-card-head"><div><h2 id="doodle-home-projects-title">项目进度</h2><small>Project Manager</small></div><button type="button" class="doodle-home-link" data-command="project-manager:open-projects">打开 ↗</button></header><div class="doodle-home-project-list"></div></section>
    <section class="doodle-home-card doodle-home-vault-card" aria-labelledby="doodle-home-vault-title"><header class="doodle-home-card-head"><div><h2 id="doodle-home-vault-title">知识库概览</h2><small>Vault / 元数据</small></div></header><div class="doodle-home-metrics"></div></section>
    <section class="doodle-home-card doodle-home-recent-card" aria-labelledby="doodle-home-recent-title"><header class="doodle-home-card-head"><div><h2 id="doodle-home-recent-title">最近笔记</h2><small>按修改时间</small></div></header><div class="doodle-home-recent-list"></div></section>
    <section class="doodle-home-card doodle-home-week-card" aria-labelledby="doodle-home-week-title"><header class="doodle-home-card-head"><div><h2 id="doodle-home-week-title">本周日记</h2><small>日记 / Calendar</small></div><button type="button" class="doodle-home-link" data-command="calendar:show-calendar-view">打开日历 ↗</button></header><div class="doodle-home-week-days"></div><p class="doodle-home-week-state" role="status"></p></section>
  </div><p class="doodle-home-status" role="status" aria-live="polite"></p>`;

const el = (tag, className, value) => { const node = document.createElement(tag); if (className) node.className = className; if (value !== undefined) node.textContent = String(value); return node; };
const addAction = (parent, label, command) => {
  const button = el("button", "doodle-home-action");
  button.type = "button"; button.dataset.command = command;
  button.disabled = !ready(command) || (command === "quickadd:runQuickAdd" && !quickAddReady);
  button.append(el("span", "", label), el("span", "doodle-home-action-arrow", "↗")); parent.append(button);
};
const filters = host.querySelector(".doodle-home-task-filters");
let selectedFilter = "today";
function renderTasks() {
  filters.replaceChildren();
  for (const [id, label] of [["today", "今天"], ["overdue", "逾期"], ["week", "本周"]]) {
    const button = el("button", selectedFilter === id ? "is-active" : "");
    button.type = "button"; button.dataset.filter = id; button.setAttribute("aria-pressed", String(selectedFilter === id));
    button.append(el("strong", "", groups[id].length), el("span", "", label)); filters.append(button);
  }
  const list = host.querySelector(".doodle-home-task-list"); list.replaceChildren();
  const rows = [...groups[selectedFilter]].sort((a, b) => (due(a) ?? scheduled(a) ?? "9999").localeCompare(due(b) ?? scheduled(b) ?? "9999"));
  host.querySelector(".doodle-home-grid").classList.toggle("has-sparse-tasks", rows.length < 3);
  host.querySelector(".doodle-home-tasks-card").classList.toggle("is-sparse", rows.length < 3);
  if (!rows.length) { list.append(el("p", "doodle-home-empty", selectedFilter === "today" ? "今天没有待处理任务。" : selectedFilter === "overdue" ? "没有逾期任务。" : "本周没有安排任务。")); return; }
  for (const task of rows.slice(0, 6)) {
    const row = el("button", "doodle-home-task-row"); row.type = "button"; row.dataset.path = task.path;
    row.append(el("span", "doodle-home-task-text", task.text.replace(/\s*[📅⏳🛫] ?\d{4}-\d{2}-\d{2}/g, "").trim()), el("small", "", taskMeta(task))); list.append(row);
  }
  if (rows.length > 6) list.append(el("p", "doodle-home-more-hint", `还有 ${rows.length - 6} 项，打开 Tasks 查看全部。`));
}
renderTasks();
const projectHost = host.querySelector(".doodle-home-project-list");
if (!pm) projectHost.append(el("p", "doodle-home-empty", "启用 Project Manager 后显示项目进度。"));
else if (activeProjects === null) projectHost.append(el("p", "doodle-home-empty", "项目状态暂不可用，可打开插件查看。"));
else if (!projects.length) projectHost.append(el("p", "doodle-home-empty", "当前没有进行中的项目任务。"));
else for (const project of projects) {
  const row = el("button", "doodle-home-project-row"); row.type = "button"; row.dataset.path = project.path;
  row.append(el("strong", "", project.title), el("small", "", `已完成 ${project.done}/${project.total} 项任务`)); projectHost.append(row);
}
const actions = host.querySelector(".doodle-home-actions");
for (const [label, command] of [
  ["工作量洞察", "project-manager-insights:open-assignee-workload-insights"], ["AI 助手", "realclaudian:open-view"],
  ["今日日记", "daily-notes"], ["新建绘图", "obsidian-excalidraw-plugin:excalidraw-autocreate-newtab"],
  [quickAddReady ? "快速记录" : "配置 QuickAdd", quickAddReady ? "quickadd:runQuickAdd" : "quickadd:openQuickAddSettings"],
  ["打开日历", "calendar:show-calendar-view"]
]) addAction(actions, label, command);
host.querySelector(".doodle-home-hint").textContent = quickAddReady ? "" : "QuickAdd 尚无 Choice，先配置 Capture。";
const metrics = host.querySelector(".doodle-home-metrics");
for (const [value, label, tone] of [[allFiles.length, "笔记", "sun"], [tags, "标签", "cyan"], [changed, "近 7 日更新", ""], [activeProjects ?? "-", "进行中项目", ""]]) {
  const tile = el("div", `doodle-home-metric ${tone}`); tile.append(el("strong", "", value), el("span", "", label)); metrics.append(tile);
}
const recentHost = host.querySelector(".doodle-home-recent-list");
if (!recent.length) recentHost.append(el("p", "doodle-home-empty", "尚无笔记，创建后会在这里出现。"));
else for (const file of recent) {
  const row = el("button", "doodle-home-recent-row"); row.type = "button"; row.dataset.path = file.path;
  row.append(el("span", "", file.basename), el("small", "", new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric" }).format(file.stat.mtime))); recentHost.append(row);
}
const days = host.querySelector(".doodle-home-week-days"), weekState = host.querySelector(".doodle-home-week-state");
function showDay(date) { weekState.textContent = `${date.toFormat("M月d日")}：${dailyFile(date) ? "已有日记，点击日期打开。" : "暂无日记，点击日期查看。"}`; }
for (let index = 0; index < 7; index++) {
  const date = weekStart.plus({ days: index }), file = dailyFile(date);
  const button = el("button", `doodle-home-day${date.toISODate() === todayKey ? " is-today" : ""}${file ? " has-note" : ""}`);
  button.type = "button"; button.dataset.day = date.toISODate(); button.setAttribute("aria-label", `${date.toFormat("M月d日")}，${file ? "已有日记" : "暂无日记"}`);
  button.setAttribute("aria-pressed", String(date.toISODate() === todayKey));
  button.append(el("span", "", ["一", "二", "三", "四", "五", "六", "日"][index]), el("strong", "", date.day), el("i", "")); days.append(button);
}
showDay(today);
host.addEventListener("click", event => {
  const button = event.target.closest("button"); if (!button || !host.contains(button)) return;
  const status = host.querySelector(".doodle-home-status");
  if (button.dataset.filter) { selectedFilter = button.dataset.filter; renderTasks(); }
  else if (button.dataset.path) app.workspace.openLinkText(button.dataset.path, "", false);
  else if (button.dataset.day) {
    const date = dv.date(button.dataset.day); for (const day of days.children) day.setAttribute("aria-pressed", String(day === button)); showDay(date);
    const file = dailyFile(date);
    if (file) app.workspace.openLinkText(file.path, "", false);
    else if (button.dataset.day === todayKey && ready("daily-notes")) app.commands.executeCommandById("daily-notes");
    else status.textContent = "该日期尚无日记，请使用日记插件创建。";
  } else if (button.dataset.command) {
    const id = button.dataset.command;
    if (!ready(id)) { status.textContent = "对应插件未启用，请检查社区插件设置。"; return; }
    app.commands.executeCommandById(id); status.textContent = `${button.textContent.trim()} 已启动。`;
  }
});
```
