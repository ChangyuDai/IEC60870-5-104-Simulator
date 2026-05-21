export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '修复: 数据点表无法删除 / 批量删除点位 — 删除现作用于当前选中的所有点位 (单选即删一个), 不再仅删右键那一行',
  '新增批量删除: 多选 (Ctrl/Shift) 后右键删除可一次删掉全部选中, 后端单次锁内成批删除',
  '支持 Delete / Backspace 键删除选中行; 右键菜单在多选时显示数量 (删除数据点 (N))',
  '删除即时生效: 删除后本地立即移除并重绘, 不再受 2s 轮询竞态影响出现「点了没反应」',
]
