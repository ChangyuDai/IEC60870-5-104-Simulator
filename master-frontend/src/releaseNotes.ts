export const APP_NAME = 'IEC104 Master'
export const REPO_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '本版主要为子站 dropdown UI 增强 (ASDU 类型下拉每项后置 TypeID 数字), 主站功能与 v1.3.5 一致, 仅同步版本号',
  '上一版 v1.3.5 亮点: 子站主布局支持拖拽调整左右栏宽度 + 左侧类别树每行多一个 TypeId chip + 数据点表表头与数据列对齐 + macOS 首次启动指引更新到 Sequoia',
  '上一版 v1.3.4 亮点: 主站发 STARTDT ACT 后等待 STARTDT CON 再发 I 帧 (§5.3 合规) + 配合子站序号修复, 严格子站不再 RST',
]
