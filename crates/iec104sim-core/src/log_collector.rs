use crate::log_entry::{Direction, LogEntry};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Maximum number of log entries to keep in memory.
const MAX_LOG_ENTRIES: usize = 10000;

/// A thread-safe communication log collector.
///
/// Collects IEC 104 communication events from slave and master engines,
/// maintaining a buffer of up to 10000 entries.
#[derive(Debug, Clone)]
pub struct LogCollector {
    entries: Arc<RwLock<Vec<LogEntry>>>,
    enabled: Arc<AtomicBool>,
}

impl Default for LogCollector {
    fn default() -> Self {
        Self::new()
    }
}

impl LogCollector {
    pub fn new() -> Self {
        Self {
            entries: Arc::new(RwLock::new(Vec::new())),
            enabled: Arc::new(AtomicBool::new(true)),
        }
    }

    #[inline]
    pub fn is_enabled(&self) -> bool {
        self.enabled.load(Ordering::Relaxed)
    }

    pub fn set_enabled(&self, enabled: bool) {
        self.enabled.store(enabled, Ordering::Relaxed);
    }

    /// Add a log entry.
    pub async fn add(&self, mut entry: LogEntry) {
        if !self.is_enabled() { return; }
        enrich_detail(&mut entry);
        let mut entries = self.entries.write().await;
        if entries.len() >= MAX_LOG_ENTRIES {
            entries.remove(0);
        }
        entries.push(entry);
    }

    /// Add a log entry (blocking version).
    pub fn add_blocking(&self, mut entry: LogEntry) {
        if !self.is_enabled() { return; }
        enrich_detail(&mut entry);
        let mut entries = self.entries.blocking_write();
        if entries.len() >= MAX_LOG_ENTRIES {
            entries.remove(0);
        }
        entries.push(entry);
    }

    /// Add a log entry (non-blocking, safe to call from sync code within async runtime).
    pub fn try_add(&self, mut entry: LogEntry) {
        if !self.is_enabled() { return; }
        enrich_detail(&mut entry);
        if let Ok(mut entries) = self.entries.try_write() {
            if entries.len() >= MAX_LOG_ENTRIES {
                entries.remove(0);
            }
            entries.push(entry);
        }
    }

    /// Get all log entries.
    pub async fn get_all(&self) -> Vec<LogEntry> {
        self.entries.read().await.clone()
    }

    /// Get all log entries (blocking version).
    pub fn get_all_blocking(&self) -> Vec<LogEntry> {
        self.entries.blocking_read().clone()
    }

    /// Get the most recent `n` entries.
    pub async fn get_recent(&self, n: usize) -> Vec<LogEntry> {
        let entries = self.entries.read().await;
        let start = entries.len().saturating_sub(n);
        entries[start..].to_vec()
    }

    /// Clear all log entries.
    pub async fn clear(&self) {
        self.entries.write().await.clear();
    }

    /// Clear all log entries (blocking version).
    pub fn clear_blocking(&self) {
        self.entries.blocking_write().clear();
    }

    /// Export all entries to CSV format.
    pub async fn export_csv(&self) -> String {
        let entries = self.entries.read().await;
        let mut output = String::new();
        output.push_str(LogEntry::csv_header());
        output.push('\n');
        for entry in entries.iter() {
            output.push_str(&entry.to_csv_row());
            output.push('\n');
        }
        output
    }

    /// Export all entries to plain text format.
    pub async fn export_text(&self) -> String {
        let entries = self.entries.read().await;
        let mut output = String::new();
        for entry in entries.iter() {
            let timestamp = entry.timestamp.format("%Y-%m-%d %H:%M:%S%.3f");
            let dir = match entry.direction {
                Direction::Rx => "RX",
                Direction::Tx => "TX",
            };
            output.push_str(&format!(
                "[{}] {} {} - {}\n",
                timestamp, dir, entry.frame_label.name(), entry.detail
            ));
        }
        output
    }

    /// Get the current number of entries.
    pub async fn len(&self) -> usize {
        self.entries.read().await.len()
    }

    /// Check if the collector is empty.
    pub async fn is_empty(&self) -> bool {
        self.entries.read().await.is_empty()
    }
}

/// 给单对象数据帧的日志在汇总头后追加解析出的具体值(IOA/值/品质/时标)。
///
/// 一处覆盖主/子站、收/发的所有 I 帧数据日志(它们都带 `raw_bytes`):
///   - 无 `raw_bytes`(连接事件等)→ 原样;
///   - 多对象帧 / U / S / 解析失败 → `format_single_object_detail` 返回 `None`,原样;
///   - detail 已含增强分隔符 `▸` → 幂等跳过,不二次追加。
fn enrich_detail(entry: &mut LogEntry) {
    if entry.detail.contains('▸') {
        return;
    }
    let Some(raw) = entry.raw_bytes.as_ref() else { return };
    if let Some(values) = crate::decode::format_single_object_detail(raw) {
        entry.detail.push_str(" ▸ ");
        entry.detail.push_str(&values);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::log_entry::FrameLabel;

    #[tokio::test]
    async fn test_log_collector_basic() {
        let collector = LogCollector::new();
        assert!(collector.is_empty().await);

        let entry = LogEntry::new(Direction::Rx, FrameLabel::GeneralInterrogation, "GI CA=1");
        collector.add(entry).await;

        assert_eq!(collector.len().await, 1);
    }

    #[tokio::test]
    async fn test_log_collector_max_entries() {
        let collector = LogCollector::new();
        let max = MAX_LOG_ENTRIES;

        for i in 0..(max + 100) {
            let entry = LogEntry::new(
                Direction::Rx,
                FrameLabel::IFrame("M_SP_NA_1".to_string()),
                format!("IOA {} val=1", i),
            );
            collector.add(entry).await;
        }

        assert_eq!(collector.len().await, max);
    }

    #[tokio::test]
    async fn test_clear() {
        let collector = LogCollector::new();
        let entry = LogEntry::new(Direction::Rx, FrameLabel::GeneralInterrogation, "GI");
        collector.add(entry).await;
        assert_eq!(collector.len().await, 1);

        collector.clear().await;
        assert!(collector.is_empty().await);
    }

    /// 单对象数据帧:汇总头后追加具体值。
    fn m_me_nc_single() -> Vec<u8> {
        // M_ME_NC_1 IOA=1 float=1.5 QDS=0
        let mut bytes = vec![0x68, 0x10, 0x00, 0x00, 0x00, 0x00];
        bytes.extend_from_slice(&[0x0D, 0x01, 0x03, 0x00, 0x01, 0x00]);
        bytes.extend_from_slice(&[0x01, 0x00, 0x00]);
        bytes.extend_from_slice(&1.5f32.to_le_bytes());
        bytes.push(0x00);
        bytes
    }

    #[tokio::test]
    async fn add_appends_single_object_values_to_detail() {
        let collector = LogCollector::new();
        collector.add(LogEntry::with_raw_bytes(
            Direction::Rx, FrameLabel::IFrame("M_ME_NC_1".into()),
            "M_ME_NC_1 CA=1 n=1 COT=3 SQ=0", m_me_nc_single(),
        )).await;
        let logs = collector.get_all().await;
        assert_eq!(logs[0].detail, "M_ME_NC_1 CA=1 n=1 COT=3 SQ=0 ▸ IOA=1 val=1.500000 q=OK");
    }

    #[tokio::test]
    async fn multi_object_and_no_raw_detail_unchanged() {
        let collector = LogCollector::new();
        // 多对象 SQ 帧 → 不增强(仅汇总)
        let mut multi = vec![0x68, 0x0E, 0x00, 0x00, 0x00, 0x00];
        multi.extend_from_slice(&[0x01, 0x83, 0x14, 0x00, 0x01, 0x00]);
        multi.extend_from_slice(&[0x0A, 0x00, 0x00]);
        multi.extend_from_slice(&[0x01, 0x00, 0x01]);
        collector.add(LogEntry::with_raw_bytes(
            Direction::Rx, FrameLabel::IFrame("M_SP_NA_1".into()),
            "M_SP_NA_1 CA=1 n=3 COT=20 SQ=1", multi,
        )).await;
        // 无 raw_bytes → 不增强
        collector.add(LogEntry::new(
            Direction::Tx, FrameLabel::GeneralInterrogation, "GI CA=1",
        )).await;
        let logs = collector.get_all().await;
        assert_eq!(logs[0].detail, "M_SP_NA_1 CA=1 n=3 COT=20 SQ=1");
        assert_eq!(logs[1].detail, "GI CA=1");
    }

    #[tokio::test]
    async fn enrich_is_idempotent() {
        // detail 已含增强分隔符 → 不再二次追加
        let collector = LogCollector::new();
        collector.add(LogEntry::with_raw_bytes(
            Direction::Rx, FrameLabel::IFrame("M_ME_NC_1".into()),
            "pre ▸ IOA=1 val=already", m_me_nc_single(),
        )).await;
        let logs = collector.get_all().await;
        assert_eq!(logs[0].detail, "pre ▸ IOA=1 val=already");
    }
}
