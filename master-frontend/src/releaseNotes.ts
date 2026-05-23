export const APP_NAME = 'IEC104 Master'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '品质显示从单灯升级为多位徽章: 数据表与详情逐位展示收到的 IV/NT/SB/BL/OV 并高亮, (?) 图标点开有中英双语释义图例',
  '修复主站收帧从不解码品质字节的问题 (此前品质灯永远是绿的), 现按类型解出全部 5 位',
  '品质字段端到端透传, 与子站发出的品质保持一致',
]
