export const APP_NAME = 'IEC104 Master'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '新增「广播 ▾」拆分按钮: 一帧广播召唤全部从站, 含广播总召 / 广播对时 / 广播计量召唤三项',
  '广播公共地址可在新建/编辑连接对话框配置, 默认 0xFFFF, 支持 0xFF00 等厂商方言',
  '广播应答中未配置的公共地址 3 秒安静期后自动并入连接, 连接树即时刷新',
  '协议层零 Tauri 耦合: 通过 mpsc 把 flush 事件抛给 commands 层做 emit',
]
