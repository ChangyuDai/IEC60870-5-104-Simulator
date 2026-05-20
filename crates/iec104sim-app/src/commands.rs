use crate::state::{AppState, DataPointInfo, IncrementalDataResponse, ServerInfo, SlaveServerState, StationInfo};
use iec104sim_core::data_point::{DataPoint, DataPointValue, InformationObjectDef};
use iec104sim_core::log_collector::LogCollector;
use iec104sim_core::log_entry::LogEntry;
use iec104sim_core::slave::{
    FixedMutationConfig, ProtocolTimingConfig, RemoteOperationConfig, SlaveServer,
    SlaveTransportConfig, Station,
};
use iec104sim_core::types::AsduTypeId;
use rand::Rng;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{AppHandle, Emitter, State};

// ---------------------------------------------------------------------------
// Event Payloads
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct ServerStateEvent {
    pub id: String,
    pub state: String,
}

// ---------------------------------------------------------------------------
// Server Commands
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct CreateServerRequest {
    pub bind_address: Option<String>,
    pub port: u16,
    pub init_mode: Option<String>,
    /// 默认 station 每个 ASDU 类型分类下的点数（缺省 10）。0 = 空站。
    pub count_per_category: Option<u32>,
    pub use_tls: Option<bool>,
    pub cert_file: Option<String>,
    pub key_file: Option<String>,
    pub ca_file: Option<String>,
    pub require_client_cert: Option<bool>,
    /// 可选:创建时直接附带协议时序参数。缺省时使用 SlaveServer 默认值。
    #[serde(default)]
    pub protocol_timing: Option<ProtocolTimingConfig>,
    /// 可选:创建时直接附带远动运行参数。缺省时使用默认值。
    #[serde(default)]
    pub remote_ops: Option<RemoteOperationConfig>,
}

#[tauri::command]
pub async fn create_server(
    state: State<'_, AppState>,
    request: CreateServerRequest,
) -> Result<ServerInfo, String> {
    let id = {
        let mut counter = state.next_server_id.write().await;
        let id = format!("server_{}", *counter);
        *counter += 1;
        id
    };

    let transport = SlaveTransportConfig {
        bind_address: request.bind_address.unwrap_or_else(|| "0.0.0.0".to_string()),
        port: request.port,
        tls: iec104sim_core::slave::SlaveTlsConfig {
            enabled: request.use_tls.unwrap_or(false),
            cert_file: request.cert_file.unwrap_or_default(),
            key_file: request.key_file.unwrap_or_default(),
            ca_file: request.ca_file.unwrap_or_default(),
            require_client_cert: request.require_client_cert.unwrap_or(false),
            pkcs12_file: String::new(),
            pkcs12_password: String::new(),
        },
    };

    let log_collector = Arc::new(LogCollector::new());
    let server = SlaveServer::new(transport).with_log_collector(log_collector.clone());

    // 在加站点之前应用服务器级配置,以便首次 set 后的任何上送都按目标参数发送。
    if let Some(t) = request.protocol_timing {
        server.set_protocol_timing(t).await;
    }
    if let Some(ops) = request.remote_ops {
        server.set_remote_ops(ops).await;
    }

    // Auto-create default station (CA=1) with pre-filled data points
    let n = request.count_per_category.unwrap_or(10);
    let default_station = match request.init_mode.as_deref() {
        Some("random") => Station::with_random_points(1, "", n),
        _ => Station::with_default_points(1, "", n),
    };
    server
        .add_station(default_station)
        .await
        .map_err(|e| format!("failed to add default station: {}", e))?;

    let info = ServerInfo {
        id: id.clone(),
        bind_address: server.transport.bind_address.clone(),
        port: server.transport.port,
        state: format!("{:?}", server.state()),
        station_count: 1,
        use_tls: server.transport.tls.enabled,
    };

    state.servers.write().await.insert(
        id,
        SlaveServerState {
            server,
            log_collector,
        },
    );

    Ok(info)
}

#[tauri::command]
pub async fn start_server(
    state: State<'_, AppState>,
    app_handle: AppHandle,
    id: String,
) -> Result<(), String> {
    let state_str: String;
    {
        let mut servers = state.servers.write().await;
        let srv = servers
            .get_mut(&id)
            .ok_or_else(|| format!("server {} not found", id))?;

        srv.server
            .start()
            .await
            .map_err(|e| format!("failed to start: {}", e))?;
        state_str = format!("{:?}", srv.server.state());
    }

    app_handle.emit("server-state-changed", ServerStateEvent {
        id, state: state_str,
    }).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn stop_server(
    state: State<'_, AppState>,
    app_handle: AppHandle,
    id: String,
) -> Result<(), String> {
    let state_str: String;
    {
        let mut servers = state.servers.write().await;
        let srv = servers
            .get_mut(&id)
            .ok_or_else(|| format!("server {} not found", id))?;

        srv.server
            .stop()
            .await
            .map_err(|e| format!("failed to stop: {}", e))?;
        state_str = format!("{:?}", srv.server.state());
    }

    app_handle.emit("server-state-changed", ServerStateEvent {
        id, state: state_str,
    }).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_server(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let mut servers = state.servers.write().await;
    servers
        .remove(&id)
        .ok_or_else(|| format!("server {} not found", id))?;
    Ok(())
}

#[tauri::command]
pub async fn list_servers(
    state: State<'_, AppState>,
) -> Result<Vec<ServerInfo>, String> {
    let servers = state.servers.read().await;
    let mut result = Vec::new();

    for (id, srv_state) in servers.iter() {
        let station_count = srv_state.server.stations.read().await.len();
        result.push(ServerInfo {
            id: id.clone(),
            bind_address: srv_state.server.transport.bind_address.clone(),
            port: srv_state.server.transport.port,
            state: format!("{:?}", srv_state.server.state()),
            station_count,
            use_tls: srv_state.server.transport.tls.enabled,
        });
    }

    Ok(result)
}

// ---------------------------------------------------------------------------
// Station Commands
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct AddStationRequest {
    pub server_id: String,
    pub common_address: u16,
    pub name: String,
    pub init_mode: Option<String>,
}

#[tauri::command]
pub async fn add_station(
    state: State<'_, AppState>,
    request: AddStationRequest,
) -> Result<StationInfo, String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&request.server_id)
        .ok_or_else(|| format!("server {} not found", request.server_id))?;

    let station = match request.init_mode.as_deref() {
        Some("random") => Station::with_random_points(request.common_address, request.name.clone(), 10),
        Some("zero") => Station::with_default_points(request.common_address, request.name.clone(), 10),
        _ => Station::new(request.common_address, request.name.clone()),
    };
    let point_count = station.data_points.len();

    srv.server
        .add_station(station)
        .await
        .map_err(|e| format!("failed to add station: {}", e))?;

    Ok(StationInfo {
        common_address: request.common_address,
        name: request.name,
        point_count,
    })
}

#[tauri::command]
pub async fn remove_station(
    state: State<'_, AppState>,
    server_id: String,
    common_address: u16,
) -> Result<(), String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&server_id)
        .ok_or_else(|| format!("server {} not found", server_id))?;

    srv.server
        .remove_station(common_address)
        .await
        .map_err(|e| format!("failed to remove station: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn list_stations(
    state: State<'_, AppState>,
    server_id: String,
) -> Result<Vec<StationInfo>, String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&server_id)
        .ok_or_else(|| format!("server {} not found", server_id))?;

    let stations = srv.server.stations.read().await;
    let result: Vec<StationInfo> = stations
        .values()
        .map(|s| StationInfo {
            common_address: s.common_address,
            name: s.name.clone(),
            point_count: s.data_points.len(),
        })
        .collect();

    Ok(result)
}

// ---------------------------------------------------------------------------
// Data Point Commands
// ---------------------------------------------------------------------------

fn parse_asdu_type(s: &str) -> Result<AsduTypeId, String> {
    // 归一化: 小写 + 仅保留字母数字。涵盖三种来源:
    // PascalCase 枚举名 ("MSpNa1") / 小写下划线 ("m_sp_na_1") /
    // 前端从 list_data_points 拿到的显示名 ("M_SP_NA_1").
    let key: String = s.chars()
        .filter(|c| c.is_alphanumeric())
        .flat_map(|c| c.to_lowercase())
        .collect();
    match key.as_str() {
        "mspna1" => Ok(AsduTypeId::MSpNa1),
        "msptb1" => Ok(AsduTypeId::MSpTb1),
        "mdpna1" => Ok(AsduTypeId::MDpNa1),
        "mdptb1" => Ok(AsduTypeId::MDpTb1),
        "mstna1" => Ok(AsduTypeId::MStNa1),
        "msttb1" => Ok(AsduTypeId::MStTb1),
        "mbona1" => Ok(AsduTypeId::MBoNa1),
        "mbotb1" => Ok(AsduTypeId::MBoTb1),
        "mmena1" => Ok(AsduTypeId::MMeNa1),
        "mmenb1" => Ok(AsduTypeId::MMeNb1),
        "mmenc1" => Ok(AsduTypeId::MMeNc1),
        "mmetd1" => Ok(AsduTypeId::MMeTd1),
        "mmete1" => Ok(AsduTypeId::MMeTe1),
        "mmetf1" => Ok(AsduTypeId::MMeTf1),
        "mitna1" => Ok(AsduTypeId::MItNa1),
        "mittb1" => Ok(AsduTypeId::MItTb1),
        _ => Err(format!("unknown ASDU type: {}", s)),
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct AddDataPointRequest {
    pub server_id: String,
    pub common_address: u16,
    pub ioa: u32,
    pub asdu_type: String,
    pub name: Option<String>,
    pub comment: Option<String>,
}

#[tauri::command]
pub async fn add_data_point(
    state: State<'_, AppState>,
    request: AddDataPointRequest,
) -> Result<(), String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&request.server_id)
        .ok_or_else(|| format!("server {} not found", request.server_id))?;

    let asdu_type = parse_asdu_type(&request.asdu_type)?;
    let def = InformationObjectDef {
        ioa: request.ioa,
        asdu_type,
        category: asdu_type.category(),
        name: request.name.unwrap_or_default(),
        comment: request.comment.unwrap_or_default(),
    };

    let mut stations = srv.server.stations.write().await;
    let station = stations
        .get_mut(&request.common_address)
        .ok_or_else(|| format!("station CA={} not found", request.common_address))?;

    station.add_point(def)
        .map_err(|e| format!("failed to add point: {}", e))
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct BatchAddDataPointsRequest {
    pub server_id: String,
    pub common_address: u16,
    pub start_ioa: u32,
    pub count: u32,
    pub asdu_type: String,
    pub name_prefix: Option<String>,
}

#[tauri::command]
pub async fn batch_add_data_points(
    state: State<'_, AppState>,
    request: BatchAddDataPointsRequest,
) -> Result<u32, String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&request.server_id)
        .ok_or_else(|| format!("server {} not found", request.server_id))?;

    let asdu_type = parse_asdu_type(&request.asdu_type)?;

    let mut stations = srv.server.stations.write().await;
    let station = stations
        .get_mut(&request.common_address)
        .ok_or_else(|| format!("station CA={} not found", request.common_address))?;

    station
        .batch_add_points(
            request.start_ioa,
            request.count,
            asdu_type,
            request.name_prefix.as_deref().unwrap_or(""),
        )
        .map_err(|e| format!("failed to batch add points: {}", e))
}

#[tauri::command]
pub async fn remove_data_point(
    state: State<'_, AppState>,
    server_id: String,
    common_address: u16,
    ioa: u32,
    asdu_type: String,
) -> Result<(), String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&server_id)
        .ok_or_else(|| format!("server {} not found", server_id))?;

    let asdu = parse_asdu_type(&asdu_type)?;

    let mut stations = srv.server.stations.write().await;
    let station = stations
        .get_mut(&common_address)
        .ok_or_else(|| format!("station CA={} not found", common_address))?;

    station.remove_point(ioa, asdu)
        .map_err(|e| format!("failed to remove point: {}", e))
}

#[tauri::command]
pub async fn update_data_point(
    state: State<'_, AppState>,
    server_id: String,
    common_address: u16,
    ioa: u32,
    asdu_type: String,
    value: String,
) -> Result<(), String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&server_id)
        .ok_or_else(|| format!("server {} not found", server_id))?;

    let asdu = parse_asdu_type(&asdu_type)?;

    let mut stations = srv.server.stations.write().await;
    let station = stations
        .get_mut(&common_address)
        .ok_or_else(|| format!("station CA={} not found", common_address))?;

    let point = station.data_points.get_mut(ioa, asdu)
        .ok_or_else(|| format!("IOA {} type {} not found", ioa, asdu_type))?;

    // Parse value based on current type
    let new_value = match &point.value {
        DataPointValue::SinglePoint { .. } => {
            let v = value.parse::<bool>().or_else(|_| {
                match value.as_str() {
                    "1" | "true" | "ON" | "on" => Ok(true),
                    "0" | "false" | "OFF" | "off" => Ok(false),
                    _ => Err(format!("invalid bool: {}", value)),
                }
            }).map_err(|e| format!("{}", e))?;
            DataPointValue::SinglePoint { value: v }
        }
        DataPointValue::DoublePoint { .. } => {
            let v = value.parse::<u8>().map_err(|e| format!("{}", e))?;
            DataPointValue::DoublePoint { value: v }
        }
        DataPointValue::Normalized { .. } => {
            let v = value.parse::<f32>().map_err(|e| format!("{}", e))?;
            DataPointValue::Normalized { value: v }
        }
        DataPointValue::Scaled { .. } => {
            let v = value.parse::<i16>().map_err(|e| format!("{}", e))?;
            DataPointValue::Scaled { value: v }
        }
        DataPointValue::ShortFloat { .. } => {
            let v = value.parse::<f32>().map_err(|e| format!("{}", e))?;
            DataPointValue::ShortFloat { value: v }
        }
        DataPointValue::IntegratedTotal { carry, sequence, .. } => {
            let v = value.parse::<i32>().map_err(|e| format!("{}", e))?;
            DataPointValue::IntegratedTotal { value: v, carry: *carry, sequence: *sequence }
        }
        _ => return Err("unsupported value type".to_string()),
    };

    point.value = new_value;
    point.timestamp = Some(chrono::Utc::now());
    // Stamp the change so incremental polling (list_data_points_since) sees it —
    // a bare get_mut value write does not bump update_seq.
    station.data_points.mark_changed(ioa, asdu);

    drop(stations);
    srv.server.queue_spontaneous(common_address, &[(ioa, asdu)]).await;

    Ok(())
}

/// Map a core `DataPoint` to the serialisable `DataPointInfo` the UI consumes.
fn data_point_to_info(
    p: &DataPoint,
    def_map: &std::collections::HashMap<(u32, AsduTypeId), &InformationObjectDef>,
) -> DataPointInfo {
    let def = def_map.get(&(p.ioa, p.asdu_type));
    DataPointInfo {
        ioa: p.ioa,
        asdu_type: p.asdu_type.name().to_string(),
        category: p.asdu_type.category().name().to_string(),
        name: def.map(|d| d.name.clone()).unwrap_or_default(),
        comment: def.map(|d| d.comment.clone()).unwrap_or_default(),
        value: p.value.display(),
        quality_iv: p.quality.iv,
        // DataPoint.timestamp 内部存 UTC 便于无歧义比较；展示给用户时转为
        // 本地时区,这样 UI 看到的"时间戳"和系统挂钟一致。
        timestamp: p.timestamp.map(|t| t.with_timezone(&chrono::Local).format("%H:%M:%S%.3f").to_string()),
    }
}

#[tauri::command]
pub async fn list_data_points(
    state: State<'_, AppState>,
    server_id: String,
    common_address: u16,
    _category: Option<String>,
) -> Result<Vec<DataPointInfo>, String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&server_id)
        .ok_or_else(|| format!("server {} not found", server_id))?;

    let stations = srv.server.stations.read().await;
    let station = stations
        .get(&common_address)
        .ok_or_else(|| format!("station CA={} not found", common_address))?;

    let points = station.data_points.all_sorted();
    let defs = &station.object_defs;

    // Build O(1) lookup map instead of O(n) linear search per point
    let def_map: std::collections::HashMap<(u32, AsduTypeId), &InformationObjectDef> = defs.iter()
        .map(|d| ((d.ioa, d.asdu_type), d))
        .collect();

    let result: Vec<DataPointInfo> = points
        .into_iter()
        .map(|p| data_point_to_info(p, &def_map))
        .collect();

    Ok(result)
}

/// Incremental variant of `list_data_points`: returns only points whose
/// `update_seq` exceeds `since_seq`, so a polling UI transfers a handful of
/// changed rows instead of the whole (potentially 80k-row) table each tick.
/// `total_count` lets the caller detect deletions via a size mismatch.
#[tauri::command]
pub async fn list_data_points_since(
    state: State<'_, AppState>,
    server_id: String,
    common_address: u16,
    since_seq: u64,
) -> Result<IncrementalDataResponse, String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&server_id)
        .ok_or_else(|| format!("server {} not found", server_id))?;

    let stations = srv.server.stations.read().await;
    let station = stations
        .get(&common_address)
        .ok_or_else(|| format!("station CA={} not found", common_address))?;

    let def_map: std::collections::HashMap<(u32, AsduTypeId), &InformationObjectDef> =
        station.object_defs.iter()
            .map(|d| ((d.ioa, d.asdu_type), d))
            .collect();

    let points: Vec<DataPointInfo> = station.data_points
        .changed_since(since_seq)
        .into_iter()
        .map(|p| data_point_to_info(p, &def_map))
        .collect();

    Ok(IncrementalDataResponse {
        seq: station.data_points.current_seq(),
        total_count: station.data_points.len(),
        points,
    })
}

// ---------------------------------------------------------------------------
// Log Commands
// ---------------------------------------------------------------------------

#[tauri::command]
pub async fn get_communication_logs(
    state: State<'_, AppState>,
    server_id: String,
) -> Result<Vec<LogEntry>, String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&server_id)
        .ok_or_else(|| format!("server {} not found", server_id))?;
    Ok(srv.log_collector.get_all().await)
}

#[tauri::command]
pub async fn clear_communication_logs(
    state: State<'_, AppState>,
    server_id: String,
) -> Result<(), String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&server_id)
        .ok_or_else(|| format!("server {} not found", server_id))?;
    srv.log_collector.clear().await;
    Ok(())
}

#[tauri::command]
pub async fn export_logs_csv(
    state: State<'_, AppState>,
    server_id: String,
) -> Result<String, String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&server_id)
        .ok_or_else(|| format!("server {} not found", server_id))?;
    Ok(srv.log_collector.export_csv().await)
}

// ---------------------------------------------------------------------------
// Simulation Commands
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct RandomMutateRequest {
    pub server_id: String,
    pub common_address: u16,
}

#[tauri::command]
pub async fn random_mutate_data_points(
    state: State<'_, AppState>,
    request: RandomMutateRequest,
) -> Result<u32, String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&request.server_id)
        .ok_or_else(|| format!("server {} not found", request.server_id))?;

    let mut stations = srv.server.stations.write().await;
    let station = stations
        .get_mut(&request.common_address)
        .ok_or_else(|| format!("station CA={} not found", request.common_address))?;

    let (mutated, changed_ioas) = {
        let mut rng = rand::rng();
        let mut mutated = 0u32;
        let mut changed_ioas: Vec<(u32, AsduTypeId)> = Vec::new();

        let keys: Vec<(u32, AsduTypeId)> = station.data_points.points.keys().copied().collect();
        let count = (keys.len() * 30 / 100).max(3).min(keys.len());

        let mut pick = keys;
        for i in (1..pick.len()).rev() {
            let j = rng.random_range(0..=i);
            pick.swap(i, j);
        }

        for &(ioa, asdu_type) in &pick[..count] {
            if let Some(point) = station.data_points.get_mut(ioa, asdu_type) {
                point.value = match &point.value {
                    DataPointValue::SinglePoint { value } => {
                        DataPointValue::SinglePoint { value: !value }
                    }
                    DataPointValue::DoublePoint { value } => {
                        DataPointValue::DoublePoint { value: if *value == 1 { 2 } else { 1 } }
                    }
                    DataPointValue::Normalized { value } => {
                        let delta: f32 = rng.random_range(-0.1..0.1);
                        DataPointValue::Normalized { value: (*value + delta).clamp(-1.0, 1.0) }
                    }
                    DataPointValue::Scaled { value } => {
                        let delta: i16 = rng.random_range(-100..100);
                        DataPointValue::Scaled { value: value.saturating_add(delta) }
                    }
                    DataPointValue::ShortFloat { value } => {
                        let delta: f32 = rng.random_range(-10.0..10.0);
                        DataPointValue::ShortFloat { value: value + delta }
                    }
                    DataPointValue::IntegratedTotal { value, carry, sequence } => {
                        let delta: i32 = rng.random_range(0..100);
                        DataPointValue::IntegratedTotal {
                            value: value + delta,
                            carry: *carry,
                            sequence: *sequence,
                        }
                    }
                    other => other.clone(),
                };
                point.timestamp = Some(chrono::Utc::now());
                changed_ioas.push((ioa, asdu_type));
                mutated += 1;
            }
        }
        (mutated, changed_ioas)
    }; // rng dropped here

    // Stamp every mutated point for incremental polling.
    for &(ioa, asdu_type) in &changed_ioas {
        station.data_points.mark_changed(ioa, asdu_type);
    }

    drop(stations);

    // 按 RemoteOperationConfig.random_pacing 分批 queue_spontaneous,
    // 每发 batch_size 个 IOA 后 sleep delay_ms。batch_size=0 视为一次性发送。
    let pacing = srv.server.get_remote_ops().await.random_pacing;
    let batch_size = pacing.batch_size.max(1) as usize;
    let delay = std::time::Duration::from_millis(pacing.delay_ms as u64);
    let mut idx = 0;
    while idx < changed_ioas.len() {
        let end = (idx + batch_size).min(changed_ioas.len());
        srv.server.queue_spontaneous(request.common_address, &changed_ioas[idx..end]).await;
        idx = end;
        if idx < changed_ioas.len() && pacing.delay_ms > 0 {
            tokio::time::sleep(delay).await;
        }
    }

    Ok(mutated)
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct CyclicConfigRequest {
    pub server_id: String,
    pub common_address: u16,
    pub enabled: bool,
    pub interval_ms: u32,
}

#[tauri::command]
pub async fn set_cyclic_config(
    state: State<'_, AppState>,
    request: CyclicConfigRequest,
) -> Result<(), String> {
    use iec104sim_core::slave::CyclicConfig;
    let servers = state.servers.read().await;
    let srv = servers
        .get(&request.server_id)
        .ok_or_else(|| format!("server {} not found", request.server_id))?;
    srv.server
        .set_cyclic_config(
            request.common_address,
            CyclicConfig { enabled: request.enabled, interval_ms: request.interval_ms },
        )
        .await
        .map_err(|e| format!("{:?}", e))
}

// ---------------------------------------------------------------------------
// Remote Operation Configuration Commands (远动运行参数)
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ProtocolTimingRequest {
    pub server_id: String,
    pub timing: ProtocolTimingConfig,
}

#[tauri::command]
pub async fn set_protocol_timing(
    state: State<'_, AppState>,
    request: ProtocolTimingRequest,
) -> Result<(), String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&request.server_id)
        .ok_or_else(|| format!("server {} not found", request.server_id))?;
    srv.server.set_protocol_timing(request.timing).await;
    Ok(())
}

#[tauri::command]
pub async fn get_protocol_timing(
    state: State<'_, AppState>,
    server_id: String,
) -> Result<ProtocolTimingConfig, String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&server_id)
        .ok_or_else(|| format!("server {} not found", server_id))?;
    Ok(srv.server.get_protocol_timing().await)
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct RemoteOpsRequest {
    pub server_id: String,
    pub ops: RemoteOperationConfig,
}

#[tauri::command]
pub async fn set_remote_operation_config(
    state: State<'_, AppState>,
    request: RemoteOpsRequest,
) -> Result<(), String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&request.server_id)
        .ok_or_else(|| format!("server {} not found", request.server_id))?;
    srv.server.set_remote_ops(request.ops).await;
    Ok(())
}

#[tauri::command]
pub async fn get_remote_operation_config(
    state: State<'_, AppState>,
    server_id: String,
) -> Result<RemoteOperationConfig, String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&server_id)
        .ok_or_else(|| format!("server {} not found", server_id))?;
    Ok(srv.server.get_remote_ops().await)
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct FixedMutationRequest {
    pub server_id: String,
    pub config: FixedMutationConfig,
}

#[tauri::command]
pub async fn set_fixed_mutation(
    state: State<'_, AppState>,
    request: FixedMutationRequest,
) -> Result<(), String> {
    let servers = state.servers.read().await;
    let srv = servers
        .get(&request.server_id)
        .ok_or_else(|| format!("server {} not found", request.server_id))?;
    srv.server.set_fixed_mutation(request.config).await;
    Ok(())
}

// ---------------------------------------------------------------------------
// State Persistence Commands
// ---------------------------------------------------------------------------

#[tauri::command]
pub async fn save_config(
    state: State<'_, AppState>,
    path: String,
) -> Result<(), String> {
    use iec104sim_core::config::{SlaveConfigFile, SlaveServerConfig, SlaveStationConfig};

    let json = {
        let servers = state.servers.read().await;
        let mut out = Vec::new();
        for (_id, srv_state) in servers.iter() {
            let stations = srv_state.server.stations.read().await;
            let mut st = Vec::new();
            for (_ca, station) in stations.iter() {
                st.push(SlaveStationConfig {
                    common_address: station.common_address,
                    name: station.name.clone(),
                    object_defs: station.object_defs.clone(),
                });
            }
            out.push(SlaveServerConfig {
                bind_address: srv_state.server.transport.bind_address.clone(),
                port: srv_state.server.transport.port,
                stations: st,
                protocol_timing: srv_state.server.get_protocol_timing().await,
                remote_ops: srv_state.server.get_remote_ops().await,
            });
        }
        SlaveConfigFile::new(out).to_json()?
    };
    std::fs::write(&path, json).map_err(|e| format!("写入文件失败: {e}"))
}

#[tauri::command]
pub async fn load_config(
    state: State<'_, AppState>,
    path: String,
) -> Result<usize, String> {
    use iec104sim_core::config::SlaveConfigFile;

    let content = std::fs::read_to_string(&path)
        .map_err(|e| format!("读取文件失败: {e}"))?;
    let file = SlaveConfigFile::from_json(&content)?;

    let mut imported = 0usize;
    for srv in file.servers {
        let id = {
            let mut counter = state.next_server_id.write().await;
            let id = format!("server_{}", *counter);
            *counter += 1;
            id
        };
        let transport = SlaveTransportConfig {
            bind_address: srv.bind_address,
            port: srv.port,
            tls: Default::default(),
        };
        let log_collector = Arc::new(LogCollector::new());
        let server = SlaveServer::new(transport).with_log_collector(log_collector.clone());
        // 加站点前先恢复服务器级配置,确保后续突发上送按目标参数走。
        server.set_protocol_timing(srv.protocol_timing).await;
        server.set_remote_ops(srv.remote_ops).await;
        for st in srv.stations {
            let mut station = Station::new(st.common_address, st.name);
            for def in st.object_defs {
                let _ = station.add_point(def);
            }
            let _ = server.add_station(station).await;
        }
        state.servers.write().await.insert(
            id,
            SlaveServerState { server, log_collector },
        );
        imported += 1;
    }
    Ok(imported)
}

// ---------------------------------------------------------------------------
// Tool Commands
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn parse_hex(data: String) -> Result<Vec<u8>, String> {
    iec104sim_core::tools::parse_hex_string(&data)
        .map_err(|e| format!("{}", e))
}

#[tauri::command]
pub fn parse_apci(data: String) -> Result<String, String> {
    let bytes = iec104sim_core::tools::parse_hex_string(&data)
        .map_err(|e| format!("{}", e))?;
    let frame = iec104sim_core::frame::parse_apci(&bytes)
        .map_err(|e| format!("{}", e))?;
    Ok(iec104sim_core::frame::format_frame_summary(&frame))
}

#[tauri::command]
pub fn parse_frame_full(data: String) -> Result<iec104sim_core::decode::ParsedFrame, String> {
    let bytes = iec104sim_core::tools::parse_hex_string(&data)
        .map_err(|e| format!("{}", e))?;
    iec104sim_core::decode::parse_frame_full(&bytes)
}
