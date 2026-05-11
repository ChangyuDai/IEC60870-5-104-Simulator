use rsa::pkcs1::DecodeRsaPrivateKey;
use rsa::pkcs8::{EncodePrivateKey, LineEnding};

/// 读取客户端/服务端私钥 PEM 文件,统一规范化为 PKCS#8 PEM 字节,
/// 以便交给 native-tls 的 `Identity::from_pkcs8`。
///
/// - `-----BEGIN PRIVATE KEY-----` (PKCS#8): 原样返回
/// - `-----BEGIN RSA PRIVATE KEY-----` (PKCS#1): 解码后重新编码为 PKCS#8
/// - 其它(EC/加密/未知): 返回明确错误
pub fn load_key_as_pkcs8_pem(path: &str) -> Result<Vec<u8>, String> {
    let pem = std::fs::read_to_string(path)
        .map_err(|e| format!("读取密钥失败 {}: {}", path, e))?;

    if pem.contains("-----BEGIN PRIVATE KEY-----") {
        return Ok(pem.into_bytes());
    }

    if pem.contains("-----BEGIN RSA PRIVATE KEY-----") {
        let rsa_key = rsa::RsaPrivateKey::from_pkcs1_pem(&pem)
            .map_err(|e| format!("解析 PKCS#1 RSA 私钥失败 {}: {}", path, e))?;
        let pkcs8 = rsa_key
            .to_pkcs8_pem(LineEnding::LF)
            .map_err(|e| format!("转换 PKCS#1 → PKCS#8 失败 {}: {}", path, e))?;
        return Ok(pkcs8.as_bytes().to_vec());
    }

    if pem.contains("-----BEGIN ENCRYPTED PRIVATE KEY-----") {
        return Err(format!("不支持加密的私钥 {}: 请先解密为明文 PKCS#8/PKCS#1 PEM", path));
    }

    if pem.contains("-----BEGIN EC PRIVATE KEY-----") {
        return Err(format!(
            "不支持 SEC1 EC 私钥 {}: 请用 `openssl pkcs8 -topk8 -nocrypt -in <key>` 转为 PKCS#8 PEM",
            path
        ));
    }

    Err(format!("无法识别的私钥格式 {}: 仅支持 PKCS#1 / PKCS#8 PEM", path))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    fn write_tmp(content: &str) -> tempfile::NamedTempFile {
        let mut f = tempfile::NamedTempFile::new().unwrap();
        f.write_all(content.as_bytes()).unwrap();
        f
    }

    fn gen_pkcs1_pem() -> String {
        use rsa::pkcs1::EncodeRsaPrivateKey;
        let mut rng = rand::rngs::OsRng;
        let key = rsa::RsaPrivateKey::new(&mut rng, 2048).unwrap();
        key.to_pkcs1_pem(LineEnding::LF).unwrap().to_string()
    }

    fn gen_pkcs8_pem() -> String {
        let mut rng = rand::rngs::OsRng;
        let key = rsa::RsaPrivateKey::new(&mut rng, 2048).unwrap();
        key.to_pkcs8_pem(LineEnding::LF).unwrap().to_string()
    }

    #[test]
    fn pkcs1_is_converted_to_pkcs8() {
        let pkcs1 = gen_pkcs1_pem();
        assert!(pkcs1.starts_with("-----BEGIN RSA PRIVATE KEY-----"));
        let f = write_tmp(&pkcs1);
        let out = load_key_as_pkcs8_pem(f.path().to_str().unwrap()).unwrap();
        let s = String::from_utf8(out).unwrap();
        assert!(s.starts_with("-----BEGIN PRIVATE KEY-----"), "got: {}", s);
        // 应能被 PKCS#8 解码器重新解析
        use rsa::pkcs8::DecodePrivateKey;
        rsa::RsaPrivateKey::from_pkcs8_pem(&s).unwrap();
    }

    #[test]
    fn pkcs8_is_passed_through() {
        let pkcs8 = gen_pkcs8_pem();
        let f = write_tmp(&pkcs8);
        let out = load_key_as_pkcs8_pem(f.path().to_str().unwrap()).unwrap();
        assert_eq!(out, pkcs8.as_bytes());
    }

    #[test]
    fn missing_file_returns_error_with_path() {
        let err = load_key_as_pkcs8_pem("/definitely/not/a/real/path.key").unwrap_err();
        assert!(err.contains("/definitely/not/a/real/path.key"));
    }

    #[test]
    fn unknown_format_is_rejected() {
        let f = write_tmp("-----BEGIN CERTIFICATE-----\nMIIB...\n-----END CERTIFICATE-----\n");
        let err = load_key_as_pkcs8_pem(f.path().to_str().unwrap()).unwrap_err();
        assert!(err.contains("无法识别的私钥格式"));
    }
}
