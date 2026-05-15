export const APP_NAME = 'IEC104 Master'
export const REPO_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '两个前端共享代码合并: 新建 shared-frontend/ 收口 5 个 Vue 组件、useDialog、i18n 核心与 ParsedFrame 类型, 净删 ~2700 行重复代码, 两个 app 通过 @shared/@app vite alias 引用',
  'Catppuccin Mocha 色板 token 化: tokens.css 定义 --c-* 变量与跨平台 --font-mono (Cascadia Code / JetBrains Mono fallback), 22 个 .vue 中所有 hex 颜色与等宽字体栈替换为 var(...)',
  'Toolbar 巨石拆分: master 819 → 323 行, 抽出 NewConnectionModal (含编辑模式 + 协议参数 + localStorage 持久化 + 22 字段表单)',
  '工具栏右上角新增版本号 + GitHub 图标 (VersionBadge), 点击复制版本号或仓库 URL, 1.5s flash toast 反馈',
  '全局 :focus-visible 键盘焦点环 + 删除 App.vue 中 selectedConnectionState 自赋值噪声',
  '上一版 v1.3.6 亮点: 添加点位 / 批量添加对话框的 ASDU 类型下拉每项后置 TypeID 数字 (与子站同步)',
]
