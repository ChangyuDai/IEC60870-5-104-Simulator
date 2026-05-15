export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '添加点位 / 批量添加对话框的 ASDU 类型下拉每项后置 TypeID 数字: 之前只看到 "单点 (SP)" / "单点带 CP56 时标 (SP_TB)" 这种语义标签, 现在每行末尾显示 "· 1" "· 30" 等数字, 与左侧 ConnectionTree 的 TypeId chip 风格一致',
  '上一版 v1.3.5 亮点: 子站主布局支持拖拽调整左右栏宽度 (宽度落 localStorage) + 左侧类别树每行多一个 TypeId chip + 数据点表表头与数据列对齐 + macOS 首次启动指引更新到 Sequoia',
  '上一版 v1.3.4 亮点: 子站 IEC 104 序列号实现修复 + 主站 STARTDT CON 等待 + GI / 累计量召唤批量编帧',
]
