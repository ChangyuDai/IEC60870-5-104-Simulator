export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '修复子站在主站发出 STARTDT 之前就发送周期/突发 I 帧的问题: 此前连接一建立就上送, 主站在 STOPPED 态丢弃且不计数, 导致子站 N(S) 永久超前并持续报 "unexpted I-Frame ns"',
  '新增 per-connection 数据传输状态机: 周期与突发上送仅在 STARTDT_ACT 激活后、STOPDT_ACT 之前发送',
  '新增 startdt_gating 回归测试: 验证 STARTDT 前子站零 I 帧上送、STARTDT 后恢复正常',
  '上一版 v1.3.7 亮点: 两个前端共享代码合并 (shared-frontend/, 净删 ~2700 行) + Catppuccin 色板 token 化 + Toolbar 拆分',
]
