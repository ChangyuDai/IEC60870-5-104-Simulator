<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
import { useRemoteParams } from '../composables/useRemoteParams'
import type { CommandAckCot, UploadMode } from '../types'

// 与 App.vue 中 provide 的 selectedServerId 联动
const selectedServerId = inject<Ref<string | null>>('selectedServerId') as Ref<string | null>

const { timing, ops, loading, lastError, applyTiming, applyOps, setFixedMutation } =
  useRemoteParams(selectedServerId)

const collapsed = ref(false)
const fixedRunning = computed(() => ops.value.fixed_mutation.enabled)

const cotOptions: { value: CommandAckCot; label: string }[] = [
  { value: 'activation_con', label: 'ACTIVATION_CON (7)' },
  { value: 'activation_termination', label: 'ACTIVATION_TERMINATION (10)' },
  { value: 'deactivation_con', label: 'DEACTIVATION_CON (9)' },
]
const modeOptions: { value: UploadMode; label: string }[] = [
  { value: 'continuous', label: '连续 (SQ=1)' },
  { value: 'discrete', label: '离散 (SQ=0)' },
]

// 与点位列表中的 ASDU 类型保持一致;后端用 snake_case enum 反序列化。
const asduTypeOptions = [
  'm_sp_na_1', 'm_dp_na_1', 'm_st_na_1', 'm_bo_na_1',
  'm_me_na_1', 'm_me_nb_1', 'm_me_nc_1', 'm_it_na_1',
]

function toggle() {
  collapsed.value = !collapsed.value
}

async function startFixed() {
  await setFixedMutation({ ...ops.value.fixed_mutation, enabled: true })
}
async function stopFixed() {
  await setFixedMutation({ ...ops.value.fixed_mutation, enabled: false })
}
</script>

<template>
  <div :class="['remote-params', { collapsed }]">
    <button class="toggle" @click="toggle" :title="collapsed ? '展开远动参数' : '折叠'">
      <span v-if="!collapsed">远动运行参数 ▸</span>
      <span v-else>◂</span>
    </button>

    <div v-if="!collapsed" class="body">
      <div v-if="!selectedServerId" class="hint">请先在左侧选择一个服务器</div>

      <template v-else>
        <section class="section">
          <h4>远动通讯配置 (协议时序)</h4>
          <div class="grid">
            <label>t0 <input type="number" v-model.number="timing.t0" min="1" max="255" /></label>
            <label>t1 <input type="number" v-model.number="timing.t1" min="1" max="255" /></label>
            <label>t2 <input type="number" v-model.number="timing.t2" min="1" max="255" /></label>
            <label>t3 <input type="number" v-model.number="timing.t3" min="1" max="255" /></label>
            <label>k <input type="number" v-model.number="timing.k" min="1" max="32767" /></label>
            <label>w <input type="number" v-model.number="timing.w" min="1" max="32767" /></label>
          </div>
          <button class="apply" @click="applyTiming">应用</button>
          <p class="muted">注:一期仅持久化,运行时计时器尚未严格驱动 t1/t2/t3。</p>
        </section>

        <section class="section">
          <h4>远动运行参数配置</h4>

          <label class="checkbox">
            <input type="checkbox" v-model="ops.sp_sync_with_tb" />
            M_SP_NA_1 变位上送同步上送 M_SP_TB_1
          </label>
          <label class="checkbox">
            <input type="checkbox" v-model="ops.answer_general_interrogation" />
            主站总召唤 (C_IC_NA_1) 应答
          </label>
          <label class="checkbox">
            <input type="checkbox" v-model="ops.answer_counter_interrogation" />
            主站累积量召唤 (C_CI_NA_1) 应答
          </label>
          <label class="checkbox">
            <input type="checkbox" v-model="ops.answer_commands" />
            主站遥控、遥调应答
          </label>
          <label class="checkbox">
            <input type="checkbox" v-model="ops.gi_include_timestamped" />
            召唤应答包含带时标类型点
          </label>

          <label>不带时标数据上送方式
            <select v-model="ops.upload_mode_untimestamped">
              <option v-for="o in modeOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </label>
          <label>带时标数据上送方式
            <select v-model="ops.upload_mode_timestamped">
              <option v-for="o in modeOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </label>

          <label>选择应答
            <select v-model="ops.select_ack_cot">
              <option v-for="o in cotOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </label>
          <label>执行应答
            <select v-model="ops.execute_ack_cot">
              <option v-for="o in cotOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </label>
          <label>取消应答
            <select v-model="ops.cancel_ack_cot">
              <option v-for="o in cotOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </label>

          <div class="row">
            <label>随机变位 每发送
              <input type="number" v-model.number="ops.random_pacing.batch_size" min="1" max="100000" />
              个,
            </label>
            <label>延迟
              <input type="number" v-model.number="ops.random_pacing.delay_ms" min="0" max="60000" />
              毫秒
            </label>
          </div>

          <label class="checkbox">
            <input type="checkbox" v-model="ops.auto_packing" />
            自动组包发送 (连续 IOA 合并)
          </label>

          <button class="apply" @click="applyOps">应用</button>
        </section>

        <section class="section">
          <h4>固定变位</h4>
          <div class="row">
            <label>IOA
              <input type="number" v-model.number="ops.fixed_mutation.ioa" min="0" max="16777215" />
            </label>
            <label>类型
              <select v-model="ops.fixed_mutation.asdu_type">
                <option v-for="t in asduTypeOptions" :key="t" :value="t">{{ t }}</option>
              </select>
            </label>
            <label>周期 (ms)
              <input type="number" v-model.number="ops.fixed_mutation.period_ms" min="50" max="60000" />
            </label>
          </div>
          <div class="row">
            <button @click="startFixed" :disabled="fixedRunning">开始</button>
            <button @click="stopFixed" :disabled="!fixedRunning">停止</button>
            <span class="muted" v-if="fixedRunning">运行中</span>
          </div>
        </section>

        <p v-if="lastError" class="error">{{ lastError }}</p>
        <p v-if="loading" class="muted">加载中...</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.remote-params {
  display: flex;
  flex-direction: row;
  height: 100%;
  background: var(--c-mantle);
  border-left: 1px solid var(--c-surface0);
}

.remote-params.collapsed {
  width: 36px;
}

.toggle {
  width: 36px;
  background: var(--c-surface0);
  color: var(--c-text);
  border: none;
  cursor: pointer;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  padding: 8px 4px;
  font-size: 12px;
}

.body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px 16px;
  font-size: 12px;
  color: var(--c-text);
}

.section {
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--c-surface0);
}

.section h4 {
  font-size: 12px;
  margin: 0 0 8px;
  color: var(--c-blue);
}

.section label {
  display: block;
  margin-bottom: 5px;
}

.section label.checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
}

.section .grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 8px;
}

.section .row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.section input[type="number"],
.section select {
  width: 100%;
  padding: 2px 4px;
  background: var(--c-base);
  color: var(--c-text);
  border: 1px solid var(--c-surface1);
  border-radius: 3px;
  font-size: 12px;
}

.section .row input[type="number"] {
  width: 80px;
}

.apply {
  margin-top: 6px;
  padding: 4px 10px;
  background: var(--c-blue);
  color: var(--c-base);
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.apply:hover { filter: brightness(1.1); }

.section button {
  padding: 3px 8px;
  background: var(--c-surface0);
  color: var(--c-text);
  border: 1px solid var(--c-surface1);
  border-radius: 3px;
  cursor: pointer;
}

.section button:disabled { opacity: 0.5; cursor: not-allowed; }

.hint {
  color: var(--c-subtext0);
  padding: 16px 8px;
  text-align: center;
}

.muted { color: var(--c-subtext0); font-size: 11px; }
.error { color: var(--c-red); font-size: 11px; }
</style>
