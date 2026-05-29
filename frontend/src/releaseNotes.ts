export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '本版本 Slave 端无功能改动; Master 端: 命令类型下拉显示十进制 TypeID, 广播 GI 响应提速 (debouncer 3s→1s, 去 3500ms 兜底), 修复新学 CA 节点不出现, 详见 CHANGELOG.md',
  '品质图例补 OK(正常)行, 说明无品质位置位的基线态',
]
