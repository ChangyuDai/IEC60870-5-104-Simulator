# 点位配置导入/导出 — 设计文档

日期:2026-05-19

## 1. 概述与范围

为主站(`iec104master-app`)、从站(`iec104sim-app`)两个 Tauri 应用各增加**手动保存/打开配置文件**功能:

- **仅手动**保存/打开,无自动落盘、无启动恢复。
- 打开(导入)文件时**追加合并**到现有工作区,不清空、不修改现有项。
- 文件格式为 JSON(pretty-print)。
- **TLS 配置完全不写入文件**;打开后的项均为明文连接,TLS 需手动重新配置。

「导出」即「保存」,「导入」即「打开」,为同一组操作。

## 2. 文件格式

两个应用各自的文件结构,均带 `app` 判别字段以防跨应用误加载。

### 从站文件

```json
{
  "app": "iec104-slave",
  "version": 1,
  "servers": [
    {
      "bind_address": "0.0.0.0",
      "port": 2404,
      "stations": [
        {
          "common_address": 1,
          "name": "站1",
          "object_defs": [
            { "ioa": 100, "asdu_type": "...", "category": "...", "name": "", "comment": "" }
          ]
        }
      ]
    }
  ]
}
```

- 仅点位定义(`InformationObjectDef`):IOA、类型、类别、名称、备注。
- 不含点位当前值与质量;打开后点位值取默认初始值。
- 不含 TLS。

### 主站文件

```json
{
  "app": "iec104-master",
  "version": 1,
  "connections": [
    {
      "target_address": "127.0.0.1",
      "port": 2404,
      "common_addresses": [1],
      "timeout_ms": 3000,
      "t0": 30, "t1": 15, "t2": 10, "t3": 20, "k": 12, "w": 8,
      "default_qoi": 20, "default_qcc": 1,
      "interrogate_period_s": 0, "counter_interrogate_period_s": 0,
      "snapshot": [
        { "ca": 1, "point": { "/* 完整 DataPoint:含值、质量、时间戳 */": null } }
      ]
    }
  ]
}
```

- 连接配置 + 已收点位快照。
- 快照使用核心已有的 `DataPoint` 结构直接序列化(`DataPoint` 本身实现 `Serialize`/`Deserialize`),避免从显示字符串反推类型。
- 不含 TLS。

### 校验

`app` 判别字段不匹配(如把主站文件打开到从站应用)或 `version` 不受支持时,`load_config` 拒绝打开并返回明确错误信息。

## 3. 后端命令

每个应用新增两个 Tauri 命令,文件读写与序列化均在 Rust 内完成(配合前端 `tauri-plugin-dialog` 选取路径)。

### `save_config(path: String) -> Result<(), String>`

收集当前应用状态 → 序列化为文件 schema → `serde_json::to_string_pretty` → 写入 `path`。空工作区仍生成合法的空数组文件。

### `load_config(path: String) -> Result<usize, String>`

读取 `path` → 解析 JSON → 校验 `app`/`version` → **追加**到现有工作区,返回导入的从站/连接数量。

- 从站:为每个 server 创建 `SlaveServer`、`Station`,逐点 `add_point`(复用现有 `import_app_state` 的追加逻辑)。
- 主站:创建 `MasterConnection`(断开态),把 snapshot 中的 `DataPoint` 预填入该连接的 `received_data`(`Arc<RwLock<MasterReceivedData>>`,通过 `MasterReceivedData::insert(ca, point)`),使 `DataTable` 立即可见;重连后被实时数据覆盖。

### 代码整理

现有的 `export_app_state` / `import_app_state` / `clear_app_state` 及 `PersistedServer` / `PersistedStation` / `PersistedAppState`(位于 `iec104sim-app/src/commands.rs`)是前端从未调用的死代码,将被新命令替换。

文件 schema 结构体统一放到 `iec104sim-core/src/config.rs`(规范来源),消除目前 `config.rs` 与 `sim/commands.rs` 之间对持久化结构体的重复定义。

## 4. 前端

- 两个应用各引入 `tauri-plugin-dialog`:Cargo 依赖、`capabilities/default.json` 权限、npm 包 `@tauri-apps/plugin-dialog`。
- `Toolbar.vue` 新增「保存配置」「打开配置」两个按钮:
  - **保存**:`dialog.save()` 选择保存路径 → `invoke('save_config', { path })` → 成功提示。
  - **打开**:`dialog.open()` 选择文件 → `invoke('load_config', { path })` → 刷新连接树 / 列表 → 成功提示(显示导入数量)。
- 新增 i18n 词条:两个应用 × `zh-CN` / `en-US`。

## 5. 错误处理

以下情况均通过现有 `showAlert` 弹窗给出明确的中文 / 英文提示:

- 序列化失败、文件写入失败。
- 文件不存在、JSON 解析失败 / 文件损坏。
- `app` 判别字段不符(跨应用误加载)。
- `version` 不受支持。

用户在文件对话框中取消选择时,不视为错误,静默返回。

## 6. 测试

- Rust 单元测试:
  - 文件 schema 往返序列化(序列化后再反序列化,结构一致)。
  - `load_config` 对错误 `app`、错误 `version`、损坏 JSON 的拒绝行为。
  - 主站快照往返:`DataPoint` 的值与质量在序列化 / 反序列化后保真。
