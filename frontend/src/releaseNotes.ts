export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '品质图例补 OK(正常)行, 说明无品质位置位的基线态',
  '本版本 Slave 端其他改动较小; Master 端新增广播总召 (0xFFFF/0xFF00) + 单向被动接收模式, 详见 CHANGELOG.md',
]
