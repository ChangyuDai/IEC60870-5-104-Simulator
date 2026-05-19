export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '修复发版构建窗口期内"检查更新"失败的问题: release 改为构建期间保持草稿, releases/latest 始终指向更新清单完整的版本, 不再报 "Could not fetch a valid release JSON"',
  '上一版 v1.3.9 亮点: 更新弹窗重写 (Catppuccin 深色主题 + 富格式渲染) + 子站数据点表改用增量轮询',
]
