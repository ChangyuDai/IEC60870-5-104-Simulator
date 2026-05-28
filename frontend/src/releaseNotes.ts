export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '本版本 Slave 端无用户可见改动, 仅 Master 端新增广播总召 (0xFFFF/0xFF00) 等能力',
  '版本号与 Master 同步 bump 以保持发版一致, 详见 CHANGELOG.md',
]
