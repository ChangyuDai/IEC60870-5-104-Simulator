export const APP_NAME = 'IEC104 Master'
export const REPO_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '本版主要为子站 UI 改进 (拖拽分隔条 + 类别 TypeId + 表头对齐), 主站功能与 v1.3.4 一致, 仅同步版本号',
  'README 中英文 macOS 首次启动指引同步更新到 Sequoia 行为: 旧 "右键 → 打开" 路径自 macOS 15 起被 Apple 移除, 现走 系统设置 → 隐私与安全性 → 仍要打开, 或 xattr -dr com.apple.quarantine 兜底',
  '上一版 v1.3.4 亮点: 主站发 STARTDT ACT 后等待 STARTDT CON 再发 I 帧 (§5.3 合规) + 配合子站序号修复, 严格子站不再 RST',
  '上一版 v1.3.3 亮点: 主站 TLS 无条件关闭 hostname 校验 (现场证书 CN 多为设备序列号), CA 链信任仍按 accept_invalid_certs 控制',
]
