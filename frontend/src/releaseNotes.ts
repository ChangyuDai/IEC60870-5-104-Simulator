export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '远动运行参数面板重设计: 拆为「链路参数 / 召唤与应答 / 数据上送方式 / 变位仿真」4 块卡片, t0..w 改为 2×3 紧凑网格并附用途 hint',
  '统一「保存全部」按钮 + dirty 检测: 顶部 sticky 头取代每段独立「应用」, 有改动时按钮变蓝并露出「放弃」, 保存成功短暂提示「已保存」',
  '固定变位「启动/停止」加 hover 语义色 (启动→绿, 停止→红) + 运行状态 mono 字 + 脉冲点 (空闲灰 / 运行中绿色脉冲)',
  'Modal 启停 toggle 修复键盘可达性: 原 display:none 改为 visually-hidden + :focus-within 焦点环, Tab 可达 / Space 可切 / 屏幕阅读器可读',
  '清理: 删除 RemoteParamsPanel.vue 中重复的死代码 watch([timing,ops]); savedFlash setTimeout 加卸载与重复保存防叠加; saveLabel 提为 computed',
]
