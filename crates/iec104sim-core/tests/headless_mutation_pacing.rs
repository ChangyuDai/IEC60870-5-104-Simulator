//! 验证点位周期变位的起停、多点并发独立性,以及句柄登记 (list_point_mutations)。
//!
//! 注:周期变位的 Tauri 命令在 app crate;core 层暴露
//! `start_point_mutation` / `stop_point_mutation` / `list_point_mutations`。

mod common;
use common::harness::Pair;
use common::helpers::{count_iframes, wait_for_ioa_count, DEFAULT_TIMEOUT};

use iec104sim_core::data_point::DataPointValue;
use iec104sim_core::log_entry::Direction;
use iec104sim_core::slave::RemoteOperationConfig;
use iec104sim_core::types::AsduTypeId;
use tokio::time::{sleep, Duration};

/// 单点周期变位:启动后 1 秒内 master 应收到至少 3 帧 M_SP_NA_1 自发帧;
/// 停止后不再新增,且 list_point_mutations 清空。
#[tokio::test]
async fn point_mutation_starts_and_stops() {
    let pair = Pair::spawn(RemoteOperationConfig::default()).await;

    pair.master.conn.send_interrogation(1).await.unwrap();
    let _ = wait_for_ioa_count(&pair.master.conn, 1, 1, DEFAULT_TIMEOUT).await;
    pair.log.clear().await;

    pair.slave.server
        .start_point_mutation(1, 1, AsduTypeId::MSpNa1, 200)
        .await;
    assert_eq!(pair.slave.server.list_point_mutations().await.len(), 1);

    sleep(Duration::from_secs(1)).await;
    let count_during = count_iframes(&pair.log, Direction::Rx, "M_SP_NA_1").await;
    assert!(count_during >= 3, "1 秒应至少 3 帧 M_SP_NA_1,实际 {}", count_during);

    pair.slave.server.stop_point_mutation(1, 1, AsduTypeId::MSpNa1).await;
    assert!(pair.slave.server.list_point_mutations().await.is_empty());

    sleep(Duration::from_millis(300)).await;
    let baseline = count_iframes(&pair.log, Direction::Rx, "M_SP_NA_1").await;
    sleep(Duration::from_millis(500)).await;
    let after_stop = count_iframes(&pair.log, Direction::Rx, "M_SP_NA_1").await;
    assert_eq!(baseline, after_stop, "停止后不应再增加 M_SP_NA_1 帧");

    pair.shutdown().await;
}

/// 多点并发:IOA=1 与 IOA=2 同时变位,各自独立产生帧;停 IOA=1 后,
/// IOA=2 继续而 IOA=1 停止增长。
#[tokio::test]
async fn multi_point_mutation_independent() {
    let pair = Pair::spawn(RemoteOperationConfig::default()).await;
    pair.master.conn.send_interrogation(1).await.unwrap();
    let _ = wait_for_ioa_count(&pair.master.conn, 1, 2, DEFAULT_TIMEOUT).await;

    pair.slave.server.start_point_mutation(1, 1, AsduTypeId::MSpNa1, 150).await;
    pair.slave.server.start_point_mutation(1, 2, AsduTypeId::MSpNa1, 150).await;
    assert_eq!(pair.slave.server.list_point_mutations().await.len(), 2);

    let count_ioa = |frames: &Vec<iec104sim_core::log_entry::LogEntry>, ioa: &str| {
        frames.iter().filter(|e| {
            matches!(&e.frame_label, iec104sim_core::log_entry::FrameLabel::IFrame(s) if s.contains("M_SP_NA_1"))
                && e.detail.contains(ioa)
        }).count()
    };

    sleep(Duration::from_millis(600)).await;
    let frames = pair.log.get_all().await;
    assert!(count_ioa(&frames, "IOA=1") >= 2, "IOA=1 应已多次变位");
    assert!(count_ioa(&frames, "IOA=2") >= 2, "IOA=2 应已多次变位");

    // 停 IOA=1,保留 IOA=2。
    pair.slave.server.stop_point_mutation(1, 1, AsduTypeId::MSpNa1).await;
    let active = pair.slave.server.list_point_mutations().await;
    assert_eq!(active, vec![(1u16, 2u32, AsduTypeId::MSpNa1)]);

    pair.log.clear().await;
    sleep(Duration::from_millis(600)).await;
    let frames2 = pair.log.get_all().await;
    assert_eq!(count_ioa(&frames2, "IOA=1"), 0, "停止后 IOA=1 不应再变位");
    assert!(count_ioa(&frames2, "IOA=2") >= 2, "IOA=2 应继续变位");

    pair.slave.server.stop_point_mutation(1, 2, AsduTypeId::MSpNa1).await;
    pair.shutdown().await;
}

/// 翻转值确实变化:SP 点首次 tick 后从 false↔true 切换。
#[tokio::test]
async fn point_mutation_actually_flips_value() {
    let pair = Pair::spawn(RemoteOperationConfig::default()).await;
    pair.master.conn.send_interrogation(1).await.unwrap();
    let _ = wait_for_ioa_count(&pair.master.conn, 1, 1, DEFAULT_TIMEOUT).await;

    let init_b = {
        let stations = pair.slave.server.stations.read().await;
        match stations.get(&1).unwrap().data_points.get(1, AsduTypeId::MSpNa1).unwrap().value {
            DataPointValue::SinglePoint { value } => value,
            _ => panic!("默认应是 SinglePoint"),
        }
    };

    pair.slave.server.start_point_mutation(1, 1, AsduTypeId::MSpNa1, 150).await;
    sleep(Duration::from_millis(200)).await;
    let after_one = {
        let stations = pair.slave.server.stations.read().await;
        match stations.get(&1).unwrap().data_points.get(1, AsduTypeId::MSpNa1).unwrap().value {
            DataPointValue::SinglePoint { value } => value,
            _ => panic!(),
        }
    };
    assert_ne!(init_b, after_one, "首次 tick 后值应已翻转");

    pair.slave.server.stop_point_mutation(1, 1, AsduTypeId::MSpNa1).await;
    pair.shutdown().await;
}
