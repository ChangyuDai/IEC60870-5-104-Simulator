<script setup lang="ts">
import type {
  ProtocolTimingConfig,
  RemoteOperationConfig,
  CommandAckCot,
  UploadMode,
} from '../types'

defineProps<{
  timing: ProtocolTimingConfig
  ops: RemoteOperationConfig
}>()

const cotOptions: { value: CommandAckCot; label: string }[] = [
  { value: 'activation_con', label: 'ACT_CON · 7' },
  { value: 'activation_termination', label: 'ACT_TERM · 10' },
  { value: 'deactivation_con', label: 'DEACT_CON · 9' },
]
const modeOptions: { value: UploadMode; label: string }[] = [
  { value: 'continuous', label: '连续 SQ=1' },
  { value: 'discrete', label: '离散 SQ=0' },
]
const asduTypeOptions = [
  'm_sp_na_1', 'm_dp_na_1', 'm_st_na_1', 'm_bo_na_1',
  'm_me_na_1', 'm_me_nb_1', 'm_me_nc_1', 'm_it_na_1',
]

const timingMeta: { key: 't0' | 't1' | 't2' | 't3' | 'k' | 'w'; hint: string; min: number; max: number }[] = [
  { key: 't0', hint: '建立连接超时 (s)', min: 1, max: 255 },
  { key: 't1', hint: '发送/测试超时 (s)', min: 1, max: 255 },
  { key: 't2', hint: 'S 帧响应超时 (s)', min: 1, max: 255 },
  { key: 't3', hint: 'TestFR 触发 (s)', min: 1, max: 255 },
  { key: 'k', hint: '未确认 I 帧上限', min: 1, max: 32767 },
  { key: 'w', hint: '累计后回送 S 帧', min: 1, max: 32767 },
]
</script>

<template>
  <!-- ① 链路参数 -->
  <section class="rp-card">
    <header class="rp-card-head">
      <span class="rp-eyebrow">01</span>
      <h4>链路参数</h4>
      <span class="rp-card-sub">协议时序 · 窗口</span>
    </header>
    <div class="rp-timing">
      <div v-for="m in timingMeta" :key="m.key" class="rp-timing-cell">
        <span class="rp-timing-key">{{ m.key }}</span>
        <input
          type="number"
          :min="m.min"
          :max="m.max"
          v-model.number="timing[m.key]"
        />
        <span class="rp-timing-hint">{{ m.hint }}</span>
      </div>
    </div>
    <slot name="actions-timing" />
  </section>

  <!-- ② 召唤与应答 -->
  <section class="rp-card">
    <header class="rp-card-head">
      <span class="rp-eyebrow">02</span>
      <h4>召唤与应答</h4>
      <span class="rp-card-sub">主站请求处理</span>
    </header>

    <div class="rp-group">
      <span class="rp-group-label">应答开关</span>
      <label class="rp-switch">
        <input type="checkbox" v-model="ops.answer_general_interrogation" />
        <span>总召唤 <code>C_IC_NA_1</code></span>
      </label>
      <label class="rp-switch">
        <input type="checkbox" v-model="ops.answer_counter_interrogation" />
        <span>累积量召唤 <code>C_CI_NA_1</code></span>
      </label>
      <label class="rp-switch">
        <input type="checkbox" v-model="ops.answer_commands" />
        <span>遥控、遥调</span>
      </label>
      <label class="rp-switch">
        <input type="checkbox" v-model="ops.gi_include_timestamped" />
        <span>召唤含带时标点</span>
      </label>
    </div>

    <div class="rp-group">
      <span class="rp-group-label">命令应答 COT</span>
      <div class="rp-field">
        <label>选择</label>
        <select v-model="ops.select_ack_cot">
          <option v-for="o in cotOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>
      <div class="rp-field">
        <label>执行</label>
        <select v-model="ops.execute_ack_cot">
          <option v-for="o in cotOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>
      <div class="rp-field">
        <label>取消</label>
        <select v-model="ops.cancel_ack_cot">
          <option v-for="o in cotOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>
    </div>

    <slot name="actions-ops" />
  </section>

  <!-- ③ 数据上送方式 -->
  <section class="rp-card">
    <header class="rp-card-head">
      <span class="rp-eyebrow">03</span>
      <h4>数据上送方式</h4>
      <span class="rp-card-sub">ASDU 组装策略</span>
    </header>

    <div class="rp-group">
      <span class="rp-group-label">SQ 模式</span>
      <div class="rp-field">
        <label>不带时标</label>
        <select v-model="ops.upload_mode_untimestamped">
          <option v-for="o in modeOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>
      <div class="rp-field">
        <label>带时标</label>
        <select v-model="ops.upload_mode_timestamped">
          <option v-for="o in modeOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>
    </div>

    <div class="rp-group">
      <span class="rp-group-label">组包策略</span>
      <label class="rp-switch">
        <input type="checkbox" v-model="ops.auto_packing" />
        <span>自动组包（连续 IOA 合并）</span>
      </label>
      <label class="rp-switch">
        <input type="checkbox" v-model="ops.sp_sync_with_tb" />
        <span><code>M_SP_NA_1</code> 变位同步上送 <code>M_SP_TB_1</code></span>
      </label>
    </div>
  </section>

  <!-- ④ 变位仿真 -->
  <section class="rp-card">
    <header class="rp-card-head">
      <span class="rp-eyebrow">04</span>
      <h4>变位仿真</h4>
      <span class="rp-card-sub">随机变位 · 固定变位</span>
    </header>

    <div class="rp-group">
      <span class="rp-group-label">随机变位节流</span>
      <div class="rp-pacing">
        <div class="rp-field">
          <label>每发送</label>
          <div class="rp-inline">
            <input type="number" min="1" max="100000" v-model.number="ops.random_pacing.batch_size" />
            <span class="rp-unit">个</span>
          </div>
        </div>
        <div class="rp-field">
          <label>延迟</label>
          <div class="rp-inline">
            <input type="number" min="0" max="60000" v-model.number="ops.random_pacing.delay_ms" />
            <span class="rp-unit">ms</span>
          </div>
        </div>
      </div>
    </div>

    <div class="rp-group">
      <span class="rp-group-label">固定变位</span>
      <div class="rp-fixed">
        <div class="rp-field">
          <label>IOA</label>
          <input type="number" min="0" max="16777215" v-model.number="ops.fixed_mutation.ioa" />
        </div>
        <div class="rp-field">
          <label>类型</label>
          <select v-model="ops.fixed_mutation.asdu_type">
            <option v-for="t in asduTypeOptions" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="rp-field">
          <label>周期</label>
          <div class="rp-inline">
            <input type="number" min="50" max="60000" v-model.number="ops.fixed_mutation.period_ms" />
            <span class="rp-unit">ms</span>
          </div>
        </div>
      </div>
      <slot name="actions-fixed" :enabled="ops.fixed_mutation.enabled" />
    </div>
  </section>
</template>

<style scoped>
.rp-card {
  position: relative;
  background: var(--c-base);
  border: 1px solid var(--c-surface0);
  border-radius: 6px;
  padding: 10px 12px 12px;
  margin-bottom: 10px;
}

.rp-card-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px dashed var(--c-surface0);
}

.rp-eyebrow {
  font: 600 10px/1 ui-monospace, "SF Mono", Menlo, monospace;
  letter-spacing: 0.06em;
  color: var(--c-overlay0);
  background: var(--c-surface0);
  padding: 2px 5px;
  border-radius: 3px;
}

.rp-card-head h4 {
  margin: 0;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c-text);
  letter-spacing: 0.02em;
}

.rp-card-sub {
  margin-left: auto;
  font-size: 10.5px;
  color: var(--c-overlay0);
  letter-spacing: 0.04em;
}

.rp-group {
  margin-top: 8px;
}

.rp-group + .rp-group {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed var(--c-surface0);
}

.rp-group-label {
  display: block;
  font: 600 10px/1 ui-monospace, "SF Mono", Menlo, monospace;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-blue);
  margin-bottom: 6px;
  opacity: 0.85;
}

/* —— 链路参数：六联紧凑卡 —— */
.rp-timing {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.rp-timing-cell {
  display: grid;
  grid-template-columns: 22px 1fr;
  grid-template-rows: auto auto;
  align-items: center;
  gap: 0 8px;
  padding: 5px 7px;
  background: var(--c-mantle);
  border: 1px solid var(--c-surface0);
  border-radius: 4px;
}

.rp-timing-key {
  grid-row: 1 / span 2;
  font: 600 13px/1 ui-monospace, "SF Mono", Menlo, monospace;
  color: var(--c-peach, var(--c-yellow, #f5c2a7));
  align-self: center;
}

.rp-timing-cell input {
  grid-column: 2;
  width: 100%;
  height: 22px;
  padding: 0 6px;
  background: var(--c-base);
  border: 1px solid var(--c-surface1);
  border-radius: 3px;
  color: var(--c-text);
  font: 500 12px/1 ui-monospace, "SF Mono", Menlo, monospace;
}

.rp-timing-cell input:focus {
  outline: none;
  border-color: var(--c-blue);
}

.rp-timing-hint {
  grid-column: 2;
  font-size: 10px;
  color: var(--c-subtext0);
  opacity: 0.75;
}

/* —— Switch 行 —— */
.rp-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
  color: var(--c-text);
  cursor: pointer;
  user-select: none;
}

.rp-switch input {
  flex: none;
  width: 14px;
  height: 14px;
  margin: 0;
  accent-color: var(--c-blue);
  cursor: pointer;
}

.rp-switch code {
  font: 500 11px/1 ui-monospace, "SF Mono", Menlo, monospace;
  background: var(--c-surface0);
  padding: 1px 4px;
  border-radius: 3px;
  color: var(--c-mauve, var(--c-blue));
}

/* —— Field 行（label 左 + control 右）—— */
.rp-field {
  display: grid;
  grid-template-columns: 64px 1fr;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.rp-field label {
  font-size: 11.5px;
  color: var(--c-subtext0);
  letter-spacing: 0.02em;
}

.rp-field select,
.rp-field input[type="number"] {
  width: 100%;
  height: 24px;
  padding: 0 6px;
  background: var(--c-mantle);
  border: 1px solid var(--c-surface0);
  border-radius: 3px;
  color: var(--c-text);
  font: 500 12px/1 ui-monospace, "SF Mono", Menlo, monospace;
  transition: border-color 80ms linear;
}

.rp-field select:hover,
.rp-field input[type="number"]:hover {
  border-color: var(--c-surface1);
}

.rp-field select:focus,
.rp-field input[type="number"]:focus {
  outline: none;
  border-color: var(--c-blue);
  background: var(--c-base);
}

.rp-inline {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rp-inline input { flex: 1; }

.rp-unit {
  font: 500 11px/1 ui-monospace, "SF Mono", Menlo, monospace;
  color: var(--c-overlay0);
}

.rp-pacing,
.rp-fixed {
  display: grid;
  gap: 6px;
}

.rp-fixed { grid-template-columns: 1fr; }
</style>
