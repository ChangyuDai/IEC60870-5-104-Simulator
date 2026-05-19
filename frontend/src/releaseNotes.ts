export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '全部弹窗统一平滑开合动画: 新增共享 dialog-pop 过渡(遮罩淡入淡出 + 0.96→1 缩放), 9 个模态弹窗与更新弹窗统一接入, 遵循 prefers-reduced-motion',
  '底部日志区改为终端控制台条: 近黑背景 + 蓝色细发丝顶边 + 状态点(有报文为绿、空闲为暗灰)',
  '上一版 v1.3.11 亮点: 根除发版 CI 资产上传 404 竞态',
]
