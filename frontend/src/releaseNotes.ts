export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '跟随主站发版: 本次主要修复在主站 TLS — 工程现场服务端证书 CN 通常是设备序列号、SAN 常缺失, 主站连接现在默认关掉 hostname 校验, CA 链信任仍按 accept_invalid_certs 控制',
  '上一版 v1.3.2 亮点: GitHub Release 覆盖 Windows ARM64 (Surface Pro X / Snapdragon X / Win11-ARM)',
  '上一版 v1.3.1 亮点: TLS 私钥自动兼容 PKCS#1 (BEGIN RSA PRIVATE KEY), 子站 native-tls 加载链路新增 PKCS#1 → PKCS#8 自动转换',
]
