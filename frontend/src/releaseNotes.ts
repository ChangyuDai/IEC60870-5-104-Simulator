export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '新增 M_ME_ND_1 (TypeID 21) 归一化无品质测量值: 可创建并编码为 2 字节裸值 NVA, 无品质字节、无时标',
  'ValuePanel 选中 M_ME_ND_1 点时隐藏全部品质开关, 改显「无品质 (N/A)」',
  '数据点类型下拉新增 M_ME_ND_1 选项',
]
