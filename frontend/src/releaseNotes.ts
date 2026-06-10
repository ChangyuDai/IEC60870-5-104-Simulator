export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '周期变位下沉到点位: 数据表里右键选中点位即可启停周期变位 (行内脉冲指示, 支持多点并发独立启停), 取代原独立「固定变位」面板; 类型/IOA 取自点位本身, 根治旧面板因 ASDU 类型串与后端 serde 名不匹配而从未生效的问题',
  '修复 socket 泄漏: 子站读循环检测到对端断开 (EOF) 后通知写任务退出释放 socket, 杜绝空闲连接停在 CLOSE_WAIT 累积 FD 泄漏 (此前累积到上限后会 accept 失败、新主站连不上)',
  '通信日志更完整: 体现单对象数据帧的解析值; 主站收到 TESTFR ACT 回发 TESTFR CON 时补记发送日志',
  '本版主站另有: 掉线后按 T0 间隔自动重连, 详见 CHANGELOG.md',
  '新增自建加速更新源: gh.daichangyu.com (新加坡服务器 nginx 反代 GitHub, 含 302 改写让安装包下载也走加速) 作为更新源第一顺位, 国内更新稳定约 1.8MB/s 且可控, 不再赌免费镜像; 仍需装上本版后后续更新才走新源',
  '自动更新提速: 更新源 (updater.endpoints) 优先改用 GitHub 原始地址, 绕开带宽抽风的免费镜像 ghfast.top (此前排第一时曾把更新拖到 0.01MB/s 近乎卡死); 注意 endpoint 顺序固化在已装版本里, 装上本版后后续更新才走新顺序',
  '短浮点显示精度提升至 6 位小数: 数据表与报文解析器中 short float (M_ME_NC / M_ME_TF / C_SE_NC) 由 3 位改为 6 位',
  '本版主站另有: 计量召唤改为按 CA 选择、移除「广播对时」前端入口 (后端广播对时命令保留), 详见 CHANGELOG.md',
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
