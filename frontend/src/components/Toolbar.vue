<script setup lang="ts">
import { ref, inject, type Ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { dialogKey } from '@shared/composables/useDialog'
import type { showAlert as ShowAlert, showPrompt as ShowPrompt } from '@shared/composables/useDialog'
import AboutDialog from '@shared/components/AboutDialog.vue'
import LangSwitch from '@shared/components/LangSwitch.vue'
import VersionBadge from '@shared/components/VersionBadge.vue'
import NewServerModal from './NewServerModal.vue'
import { useI18n } from '@shared/i18n'
import { useMutationTimer } from '../composables/useMutationTimer'
import { useCyclicTransmission } from '../composables/useCyclicTransmission'

const { t } = useI18n()
const showAbout = ref(false)

const selectedServerId = inject<Ref<string | null>>('selectedServerId')!
const selectedServerState = inject<Ref<string>>('selectedServerState')!
const selectedCA = inject<Ref<number | null>>('selectedCA')!
const refreshTree = inject<() => void>('refreshTree')!
const { showAlert, showPrompt } = inject<{
  showAlert: typeof ShowAlert
  showPrompt: typeof ShowPrompt
}>(dialogKey)!
const openParseFrame = inject<(prefill?: string) => void>('openParseFrame')!

const { active: mutationActive, rateMs: mutationRate, toggle: toggleMutation } = useMutationTimer()
const { active: cyclicActive, intervalMs: cyclicInterval, toggle: toggleCyclic } = useCyclicTransmission()

type UpdateMeta = { version: string; notes: string; pub_date?: string | null }
const checkUpdate = inject<(force?: boolean) => Promise<UpdateMeta | null>>('checkUpdate')!
const updateChecking = ref(false)
async function manualCheckUpdate() {
  if (updateChecking.value) return
  updateChecking.value = true
  try {
    const meta = await checkUpdate(true)
    if (!meta) await showAlert(t('toolbar.alreadyLatest'))
  } catch (e) {
    await showAlert(`${t('toolbar.updateCheckFailed')}: ${e}`)
  } finally {
    updateChecking.value = false
  }
}

const showNewServerModal = ref(false)

async function startServer() {
  if (!selectedServerId.value) return
  try {
    await invoke('start_server', { id: selectedServerId.value })
    selectedServerState.value = 'Running'
    refreshTree()
  } catch (e) {
    await showAlert(String(e))
  }
}

async function stopServer() {
  if (!selectedServerId.value) return
  try {
    await invoke('stop_server', { id: selectedServerId.value })
    selectedServerState.value = 'Stopped'
    refreshTree()
  } catch (e) {
    await showAlert(String(e))
  }
}

async function addStation() {
  if (!selectedServerId.value) return
  const caStr = await showPrompt(t('prompt.inputCommonAddress'), '1')
  if (caStr === null) return
  const ca = Number(caStr)
  if (isNaN(ca) || ca < 1 || ca > 65534) {
    await showAlert(t('errors.invalidCa'))
    return
  }
  const defaultName = t('station.defaultName', { ca })
  const name = await showPrompt(t('prompt.inputStationName'), defaultName)
  if (name === null) return
  try {
    await invoke('add_station', {
      request: {
        server_id: selectedServerId.value,
        common_address: ca,
        name: name || '',
      },
    })
    refreshTree()
  } catch (e) {
    await showAlert(String(e))
  }
}

</script>

<template>
  <div class="toolbar">
    <div class="toolbar-group">
      <button class="toolbar-btn" @click="showNewServerModal = true" :title="t('toolbar.titleNewServer')">
        <span class="toolbar-icon">+</span>
        <span class="toolbar-label">{{ t('toolbar.newServer') }}</span>
      </button>
    </div>
    <div class="toolbar-divider"></div>
    <div class="toolbar-group">
      <button
        class="toolbar-btn btn-start"
        @click="startServer"
        :disabled="!selectedServerId || selectedServerState === 'Running'"
        :title="t('toolbar.titleStartServer')"
      >
        <span class="toolbar-label">{{ t('toolbar.start') }}</span>
      </button>
      <button
        class="toolbar-btn btn-stop"
        @click="stopServer"
        :disabled="!selectedServerId || selectedServerState === 'Stopped'"
        :title="t('toolbar.titleStopServer')"
      >
        <span class="toolbar-label">{{ t('toolbar.stop') }}</span>
      </button>
    </div>
    <div class="toolbar-divider"></div>
    <div class="toolbar-group">
      <button
        class="toolbar-btn"
        @click="addStation"
        :disabled="!selectedServerId"
        :title="t('toolbar.titleAddStation')"
      >
        <span class="toolbar-label">{{ t('toolbar.addStation') }}</span>
      </button>
    </div>
    <div class="toolbar-divider"></div>
    <div class="toolbar-group interval-group">
      <button
        :class="['toolbar-btn', { 'btn-mutation-active': mutationActive }]"
        @click="toggleMutation"
        :disabled="!selectedServerId || selectedCA === null"
        :title="t('toolbar.titleRandomMutation')"
      >
        <span class="toolbar-label">{{ mutationActive ? t('toolbar.stopMutation') : t('toolbar.randomMutation') }}</span>
      </button>
      <div class="interval-field">
        <input
          type="number"
          class="interval-input"
          min="100"
          max="60000"
          step="100"
          v-model.number="mutationRate"
          :title="t('toolbar.mutationInterval')"
        />
        <span class="rate-label">ms</span>
      </div>
    </div>
    <div class="toolbar-divider"></div>
    <div class="toolbar-group interval-group">
      <button
        :class="['toolbar-btn', { 'btn-cyclic-active': cyclicActive }]"
        @click="toggleCyclic"
        :disabled="!selectedServerId || selectedCA === null"
        :title="t('toolbar.titleCyclicSend')"
      >
        <span class="toolbar-label">{{ cyclicActive ? t('toolbar.stopCyclic') : t('toolbar.cyclicSend') }}</span>
      </button>
      <div class="interval-field">
        <input
          type="number"
          class="interval-input"
          min="100"
          max="60000"
          step="100"
          v-model.number="cyclicInterval"
          :title="t('toolbar.sendInterval')"
        />
        <span class="rate-label">ms</span>
      </div>
    </div>
    <div class="toolbar-divider"></div>
    <div class="toolbar-group">
      <button class="toolbar-btn" @click="openParseFrame()" :title="t('toolbar.parseFrame')">
        <span class="toolbar-label">{{ t('toolbar.parseFrame') }}</span>
      </button>
    </div>
    <button class="toolbar-btn toolbar-btn-update" :disabled="updateChecking" @click="manualCheckUpdate">
      {{ updateChecking ? t('toolbar.checkingUpdate') : t('toolbar.checkUpdate') }}
    </button>
    <LangSwitch />
    <VersionBadge />
    <button class="toolbar-title as-button" @click="showAbout = true" :title="t('toolbar.about')">{{ t('toolbar.appTitle') }}</button>
  </div>

  <AboutDialog :visible="showAbout" @close="showAbout = false" />
  <NewServerModal v-model:visible="showNewServerModal" />
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  height: 42px;
  padding: 0 8px;
  gap: 6px;
  user-select: none;
  font-size: 13px;
}

.toolbar-group {
  display: flex;
  gap: 2px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--c-surface0);
  margin: 0 4px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: none;
  background: var(--c-surface0);
  color: var(--c-text);
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  white-space: nowrap;
}

.toolbar-btn:hover:not(:disabled) {
  background: var(--c-surface1);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.toolbar-btn.btn-start:not(:disabled) {
  color: var(--c-green);
}

.toolbar-btn.btn-stop:not(:disabled) {
  color: var(--c-peach);
}

.toolbar-icon {
  font-weight: bold;
  font-size: 14px;
}

.toolbar-btn.btn-mutation-active {
  background: var(--c-green);
  color: var(--c-base);
  font-weight: 600;
}

.toolbar-btn.btn-mutation-active:hover {
  background: var(--c-teal);
}

.toolbar-btn.btn-cyclic-active {
  background: var(--c-mauve);
  color: var(--c-base);
  font-weight: 600;
}

.toolbar-btn.btn-cyclic-active:hover {
  background: var(--c-lavender);
}

/* button + value field read as one segmented control */
.interval-group {
  align-items: stretch;
  gap: 0;
}

.interval-group .toolbar-btn {
  border-radius: 4px 0 0 4px;
}

.interval-field {
  display: flex;
  align-items: center;
  gap: 1px;
  padding: 0 7px 0 2px;
  background: var(--c-surface0);
  border: 1px solid var(--c-surface1);
  border-left: none;
  border-radius: 0 4px 4px 0;
}

.interval-field:focus-within {
  border-color: var(--c-blue);
}

.interval-input {
  width: 44px;
  padding: 2px;
  background: transparent;
  border: none;
  color: var(--c-text);
  font-size: 11px;
  font-family: var(--font-mono);
  text-align: right;
  -moz-appearance: textfield;
}

.interval-input::-webkit-inner-spin-button,
.interval-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.rate-label {
  font-size: 10px;
  color: var(--c-overlay0);
  font-family: var(--font-mono);
}

.toolbar-btn-update {
  margin-left: auto;
}

.toolbar-title {
  font-size: 12px;
  color: var(--c-overlay0);
  padding-right: 8px;
}
.toolbar-title.as-button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
}
.toolbar-title.as-button:hover { color: var(--c-text); }

</style>
