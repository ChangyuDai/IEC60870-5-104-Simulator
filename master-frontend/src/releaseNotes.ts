export const APP_NAME = 'IEC104 Master'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '子站修复: 主站发出 STARTDT 之前子站不再发送周期/突发 I 帧, 消除主站接收序号永久失步与持续的 "unexpted I-Frame ns" 报错',
  '子站新增 per-connection 数据传输状态机: 上送仅在 STARTDT_ACT 激活后、STOPDT_ACT 之前进行',
  '新增 startdt_gating 回归测试: 验证 STARTDT 前子站零 I 帧上送、STARTDT 后恢复正常',
  '上一版 v1.3.7 亮点: 两个前端共享代码合并 (shared-frontend/, 净删 ~2700 行) + Catppuccin 色板 token 化 + Toolbar 拆分',
]
