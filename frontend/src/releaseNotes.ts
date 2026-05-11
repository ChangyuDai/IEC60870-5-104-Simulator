export const APP_NAME = 'IEC104 Slave'
export const REPO_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  'TLS 私钥自动兼容 PKCS#1 (BEGIN RSA PRIVATE KEY): 现场签出的客户端密钥常是 PKCS#1, 此前必须 openssl pkcs8 -topk8 转换才能用; 现在子站启动加载证书时, 后端识别到 PKCS#1 会自动在内存里转成 PKCS#8 再交给 native-tls, PKCS#8 原样透传, 加密私钥/EC SEC1 给出明确错误提示',
  'GitHub Release 新增 Windows 便携版: 直接下载 IEC104Slave_1.3.1_x64-portable.exe 双击即用, 不写注册表, 适合 U 盘 / 免安装场景 (依赖 WebView2 Runtime, Win10 22H2+ / Win11 自带)',
  '新增 4 项 tls_key 单元测试: 覆盖 PKCS#1 → PKCS#8 真实转换链路 + PKCS#8 原样透传 + 文件不存在 + 未知 PEM 格式被拒绝',
  '上一版 v1.3.0 亮点: 报文解析器双端可用 (粘贴 hex 即得 APCI / ASDU / IOA 可视化), 通信日志右键 "解析此报文"',
]
