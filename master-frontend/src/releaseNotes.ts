export const APP_NAME = 'IEC104 Master'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '修复品质图例 (?) 弹层在受限容器内被裁剪的问题, 现 teleport 到顶层正常弹出',
  '数据表「品质」列表头旁新增 (?) 图例, 无需选中点位即可查看 IV/NT/SB/BL/OV 释义',
]
