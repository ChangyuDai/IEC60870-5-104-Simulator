<script setup lang="ts">
import { ref, inject, type Ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { save, open } from '@tauri-apps/plugin-dialog'
import { openUrl } from '@tauri-apps/plugin-opener'
import { dialogKey } from '@shared/composables/useDialog'
import type { showAlert as ShowAlert, showPrompt as ShowPrompt, showConfirm as ShowConfirm } from '@shared/composables/useDialog'
import AboutDialog from '@shared/components/AboutDialog.vue'
import LangSwitch from '@shared/components/LangSwitch.vue'
import VersionBadge from '@shared/components/VersionBadge.vue'
import NewServerModal from './NewServerModal.vue'
import { useI18n } from '@shared/i18n'

const { t } = useI18n()
const showAbout = ref(false)

const selectedServerId = inject<Ref<string | null>>('selectedServerId')!
const selectedServerState = inject<Ref<string>>('selectedServerState')!
const refreshTree = inject<() => void>('refreshTree')!
const { showAlert, showPrompt, showConfirm } = inject<{
  showAlert: typeof ShowAlert
  showPrompt: typeof ShowPrompt
  showConfirm: typeof ShowConfirm
}>(dialogKey)!
const openParseFrame = inject<(prefill?: string) => void>('openParseFrame')!
const openRuntimeParamsDrawer = inject<() => void>('openRuntimeParamsDrawer')!

type UpdateMeta = { version: string; notes: string; pub_date?: string | null }
const checkUpdate = inject<(force?: boolean) => Promise<UpdateMeta | null>>('checkUpdate')!
const updateChecking = ref(false)
const MIRROR_RELEASE_URL = 'https://ghfast.top/https://github.com/Karl-Dai/IEC60870-5-104-Simulator/releases/latest'

async function manualCheckUpdate() {
  if (updateChecking.value) return
  updateChecking.value = true
  try {
    const meta = await checkUpdate(true)
    if (!meta) await showAlert(t('toolbar.alreadyLatest'))
  } catch (e) {
    console.warn('update check failed', e)
    const wantMirror = await showConfirm(t('toolbar.updateCheckFailedMirrorPrompt'))
    if (wantMirror) {
      try {
        await openUrl(MIRROR_RELEASE_URL)
      } catch (err) {
        await showAlert(`${t('toolbar.updateCheckFailed')}: ${err}`)
      }
    }
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

async function saveConfig() {
  const path = await save({
    filters: [{ name: 'IEC104 Config', extensions: ['json'] }],
    defaultPath: 'iec104-slave-config.json',
  })
  if (!path) return
  try {
    await invoke('save_config', { path })
    await showAlert(t('toolbar.configSaved'))
  } catch (e) {
    await showAlert(`${t('toolbar.configSaveFailed')}: ${e}`)
  }
}

async function openConfig() {
  const path = await open({
    multiple: false,
    filters: [{ name: 'IEC104 Config', extensions: ['json'] }],
  })
  if (!path || typeof path !== 'string') return
  try {
    const count = await invoke<number>('load_config', { path })
    refreshTree()
    await showAlert(t('toolbar.configLoaded', { count }))
  } catch (e) {
    await showAlert(`${t('toolbar.configLoadFailed')}: ${e}`)
  }
}

</script>

<template>
  <div class="toolbar">
    <div class="toolbar-main">
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
    <div class="toolbar-group">
      <button class="toolbar-btn" @click="openParseFrame()" :title="t('toolbar.parseFrame')">
        <span class="toolbar-label">{{ t('toolbar.parseFrame') }}</span>
      </button>
      <button
        class="toolbar-btn toolbar-btn-params"
        :disabled="!selectedServerId"
        @click="openRuntimeParamsDrawer()"
        :title="t('runtimeParams.title')"
      >
        <svg class="toolbar-icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="8" cy="8" r="2.1"/>
          <path d="M8 1.5v1.6M8 12.9v1.6M3.4 3.4l1.13 1.13M11.47 11.47l1.13 1.13M1.5 8h1.6M12.9 8h1.6M3.4 12.6l1.13-1.13M11.47 4.53l1.13-1.13"/>
        </svg>
        <span class="toolbar-label">{{ t('runtimeParams.title') }}</span>
      </button>
    </div>
    <div class="toolbar-divider"></div>
    <div class="toolbar-group">
      <button class="toolbar-btn" @click="saveConfig" :title="t('toolbar.saveConfig')">
        <span class="toolbar-label">{{ t('toolbar.saveConfig') }}</span>
      </button>
      <button class="toolbar-btn" @click="openConfig" :title="t('toolbar.openConfig')">
        <span class="toolbar-label">{{ t('toolbar.openConfig') }}</span>
      </button>
    </div>
    </div>
    <div class="toolbar-aside">
      <button class="toolbar-btn toolbar-btn-update" :disabled="updateChecking" @click="manualCheckUpdate">
        {{ updateChecking ? t('toolbar.checkingUpdate') : t('toolbar.checkUpdate') }}
      </button>
      <LangSwitch />
      <VersionBadge />
      <button class="toolbar-title as-button" @click="showAbout = true" :title="t('toolbar.about')">{{ t('toolbar.appTitle') }}</button>
    </div>
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

/* Left operations region: shrinks and scrolls horizontally on narrow windows
   so the right-side status region never gets clipped. */
.toolbar-main {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 2px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
}
.toolbar-main::-webkit-scrollbar {
  height: 6px;
}

/* Right status region: language / version / about — always visible. */
.toolbar-aside {
  flex: none;
  display: flex;
  align-items: center;
  gap: 2px;
  padding-left: 2px;
}

.toolbar-group {
  display: flex;
  gap: 2px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--c-surface0);
  margin: 0 2px;
  flex: none;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 7px;
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

.toolbar-icon-svg {
  width: 13px;
  height: 13px;
  flex: none;
  color: var(--c-subtext0);
  transition: color 100ms linear, transform 220ms ease;
}

.toolbar-btn-params:hover:not(:disabled) .toolbar-icon-svg {
  color: var(--c-blue);
  transform: rotate(45deg);
}

.toolbar-main > .toolbar-group,
.toolbar-main > .toolbar-divider {
  flex: none;
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
