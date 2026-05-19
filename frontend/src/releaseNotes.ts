export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '更新弹窗彻底重写: 改用 Catppuccin 深色主题, release notes 富格式渲染 (标题/项目符号/加粗/行内代码), 不再是白底弹窗 + Markdown 原文',
  '子站数据点表改用增量轮询: 新增 list_data_points_since, 静止时每轮回传 0 个点, 不再每 2 秒全量拉取 80000 个点',
  '修正数据点表行 key 重复 (同 IOA 挂多种 ASDU 类型) 导致的选中/编辑/高亮串行渲染错乱',
  '高频路径优化: onScroll rAF 合帧、轮询并发保护、日志面板 :key 稳定化、清理死代码',
  '发版 CI 加固 (gh release upload 加重试) + 仓库 URL 迁移到 Karl-Dai',
]
