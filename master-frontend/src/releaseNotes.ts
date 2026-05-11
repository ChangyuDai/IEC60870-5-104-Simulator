export const APP_NAME = 'IEC104 Master'
export const REPO_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  '主站连接 TLS 子站时无条件关闭 hostname 校验: 真实现场的服务端证书 CN 通常是设备序列号、SAN 也常缺失, 严格 hostname 匹配几乎从不成立。现在默认关掉 hostname 检查, CA 链信任仍按 accept_invalid_certs 控制, 自签 CA 场景可以保持严格链验证又不必把每个设备序列号加进 SAN',
  '上一版 v1.3.2 亮点: GitHub Release 覆盖 Windows ARM64 (Surface Pro X / Snapdragon X / Win11-ARM), 修复 v1.3.1 Windows 便携 EXE 没传 + Release body 占位符问题, 修复主站右键编辑连接因兄弟 provide 失效而无响应',
  '上一版 v1.3.1 亮点: TLS 私钥自动兼容 PKCS#1 (BEGIN RSA PRIVATE KEY), 主子站 native-tls 加载链路新增 PKCS#1 → PKCS#8 自动转换',
]
