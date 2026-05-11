export const APP_NAME = 'IEC104 Master'
export const REPO_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator'
export const RELEASES_URL = 'https://github.com/Carl-Dai/IEC60870-5-104-Simulator/releases'

// Keep in sync with CHANGELOG.md — see `release` skill.
export const RELEASE_NOTES: string[] = [
  'TLS 私钥自动兼容 PKCS#1 (BEGIN RSA PRIVATE KEY): 现场签出的客户端密钥常是 PKCS#1, 此前必须 openssl pkcs8 -topk8 转换才能用; 现在主站连接 TLS 子站时, 后端识别到 PKCS#1 会自动在内存里转成 PKCS#8 再交给 native-tls, PKCS#8 原样透传, 加密私钥/EC SEC1 给出明确错误提示',
  'GitHub Release 新增 Windows 便携版: 直接下载 IEC104Master_1.3.1_x64-portable.exe 双击即用, 不写注册表, 适合 U 盘 / 免安装场景 (依赖 WebView2 Runtime, Win10 22H2+ / Win11 自带)',
  '修复: 新建连接对话框默认证书路径与 LEGACY_CERTS 迁移列表里残留的开发者本机绝对路径已清理, 默认回归到稳定的 ./ca.pem / ./client.pem / ./client-key.pem',
  '新增 4 项 tls_key 单元测试: 覆盖 PKCS#1 → PKCS#8 真实转换链路 + PKCS#8 原样透传 + 文件不存在 + 未知 PEM 格式被拒绝',
  '上一版 v1.3.0 亮点: 报文解析器双端可用, 日志面板关闭时热路径跳过 format!() 字符串构造',
]
