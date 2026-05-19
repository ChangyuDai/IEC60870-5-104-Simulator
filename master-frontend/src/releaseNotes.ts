export const APP_NAME = 'IEC104 Master'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '根除发版 CI 反复出现的资产上传 404 失败: 关闭 tauri-action 冗余的 latest.json, 消除并行 matrix job 抢传同名文件的竞态',
  '发版流程进一步收紧: publish-manifest 首步即转正, 更新清单脚本全程对已发布 release 运行',
  '上一版 v1.3.10 亮点: 发版构建期间 release 保持草稿, 旧版应用"检查更新"不再受 CI 窗口期影响',
]
