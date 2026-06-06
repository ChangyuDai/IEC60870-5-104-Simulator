export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '子站工具栏精简: 移除顶部「随机变化 / 周期发送」按钮及其 ms 间隔输入框',
  '子站总召唤 (GI) 不再上送累积量 (M_IT): 累积量仅由计数量召唤 (C_CI) 上送, 符合 IEC 60870-5-104 规约',
  '子站工具栏窄窗口优化: 操作按钮区横向滚动, 语言 / 版本 / 关于状态区常驻',
  '主站本版另有: 遥控三种控制模式 (仅执行/仅选择/自动两步)、归一化值改用原始整数 (NVA i16)、总召按 CA 选择, 详见 CHANGELOG.md',
  '本版本 Slave 端无功能改动; Master 端: TLS 证书路径编辑/存盘持久化修复、断开重连 TLS 握手超时 (Windows os error 10060 / macOS handshake interrupted) 修复, 详见 CHANGELOG.md',
  '证书路径修复: 子站读取证书/密钥/PKCS#12 前自动剥掉「复制为路径」带来的包裹引号与首尾空白, 根治 Windows 带引号路径报 os error 123',
  '本版本 Slave 端其余为 Master 改动 (单连接 RTU 重连修复、数据节点显示 ASDU TypeID), 详见 CHANGELOG.md',
  '本版本 Slave 端无功能改动; Master 端: 数据表/详情面板点位类型显示十进制 TypeID, 详见 CHANGELOG.md',
  'GitHub 图标 / 关于对话框的主页·Releases 链接点击改为直接打开系统浏览器 (非 Tauri 环境回退到复制链接)',
  'Master 端: 命令类型下拉显示十进制 TypeID, 广播 GI 响应提速 (debouncer 3s→1s, 去 3500ms 兜底), 修复新学 CA 节点不出现, 详见 CHANGELOG.md',
  '品质图例补 OK(正常)行, 说明无品质位置位的基线态',
]
