export const APP_NAME = 'IEC104 Master'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '子站 8 万点位总召唤不再超时: GI/CI 启用 SQ=1 连续打包, 主站收到 I 帧从 80,000 压到 ~3,500, 实测 ~2.6s 完成',
  'IEC 60870-5-104 k/w 窗口流控落地于子站, 主站既有 k/w 实现与之对接更顺畅 (S 帧/ack_ssn 同步)',
  '远动运行参数体系: 子站新增 13 项 RemoteOperationConfig + ProtocolTimingConfig (t0/t1/t2/t3/k/w)',
  'CP56Time2a / CP24Time2a 时标编码到位, 子站可按 gi_include_timestamped 补发同 IOA 的时标变体',
  '新增子站固定变位后台任务, 按 period_ms 周期翻转指定 IOA',
  'Updater 中国大陆 proxy fallback: ghfast.top / gh-proxy.com / gh.idayer.com 三层兜底 + 镜像下载页引导',
]
