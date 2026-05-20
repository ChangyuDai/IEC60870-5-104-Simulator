export const APP_NAME = 'IEC104 Master'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '本版本为子站 UI 维护版本: 子站「远动运行参数」面板重设计为 4 块卡片 + 统一「保存全部」按钮 + dirty 检测',
  '主站二进制随版本同步升级, 协议栈与功能与 v1.4.0 保持一致, 无破坏性变更',
  '可继续连接 v1.4.x 子站, k/w 窗口流控、SQ=1 连续打包、远动运行参数体系等行为不变',
]
