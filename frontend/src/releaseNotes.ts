export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '多选数据点后可批量改品质: 详情面板一键设 IV/NT/SB/BL/OV (类型无关, OV 仅测量类)',
  '多选同分类点可批量写同一个值; 跨分类自动禁用并提示, 批量写值原子 (全或无)',
  '修复数据表品质列与表头错位, 改为左对齐 (与主站一致)',
]
