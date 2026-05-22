export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '新增 IEC 104 时序参数自动纠正: t1/t2/t3/k/w 强制满足 t2<t1<t3、w≤⌊2k/3⌋, 远动参数表单以 t1/k 为锚即时修正并提示, 导入旧的非法配置自动修正',
  '变位带时标 (TB) 同步改为按分类逐类开关: SP/DP/ST/BO/ME_NA/ME_NB/ME_NC 七类各自独立, 开启的分类在变位与总召唤时从 NA 点派生 TB 帧',
  '后端在所有入口权威规范化时序参数, 不可绕过',
]
