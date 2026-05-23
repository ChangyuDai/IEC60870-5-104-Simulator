export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '品质描述词端到端打通: 可为任意点位设置 IV/NT/SB/BL/OV, 编码时真正写入 SIQ/DIQ/QDS/BCR (此前硬编码为 0)',
  '品质显示从单灯升级为多位徽章, 逐位展示置位品质并高亮, 旁边 (?) 图标点开有中英双语释义图例',
  '在 ValuePanel 选中点位即可勾选品质开关 (OV 仅测量类显示), 改动即时上送',
]
