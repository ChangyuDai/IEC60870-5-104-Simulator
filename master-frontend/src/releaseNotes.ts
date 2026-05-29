export const APP_NAME = 'IEC104 Master'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '数据表/详情面板的点位类型显示十进制 TypeID (如 M_SP_NA_1 · 1、M_ME_NC_1 · 13), 与命令类型下拉一致',
  'GitHub 图标 / 关于对话框的主页·Releases 链接点击改为直接打开系统浏览器 (非 Tauri 环境回退到复制链接)',
  '命令类型下拉显示十进制 TypeID: 发送控制命令对话框每个类型在缩写旁标出 IEC 104 TypeID (如 C_SC_NA_1 · 45), 对照报文/规约更直观',
  '广播 GI 响应更快: 未知 CA 聚批安静期 3s → 1s, 广播总召后连接树几乎即时刷新 (移除固定 3500ms 兜底定时器, 改由后端事件驱动)',
  '修复广播 GI 新学到的 CA 节点不出现: 新 CA 默认展开, 子分类正常渲染',
  '广播 GI 高峰内存优化: parse 热路径改读锁直接比较, 每帧少一次 CA 快照 clone',
  '修复切到点数更少的 CA/分类后数据表格空白',
  '[hotfix v1.10.3] 撤销 v1.10.2 的 N=0 跳过 (保留命令响应黑名单): 收到的 CA 都应在树里看到, 空节点本身就是从站协议异常的信号',
  '[hotfix v1.10.2] 未知 CA 学习跳过命令响应类型 (TypeID 100/101/103) 和 N=0 空数据帧',
  '[hotfix v1.10.1] 修复广播应答中未配置 CA 不进连接树: debouncer 学到的新 CA 没同步到 list_connections 暴露给前端的字段',
  '新增「广播 ▾」拆分按钮: 一帧广播召唤全部从站, 含广播总召 / 广播对时 / 广播计量召唤三项',
  '广播公共地址可在新建/编辑连接对话框配置, 默认 0xFFFF, 支持 0xFF00 等厂商方言',
  '广播应答中未配置的公共地址 3 秒安静期后自动并入连接, 连接树即时刷新',
  '新增单向被动接收模式 (正向隔离 / 只读): 链路完全沉默、永不主动断连, 用于电力二次安防场景',
  '单向连接禁用总召/命令/对时/控制按钮, 连接树显示「单向」徽标',
  '品质图例补 OK(正常)行, 说明无品质位置位的基线态',
]
