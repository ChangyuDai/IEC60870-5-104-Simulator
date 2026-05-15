# Changelog

本项目的所有重要变更记录在此文件。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/),版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

## [1.3.7] - 2026-05-15

### Highlights / 亮点

- 🧹 **两个前端共享代码合并,净删 ~2700 行重复** / Slave & master frontends now share a single source tree, net ~2700 LoC of duplication removed — 新建 `shared-frontend/`,把 AboutDialog/AppDialog/UpdateDialog/LangSwitch/ParseFrameDialog 5 个 Vue 组件、`useDialog` composable、`i18n/{index,detect,types}.ts` 与 ParsedFrame 等帧解析类型集中收口;两个项目通过 vite `@shared`/`@app` alias + tsconfig paths 引用,各自 build/test 仍独立 / Introduced `shared-frontend/` for the 5 byte-identical dialogs, `useDialog`, the i18n core trio and the `ParsedFrame` type family. Both apps reference it via vite/tsconfig `@shared`/`@app` aliases while still building independently.
- 🎨 **Catppuccin Mocha 色板 token 化 + 等宽字体栈跨平台化** / Catppuccin Mocha palette extracted to CSS custom properties, mono font stack widened — `shared-frontend/styles/tokens.css` 统一定义 `--c-crust/mantle/base/surface0..2/overlay0/blue/red/green/...` 与 `--font-mono`(扩展到 Cascadia Code / JetBrains Mono / Menlo / Consolas 跨 macOS/Linux/Windows);22 个 .vue 中所有硬编码 hex 与 `'SF Mono', 'Fira Code', monospace` 字面量批量替换为 `var(...)`,后续主题切换只改 token 文件 / `tokens.css` defines the full Catppuccin variable set plus a cross-platform `--font-mono` (adds Cascadia Code / JetBrains Mono / Menlo / Consolas). 22 .vue files had every literal hex and the `'SF Mono', 'Fira Code', monospace` stack swapped to `var(...)`.
- 🔧 **Toolbar 巨石拆分** / Monolithic Toolbar components broken up — slave Toolbar 653 → 326 行(-50%),抽出 `NewServerModal.vue` + `useMutationTimer` + `useCyclicTransmission` 两个 composable;master Toolbar 819 → 323 行(-60%),抽出 `NewConnectionModal.vue`(含编辑模式 + 协议参数 + localStorage 持久化 + 22 字段)/ Slave Toolbar 653 → 326 lines (−50%) with `NewServerModal.vue` + `useMutationTimer` + `useCyclicTransmission` composables extracted; master Toolbar 819 → 323 lines (−60%) with `NewConnectionModal.vue` carrying the edit mode, protocol params and localStorage persistence.
- 🆕 **工具栏右上角显示版本号 + GitHub 图标** / New version + GitHub badge in the top-right toolbar — `VersionBadge.vue` 显示 `v1.3.7 [github svg]`,点击版本号复制版本字符串,点击图标复制仓库 URL,带 1.5s 短 toast 反馈(`useClipboardFlash` 共享 composable,onUnmounted cleanup 防 setTimeout 泄漏)/ `VersionBadge.vue` renders `v1.3.7 [github svg]` in both toolbars. Clicking either copies the value with a 1.5s flash toast, backed by a shared `useClipboardFlash` composable with onUnmounted cleanup.
- ⌨️ **全局键盘焦点环 + 子站滚动条暗色样式** / Global keyboard focus ring + slave dark scrollbar — 两边 `:focus-visible` 一律显示 2px 蓝色 outline(`* { outline: none }` 不再吞键盘焦点);slave 之前没设 webkit-scrollbar 暗色覆盖,在 macOS "始终显示滚动条" 模式下出白色滚动槽,现与 master 一致 / `:focus-visible` enforced globally so keyboard users always see the focus ring. Slave inherits master's dark webkit-scrollbar override — no more white scrollbar tracks on macOS "Always show scrollbars".

### Added 新增

- **shared-frontend/**: 新目录承载 `components/{AboutDialog,AppDialog,UpdateDialog,LangSwitch,ParseFrameDialog,VersionBadge}.vue`、`composables/{useDialog,useClipboardFlash}.ts`、`i18n/{index,detect,types}.ts`、`types/frame.ts`、`styles/tokens.css`、`vite/aliases.ts` / New directory holding 6 shared Vue components, 2 composables, the i18n core, frame types, design tokens and a vite-alias helper.
- **frontend / NewServerModal.vue, composables/{useMutationTimer,useCyclicTransmission}.ts**: slave 新建服务器表单 + 随机变化定时器 + 循环传送控制各自独立模块 / Slave's new-server form, random-mutation timer and cyclic-transmission toggle each extracted into their own module.
- **master-frontend / NewConnectionModal.vue**: master 新建/编辑连接 Modal(含 22 字段表单 + 协议参数 details + localStorage 持久化 + TLS 子表单),Toolbar 通过 modal ref `defineExpose({ openEditConnection })` 转发给 App.vue 的右键菜单 / Master's new/edit connection modal (22-field form + protocol-params details + localStorage persistence + TLS subform); Toolbar forwards `openEditConnection` via modal ref to App.vue's tree context menu.
- **shared-frontend/vite/aliases.ts**: `buildSharedAliases(import.meta.url)` helper,统一管理两边 vite.config.ts / vitest.config.ts 的 `@app`/`@shared` 别名与 `vue`/`@tauri-apps/api/*` 的 `require.resolve` 解析(让 shared 文件能定位宿主项目的 node_modules)/ Centralised vite alias helper used by both `vite.config.ts` + `vitest.config.ts`, including `require.resolve()` of `vue` and `@tauri-apps/api/*` so shared-frontend files resolve dependencies against the host project's node_modules.

### Changed 改进

- **frontend & master-frontend / vite.config.ts + vitest.config.ts + tsconfig.app.json**: 加 `@app`/`@shared` 路径别名,tsconfig.app.json 加 `"exclude": ["../shared-frontend/vite/**"]` 避免 Node API 脚本被 dom tsconfig 扫到 / Added `@app`/`@shared` aliases to both vite + vitest configs; tsconfig.app.json excludes `../shared-frontend/vite/**` so the Node-API helper isn't compiled with DOM lib.
- **frontend & master-frontend / src/types.ts**: 删除本地重复定义的 `ParsedQuality/ParsedTimestamp/ParsedObject/ParsedAsdu/ParsedApci/ParsedFrame`,改为 `export * from '@shared/types/frame'` / Replaced duplicate frame-parser interface declarations with `export * from '@shared/types/frame'`.
- **frontend & master-frontend / src/main.ts**: 顶部 `import '@shared/styles/tokens.css'`,让 Catppuccin 变量与 `--font-mono` 在 `:root` 注册 / Each main.ts now imports `@shared/styles/tokens.css` to register the Catppuccin custom properties and `--font-mono` at `:root`.
- **22 个 .vue (两个前端 + shared)**: 所有 hex 颜色(`#11111b`/`#1e1e2e`/`#313244`/`#cdd6f4`/`#89b4fa`/`#a6e3a1`/`#f38ba8` 等 20 种)与 `'SF Mono', 'Fira Code', monospace` 字面量机械替换为 `var(--c-*)` / `var(--font-mono)` / Mechanical replacement across 22 .vue files: all 20 Catppuccin hex literals and the `'SF Mono', 'Fira Code', monospace` font stack swapped to `var(--c-*)` / `var(--font-mono)`.
- **master-frontend / NewConnectionModal.openEditConnection**: 用 `{ ...loadForm(), ...connFields }` 替代 18 行字段拼装 / Edit-mode form hydration collapsed from a 21-field literal to `{ ...loadForm(), ...connFields }`.

### Fixed 修复

- **master-frontend / App.vue**: 删 `selectedConnectionState.value = selectedConnectionState.value // preserve` 这行无意义自赋值 / Removed the `selectedConnectionState.value = selectedConnectionState.value` noise.
- **shared-frontend / VersionBadge.vue**: flash toast 的 `setTimeout` 句柄保存,重复点击/卸载时 `clearTimeout` 上一个,onUnmounted cleanup 防内存泄漏 / `setTimeout` handle now retained and cleared on rapid re-click / unmount.
- **master-frontend / NewConnectionModal.loadForm**: 删 `LEGACY_CERTS = new Set([])` 空 set 死代码与 3 行无 op 的 `if has(...)` 检查 / Dropped the dead `LEGACY_CERTS = new Set([])` block and the 3 no-op `if has(...)` checks.

### Internal 内部

- **18 个文件被删除合并**: `frontend/src/components/{AboutDialog,AppDialog,UpdateDialog,LangSwitch,ParseFrameDialog}.vue` × 2(slave + master),`{composables/useDialog.ts, i18n/{index,detect,types}.ts}` × 2,均迁入 `shared-frontend/`;前端净统计 **53 files changed, +636 / -2540**,Toolbar 拆分另增 +480 / -996(NewConnectionModal 加上其原内联代码替换)/ 18 duplicate files deleted across both frontends and moved into `shared-frontend/`. Aggregate diff for the merge phase: 53 files, +636 / −2540; Toolbar split phase: +480 / −996.
- **shared-frontend/composables/useClipboardFlash.ts**: VersionBadge 与 AboutDialog 共用 "写剪贴板 + 1.5s flash" 模式,统一失败处理与 setTimeout cleanup / Shared `useClipboardFlash` consolidates the "write-then-flash" idiom used by VersionBadge and AboutDialog, with unified failure handling and cleanup.

## [1.3.6] - 2026-05-15

### Highlights / 亮点

- 🏷️ **添加点位 / 批量添加对话框的 ASDU 类型下拉每项后置 TypeID 数字** / ASDU type dropdown in the add-point and batch-add modals now shows the IEC 60870-5-101/104 TypeID after each label — 之前下拉里只看到 `单点 (SP)` / `单点带 CP56 时标 (SP_TB)` 这种语义标签,工程师还得自己心算或翻表才知道对应的 typeid 是哪个;现在每行末尾显示 `· 1` `· 30` 等数字,与左侧 ConnectionTree 的 TypeId chip 风格一致 / Previously the dropdown only showed friendly labels like `单点 (SP)` / `Single-point with CP56 time tag (SP_TB)`. Each option now appends `· 1`, `· 30`, etc. — matching the per-row TypeId chips already shown in the left ConnectionTree.

### Added 新增

- **frontend / constants/asduTypes.ts**: `AsduTypeOption` 接口新增 `typeId: number` 字段;16 个 ASDU 类型各自补上对应 typeid(1/30, 3/31, 5/32, 7/33, 9/34, 11/35, 13/36, 15/37),来源与 `crates/iec104sim-core/src/types.rs::AsduTypeId` 一致 / `AsduTypeOption` interface gains a `typeId: number` field; all 16 entries populated to match `types.rs::AsduTypeId`.

### Changed 改进

- **frontend / BatchAddModal.vue 与 DataPointModal.vue**: `<select>` 内的 `<option>` 文本从 `{{ opt.label }}` 改为 `{{ opt.label }} · {{ opt.typeId }}` / The `<option>` text in both modals now renders as `{{ opt.label }} · {{ opt.typeId }}`.

## [1.3.5] - 2026-05-15

### Highlights / 亮点

- 🪟 **子站主布局支持拖拽调整左右栏宽度** / Slave main layout supports drag-to-resize left/right panels — 服务器树和数据点详情两栏之间各加一条 hover 变蓝、按住可拖的细线分隔条;宽度落 `localStorage`,关闭应用再开宽度恢复 / Two thin draggable dividers (turn blue on hover) sit between the server tree, the data point table and the value panel; widths persisted to `localStorage` so they survive a restart. Range: tree 180–480 px, value panel 220–600 px.
- 🏷️ **左侧类别树每行多一个 TypeId chip** / Slave tree gets per-category TypeId chips — 每行 label 右侧多一个 monospace 小 chip,显示该 category 对应的「无时标 · CP56 时标」typeid 对(如 `1 · 30`,`9 · 34`),颜色用 IOA 同色系的 sky blue,省去翻 IEC 60870-5-101 表 / A monospace chip next to each category label shows the IEC 60870-5-101/104 typeid pair "untimed · CP56-timed" (e.g. `1 · 30`, `9 · 34`); saves engineers a lookup against the standard tables.
- 🔧 **数据点表表头列与数据列对齐** / Data-point table header columns align with body cells — 表头与表体是两个独立 `<table>` 元素,body 的 `<td>` 有 `.col-* { width }` 规则但表头 `<th>` 用的 `.th-*` 没 CSS,在默认 `table-layout: auto` 下两个 table 各自按内容算列宽 → `值` `品质` `时间戳` 表头视觉飘到错位。改 th 复用 `.col-*` + 两个 table 都加 `table-layout: fixed` / Header and body lived in two separate `<table>` elements; body cells had `.col-*` width rules but headers used `.th-*` with no CSS, and under default `table-layout: auto` each table sized columns from its own content. Header now reuses `.col-*`, both tables lock to `table-layout: fixed`, `.col-name` absorbs remaining space.
- 📄 **macOS 首次启动指引更新到 Sequoia 行为** / README macOS first-launch guidance updated for Sequoia — 旧文档讲的 "右键 → 打开" 路径自 macOS 15 (Sequoia) 起被 Apple 移除,现弹窗只剩 *完成 / 移到废纸篓* 两个按钮。README 中英文双语重写为 *系统设置 → 隐私与安全性 → 仍要打开* 主路径 + `xattr -dr com.apple.quarantine` 兜底 / The old "right-click → Open" bypass was removed by Apple in macOS 15 (Sequoia); the dialog now offers only *Done* / *Move to Trash*. Both `README.md` and `README_CN.md` rewritten for the *System Settings → Privacy & Security → Open Anyway* path plus the `xattr -dr com.apple.quarantine` fallback.

### Added 新增

- **frontend / App.vue**: 新增 `Splitter.vue` 组件 (无依赖, ~80 行),`axis: 'x' \| 'y'`、`v-model: number`、`min/max`、可选 `reverse`;mousedown 后捕获 document mousemove/up,光标变 col-resize / row-resize,hover 时 1px 分隔线变 2px 亮蓝。主 grid 从 3 列改为 5 列 (`var(--tree-w) 4px 1fr 4px var(--panel-w)`),splitter 占独立 `sp-l / sp-r` track;CSS 变量绑定两个 ref:`treeWidth`(180–480 默认 240)与 `panelWidth`(220–600 默认 280);存到 `iec104.layout.treeWidth` / `iec104.layout.panelWidth` / Added `Splitter.vue` (zero-dep, ~80 lines): `axis`, `v-model`, `min/max`, optional `reverse`. Captures document mousemove on mousedown, swaps cursor to col-resize/row-resize, divider turns blue on hover. Main grid switches from 3 columns to 5 (`var(--tree-w) 4px 1fr 4px var(--panel-w)`); widths flow through CSS vars bound to two refs (`treeWidth` 180–480 default 240, `panelWidth` 220–600 default 280) and persist under `iec104.layout.treeWidth` / `iec104.layout.panelWidth`.
- **frontend / ConnectionTree.vue**: category 节点新增 `node-typeid` chip,数据来自顶层 `CATEGORY_TYPEIDS` map(与 `crates/iec104sim-core/src/types.rs::AsduTypeId::category` 同步),monospace 10px,sky `#74c7ec`,选中行颜色变深以适配蓝底高对比 / Category nodes get a new `node-typeid` chip backed by a top-level `CATEGORY_TYPEIDS` map (kept in sync with `types.rs::AsduTypeId::category`). Monospace 10px, sky `#74c7ec`, dims on selected rows for contrast on the blue selection background.

### Fixed 修复

- **frontend / DataPointTable.vue**: 表头 6 个 `<th>` 类从 `.th-*` (无 CSS) 改为 `.col-*` 复用 body 宽度;`.table` 加 `table-layout: fixed`;`.col-name` 删 `max-width: 120px` 改为吸收剩余空间 / Header `<th>` classes changed from `.th-*` (which had no CSS) to `.col-*`; `.table` locks to `table-layout: fixed`; `.col-name` drops `max-width: 120px` and absorbs remaining space.
- **frontend / ConnectionTree.vue**: 给 `.node-label` 加 `min-width: 0` 让长 label(归一化/标度化)在窄容器下走 ellipsis,而不是把 `node-typeid` chip 挤换行 / Added `min-width: 0` to `.node-label` so long category names (归一化/标度化) ellipsis instead of pushing the `node-typeid` chip onto a second line. `node-typeid` itself gets `white-space: nowrap; flex-shrink: 0`.

### Docs 文档

- **README.md / README_CN.md**: 双语重写 macOS 首次启动章节(标题英文从 *macOS install note* 改为 *First launch on macOS*,中文从 *macOS 安装提示* 改为 *macOS 首次启动*);保留 v1.1.1 及更早旧 dmg "已损坏" 的兜底升级提示 / Both READMEs rewrite the macOS first-launch section. English title moves from *macOS install note* to *First launch on macOS* (matches the GitHub slug `#first-launch-on-macos` referenced by the release-notes template). Legacy "is damaged" guidance for v1.1.1 dmgs kept as a fallback paragraph.
- **docs/superpowers/specs/2026-05-15-macos-gatekeeper-onboarding-design.md** 与 **docs/superpowers/plans/2026-05-15-macos-gatekeeper-onboarding.md**: 落盘对应 spec 与实施计划文件(brainstorm/审计跟踪用)/ Added design spec and implementation plan for the macOS Gatekeeper onboarding doc rewrite (audit trail).

## [1.3.4] - 2026-05-12

### Highlights / 亮点

- 🛠️ **子站 IEC 104 序列号实现修复,严格主站不再在召唤后被踢线** / Slave IEC 104 sequence-number handling fixed; strict masters no longer drop the link after interrogations — 之前子站在回 `激活确认 / 激活终止` 时把主站发来的 APCI bytes 原样回送,自己的 `N(S)/N(R)` 从不前进,等于跟主站说"我是你"。严格主站会判协议违规直接 RST,宽松主站则 t1 超时关链。本版引入 `SeqState` 把每条连接的发/收序号统一收口,在收到 I 帧时 `observe_recv_iframe` 推进 `N(R)`,发 ack/term 用 `build_response_frame` 重写 APCI bytes 2–5 为子站自己的值;原来 read-loop 与 cyclic 任务各持一套计数器导致序号跳变的问题一并修复 / The slave's ack/term frames previously echoed the master's APCI control bytes verbatim and never advanced its own `N(R)` on received I-frames, so strict masters either RST'd (sequence violation) or t1-timed out. v1.3.4 introduces `SeqState` shared across cyclic / read-loop / spontaneous senders, `observe_recv_iframe` advances `N(R)` on every received I-frame, and `build_response_frame` rewrites APCI bytes 2–5 with the slave's own `N(S)/N(R)` for every ack/term — eliminating the previous twin-counter divergence in one stroke.
- 🚦 **主站在收到 STARTDT CON 前不再发 I 帧** / Master now waits for STARTDT CON before transmitting any I-frame — 严格按 IEC 60870-5-104 §5.3,主站发完 STARTDT ACT 必须等对端 STARTDT CON 才能发 GI / 累计量召唤 / 控制等 I 帧;之前主站 TCP 三次握手后立即把 `state=Connected`,周期任务/用户点击的 GI 在 STARTDT CON 还没到时就抢跑,合规子站直接 RST。现新增 `ProtocolState.startdt_acked`,`send_async_frame` 发 I 帧前阻塞等待这个 flag,封顶 t1 后返回明确错误 `STARTDT CON 在 t1 内未收到` / Per IEC 60870-5-104 §5.3 the master must not send I-frames until the slave confirms STARTDT. v1.3.4 adds `ProtocolState.startdt_acked` (flipped on `ctrl1 == 0x0B`) and gates `send_async_frame`'s I-frame path on it, bounded by t1 — preventing the race where periodic / manual GIs raced ahead of STARTDT CON and caused conformant slaves to RST.
- ⚡ **子站 GI / 累计量召唤批量编帧,锁开销降到 1 次** / Slave GI / CI responses now build under a single mutex acquisition — 默认站 160 数据点 × 3 CA 的总召之前会做 ~960 次 `seq.lock().await` + 等量 `queue.lock().await`,本版改为整批在单次 `seq` 锁内构造,单次 `queue.lock().extend_from_slice(&batch)` 写入;TLS 阻塞路径上 `send_gi_response_blocking` 与 type 101 块同样合并为单 `block_on` + 单 `write_all` / The previous GI loop took two mutex hops per data point (~960 awaits for a default 160-point × 3-CA call); v1.3.4 builds the full ack + GI frames + term batch under one `seq.lock().await` and writes the queue in one go. TLS path's `send_gi_response_blocking` and the type-101 block similarly collapse to a single `block_on` + single `write_all`.

### Fixed 修复

- **iec104sim-core / slave**: `handle_client_read_loop` 与 `handle_client_blocking` 现在共用 `ConnectionWrite.seq: Arc<Mutex<SeqState>>` (替换原裸字段 `ssn: u16, rsn: u16`),cyclic 任务、`queue_spontaneous`、读循环都走同一份序号 — 三套计数器分裂导致主站看见 `N(S)` 跳变的问题归零 / Slave's async read loop and TLS blocking handler now share `ConnectionWrite.seq: Arc<Mutex<SeqState>>` (replacing the bare `ssn: u16, rsn: u16` fields). Cyclic task, `queue_spontaneous`, and the read loops all advance the same counter — no more `N(S)` jumps that conformant masters reject.
- **iec104sim-core / slave**: 所有 `let mut ack = data[..n].to_vec(); ack[8] = 7;` / `term[8] = 10` 模式替换为新 helper `build_response_frame(recv, cot, &mut SeqState)`,重写 APCI bytes 2–5 后再 `ssn += 2` — 之前 ack/term 实际携带的是主站的 `N(S)/N(R)`,等同协议违规 / Replaced every inline `ack[8] = 7` / `term[8] = 10` pattern with a new `build_response_frame(recv, cot, &mut SeqState)` helper that rewrites APCI bytes 2–5 to the slave's `N(S)/N(R)` and increments `ssn`. Previously those frames carried the master's own sequence numbers — a protocol violation.
- **iec104sim-core / slave**: 收到 master I 帧时新增 `observe_recv_iframe(seq, frame)` 把本地 `rsn` 推进为 `peer_N(S) + 1`;此前 `rsn` 永远停留在 0,严格主站等不到 ACK → t1 超时关链 / Added `observe_recv_iframe(seq, frame)` to advance the slave's `rsn` to `peer_N(S) + 1` on every received I-frame. Previously `rsn` stayed at 0, leaving the master's I-frames unacknowledged and causing strict masters to t1-drop the link.
- **iec104sim-core / master**: `process_received_frame` 收到 STARTDT CON (`ctrl1 == 0x0B`) 时翻 `protocol.startdt_acked = true` 并复用 `ack_notify` 唤醒等待方;`send_async_frame` 在 I 帧路径头部新增等待循环,超 t1 返回 `MasterError::SendError("…: STARTDT CON 在 t1 内未收到")` / `process_received_frame` flips `protocol.startdt_acked` on `ctrl1 == 0x0B` and reuses `ack_notify` to wake senders; `send_async_frame` gates the I-frame path on that flag, bounded by t1 (returns `MasterError::SendError("…: STARTDT CON 在 t1 内未收到")` on timeout).

### Changed 改进

- **iec104sim-core / slave**: `build_i_frame` 与 `encode_point_frame` 签名由 `&mut u16, &mut u16` 改为 `&mut SeqState`;解决了 `MutexGuard` 上对 `s.ssn` / `s.rsn` 同时 `&mut` 借用编译失败的问题,同时砍掉调用点参数数量 / `build_i_frame` and `encode_point_frame` now take `&mut SeqState` (replacing the separate `&mut u16, &mut u16` pair). This sidesteps the disjoint-borrow failure through `MutexGuard` and trims call-site arity.
- **iec104sim-core / slave**: GI (type 100) / 累计量召唤 (type 101) 响应在异步与 TLS 阻塞两条路径上都改为单锁批量构造、单次入队;TLS 路径合并 `rt.block_on` 调用 / GI (type 100) / CI (type 101) responses on both async and TLS-blocking paths now build the full ack-frames-term batch under one `seq` lock and write the queue / TLS socket once. TLS path collapses multiple `rt.block_on` calls into one.
- **iec104sim-core / slave**: `send_gi_response_blocking` 改为 async,接收 `&SharedSeq` 并使用连接共享序号(此前每次重置 0,会让主站看到 `N(S)` 倒退) / `send_gi_response_blocking` is now async, receives `&SharedSeq`, and uses the connection's shared sequence (previously it reset `ssn` to 0 on every call, making the master see `N(S)` jump backwards).

### Tests 测试

- **iec104sim-core**: `tests/protocol_state_machine.rs` 两个用例的伪从站补发一次 STARTDT CON (`68 04 0B 00 00 00`) 以适配主站新的 I 帧等待逻辑;3 个用例全绿,workspace 测试套(协议状态机 / 累计量召唤 / TLS e2e / TLS 版本协商 / TLS 发送延迟)共 18 项 ok / Updated two fake slaves in `tests/protocol_state_machine.rs` to send STARTDT CON (`68 04 0B 00 00 00`) so the master can leave its new I-frame wait gate. All 3 cases green; full workspace suite (state machine, counter interrogation, TLS e2e, TLS version negotiation, TLS send latency) 18 ok.

### Internal 内部

- **iec104sim-core / slave**: 重构主体在单文件内完成,`SeqState` + 两个 helper (`observe_recv_iframe`, `build_response_frame`) 替换原先分散在 read loop / TLS handler / `send_gi_response_blocking` 的局部 `ssn / rsn` 副本(共 4 处) — 单一序号源 / Refactor confined to `crates/iec104sim-core/src/slave.rs`. `SeqState` plus two helpers (`observe_recv_iframe`, `build_response_frame`) replace four separate local `ssn / rsn` copies previously scattered across the async read loop, TLS handler, and `send_gi_response_blocking` — single source of truth for per-connection sequence numbers.

## [1.3.3] - 2026-05-11

### Highlights / 亮点

- 🔓 **主站连接 TLS 子站时无条件关闭 hostname 校验** / Master always disables TLS hostname verification when connecting — 真实工程现场的服务端证书 CN 普遍是设备序列号 (例如 `om_1825849177586352128`), SAN 也常缺失或不含主站填的 IP/DNS。此前主站必须勾 `accept_invalid_certs` 才能连上 (因为它同时关掉 hostname 校验), 但这把整条 CA 链信任都一起关了。本次拆分: hostname 校验默认就关 (CN/SAN 几乎从不匹配现场连接信息), 证书签名链信任仍按 `accept_invalid_certs` 控制 — 用自签 CA 时可以让 hostname 不严格但 CA 链严格 / Server certs issued in the field commonly use a device serial as CN (e.g. `om_1825849177586352128`) and either omit SAN or list values that don't match the IP/DNS the master is dialing. Previously the only way to connect was to tick `accept_invalid_certs`, but that also disabled CA-chain trust. v1.3.3 splits the two: hostname checking is now always off, while CA-chain trust is still gated by `accept_invalid_certs` — so a self-signed CA setup can keep strict chain validation without manually adding every device serial to SAN.

### Changed 改进

- **主站 TLS 装载**: `MasterConnection::ensure_writer_setup_async` 把 `builder.danger_accept_invalid_hostnames(true)` 从 `if self.config.tls.accept_invalid_certs` 分支里抽到外面、无条件设置;`accept_invalid_certs` 现在只控制 `danger_accept_invalid_certs` 一项 (CA 链 / 过期 / validity period) / `MasterConnection::ensure_writer_setup_async` hoists `danger_accept_invalid_hostnames(true)` out of the `accept_invalid_certs` branch so it always applies; `accept_invalid_certs` now only toggles `danger_accept_invalid_certs` (CA chain / expiry / Apple validity-period policy).

### Internal 内部

- **CI / Release**: workflow 的 portable-exe 上传 step 改用 `if: always() && matrix.platform == 'windows-latest'`, tauri-action 偶发 GitHub API race (`Not Found - delete-a-release-asset`) 不再让便携 EXE 被跳过;同时加防呆: cargo 产物若不存在 → 输出 `::warning::` 并 exit 0, 避免遮蔽真正 build 失败 / Release workflow's portable-exe step now uses `if: always() && matrix.platform == 'windows-latest'`, so the occasional `tauri-action` race (`Not Found - delete-a-release-asset`) no longer takes the portable EXE down with it. Defensive: if the cargo binary is missing → emit `::warning::` and exit 0 so genuine compile failures still surface.

## [1.3.2] - 2026-05-11

### Highlights / 亮点

- 🪟 **GitHub Release 现在覆盖 Windows ARM64** / GitHub Release now ships Windows ARM64 — Surface Pro X / Snapdragon X / Win11-ARM 用户可以下载 `_arm64-setup.exe` (NSIS) / `_arm64_en-US.msi` / `_arm64-portable.exe` 三种格式;Tauri updater 自动覆盖 `windows-aarch64` 平台,后续 ARM 设备能跟主线一起收到自动更新 / Surface Pro X / Snapdragon X / Win11-ARM users can now download `_arm64-setup.exe` (NSIS), `_arm64_en-US.msi`, and `_arm64-portable.exe`. The Tauri updater manifest now includes `windows-aarch64`, so ARM devices receive auto-updates alongside the main channel.
- 🛠️ **修复 v1.3.1 Windows job 失败 / 便携版没传上去** / Fixed v1.3.1 Windows build failure that blocked the portable EXE — 上传 step 之前写的源路径 `target/release/IEC104Slave.exe` 实际上不存在 (那是 Tauri productName, 只出现在 `bundle/nsis/` 里), cargo 真正产物名是 crate name `iec104sim-app.exe` / `iec104master-app.exe`。修正后 v1.3.2 Release 资产里会齐齐看到便携 EXE / The step wrote `target/release/IEC104Slave.exe` as source, but that path doesn't exist — `IEC104Slave.exe` is the Tauri productName and only appears inside `bundle/nsis/` installer filenames. Cargo's actual binary follows the crate name (`iec104sim-app.exe` / `iec104master-app.exe`). Fixed source paths; v1.3.2 release ships portable EXE assets.
- 🔧 **主站 "右键 → 编辑连接" 终于真的能开对话框** / Right-click "Edit connection" actually opens the dialog now — Toolbar 与 ConnectionTree 是 App.vue 的兄弟, Vue 的 `provide` 只能向后代注入, 兄弟之间无效, 之前点了等于什么都没发生。改由 App 持有 Toolbar ref + provide 转发 closure, ConnectionTree.inject 现在能拿到真值 / `Toolbar` and `ConnectionTree` are siblings; Vue `provide` only flows to descendants, so the previous setup silently swallowed the call. Now `App.vue` holds a `toolbarRef` and provides a forwarding closure that `ConnectionTree.inject('openEditConnection')` resolves correctly.

### Added 新增

- **CI / Release**: `.github/workflows/release.yml` 的 `build-slave` / `build-master` matrix 中 windows-latest 由 1 个扩成 2 个 (x64 + `aarch64-pc-windows-msvc`), 通过新 matrix key `win_arch` (x64 / arm64) 区分上传文件名,`rust_target` 区分产物路径 / Windows job in both `build-slave` and `build-master` matrices expands to `x64` + `aarch64-pc-windows-msvc`; a new `win_arch` matrix key distinguishes the uploaded portable-exe filename, `rust_target` controls the cargo target directory.
- **CI / Release**: `scripts/gen-update-manifest.mjs` 新增 `windows-aarch64` 平台模式 (匹配 `_arm64-setup.exe`), Tauri updater 现在为 Win11-ARM / Surface Pro X / Snapdragon 设备生成正确的下载条目 / `gen-update-manifest.mjs` recognises `_arm64-setup.exe` as `windows-aarch64`, so the Tauri updater serves Win11 ARM (Surface Pro X, Snapdragon X) the correct asset.
- **CI / Release**: `scripts/build-release-notes.mjs` PLATFORMS 数组追加三行 Windows ARM64 (NSIS / MSI / Portable), Release 描述下载表镜像 x64 三行结构 / Three Windows ARM64 rows (NSIS / MSI / Portable) added to the per-OS download table.
- **CI / Release tests**: `scripts/{build-release-notes,gen-update-manifest}.test.mjs` 各加 ARM64 断言 (NSIS 命名 / Portable 命名 / windows-aarch64 分组), 11 项全绿 / Added ARM64 assertions to both vitest suites (NSIS naming, portable naming, `windows-aarch64` grouping); 11 cases green.

### Fixed 修复

- **CI / Release**: v1.3.1 Windows 上传便携 exe step 失败 (源路径写成 productName, 实际应是 cargo crate name) / Portable-exe upload step in v1.3.1 Windows job referenced productName path instead of crate-name path; fixed (`iec104sim-app.exe` / `iec104master-app.exe`).
- **主站前端**: 主站 ConnectionTree 右键 "编辑连接" 之前 inject 拿不到 closure (Toolbar provide → ConnectionTree inject 跨兄弟无效), 点了无响应。改由 App.vue 持有 Toolbar ref + provide 转发 / Master `ConnectionTree`'s right-click "Edit connection" used to silently do nothing because the provider lived on a sibling component. Now wired through `App.vue` via a forwarding provide.

## [1.3.1] - 2026-05-11

### Highlights / 亮点

- 🔑 **TLS 私钥自动兼容 PKCS#1 (BEGIN RSA PRIVATE KEY)** / TLS now auto-accepts PKCS#1 keys — 真实工程现场签出来的客户端密钥常常是 `-----BEGIN RSA PRIVATE KEY-----` (PKCS#1) 格式,而 `native-tls` 的 `from_pkcs8` 严格只吃 PKCS#8。之前用户必须先 `openssl pkcs8 -topk8 -nocrypt` 转一遍才能用,踩坑率极高;现在主站和子站都新增 `tls_key::load_key_as_pkcs8_pem` helper,识别到 PKCS#1 自动在内存里转换为 PKCS#8 再交给 native-tls,PKCS#8 原样透传,加密私钥/EC SEC1 给出明确错误提示 / Field-issued client keys frequently arrive in PKCS#1 (`-----BEGIN RSA PRIVATE KEY-----`), but `native-tls::Identity::from_pkcs8` accepts only PKCS#8 — forcing users to run `openssl pkcs8 -topk8 -nocrypt` before connecting. Both master and slave now route the key through a new `tls_key::load_key_as_pkcs8_pem` helper that converts PKCS#1 → PKCS#8 in memory, passes PKCS#8 through untouched, and emits clear errors for encrypted or SEC1 EC keys.
- 📦 **GitHub Release 新增 Windows 便携版(裸 EXE)** / GitHub Release now ships a Windows portable EXE — 不想/不能安装到系统的用户可以直接下载 `IEC104Slave_1.3.1_x64-portable.exe` 与 `IEC104Master_1.3.1_x64-portable.exe`,双击即用(仅依赖系统自带的 WebView2 Runtime,Win10 22H2+ / Win11 自带)。NSIS / MSI 安装版与自动更新通道照旧 / Users who cannot or do not want to install can grab `IEC104Slave_1.3.1_x64-portable.exe` / `IEC104Master_1.3.1_x64-portable.exe` from the release page and run them directly (WebView2 Runtime required, bundled with Win10 22H2+ / Win11). NSIS / MSI installers and the auto-update channel are unaffected.
- 🧪 **新增 4 项 tls_key 单元测试** / 4 new `tls_key` unit tests — 覆盖 PKCS#1 → PKCS#8 真实转换链路(可被 PKCS#8 解码器再解析回来)、PKCS#8 原样透传、文件不存在错误包含路径、未知 PEM 格式被拒绝 / Cover the real PKCS#1 → PKCS#8 conversion (verified by parsing the output back), PKCS#8 pass-through, missing-file error including the path, and rejection of unknown PEM blocks.

### Added 新增

- **iec104sim-core**: 新增 `tls_key` 模块(crate-private),导出 `load_key_as_pkcs8_pem(path) -> Result<Vec<u8>, String>`,统一规范化私钥为 PKCS#8 PEM 字节供 `native_tls::Identity::from_pkcs8` 使用;依赖新增 `rsa = { version = "0.9", default-features = false, features = ["std", "pem"] }` / New crate-private `tls_key` module normalises any client/server key file to PKCS#8 PEM bytes via `load_key_as_pkcs8_pem`. New dependency: `rsa = "0.9"` with `std` + `pem` features.
- **iec104sim-core**: `tls_key::tests` 共 4 个单元测试,使用 `tempfile` + `rand::rngs::OsRng` 生成真实 RSA 2048 密钥进行往返验证 / 4 new unit tests in `tls_key::tests` using `tempfile` + `OsRng` to generate real RSA-2048 keys for round-trip assertions.
- **CI / Release**: `.github/workflows/release.yml` 在 `build-slave` 与 `build-master` 的 Windows job 中各加一步,把 `target/release/<productName>.exe` 复制为 `<productName>_<version>_x64-portable.exe` 并通过 `gh release upload --clobber` 追加到当次 Release / Release workflow now appends a Windows portable EXE asset per app via `gh release upload --clobber` in both `build-slave` and `build-master` Windows jobs.
- **CI / Release**: `scripts/build-release-notes.mjs` `PLATFORMS` 数组追加 `Windows x64 (Portable)` 行,Release 描述的下载表自动展示便携版资产 / Added `Windows x64 (Portable)` row to the per-OS download table rendered into the release body.

### Changed 改进

- **iec104sim-core**: `MasterConnection::ensure_writer_setup_async` 与 `SlaveServer::accept_loop` 的 TLS 身份装载路径改走 `tls_key::load_key_as_pkcs8_pem(&cfg.key_file)?`,错误类型分别映射为 `MasterError::TlsError` / `SlaveError::TlsError`,行为对调用方完全向后兼容 / Master and slave TLS identity loading both route through the new helper; error mapping kept inside the existing `*::TlsError` channels — fully backward compatible to callers.

### Fixed 修复

- **主站前端**: `master-frontend/src/components/Toolbar.vue` 中默认证书路径与 `LEGACY_CERTS` 迁移列表里残留的开发者本机绝对路径已清理,新建连接对话框的 `ca_file/cert_file/key_file` 默认值回归到稳定的 `./ca.pem` / `./client.pem` / `./client-key.pem`,迁移钩子保留为空集以便未来切换默认路径时单行加入 / Removed stray developer-local absolute paths from the new-connection dialog defaults and from the `LEGACY_CERTS` migration list. Defaults are back to the stable `./ca.pem` / `./client.pem` / `./client-key.pem`; the migration hook stays in place with an empty set so future default switches can be wired in with a single line.

### Tests 测试

- **iec104sim-core**: `cargo test -p iec104sim-core --lib` 通过 `tls_key::tests` 全部 4 项,workspace 测试全绿 / `cargo test -p iec104sim-core --lib` runs the 4 new `tls_key::tests` plus the existing suite green.

## [1.3.0] - 2026-04-30

### Highlights / 亮点

- 🔬 **新增"报文解析器"工具,主子站双端可用** / Brand-new frame parser tool on both master and slave — 顶栏新增"报文解析"按钮,粘贴一段 hex APDU 即刻得到 APCI / ASDU / IOA 三段式可视化(帧类型 + 序列号 + ASDU 类型/COT/CA + 每个 IOA 的值/品质/CP56Time2a 时间戳/原始字节)。覆盖 25 种 ASDU(M_SP/DP/ST/BO/ME_NA/NB/NC/IT 监视方向,带或不带时标 + C_SC/DC/RC/SE_NA/NB/NC 控制 + C_IC/CI/CS 系统命令)。通信日志条目右键即可"解析此报文",自动用该条 raw_bytes 填充 / Top-bar "Parse Frame" button opens a dialog where you paste any IEC 104 APDU as hex and immediately get a three-section visual breakdown — APCI header, ASDU header, and per-IOA value/quality/CP56Time2a/raw bytes. Covers 25 ASDU types across monitor and control directions plus system commands. Right-click any log row to parse its raw bytes in one click.
- ⚡ **日志面板未展开时,master 收发热路径不再构造日志字符串** / Master no longer pays for log strings when the log panel is collapsed — `LogCollector` 新增 enabled flag,关闭时所有 `format!()` 整段被 `active_lc()` helper 短路。在大流量场景(高频突发上送 + 周期总召唤)下,后端 CPU 占用与堆分配明显下降 / `LogCollector` gains an `enabled` flag; when off, every `format!()` site is short-circuited by an `active_lc()` helper. Heap allocations and CPU usage drop visibly under heavy I-frame traffic.
- 🛠️ **修复 master 接收循环 4 处编译错误,解锁 v1.2.x 后续构建** / Fixed 4 build errors in master receive loop — `active_lc(log_collector)` 在两条接收循环的 disconnect / error 分支上误传值而非引用,导致 `cargo build -p iec104sim-core` 直接失败。本次补回 `&`,workspace 与 65 个测试全绿 / 4 spots called `active_lc(log_collector)` instead of `active_lc(&log_collector)` in disconnect/error paths, breaking `cargo build` on the whole workspace. Now fixed and `cargo test --workspace` is green (65 tests pass).
- 🧪 **新增 10 项 decode 单元测试** / 10 new decode unit tests — 覆盖 U/S/I 帧、SQ=1 多点序列、CP56Time2a 时标、控制命令响应、起始字节错、未知 ASDU 类型(进 warnings 而非 panic)、APDU 长度不一致 / U/S/I frames, SQ=1 multi-point sequences, CP56Time2a timestamps, control responses, invalid start bytes, unknown ASDU types (surfaced as warnings, not panics), and APDU length mismatches.

### Added 新增

- **iec104sim-core**: 新增 `decode` 模块,导出 `ParsedFrame` / `ParsedApci` / `ParsedAsdu` / `ParsedObject` / `Cp56Time2a` 与 `parse_frame_full(&[u8]) -> Result<ParsedFrame, String>`。结构全部 serde 友好,Tauri 直接序列化到前端 / New `decode` module exposes `ParsedFrame` / `ParsedApci` / `ParsedAsdu` / `ParsedObject` / `Cp56Time2a` plus `parse_frame_full(&[u8]) -> Result<ParsedFrame, String>`. All structs are serde-ready for Tauri.
- **主站后端**: 新增 `parse_hex` 与 `parse_frame_full` Tauri 命令(主站此前完全没有任何报文解析能力) / `parse_hex` and `parse_frame_full` commands added to the master backend (which had no parsing commands at all before).
- **子站后端**: 在保留 `parse_apci` 字符串摘要命令的基础上新增 `parse_frame_full`,返回结构化 `ParsedFrame` / Slave keeps the existing `parse_apci` summary command and adds `parse_frame_full` for the structured payload.
- **主站前端**: 新增 `ParseFrameDialog.vue`(Catppuccin 暗色主题、Teleport、APCI/ASDU/IOA 三段卡片、内置 6 个常用模板、警告聚合、Ctrl+Enter 解析快捷键);Toolbar 工具组末尾"报文解析"按钮;`App.vue` 通过 `provide('openParseFrame')` 共享开启函数 / New `ParseFrameDialog.vue` (Catppuccin dark, Teleport, three-section cards, six built-in templates, warning aggregation, Ctrl+Enter shortcut). New "Parse Frame" toolbar button. `App.vue` shares an `openParseFrame(prefill?)` function via `provide`.
- **主站前端**: `LogPanel.vue` 行级 `@contextmenu` 右键触发"解析此报文",自动以该条 `raw_bytes` 调用 `openParseFrame()`(空 raw_bytes 行不响应) / Right-click on any log row with raw bytes to open the parser pre-filled with that frame.
- **子站前端**: 镜像主站做法,组件命名一致;`Toolbar.vue`、`LogPanel.vue`、`App.vue`、`types.ts`、`i18n/locales/{zh-CN,en-US}.ts` 同步更新 / Slave mirrors the master integration; component names kept identical for cross-app maintenance.
- **i18n**: 主子站新增 `toolbar.parseFrame` 与 `toolbar.parseFrameInLog` 两条 key(中英) / Added `toolbar.parseFrame` and `toolbar.parseFrameInLog` to both apps in zh-CN and en-US.

### Changed 改进

- **iec104sim-core**: `LogCollector` 增加 `enabled: Arc<AtomicBool>` 字段,公开 `is_enabled()` / `set_enabled()`;`master.rs` 引入 `#[inline] fn active_lc(...)` helper,把所有 `if let Some(ref lc) = self.log_collector` 模式替换成 `if let Some(lc) = active_lc(&self.log_collector)`,关闭日志时整段 `format!()` 被跳过 / `LogCollector` gains an `enabled: Arc<AtomicBool>` plus `is_enabled()` / `set_enabled()`; `master.rs` introduces an `#[inline] active_lc(...)` helper that replaces every `if let Some(ref lc) = self.log_collector` site, so disabled-log paths skip the `format!()` cost entirely.
- **iec104sim-app**: `check_for_update` Tauri 命令新增 `force: Option<bool>` 参数;`force=true` 绕过 6h 节流和 24h snooze,启动自动检查仍走原节流逻辑(配合 v1.2.0 工具栏"检查更新"按钮的实装) / `check_for_update` gains an optional `force: bool`; when true it bypasses both the 6 h throttle and the 24 h snooze (pairing with the v1.2.0 toolbar button).
- **主站前端**: `types.ts` 抽出 `ChangedCategoriesMap` 与 `CategoryCountsMap` 类型别名,`App.vue` / `ConnectionTree.vue` / `DataTable.vue` 共用,消除三处嵌套泛型重复 / Pulled `ChangedCategoriesMap` and `CategoryCountsMap` aliases out so `App.vue`, `ConnectionTree.vue`, and `DataTable.vue` stop duplicating the nested generic.

### Fixed 修复

- **主站后端**: `process_received_frame` 与两条接收循环 disconnect/error 分支共 4 处调用 `active_lc(log_collector)` 误传值而不是引用,导致 `cargo build -p iec104sim-core` 直接编译失败。已修为 `active_lc(&log_collector)`,workspace 重新可构建 / 4 sites in `process_received_frame` and the two receive loops were calling `active_lc(log_collector)` (passing by value into a `&Option<...>` parameter), breaking `cargo build` on the whole workspace. Fixed by passing `&log_collector`.

### Tests 测试

- **iec104sim-core**: 新增 `decode::tests` 共 10 个单元测试。`cargo test -p iec104sim-core --lib` 65 通过 0 失败 / 10 new unit tests in `decode::tests`. `cargo test -p iec104sim-core --lib` runs 65 tests, all green.

## [1.2.1] - 2026-04-29

### Highlights / 亮点

- 🧰 **子站完整开箱体验大整顿** / Slave UX overhaul — 新建服务器对话框现在直接暴露"每类点数"输入,默认 10 即开即用;站点初始化默认覆盖全部 16 个监视方向 ASDU 类型(NA + 带时标 TB/TD/TE/TF 全套),不同类型可以挂在同一段 IOA 1..N 上,这才是 IEC 104 真实工程现场的样子 / The new-server dialog now exposes a "points per category" input (default 10), and the default station seeds all 16 monitor-direction ASDU types — both untimestamped (NA) and timestamped (TB/TD/TE/TF) variants share the same IOA range 1..N, mirroring how a real RTU lays out a single physical point with multiple report formats.
- 🚦 **启动/停止按钮终于不"撒谎"了** / Toolbar buttons no longer lie about server state — 之前从工具栏点"启动",右键菜单点"停止",或者后端因错误自动停服时,工具栏 disabled 状态会和真实状态脱节(看起来还能再启动一次)。现在前端订阅了后端的 `server-state-changed` 事件,所有渠道触发的状态变化都会立即同步 / Front-end now subscribes to the backend's `server-state-changed` event, so the toolbar's enable/disable state stays in lockstep with whatever happened — toolbar click, tree right-click, or auto-stop on error.
- ⚡ **写值不再卡顿,日志不再"频闪"** / No more write-value lag, no more flickering log — 在 32 万级数据点的极端站点下,改一个值后立即触发的全量轮询(`list_data_points`)会让 UI 卡几百毫秒;通信日志每 2 秒整体替换 ref 也让 deep-reactive 重建几千个 LogEntry。两条都修了:写值采用乐观更新,日志改 `shallowRef` + 倒序 + 增量检测 / Write-value used to fire an immediate full-list refresh, blocking the UI for hundreds of ms when the station held 320k+ points. Now the panel updates optimistically and lets the 2 s poll catch up. The communication log moved to `shallowRef` with a reverse-order computed view and a tail-timestamp diff so polling no longer rebuilds thousands of `LogEntry` proxies on each tick.
- 🔍 **写值终于写到正确的点了** / Write hits the right point now — 同 IOA 上挂着多种 ASDU 类型(NA + TB)后,旧版本 ValuePanel 用 `find(p => p.ioa === ...)` 找点,可能命中位串而你想写浮点 → 报"unsupported value type"。现在选中行的 `asdu_type` 跟着上行,写值精准锁定 / `selectedPoints` now carries `asdu_type` end-to-end, so picking a row labelled `M_ME_NC_1` will not accidentally route the write to the bitstring at the same IOA.
- 🎨 **子站标题瘦身、ASDU 选项补齐** / Slimmer title, fuller dropdowns — 子站窗口标题从冗长的 "IEC104Slave - IEC 60870-5-104 Simulator" 收缩到一句话 "IEC104Slave";批量/单点添加对话框的 ASDU 类型从 8 个补全到 16 个(8 个不带时标 + 8 个带时标),后端 `parse_asdu_type` 同步接受三种命名风格(`MMeNa1` / `m_me_na_1` / `M_ME_NA_1`),不再因输入大小写不一致就报 "unknown ASDU type" / Slave window title is just "IEC104Slave"; both add-point dialogs now list all 16 monitor-direction ASDU variants; backend `parse_asdu_type` accepts PascalCase, snake_case, and the upper-snake display name interchangeably.
- 📡 **突发上送终于会写日志了** / Spontaneous tx now shows up in the log — 子站手动改值或随机变化触发的 COT=3 帧之前默默发到 socket 上,通信日志里看不到。现在每次入队都会记一行 `tx I 突发上送 (COT=3) IOA={} CA={} → N 个客户端`,排查"是不是真的发出去了"再也不用 Wireshark / Manually tweaking a value (or random mutation) used to silently push COT=3 frames to the socket — invisible in the in-app log. Every batch now logs `tx I Spontaneous (COT=3) IOA={} CA={} → N clients`.

### Added 新增

- **子站后端**: `Station::with_default_points` 改为 16 个 ASDU 类型共享 IOA `1..=N`;`(IOA, AsduTypeId)` 组合在 HashMap 里一直支持共存,这次让默认初始化也用上了 / `Station::with_default_points` rewritten to seed 16 ASDU types sharing IOA `1..=N`; `(IOA, AsduTypeId)` coexistence was already supported by the HashMap key — this finally exercises it.
- **子站后端**: `CreateServerRequest` 新增 `count_per_category: Option<u32>` 字段,`create_server` 据此构造默认 station(缺省 10);旧请求向后兼容 / `CreateServerRequest` gains `count_per_category: Option<u32>` (default 10); old requests stay compatible.
- **子站后端**: `data_point.rs` 新增 `preferred_na_for(category)` helper,让 `get_by_category` / `get_mut_by_category` 在同 IOA 多类型时优先返回 NA 变体,控制命令的写入目标稳定 / New `preferred_na_for(category)` helper makes the by-category lookups deterministic — they prefer the NA variant so control commands always write the untimestamped twin.
- **子站后端**: `queue_spontaneous` 现在写 `LogEntry`,Direction=Tx,detail 含 IOA + ASDU 类型 + 客户端数 / `queue_spontaneous` now writes a `LogEntry` with the IOA, ASDU type, and per-client fan-out count.
- **子站前端**: 新建服务器对话框新增"每类点数 / Points per category"数字输入,clamp `[0, 65534]` / "Points per category" number input added to the new-server dialog, clamped to `[0, 65534]`.
- **子站前端**: `BatchAddModal` / `DataPointModal` 加入 8 个带时标 ASDU 类型选项(M_SP_TB_1, M_DP_TB_1, M_ST_TB_1, M_BO_TB_1, M_ME_TD_1, M_ME_TE_1, M_ME_TF_1, M_IT_TB_1),i18n 同步加 zh/en 描述 / Both add-point modals expose all 8 timestamped variants alongside the existing 8 untimestamped types; zh/en labels added.
- **子站前端**: 新增 `frontend/src/constants/asduTypes.ts` 共享 16 项清单,两个 modal 共用,改清单一处生效 / New `frontend/src/constants/asduTypes.ts` holds the canonical 16-entry list; both modals consume it.
- **子站前端**: `App.vue` `onMounted` 订阅 `server-state-changed`,`onUnmounted` 清理 listener / Front-end subscribes to `server-state-changed` and tears down the listener on unmount.

### Changed 改进

- **子站前端**: `LogPanel.vue` `logs` 从 `ref<LogEntry[]>` 改 `shallowRef`;新增 `displayLogs = computed(() => logs.slice().reverse())` 让最新条在顶;`loadLogs` 比对 `length` + 末条 `timestamp`,无变化不替换,polling 静默时不重渲染 / `LogPanel.vue` swaps to `shallowRef` + reverse-order computed view; `loadLogs` skips the swap when both length and tail timestamp are unchanged.
- **子站前端**: `DataPointTable.vue` 选行 emit 携带 `asdu_type`;`emitSelection` payload 从 `{ioa, value}` 升级到 `{ioa, asdu_type, value}`;`App.vue` 与 `ValuePanel.vue` 类型同步 / `DataPointTable.vue` now emits `{ioa, asdu_type, value}` so downstream consumers can disambiguate same-IOA-different-type rows.
- **子站前端**: `ValuePanel.vue` 写值后改为乐观更新当前 `pointDetail`,不再调 `refreshData()` 触发全量轮询;查找点也用 `(ioa, asdu_type)` 双键定位 / `ValuePanel.vue` writes optimistically and no longer triggers a full re-poll; lookup uses the `(ioa, asdu_type)` composite key.
- **子站前端**: 多选 chip `:key` 从 `p.ioa` 改 `${p.ioa}-${p.asdu_type}`,避免同 IOA 多 ASDU 类型 key 冲突 / Multi-select chip `:key` upgraded to a composite to handle same-IOA-multi-type selections.
- **子站后端**: `parse_asdu_type` 用 `chars().filter(is_alphanumeric).flat_map(to_lowercase)` 归一化输入,16 类型在小写无分隔符的查找表里匹配,接受 `MSpNa1` / `m_sp_na_1` / `M_SP_NA_1` 三种来源 / `parse_asdu_type` normalises input by stripping non-alphanumerics and lowercasing, then looks up against a 16-entry table — accepts PascalCase, snake_case, and upper-snake display names.
- **子站窗口**: `tauri.conf.json` 标题字符串简化为 `"IEC104Slave"` / `tauri.conf.json` window title slimmed to `"IEC104Slave"`.
- **测试**: `slave::tests::test_station_with_default_points` 断言更新为 16 类型 × N IOA = 16N 条点;`control_e2e` 中假设 IOA=3 是首个 DP 的 case 改用 IOA=1(全类共享段后所有类型都从 IOA 1 起) / `test_station_with_default_points` asserts 16N points; `control_e2e` cases updated to use IOA=1 (every type starts from IOA 1 under the shared-range model).

### Fixed 修复

- **子站**: 同 IOA 上 NA + TB 共存时,旧 `get_by_category` 用 `HashMap::values().find()` 顺序不确定,可能把 control 命令写到带时标点上,而读取时去拿不带时标点 → 状态错位。新代码优先返回 NA,写读一致 / Same-IOA NA+TB coexistence used to break control writes — `HashMap::values().find()` order is undefined, so the command might land on the TB twin while reads go to the NA one. The new "prefer NA" lookup keeps writes and reads consistent.
- **子站**: ValuePanel 选浮点 `M_ME_NC_1` 写值,实际可能命中同 IOA 的 `M_BO_NA_1`(位串),解析"321"为位串失败 → 报 "unsupported value type"。`asdu_type` 全程透传后修复 / Selecting `M_ME_NC_1` no longer accidentally routes the write to a same-IOA `M_BO_NA_1` and dies with "unsupported value type".
- **子站**: 工具栏"启动"按钮在树右键启停或后端自动停服后不刷新,看起来仍可启动 / Toolbar's start/stop buttons no longer drift out of sync after off-toolbar state changes.
- **子站**: 修改值后 UI 卡顿(32 万点站点下因立即触发 `list_data_points` 全量序列化) / Write-value lag eliminated for stations with hundreds of thousands of points — full-list refresh on write removed.
- **子站**: 通信日志面板每 2 秒整体闪烁(deep-reactive 全量重建) / Communication log no longer flickers every 2 s.
- **子站**: 突发上送 (COT=3) 缺日志,排查只能靠抓包 / Spontaneous (COT=3) frames now visible in the in-app log.
- **子站**: 数据表 dataMap 在 server_id 复用场景(dev 重启 + 前端 server_id 仍为 `server_1`)下累加旧条目 → categoryCounts 显示巨量伪点。`loadDataPoints` 改为以后端返回为准的 fresh map 替换 / `loadDataPoints` rebuilds `dataMap` from scratch on every poll, so dev hot-restart server_id reuse no longer accretes phantom points.

### Internal 内部

- **子站后端**: `slave.rs:queue_spontaneous` 在写日志前累计 `total_sent` 计数避免 0 客户端时也打日志 / `queue_spontaneous` only logs when at least one client received the batch.
- **子站前端**: `App.vue` 的 listener 类型签名 `listen<{ id: string; state: string }>('server-state-changed', ...)` 与后端 `ServerStateEvent`(`#[serde(rename_all = "snake_case")]`) 字段对齐 / Front-end listener signature aligns with backend `ServerStateEvent` snake_case payload.
- **子站前端**: `ValuePanel.vue` 删除未使用的 `refreshData` inject / Removed dead `refreshData` inject in `ValuePanel.vue`.

## [1.2.0] - 2026-04-29

### Highlights / 亮点

- 🛡️ **主站 IEC 60870-5-104 协议参数全面可配 + 真正的 t1/t2/t3/k/w 状态机** / Master gains full IEC 60870-5-104 link-layer state machine with all spec timers configurable — 新建/编辑连接对话框新增"IEC 104 协议参数"折叠区,可填 t0/t1/t2/t3/k/w、默认 QOI/QCC、总召唤与计数量召唤的自动周期。后端按规范实现:I 帧未确认达 k 时阻塞发送、收到 w 个 I 帧立即回 S 帧、t2 触发延迟 ACK、t3 空闲发 TESTFR ACT、t1 超时关连接;新增 `protocol_state_machine.rs` 集成测试。/ Connection dialog now exposes t0/t1/t2/t3/k/w plus default QOI/QCC plus auto-poll periods for general and counter interrogation. Backend implements the IEC 60870-5-104 §5.2 link-layer state machine — k blocks sender when full, w forces an immediate S-frame ACK, t2 fires a delayed ACK, t3 emits TESTFR ACT, t1 closes the link on missing ACKs. New `protocol_state_machine.rs` integration test covers t1 expiry and t3 idle.
- 🔄 **工具栏"检查更新"按钮 + 修复 6h 内错过更新的盲区** / Toolbar "Check for Updates" button bypasses the 6h throttle — `check_for_update` 后端新增 `force` 参数,手动点击绕过 6h 节流和 24h snooze;修复用户安装新版后 6h 内重启错过下一版的体验缺陷 / `check_for_update` gains an optional `force` flag, fixing the silent miss when users restarted within 6h of installing a release.

### Added 新增

- **主站后端**: `MasterConfig` 新增 `t0/t1/t2/t3/k/w/default_qoi/default_qcc/interrogate_period_s/counter_interrogate_period_s` 字段,旧序列化向后兼容 / `MasterConfig` gains the new protocol parameter fields with serde-default fallbacks for old configs.
- **主站后端**: 新增 `MasterConnection::send_interrogation_with_qoi` 与 `send_counter_read_with_qcc`,允许按调用覆盖默认 QOI/QCC / Per-call QOI/QCC overrides for GI and counter interrogation.
- **主站后端**: 新增周期性 GI / 计数量召唤后台任务,周期由 `interrogate_period_s` / `counter_interrogate_period_s` 控制,0 表示关闭 / Background auto-poll task driven by the two period fields (0 disables).
- **主站前端**: 连接对话框新增"IEC 104 协议参数"折叠区,字段在 localStorage (`iec104master.newConnForm.v2`) 持久化,编辑模式从 backend 回填 / New collapsible protocol-parameters section in the dialog, persisted in localStorage and pre-filled when editing.
- **测试**: `crates/iec104sim-core/tests/protocol_state_machine.rs` 验证 t3 触发 TESTFR_ACT、t1 未确认时关连接 / New integration tests for t3 idle test and t1 expiry behaviour.

### Changed 改进

- **主站后端**: `receive_loop` / `receive_loop_mutex` 重写为统一 `RawWrite` trait,共用 t1/t2/t3 tick 检查,TCP 读超时缩到 100 ms 让 timer 响应更快 / Both receive loops now share a `RawWrite` trait and a common timer tick; read timeout reduced to 100 ms for snappier timer firing.
- **主站后端**: `send_frame_with_event` 重写为带 k 阻塞 + SSN 分配 + 待确认队列追踪的版本,集中在 free-function `send_async_frame`,被 Tauri 命令与周期任务复用 / Send path rewritten as `send_async_frame` (k-window blocking + SSN tracking + pending-ACK list), shared by Tauri commands and the periodic poller.
- **主站后端**: `connect()` 优先使用 `t0` 作为连接超时,回退到旧 `timeout_ms`,保证旧配置无感升级 / `connect()` honours `t0` first and falls back to legacy `timeout_ms`.
- **主站更新**: `check_for_update` 命令新增可选 `force: bool` 参数;手动检查 (工具栏"检查更新"按钮) 绕过 6h 节流和 24h snooze,启动自动检查保持原行为 / `check_for_update` gains an optional `force` flag; manual checks via the new toolbar button bypass the 6h throttle and 24h snooze, while the startup auto-check is unchanged.
- **主站前端**: 工具栏新增"检查更新 / Check for Updates"按钮,无新版时弹出"已是最新版本"提示;修复用户装新版后 6h 内重启错过更新的体验问题 / Toolbar now has a "Check for Updates" button that shows "you are on the latest version" when no update is available; fixes the case where users who installed a release within 6h of restart silently miss newer versions.

## [1.1.5] - 2026-04-29

### Highlights / 亮点

- 📋 **通信日志大改版** / Communication log overhauled — 帧类型与时间格式跟随中英文切换;新增"传送原因 (COT)"列,把 `COT=3` 直接显示为"突发 / Spontaneous"等可读名称;面板顶部拖拽手柄可任意调高,持久化到 localStorage;最新条目自动置顶 / Frame label and time format follow zh/en switch; new "Cause" column decodes COT 1..47 into readable names; drag handle resizes the panel (saved to localStorage); newest entries on top.
- ⚡ **主站 TLS 发送延迟修复** / TLS send latency fixed — TLS 接收循环改非阻塞,共享 mutex 不再被阻塞读卡死,命令发送从最坏数秒降到 ~5 ms / TLS receive loop switched to non-blocking; the shared mutex is no longer held across blocking reads, so command sends no longer wait seconds for the next quiet window — worst case ~5 ms.
- 🚀 **大点位场景删除/切换不卡 UI** / No more UI freeze on heavy connections — 15 k+ 数据点的连接,点击"删除"立刻返回(后端异步析构);切换连接时 `selectedPoints` 改 shallowRef,Vue 不再 deep-proxy 卸载几万项;`refreshTree` 80 ms 防抖合并连续事件 / Delete returns immediately even with 15 k+ points (async drop in `tokio::spawn`); `selectedPoints` changed to `shallowRef` and `refreshTree` debounced (80 ms).
- 🌑 **统一暗色滚动条** / Unified dark scrollbars — 覆盖 macOS"始终显示滚动条"系统设置下的白色 track / Custom `::-webkit-scrollbar` rules override the white track macOS shows when "Always show scrollbars" is on.

### Added 新增

- **通信日志**: 新增"传送原因 (COT)"列,优先取 `detail_event.payload.cot`,回退正则匹配 `COT=N`,通过 `log.cot.*` 字典翻译成中英文名称(覆盖 1..47 主要 COT) / New Cause column on the log table.
- **通信日志**: 面板顶部新增 4 px 拖拽手柄;鼠标按下拖拽调整高度,clamp `[80, 70vh]`,松开后写 `localStorage` (`iec104.logPanel.height`) / Drag-to-resize handle on the log panel, persisted to localStorage.
- **测试**: 新增 `crates/iec104sim-core/tests/tls_send_latency.rs` 验证 TLS 命令发送 P95 延迟回归不超过 5 ms / New `tls_send_latency.rs` end-to-end test asserts TLS command-send P95 stays under 5 ms.

### Changed 改进

- **通信日志**: 帧标签 (I/S/U/GI/CS/单点命令…) 与时间格式不再硬编码,完全走 i18n;切换中英文表格内容立即跟随 / Frame labels and time format are fully i18n-driven (no hardcoded strings).
- **通信日志**: 表格倒序渲染 (`displayLogs = logs.reverse()`),最新条目在顶部 / Table rendered newest-first via a `computed` reverse view.
- **主站后端**: TLS `receive_loop_mutex` 在 TLS 握手后把底层 `TcpStream` 切为非阻塞,读返回 `WouldBlock` 立刻释放 mutex 让发送拿到锁;原本读阻塞数秒的最坏情况降到 ~5 ms 轮询间隔 / `receive_loop_mutex` flips the underlying `TcpStream` to non-blocking after the TLS handshake.
- **主站后端**: `delete_connection` 改为短锁 `HashMap::remove` (O(1)),立即释放写锁;`disconnect()` + 15 k+ HashMap 析构甩到 `tokio::spawn` 独立任务,不阻塞 Tauri 命令线程 / `delete_connection` does an O(1) `HashMap::remove`, then disconnects + drops in `tokio::spawn`.
- **主站前端**: `selectedPoints` 改 `shallowRef`,Ctrl+A 全选 15 k 行后切连接清空不再触发 Vue deep-reactive 卸载 / `selectedPoints` switched to `shallowRef`.
- **主站前端**: `refreshTree` 加 80 ms trailing-edge 防抖,`disconnect → delete → reconnect` 连续触发合并为单次 `list_connections` 调用 / `refreshTree` debounced at 80 ms.
- **测试**: 多个 e2e (`control_e2e.rs` / `tls_e2e.rs` / `overlapping_ioa_interrogation.rs`) 适配 CA-aware API,通过 `data.ca_map(ca)` 取每个 CA 的 IOA 表 / Tests updated for the new CA-aware `received_data.ca_map(...)` API.

### Fixed 修复

- **主站**: TLS 模式下点击"断开"或发送命令时,等待数秒才响应 — 由共享 mutex 被阻塞读卡住,现已修复 / Disconnect/send commands no longer hang for seconds on TLS connections.
- **主站**: 连接收到 15 k+ 数据点后点击"删除连接"按钮,UI 冻结 1–2 秒;现在立刻响应 / Deleting a connection with 15 k+ points no longer freezes the UI.
- **主站**: 切换/删除连接清空 `selectedPoints` 时主线程被 Vue Proxy 卸载几万项卡住 / Switching connections no longer stalls the main thread due to deep reactivity teardown.

### Internal 内部

- `App.vue` `onUnmounted` 补 `clearTimeout(refreshTreePending)` 防止挂起的防抖 timer 阻止 GC / `App.vue` cleans up the debounce timer on unmount.

## [1.1.4] - 2026-04-28

### Highlights / 亮点

- 🔁 **仓库迁移收尾** / Repo transfer cleanup — 仓库已从 `kelsoprotein-lab/IEC60870-5-104-Simulator` 迁移到 `Carl-Dai/IEC60870-5-104-Simulator`。GitHub 的 301 重定向让 v1.1.0–v1.1.3 老用户继续工作没问题,但本版本把所有硬编码 URL (updater endpoint、CI 脚本 REPO 常量、应用内 About 链接、README badge / 链接) 都更新成新地址,长期上不再依赖 GitHub 重定向 / Repo moved from `kelsoprotein-lab` to `Carl-Dai`. GitHub's 301 redirect keeps v1.1.0–v1.1.3 working, but this release flips every hardcoded URL in updater endpoints, CI scripts, in-app About links, and README badges to the new owner so we don't depend on the redirect long-term.

### Changed 改进

- **主站 + 从站**: `tauri.conf.json` 的 `plugins.updater.endpoints` 指向新仓库 / Updater endpoints in both `tauri.conf.json` files.
- **CI 脚本**: `scripts/gen-update-manifest.mjs` 与 `scripts/build-release-notes.mjs` 的 `REPO` 常量更新 / `REPO` constant in both manifest scripts.
- **应用内 About**: 双 frontend 的 `releaseNotes.ts` `REPO_URL` / `RELEASES_URL` 更新 / `REPO_URL` and `RELEASES_URL` in both frontends' `releaseNotes.ts`.
- **README**: 双语 README 顶部 badge、Releases 链接、changelog 链接全部更新 / Both READMEs updated (badges, Releases links, changelog links).

### Internal 内部

- 历史 `CHANGELOG.md` / `docs/superpowers/` 里的旧 URL 没有动 — 它们记录的是当时的状态,改动会曲解历史 / Old URLs in historical CHANGELOG entries and `docs/superpowers/` are intentionally left as-is; rewriting them would distort the historical record.

## [1.1.3] - 2026-04-28

### Highlights / 亮点

- ✏️ **主站连接列表右键加 "编辑连接"** / Right-click "Edit connection" on any tree node — 复用新建对话框,标题切到"编辑连接",字段全部预填,提交时先 `delete_connection` 再 `create_connection` (IEC 104 连接是有状态的,只能这么改);要求先断开再编辑,避免悄悄丢运行时状态。
- 🔁 **CI 给 publish-manifest 加重试** / `publish-manifest` retries the release-tags GET — v1.1.2 publish-manifest 启动时 release 还没对 GitHub REST 可见 (404),整个 job 挂掉;现在 6×5 s 重试,只对 Not Found 重试,其他错误立即抛出。
- 🖼️ **README 顶部加多 CA 与通信日志截图章节** / Top-of-README screenshots showing the multi-CA tree, new-connection dialog, and TLS / per-CA GI communication log.

### Added 新增

- **主站前端**: ConnectionTree 右键菜单加 `编辑连接 / Edit connection`,通过 inject 拿 Toolbar 提供的 `openEditConnection(connId)` / Tree's right-click menu now has `Edit connection`, wired to a Toolbar-provided `openEditConnection` via Vue inject.
- **主站前端**: Toolbar 的新建对话框复用为编辑模式 — 标题动态切换 `新建连接 / 编辑连接`,主按钮文字切 `创建 / 保存`;退出按钮统一走 `closeNewConn()` 重置 `editingConnId` / The Toolbar's new-connection dialog doubles as an edit dialog — title and submit-button labels switch on `editingConnId`.
- **CI 脚本**: `gen-update-manifest.mjs` 新增 `fetchReleaseWithRetry()`,把 `gh api releases/tags/<tag>` 包了 6 次每 5 s 的重试 / `fetchReleaseWithRetry` wraps the initial `gh api releases/tags/<tag>` lookup with 6 attempts at 5 s intervals.
- **README**: `docs/screenshots/master-multi-ca-newconn.png` + `master-multi-ca-comm-log.png`,在 README 与 README_CN 顶部用 markdown 图片块嵌入 / Two PNG screenshots committed under `docs/screenshots/`, embedded with descriptive captions in both READMEs.

### Changed 改进

- **主站前端**: `localStorage` 持久化的"新建连接"表单**不会被编辑模式污染** — 编辑别的连接时 watch 跳过 `localStorage.setItem`,避免你的"默认新建参数"被另一条连接的当前值覆盖 / Persisted new-connection form is shielded from edit-mode mutations.
- **README master 段功能列表** 同步到 v1.1.x 的实际能力 (多 CA 三层树、自定义控制按钮、控制对话框持久化、应用内自动更新) / Master feature list in both READMEs aligned with current v1.1.x reality.

### Fixed 修复

- **CI**: tauri-action 创建 release 与 publish-manifest 启动之间的赛跑导致 v1.1.2 整个 release pipeline 失败,现在自动重试解决 / Fixed the v1.1.2-style race where `publish-manifest` failed because the release wasn't yet visible to GitHub's REST API.

### Known limitations / 已知限制

- **编辑连接时 TLS 三个证书路径**会回填上次 *新建连接* 表单里保存的值,因为后端 `ConnectionInfo` DTO 不暴露这些路径 / Editing a connection back-fills TLS file paths from the persisted new-connection form (the backend doesn't expose them on `ConnectionInfo`). Verify the paths before saving if multiple connections use different cert files.
- **正在 Connected 的连接不能编辑** — 弹出提示让你先断开 / Editing a Connected connection is blocked with a prompt to disconnect first.

## [1.1.2] - 2026-04-28

### 修复 / Fixed

- **macOS**: 给 `.app` bundle 加 ad-hoc 签名 (`bundle.macOS.signingIdentity: "-"`),修 v1.1.1 及之前版本下载后 macOS 弹 **"IEC104Master / IEC104Slave 已损坏,无法打开"** 的问题。原因是 Apple Silicon (以及部分新 macOS) 对完全无签名的 app 直接拒绝打开,而不是给"无法验证开发者"的可绕过提示。Ad-hoc 签名后会变成温和的"无法验证开发者",可右键 → 打开 / Add ad-hoc signing so unsigned macOS bundles no longer trigger the "is damaged, move to Trash" prompt; users still see the "unverified developer" warning but can right-click → Open.

### macOS 升级备注 / Upgrade note for macOS users

- 已经装了 v1.1.1 或之前版本并且看到"已损坏"提示的用户,**不必重装**:终端跑一行
  ```bash
  xattr -dr com.apple.quarantine "/Applications/IEC104Master.app"
  xattr -dr com.apple.quarantine "/Applications/IEC104Slave.app"
  ```
  即可正常打开。从 v1.1.2 开始下载的 dmg 不再有此问题。

## [1.1.1] - 2026-04-28

> 围绕 v1.1.0 的多 CA 能力做了完整的数据面 + 操作面收尾,并修复了 master 上一个老 bug。Patch release,任何 v1.0.9+ 的用户都可自动收到。

### Highlights / 亮点

- 🗂️ 主站数据按 CA 真隔离 / Master data is now physically per-CA — 之前 `(IOA, AsduType)` 扁平存储让多站共连接的同 IOA 互相覆盖,现在改成 `HashMap<CA, DataPointMap>`,各站独立。
- 🌳 多 CA 的连接树自动展开成 **连接 → CA 徽章 → 分类** 三层 / Tree expands to **Connection → CA badge → category** for multi-CA setups (single-CA stays flat). 每个 CA 节点的分类计数独立统计。
- 🎛️ 工具栏新增 **自定义控制 / Custom Control** 入口 — 不必先选数据点,直接弹 ControlDialog,CA 字段是当前连接已配置 CAs 的下拉选 (有需要可切到"其他"手动输入)。
- 💾 ControlDialog 记忆 CA / IOA / 命令类型 / 值字段 (持久化到 localStorage) / ControlDialog now remembers CA/IOA/command-type/value across opens & restarts — 发送成功不再自动关窗,允许用户连续给同 CA 不同 IOA 发命令。
- 🔌 修复:TLS 模式下点"断开"前端永远停在 Connected 的老 bug / Fixed the TLS-disconnect hang where the UI stayed on Connected because the receiver task never exited from a blocking read.

### Added 新增

- **主站后端**: 新类型 `MasterReceivedData = HashMap<u16, DataPointMap>` + 连接级单调 seq;`parse_and_store_asdu` 取 ASDU 头里的 CA 路由到对应桶 / New `MasterReceivedData` per-CA storage with connection-wide seq counter, points routed by ASDU CA header.
- **主站后端**: `ReceivedDataPointInfo.common_address` 字段,前端可按 CA 过滤/分组/路由控制命令 / `ReceivedDataPointInfo` carries `common_address` so the UI can filter, group, and route control commands correctly.
- **主站前端**: `App.vue` 增加 `selectedCA: number | null` 共享状态;`categoryCounts` 形状改成 connId → Map<CA, Map<category, count>> / `selectedCA` shared state; per-CA category counts.
- **主站前端**: `ConnectionTree` 检测 `common_addresses.length > 1` 时渲染 CA 徽章子节点 + 各自展开/收起;`DataTable` 按 selectedCA × selectedCategory 双重过滤 / Tree renders CA badges with independent expand/collapse; data table filters by both CA and category.
- **主站前端**: 工具栏新按钮 **自定义控制**,打开 ControlDialog,IOA 留空,CA 默认当前连接首个 / Toolbar **Custom Control** button; CA defaults to the connection's first configured one.
- **主站前端**: ControlDialog CA 字段在多 CA 连接下变成下拉 (CA 1 / CA 2 / CA 3 / 其他...);单 CA 连接保持原数字输入 / CA dropdown listing the connection's CAs in multi-CA setups, with an "Other (custom)" escape hatch.

### Changed 改进

- **主站前端**: `ValuePanel` / `DataTable` 右键控制命令直接用数据点自身的 `common_address` (该点真实来源的站),不再去 list_connections 取"第一个 CA" / Right-click control commands now use each point's own CA (its source station) instead of the connection's first CA.
- **主站前端**: ControlDialog 全部输入字段持久化到 `localStorage` (key `iec104master.controlDialog.v1`) / All ControlDialog inputs persist via localStorage.
- **主站前端**: ControlDialog 发送成功后不再自动关闭;`Toolbar` 与 `DataTable` 移除 `@sent` 关闭句柄,确认看下方 OK Xms 指示 / Dialog stays open after a successful send; confirmation comes from the existing OK indicator.
- **CI**: `gen-update-manifest.mjs::extractChangelogSection` 同时识别 `## X.Y.Z` 与 `## [X.Y.Z]` 两种风格 / Changelog section extractor recognizes both `##` styles.
- **CI**: 新 `scripts/build-release-notes.mjs` (含 vitest) 在 publish-manifest job 末尾自动把 GitHub Release body 替换成 per-OS 下载表 + 本版本 CHANGELOG section,告别"See the assets below..."占位符 / CI auto-replaces the Release body with a rich, per-platform table + the version's CHANGELOG entry.

### Fixed 修复

- **主站后端**: `MasterConnection::disconnect()` 给 `receiver_handle.await` 包了 `tokio::time::timeout(2s)`,TLS 路径下即使 read 没透出 timeout 也不会让 Tauri 命令挂死 / `disconnect()` caps the receiver join at 2 s so a stuck blocking read can't hang the command.
- **主站前端**: `Toolbar::disconnectMaster` 的 `selectedConnectionState = 'Disconnected'` 移到 `finally` 块;后端返回 NotConnected (对端已关 socket) 也不再让按钮卡在 Connected,降级为静默 / Disconnect button always reflects intent in `finally`; benign `NotConnected` is silenced.
- **主站前端**: ControlDialog `value` 字段强制 `String()` 包一层,修 `<input type="number">` 在某些路径下让 v-model 拿到 JS number 导致后端报 `invalid type: integer 123, expected a string` / Force-stringify `value` so a numeric setpoint input doesn't fail serde deserialization on the Rust side.

### Internal 内部

- 类型 `ReceivedDataPointInfo`、`ConnectionInfo` 在前后端同步更新;`pointKey` 加入 CA 防止前端缓存跨站碰撞。

## [1.1.0] - 2026-04-28

> 把 v1.0.9 → v1.0.15 这一系列搭建自动更新链路的工作正式收尾,作为面向用户的 minor release。

### Highlights / 亮点

- 🔄 应用内自动更新 / In-app auto-update via GitHub Releases — 启动 2 秒后静默检查,发现新版本弹窗提示用户更新,下载经 ed25519 签名验证后自动重启;6 小时节流,"稍后" 24 小时内不重提。
- 🔢 主站支持多公共地址 / Master supports multiple Common Addresses per connection — "新建连接" 输入逗号分隔列表 (如 `1, 2, 3`),自动 GI / 时钟同步 / 累计量召唤按列表循环。
- 🛡️ 全平台 ed25519 签名 / ed25519-signed bundles for every platform — macOS `.app.tar.gz`、Linux `.AppImage`、Windows `-setup.exe` 都带 `.sig`。
- 🛠️ Release CI 现在生成两份 manifest / CI now produces `latest-slave.json` and `latest-master.json` — 两个应用各自独立的 updater endpoint,避免混在一起。

### Added 新增

- **主站 + 从站**: `tauri-plugin-updater` / `tauri-plugin-process` / `tauri-plugin-store` 接入,新增三个 Tauri 命令 `check_for_update` / `install_update` / `snooze_update`,纯函数 `should_check` / `is_snoozed` 带 12 个单元测试 (slave + master 各 6 个) / Plugged in updater/process/store plugins; added throttle/snooze pure helpers covered by 12 unit tests.
- **主站 + 从站**: 新 Vue 组件 `UpdateDialog.vue`,展示版本号、changelog、下载进度、错误重试,中英文 i18n / New `UpdateDialog.vue` showing version, changelog, progress, retry — bilingual i18n.
- **主站**: 一个连接绑定多个 CA 的字段 `common_addresses: Vec<u16>` (后端) / `common_addresses_text: string → number[]` (前端),`ConnectionTree` 显示 `CA:1,2,3` / Multi-CA per master connection (Rust + Vue), tree shows `CA:1,2,3`.
- **CI**: 新增 `scripts/gen-update-manifest.mjs` 从 release assets 按文件名前缀拆分生成 `latest-slave.json` / `latest-master.json`,带 vitest 单测覆盖正则匹配与版本号边界 / `gen-update-manifest.mjs` produces split per-role manifests, with vitest covering regex + version boundary cases.
- **CI**: `release.yml` 新增 `publish-manifest` job,在两个 build job 完成后运行,把 manifest 上传到同一 release / `publish-manifest` job uploads both manifests after build.

### Changed 改进

- `tauri.conf.json` 新增 `bundle.createUpdaterArtifacts: true` 让 Tauri 在每个平台产出可签名的 updater bundle / Added `bundle.createUpdaterArtifacts: true` so Tauri emits signable updater bundles per OS.
- 修正 `releaseNotes.ts` 中过时的仓库 URL (旧 `IEC104Sim` 已失效) / Fixed stale repo URL in `releaseNotes.ts` (`IEC104Sim` is gone).
- 失败兜底:网络不可达、json 404、解析失败、验签失败一律 `log::warn!` + 返回 None,不打扰用户 / All failure modes (network down, JSON 404, signature mismatch) silently log and return `None` — never popup an error.

### Fixed 修复

- 自上一个正式 release v1.0.8 以来,v1.0.9 → v1.0.15 共 7 个 patch 在追 CI 链路 (sig 上传、bundle 命名、manifest 正则适配 Tauri 2 真实产物名),此版本作为正式收口 / Auto-update CI plumbing fixed across 7 iterative patches (v1.0.9–v1.0.15); this minor release rolls them up.

### Internal 内部

- spec & plan 写在 `docs/superpowers/specs/2026-04-28-tauri-auto-update-design.md` 与 `docs/superpowers/plans/2026-04-28-tauri-auto-update.md`。

### Upgrade Notes / 升级说明

- v1.0.8 及更早的用户**需要手动升级一次**到 v1.1.0 (老版本没有 updater 客户端代码)。从 v1.1.0 起,后续版本将自动收到推送。
- v1.0.9 → v1.0.15 的用户也建议手动升一次到 v1.1.0 以使用稳定的 updater 链路 (那几个 patch 里多次 CI 失败,部分版本的 release 资产可能不全)。

### Known Limitations / 已知限制

- **主站**: 多 CA 场景下右键单点控制命令仍然只发到连接的第一个 CA (数据点未携带 CA 信息) / Right-click control commands target the first CA only in multi-CA setups (data points don't carry CA info).
- macOS 应用未做公证 / macOS bundles aren't notarized — 在新版 macOS 上首次运行可能被 Gatekeeper 拦下,需要用户在系统偏好设置 → 安全性中允许。

## [1.0.15] - 2026-04-28

### 修复
- **CI**: v1.0.14 验证发现 Tauri 2 + tauri-action 在默认配置下已经把所有 `*.sig` 文件、macOS `.app.tar.gz`、Linux `.AppImage`、Windows `.exe` 都正确上传到了 release —— 我们之前自己写的 explicit upload step 完全冗余,并且基于错误的文件名假设(找 `.AppImage.tar.gz` / `.nsis.zip`,而 Tauri 2 实际产物是 `.AppImage` / `-setup.exe`)。本版本删除冗余 upload step,把 `gen-update-manifest.mjs` 的正则改成匹配 Tauri 2 真实产物名,vitest 加了"不能误匹配 .dmg/.msi/.deb/.rpm"的回归测试。

### 备注
- v1.0.14 release 里有一个 tauri-action 自动生成的 `latest.json` —— 它把 slave/master 混在一起所以不可用,但我们的 updater 端点指向的是 `latest-slave.json` / `latest-master.json`,所以无影响。`latest.json` 留在 release 里作为无害噪声。

## [1.0.14] - 2026-04-28

### 修复
- **CI**: v1.0.13 试图把 `"updater"` 放进 `bundle.targets` 数组,被 Tauri 2.10 schema 拒绝(`BundleTargetInner` 不接受这个值)。本版本改用正确的字段:`bundle.createUpdaterArtifacts: true`,Tauri 会按当前 OS 自动产出对应的 updater bundle(`.app.tar.gz` / `.AppImage.tar.gz` / `.nsis.zip`)并签名。同时去掉 `includeUpdaterJson: false`,让 tauri-action 走默认路径完成签名;find-based upload step 仍然负责把 sig + updater bundle 上传到 release。

### 新增
- **主站**: 一个连接支持多个公共地址 (CA)。在"新建连接"对话框的"公共地址 (CA)"字段输入逗号分隔的列表(例如 `1, 2, 3`),应用会在连接成功后对每个 CA 各发一次 GI;时钟同步、累计量召唤同样按列表循环。连接树显示 `CA:1,2,3`。

### 已知限制
- **主站**: 右键单点控制命令仍然只发到连接的第一个 CA(数据点未携带 CA 信息)。多 CA 且 IOA 重叠的场景下命令的目标可能不符合用户预期。

## [1.0.13] - 2026-04-28 (broken — no release artifacts)

CI build 失败:`bundle.targets` 里的 `"updater"` 被 Tauri 2.10 schema 拒绝。修复见 v1.0.14。

## [1.0.12] - 2026-04-28

### 修复
- **CI**: v1.0.11 的 upload step 用 bash glob (`target/release/bundle/.../IEC104*.tar.gz`) 在 GitHub-hosted runner 上没匹配到任何文件(具体原因待诊断,可能是 cwd / 文件清理时机问题)。本版本改用 `find target -path "*/release/bundle/.../" -name "IEC104*..."` 的方式,并新增一个 Debug 步骤打印 target 目录下所有 `.tar.gz / .zip / .sig` 文件以便排查。

## [1.0.11] - 2026-04-28

### 修复
- **CI**: v1.0.10 的修复方向正确(`includeUpdaterJson: false`)但 upload step 用了 `tauri-action` 的 `outputs.artifactPaths`,而该输出实际只列主 installer,不含 `.sig` 与 updater bundle。本版本改为按 `runner.os` 分支直接 glob `target/.../bundle/{macos,nsis,appimage}/` 目录:macOS 把 `.app.tar.gz.sig` 加上 arch 后缀防 aarch64/x64 互相覆盖;Linux/Windows 上传 `IEC104*.AppImage.tar.gz(.sig)` / `IEC104*.nsis.zip(.sig)`。
- 自此 v1.0.9 / v1.0.10 用户启动应用后将自动收到 v1.0.11 的更新提示。

## [1.0.10] - 2026-04-28

### 修复
- **CI**: 修复 release workflow 没有把 `*.sig` 文件和 updater bundles (Windows `.nsis.zip` / Linux `.AppImage.tar.gz`) 上传到 release 的问题。原因是 `tauri-action` 在多 app 同 tag 场景下生成内置 updater JSON 失败,连带跳过了 sig 上传。本版本通过设置 `includeUpdaterJson: false` 让 tauri-action 只上传 bundles + sig,manifest JSON 由独立 `publish-manifest` job 生成。
- 注:本版本 upload step 实现有缺陷,实际未正确上传 sig 和 bundle,需 v1.0.11 修复。

## [1.0.9] - 2026-04-28

### 新增
- **主站 + 从站**: 应用内自动更新。启动后 2 秒静默检查 GitHub Releases,发现新版本时弹窗显示更新说明并允许一键下载、ed25519 验签后自动重启。6 小时内不重复检查;用户点"稍后"则该版本 24 小时内不再提示。
- **CI**: release workflow 现在会同时签名安装包(`*.sig`)并生成 `latest-slave.json` / `latest-master.json` 两份 manifest 上传到 release,作为 updater 客户端的 endpoint。

### 注意
- v1.0.8 及更早版本的用户**需要手动升级一次**到 v1.0.9。从 v1.0.9 开始,后续版本将自动收到更新提示。

## [1.0.8] - 2026-04-28

### 新增
- **主站 + 从站**:UI 支持中英文运行时切换。工具栏右侧 `中 / EN` 按钮一键切换;首次启动跟随系统语言(`navigator.language` 以 `zh` 开头则中文,否则英文),用户切换后通过 `localStorage` 持久化。
- **主站**:LogPanel `详情` 列改由前端字典渲染。后端控制命令(单点 / 双点 / 步调节 / 归一化设定值 / 标度化设定值 / 浮点设定值)同时携带结构化 `detail_event { kind, payload }`,前端在切换语言时已显示的日志会立即重新渲染为新语言。
- **主站 + 从站**:LogPanel CSV 导出改为前端基于已渲染文本生成,导出文件跟随当前 UI 语言;表头与 detail 列均使用当前 locale。
- **核心库**:`LogEntry` 新增可选 `detail_event` 字段(向后兼容,序列化时 `Option::is_none` 跳过),用于前端 i18n 渲染。

### 改进
- **从站**:默认站名不再硬编码为 `站 1`。后端 `commands.rs` 创建默认 station 时传空字符串,前端 ConnectionTree 显示时回退到 `t('station.defaultName', { ca })`,实现真正的语言无关存储。

## [1.0.7] - 2026-04-27

### 新增
- **主站**:点击"连接"成功后自动发送一次总召唤(GI),无需手动再点。GI 失败仅在控制台告警,不影响连接状态。

### 改进
- **主站**:新建连接对话框的 TLS 证书路径默认填入 `./ca.pem` / `./client.pem` / `./client-key.pem`(相对路径),首次启用 TLS 即可开箱使用;localStorage 中已有空字符串的字段也会回填默认值。

## [1.0.6] - 2026-04-24

### 新增
- **主站**:新建连接对话框增加 TLS 版本策略选择(Auto / 仅 TLS 1.2 / 仅 TLS 1.3),核心层按策略约束 min/max 协议版本并附带 e2e 协商测试。
- **主站**:新建连接表单(目标地址、端口、TLS 路径、证书选项等)通过 `localStorage` 自动持久化,下次打开窗口自动回填上一次的取值。

### 改进
- **主站**:窗口标题精简为 `IEC104Master`(去除冗余后缀)。
- **主站**:移除源码中写死的本机绝对路径,避免泄露用户名与跨机失效。

### 测试
- 核心层新增 `TlsVersionPolicy` 协商用 e2e 测试,覆盖 Auto/仅 1.2/仅 1.3 三种策略的握手行为。

## [1.0.5] - 2026-04-24

### 修复
- **主站**:同一 IOA 同时配置浮点 (M_ME_NC_1) 与累计量 (M_IT_NA_1) 时,总召唤会覆盖掉前端已展示的累计量、累计量召唤会覆盖掉已展示的浮点值。数据表前端 `dataMap` 改为按 `(ioa, asdu_type)` 复合键存储,与后端一致。
- **主站**:多连接场景下树节点的类别计数与 flash 高亮被所有连接共享,一个连接执行总召唤会让另一个(已断开的)连接也显示相同数据。类别计数与变更通知改为按连接 id 分桶,实现连接隔离。

### 测试
- 新增 `crates/iec104sim-core/tests/overlapping_ioa_interrogation.rs`,覆盖"浮点 + 累计量共用同一 IOA"下 GI → CI → GI 序列中两类数据互不驱逐的行为。

## [1.0.4] - 2026-04-24

### 修复
- **主站**:从站端口关闭后,主站状态未更新为断开,且无法重连(只能删除连接后重建)。
- **主站/从站**:在输入框内按住鼠标拖选文字,若在弹窗外松开鼠标会误关弹窗。

### 改进
- **核心**:主站状态变更改用 `tokio::sync::watch` 通道统一通知,合并了原 `RwLock` + `broadcast` 的双重存储,消除 blocking 线程中的 `block_on` 调用。
- **前端**:顶栏应用名可点击打开"关于"对话框,显示当前版本与本次更新内容。

### 测试
- 新增 `crates/iec104sim-core/tests/disconnect_detection.rs`,覆盖对端关闭后的状态广播与重连路径。

## [1.0.3] - 之前

见 [v1.0.3 release notes](https://github.com/kelsoprotein-lab/IEC104Sim/releases/tag/v1.0.3)。
