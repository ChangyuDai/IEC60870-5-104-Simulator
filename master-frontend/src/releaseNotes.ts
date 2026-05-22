export const APP_NAME = 'IEC104 Master'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '新增 IEC 104 时序参数自动纠正: t1/t2/t3/k/w 强制满足 t2<t1<t3、w≤⌊2k/3⌋, 新建/编辑连接时以 t1/k 为锚即时修正非法组合并提示',
  '导入含非法时序的旧配置会自动修正, 并弹出改动明细',
  '后端在所有入口权威规范化, 再也无法保存会误断健康连接的非法时序组合',
]
