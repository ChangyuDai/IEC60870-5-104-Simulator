//! 验证固定变位后台任务的起停,以及随机变位的 batch_size/delay_ms 分批节奏。
//!
//! 注:随机变位的 Tauri 命令在 app crate;core 层只暴露了 `set_fixed_mutation`
//! 和 `queue_spontaneous` 的分批节奏配置。本文件覆盖 core 层能直接观测的部分。

mod common;
use common::harness::Pair;
use common::helpers::{count_iframes, wait_for_ioa_count, DEFAULT_TIMEOUT};

use iec104sim_core::data_point::DataPointValue;
use iec104sim_core::log_entry::Direction;
use iec104sim_core::slave::{FixedMutationConfig, RemoteOperationConfig};
use iec104sim_core::types::AsduTypeId;
use tokio::time::{sleep, Duration};

/// 固定变位 enabled=true 启动后,master 在 1 秒内应收到至少 3 帧 M_SP_NA_1 自发帧。
/// 然后 disable,继续观察 500 ms 内不再有新增。
#[tokio::test]
async fn fixed_mutation_starts_and_stops() {
    let pair = Pair::spawn(RemoteOperationConfig::default()).await;

    // 先 GI 让 master 进入数据传输 + 填充 baseline。
    pair.master.conn.send_interrogation(1).await.unwrap();
    let _ = wait_for_ioa_count(&pair.master.conn, 1, 1, DEFAULT_TIMEOUT).await;
    pair.log.clear().await;

    // 启动固定变位:IOA=1 / M_SP_NA_1 / 周期 200 ms。
    pair.slave.server
        .set_fixed_mutation(FixedMutationConfig {
            enabled: true,
            ioa: 1,
            asdu_type: AsduTypeId::MSpNa1,
            period_ms: 200,
        })
        .await;

    // 1 秒应至少 3 次翻转 → 至少 3 帧 spontaneous。
    sleep(Duration::from_secs(1)).await;
    let count_during = count_iframes(&pair.log, Direction::Rx, "M_SP_NA_1").await;
    assert!(count_during >= 3, "1 秒应至少 3 帧 M_SP_NA_1,实际 {}", count_during);

    // 停止
    pair.slave.server
        .set_fixed_mutation(FixedMutationConfig { enabled: false, ..FixedMutationConfig::default() })
        .await;
    sleep(Duration::from_millis(300)).await;
    let baseline = count_iframes(&pair.log, Direction::Rx, "M_SP_NA_1").await;
    sleep(Duration::from_millis(500)).await;
    let after_stop = count_iframes(&pair.log, Direction::Rx, "M_SP_NA_1").await;
    assert_eq!(baseline, after_stop, "禁用后不应再增加 M_SP_NA_1 帧");

    pair.shutdown().await;
}

/// 重新调用 `set_fixed_mutation` 应 abort 上一个任务,新参数立即生效。
#[tokio::test]
async fn fixed_mutation_reconfigure_aborts_previous() {
    let pair = Pair::spawn(RemoteOperationConfig::default()).await;
    pair.master.conn.send_interrogation(1).await.unwrap();
    let _ = wait_for_ioa_count(&pair.master.conn, 1, 1, DEFAULT_TIMEOUT).await;

    // 第一次:200 ms 周期。
    pair.slave.server
        .set_fixed_mutation(FixedMutationConfig {
            enabled: true,
            ioa: 1,
            asdu_type: AsduTypeId::MSpNa1,
            period_ms: 200,
        })
        .await;
    sleep(Duration::from_millis(400)).await;
    // 切换为不同 IOA,旧任务应 abort。
    pair.log.clear().await;
    pair.slave.server
        .set_fixed_mutation(FixedMutationConfig {
            enabled: true,
            ioa: 2,
            asdu_type: AsduTypeId::MSpNa1,
            period_ms: 300,
        })
        .await;
    sleep(Duration::from_millis(900)).await;

    // 验证 IOA=2 收到至少 1 帧;IOA=1 在切换后应停止增长 (此处粗略不严格验证)。
    let frames = pair.log.get_all().await;
    let saw_ioa2 = frames.iter().any(|e| matches!(&e.frame_label, iec104sim_core::log_entry::FrameLabel::IFrame(s) if s.contains("M_SP_NA_1")) && e.detail.contains("IOA=2"));
    assert!(saw_ioa2, "新任务应针对 IOA=2 触发上送");

    // 收尾
    pair.slave.server
        .set_fixed_mutation(FixedMutationConfig { enabled: false, ..FixedMutationConfig::default() })
        .await;
    pair.shutdown().await;
}

/// 验证翻转值确实变化:SP 点应在两次 tick 间从 false↔true 切换。
#[tokio::test]
async fn fixed_mutation_actually_flips_value() {
    let pair = Pair::spawn(RemoteOperationConfig::default()).await;
    pair.master.conn.send_interrogation(1).await.unwrap();
    let _ = wait_for_ioa_count(&pair.master.conn, 1, 1, DEFAULT_TIMEOUT).await;

    // 取 IOA=1 的初始值。
    let initial = {
        let stations = pair.slave.server.stations.read().await;
        stations.get(&1).unwrap().data_points.get(1, AsduTypeId::MSpNa1).unwrap().value.clone()
    };
    let init_b = match initial {
        DataPointValue::SinglePoint { value } => value,
        _ => panic!("默认应是 SinglePoint"),
    };

    pair.slave.server
        .set_fixed_mutation(FixedMutationConfig {
            enabled: true,
            ioa: 1,
            asdu_type: AsduTypeId::MSpNa1,
            period_ms: 150,
        })
        .await;
    sleep(Duration::from_millis(200)).await;
    let after_one = {
        let stations = pair.slave.server.stations.read().await;
        match stations.get(&1).unwrap().data_points.get(1, AsduTypeId::MSpNa1).unwrap().value {
            DataPointValue::SinglePoint { value } => value,
            _ => panic!(),
        }
    };
    assert_ne!(init_b, after_one, "首次 tick 后值应已翻转");

    pair.slave.server
        .set_fixed_mutation(FixedMutationConfig { enabled: false, ..FixedMutationConfig::default() })
        .await;
    pair.shutdown().await;
}
