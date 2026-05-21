export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '批量添加点位新增「已有点位汇总卡片」: 实时显示当前类型已有 IOA 范围 (压缩为 0–2, 5, 7–8 形式) 与冲突详情',
  '批量添加新增「↓ 下一个可用 IOA」「↦ 跳到能放下的空隙」快捷按钮, 一键把起始 IOA 避让到不冲突的位置',
  '远动运行参数从常驻侧栏改为工具栏齿轮按钮触发的抽屉 (RemoteParamsDrawer), 主区域回收一列横向空间',
  '批量添加冲突文案改为「跳过」, 与后端「跳过已存在 IOA」实际行为一致',
  '测试扩展: 后端总召唤 8 类点位回归 + 首次引入前端组件挂载测试 (变化高亮 / 分类计数 / 切换不丢数据)',
]
