<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { useRemoteParams } from '../composables/useRemoteParams'
import RemoteParamsForm from './RemoteParamsForm.vue'
import type { ProtocolTimingConfig, RemoteOperationConfig } from '../types'

const selectedServerId = inject<Ref<string | null>>('selectedServerId') as Ref<string | null>

const { timing, ops, loading, lastError, load, applyTiming, applyOps, setFixedMutation } =
  useRemoteParams(selectedServerId)

const collapsed = ref(false)
const saving = ref(false)
const savedFlash = ref(false)
let flashTimer: ReturnType<typeof setTimeout> | null = null

// Dirty 基线忽略 fixed_mutation.enabled —— 启停由独立按钮即时生效, 不应被算作"未保存修改"
function snapshot(t: ProtocolTimingConfig, o: RemoteOperationConfig): string {
  return JSON.stringify({
    t,
    o: {
      ...o,
      fixed_mutation: { ...o.fixed_mutation, enabled: false },
    },
  })
}

const baselineKey = ref<string>('')
watch(loading, (l) => {
  baselineKey.value = l ? '' : snapshot(timing.value, ops.value)
}, { immediate: true })

const dirty = computed(() =>
  baselineKey.value !== '' && snapshot(timing.value, ops.value) !== baselineKey.value
)

const saveLabel = computed(() =>
  saving.value ? '保存中…' : savedFlash.value ? '已保存' : '保存全部'
)

function clearFlashTimer() {
  if (flashTimer !== null) {
    clearTimeout(flashTimer)
    flashTimer = null
  }
}

onBeforeUnmount(clearFlashTimer)

async function saveAll() {
  if (!selectedServerId.value || saving.value || !dirty.value) return
  saving.value = true
  clearFlashTimer()
  savedFlash.value = false
  try {
    await applyTiming()
    if (lastError.value) return
    await applyOps()
    if (lastError.value) return
    await setFixedMutation({ ...ops.value.fixed_mutation })
    if (lastError.value) return
    baselineKey.value = snapshot(timing.value, ops.value)
    savedFlash.value = true
    flashTimer = setTimeout(() => {
      savedFlash.value = false
      flashTimer = null
    }, 1200)
  } finally {
    saving.value = false
  }
}

async function discardChanges() {
  if (saving.value) return
  await load()
  baselineKey.value = snapshot(timing.value, ops.value)
}

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
    <button class="rp-toggle" @click="toggle" :title="collapsed ? '展开远动参数' : '折叠'">
      <span v-if="!collapsed">远动运行参数 ▸</span>
      <span v-else>◂</span>
    </button>

    <div v-if="!collapsed" class="rp-body">
      <header class="rp-head">
        <div class="rp-head-title">
          <span class="rp-head-eyebrow">REMOTE OPS</span>
          <h3>远动运行参数</h3>
        </div>
        <div class="rp-head-actions">
          <button
            v-if="dirty"
            class="rp-btn rp-btn-ghost"
            :disabled="saving"
            @click="discardChanges"
            title="放弃修改 · 重新载入"
          >放弃</button>
          <button
            class="rp-btn rp-btn-primary"
            :class="{ 'is-dirty': dirty, 'is-flash': savedFlash }"
            :disabled="saving || !dirty || !selectedServerId"
            @click="saveAll"
          >
            <span class="rp-btn-dot" v-if="dirty" />
            {{ saveLabel }}
          </button>
        </div>
      </header>

      <div v-if="!selectedServerId" class="rp-empty">
        <span class="rp-empty-mark">·</span>
        <span>请先在左侧选择一个服务器</span>
      </div>

      <template v-else>
        <RemoteParamsForm :timing="timing" :ops="ops">
          <template #actions-fixed="{ enabled }">
            <div class="rp-fixed-actions">
              <button class="rp-tag-btn rp-tag-start" @click="startFixed" :disabled="enabled">
                <span class="rp-pulse" v-if="!enabled" /> 启动
              </button>
              <button class="rp-tag-btn rp-tag-stop" @click="stopFixed" :disabled="!enabled">停止</button>
              <span class="rp-fixed-state" :class="{ on: enabled }">
                <span class="rp-state-dot" />
                {{ enabled ? '运行中' : '空闲' }}
              </span>
            </div>
          </template>
        </RemoteParamsForm>

        <p v-if="lastError" class="rp-error">{{ lastError }}</p>
        <p v-if="loading" class="rp-muted">载入中…</p>
        <p class="rp-foot-note">t1/t2/t3 当前仅持久化，运行时计时器未完全驱动。</p>
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

.remote-params.collapsed { width: 36px; }

.rp-toggle {
  width: 36px;
  background: var(--c-surface0);
  color: var(--c-text);
  border: none;
  cursor: pointer;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  padding: 8px 4px;
  font: 600 11px/1 ui-monospace, "SF Mono", Menlo, monospace;
  letter-spacing: 0.08em;
}

.rp-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  font-size: 12px;
  color: var(--c-text);
}

.rp-head {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 10px 12px 10px;
  background: linear-gradient(180deg, var(--c-mantle) 0%, var(--c-mantle) 70%, color-mix(in srgb, var(--c-mantle) 80%, transparent) 100%);
  border-bottom: 1px solid var(--c-surface0);
  backdrop-filter: blur(6px);
}

.rp-head-title { flex: 1; min-width: 0; }

.rp-head-eyebrow {
  display: block;
  font: 600 9.5px/1 ui-monospace, "SF Mono", Menlo, monospace;
  letter-spacing: 0.16em;
  color: var(--c-overlay0);
  margin-bottom: 4px;
}

.rp-head h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
  letter-spacing: 0.01em;
}

.rp-head-actions { display: flex; align-items: center; gap: 6px; }

.rp-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  font: 600 11px/1.2 -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: 0.02em;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 100ms, border-color 100ms, color 100ms, transform 60ms;
}

.rp-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.rp-btn:active:not(:disabled) { transform: translateY(0.5px); }

.rp-btn-ghost {
  background: transparent;
  color: var(--c-subtext0);
  border-color: var(--c-surface1);
}

.rp-btn-ghost:hover:not(:disabled) {
  color: var(--c-text);
  border-color: var(--c-surface2);
}

.rp-btn-primary {
  background: var(--c-surface0);
  color: var(--c-subtext0);
  border-color: var(--c-surface1);
}

.rp-btn-primary.is-dirty {
  background: var(--c-blue);
  color: var(--c-base);
  border-color: var(--c-blue);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--c-blue) 25%, transparent);
}

.rp-btn-primary.is-flash {
  background: var(--c-green);
  color: var(--c-base);
  border-color: var(--c-green);
}

.rp-btn-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 6px currentColor;
}

.rp-body > :not(.rp-head):not(.rp-empty) { padding: 0 12px; }
.rp-body > .rp-head + :not(.rp-empty) { margin-top: 10px; }

.rp-empty {
  margin: 24px 12px;
  padding: 18px 14px;
  border: 1px dashed var(--c-surface0);
  border-radius: 6px;
  color: var(--c-subtext0);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.rp-empty-mark {
  font: 600 18px/1 ui-monospace, "SF Mono", Menlo, monospace;
  color: var(--c-overlay0);
}

.rp-fixed-actions {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rp-tag-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--c-mantle);
  color: var(--c-text);
  border: 1px solid var(--c-surface1);
  border-radius: 3px;
  font: 600 11px/1 -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
}

.rp-tag-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.rp-tag-start:not(:disabled):hover { border-color: var(--c-green); color: var(--c-green); }
.rp-tag-stop:not(:disabled):hover { border-color: var(--c-red); color: var(--c-red); }

.rp-fixed-state {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font: 600 10.5px/1 ui-monospace, "SF Mono", Menlo, monospace;
  letter-spacing: 0.06em;
  color: var(--c-overlay0);
  text-transform: uppercase;
}

.rp-state-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-overlay0);
}

.rp-fixed-state.on { color: var(--c-green); }
.rp-fixed-state.on .rp-state-dot {
  background: var(--c-green);
  box-shadow: 0 0 6px var(--c-green);
  animation: rp-pulse 1.4s ease-in-out infinite;
}

.rp-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-green);
  animation: rp-pulse 1.4s ease-in-out infinite;
}

@keyframes rp-pulse {
  0%, 100% { opacity: 0.55; transform: scale(1); }
  50%      { opacity: 1;    transform: scale(1.2); }
}

.rp-muted { color: var(--c-subtext0); font-size: 11px; padding: 4px 0 8px; }
.rp-error {
  margin-top: 8px;
  padding: 6px 8px;
  font-size: 11.5px;
  color: var(--c-red);
  background: color-mix(in srgb, var(--c-red) 12%, transparent);
  border-left: 2px solid var(--c-red);
  border-radius: 3px;
}

.rp-foot-note {
  margin: 4px 0 14px;
  padding: 6px 8px;
  font-size: 10.5px;
  color: var(--c-overlay0);
  border-left: 2px solid var(--c-surface1);
  background: var(--c-base);
  border-radius: 0 3px 3px 0;
}
</style>
