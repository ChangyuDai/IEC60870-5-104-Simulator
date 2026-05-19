export const APP_NAME = 'IEC104 Master'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '更新弹窗彻底重写: 改用 Catppuccin 深色主题, release notes 富格式渲染, 不再是白底弹窗 + Markdown 原文',
  '日志面板 v-for :key 由列表下标改为稳定前向索引, 新日志插入头部时不再整列重渲染',
  '发版 CI 加固: gh release upload --clobber 加重试, 杜绝并行竞态 404 拖垮构建',
  '仓库 URL 由旧用户名 Carl-Dai 迁移到 Karl-Dai',
  '上一版 v1.3.8 亮点: 子站仅在 STARTDT 激活后才发送周期/突发 I 帧, 修复主站序号失步',
]
