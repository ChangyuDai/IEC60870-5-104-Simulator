export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '8 万点位总召唤不再超时: GI/CI 启用 SQ=1 连续打包 + spawn 独立 generator task, 实测 80k 点 ~2.6s 完成 (主站收到 I 帧从 80,000 压到 ~3,500)',
  'IEC 60870-5-104 k/w 窗口流控落地: sender 在未确认帧达 k 时阻塞, receiver 累计 w 时主动回 S 帧, 新增 S 帧解析分支',
  '远动运行参数体系全栈接通: 13 项 RemoteOperationConfig + ProtocolTimingConfig (t0/t1/t2/t3/k/w), 侧边可折叠面板 + RemoteParamsModal 弹窗',
  'CP56Time2a / CP24Time2a 时标编码 + NA↔TB 互转, gi_include_timestamped 可补发同 IOA 的时标变体',
  '新增固定变位后台任务: 按 period_ms 周期翻转指定 IOA, 用于模拟现场扰动',
  'Updater 中国大陆 proxy fallback: ghfast.top / gh-proxy.com / gh.idayer.com 三层兜底 + 镜像下载页引导',
  '修复 SBO 单点命令 execute ack COT 不再恒为 7, 按 execute_ack_cot 配置返回 (默认 10 = ActivationTermination)',
]
