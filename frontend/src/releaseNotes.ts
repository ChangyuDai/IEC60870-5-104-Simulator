export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  'GitHub Release 现在覆盖 Windows ARM64: Surface Pro X / Snapdragon X / Win11-ARM 用户可下载 arm64-setup.exe (NSIS) / arm64_en-US.msi / arm64-portable.exe, Tauri updater 自动更新通道同步覆盖 windows-aarch64',
  '修复 v1.3.1 Windows 便携版没传上去 / Release 描述卡占位符: 上传 step 源路径写错 (productName 不是 cargo 产物名)。v1.3.2 起便携 EXE 齐齐到位',
  '上一版 v1.3.1 亮点: TLS 私钥自动兼容 PKCS#1 (BEGIN RSA PRIVATE KEY), 子站 native-tls 加载链路新增 PKCS#1 → PKCS#8 自动转换',
]
