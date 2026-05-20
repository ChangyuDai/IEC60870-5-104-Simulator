<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
import { useRemoteParams } from '../composables/useRemoteParams'
import RemoteParamsForm from './RemoteParamsForm.vue'

// 与 App.vue 中 provide 的 selectedServerId 联动
const selectedServerId = inject<Ref<string | null>>('selectedServerId') as Ref<string | null>

const { timing, ops, loading, lastError, applyTiming, applyOps, setFixedMutation } =
  useRemoteParams(selectedServerId)

const collapsed = ref(false)
const fixedRunning = computed(() => ops.value.fixed_mutation.enabled)

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
        <RemoteParamsForm :timing="timing" :ops="ops">
          <template #actions-timing>
            <button class="apply" @click="applyTiming">应用</button>
            <p class="muted">注:一期仅持久化,运行时计时器尚未严格驱动 t1/t2/t3。</p>
          </template>
          <template #actions-ops>
            <button class="apply" @click="applyOps">应用</button>
          </template>
          <template #actions-fixed>
            <div class="row">
              <button @click="startFixed" :disabled="fixedRunning">开始</button>
              <button @click="stopFixed" :disabled="!fixedRunning">停止</button>
              <span class="muted" v-if="fixedRunning">运行中</span>
            </div>
          </template>
        </RemoteParamsForm>

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

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
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

.row button {
  padding: 3px 8px;
  background: var(--c-surface0);
  color: var(--c-text);
  border: 1px solid var(--c-surface1);
  border-radius: 3px;
  cursor: pointer;
}

.row button:disabled { opacity: 0.5; cursor: not-allowed; }

.hint {
  color: var(--c-subtext0);
  padding: 16px 8px;
  text-align: center;
}

.muted { color: var(--c-subtext0); font-size: 11px; }
.error { color: var(--c-red); font-size: 11px; }
</style>
