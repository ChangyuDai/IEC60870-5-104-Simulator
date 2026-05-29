export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '本版本 Slave 端无功能改动; Master 端: 数据表/详情面板点位类型显示十进制 TypeID, 详见 CHANGELOG.md',
  'GitHub 图标 / 关于对话框的主页·Releases 链接点击改为直接打开系统浏览器 (非 Tauri 环境回退到复制链接)',
  'Master 端: 命令类型下拉显示十进制 TypeID, 广播 GI 响应提速 (debouncer 3s→1s, 去 3500ms 兜底), 修复新学 CA 节点不出现, 详见 CHANGELOG.md',
  '品质图例补 OK(正常)行, 说明无品质位置位的基线态',
]
