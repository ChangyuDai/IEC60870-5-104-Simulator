<script setup lang="ts">
import { inject, ref, type Ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { dialogKey } from '@shared/composables/useDialog'
import type { showAlert as ShowAlert } from '@shared/composables/useDialog'
import AboutDialog from '@shared/components/AboutDialog.vue'
import ControlDialog from './ControlDialog.vue'
import NewConnectionModal from './NewConnectionModal.vue'
import LangSwitch from '@shared/components/LangSwitch.vue'
import VersionBadge from '@shared/components/VersionBadge.vue'
import { useI18n } from '@shared/i18n'

const { t } = useI18n()

const { showAlert } = inject<{ showAlert: typeof ShowAlert }>(dialogKey)!
const openParseFrame = inject<(prefill?: string) => void>('openParseFrame')!
const selectedConnectionId = inject<Ref<string | null>>('selectedConnectionId')!
const selectedConnectionState = inject<Ref<string>>('selectedConnectionState')!
const refreshTree = inject<() => void>('refreshTree')!
const refreshData = inject<() => void>('refreshData')!
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

const showAbout = ref(false)

// Free-form control dialog (entry from the toolbar; no preselected point)
const showCustomControl = ref(false)
const customControlCA = ref<number>(1)
async function openCustomControl() {
  customControlCA.value = 1
  // If a connection is selected, default the dialog's CA to its first
  // configured Common Address — saves the user a step in single-CA setups
  // and gives a sensible starting point in multi-CA ones.
  if (selectedConnectionId.value) {
    try {
      const conns = await invoke<{ id: string; common_addresses: number[] }[]>('list_connections')
      const conn = conns.find((c) => c.id === selectedConnectionId.value)
      if (conn?.common_addresses?.length) customControlCA.value = conn.common_addresses[0]
    } catch { /* ignore — fall back to 1 */ }
  }
  showCustomControl.value = true
}

// New Connection modal — owned by NewConnectionModal.vue. We expose
// openEditConnection here so App.vue's provide('openEditConnection') can
// forward right-click "Edit" actions from ConnectionTree (Toolbar and
// ConnectionTree are sibling components — provide can't bridge siblings).
const showNewConn = ref(false)
const newConnModalRef = ref<InstanceType<typeof NewConnectionModal> | null>(null)
function openEditConnection(connId: string) {
  return newConnModalRef.value?.openEditConnection(connId)
}
function openNewConnection() {
  newConnModalRef.value?.openNew()
}
defineExpose({ openEditConnection })

async function getConnCAs(): Promise<number[]> {
  const conns = await invoke<any[]>('list_connections')
  const conn = conns.find((c: any) => c.id === selectedConnectionId.value)
  const list: unknown = conn?.common_addresses
  if (Array.isArray(list) && list.length > 0) return list as number[]
  return [conn?.common_address ?? 1]
}

// Fan out a per-CA invocation across all CAs of the current connection
// concurrently. Backend serializes I-frame writes via send_lock, but
// running the IPC round-trips in parallel still saves a 3×CA latency multiplier.
async function fanOutCAs(cmd: string): Promise<void> {
  const cas = await getConnCAs()
  await Promise.all(
    cas.map((ca) => invoke(cmd, { id: selectedConnectionId.value, commonAddress: ca })),
  )
}

async function connectMaster() {
  if (!selectedConnectionId.value) return
  try {
    await invoke('connect_master', { id: selectedConnectionId.value })
    selectedConnectionState.value = 'Connected'
    refreshTree()
    try {
      await fanOutCAs('send_interrogation')
      refreshData()
      setTimeout(() => refreshTree(), 3000)
    } catch (e) {
      console.warn('Auto GI after connect failed:', e)
    }
  } catch (e) {
    await showAlert(String(e))
  }
}

async function disconnectMaster() {
  if (!selectedConnectionId.value) return
  let alertErr: unknown = null
  try {
    await invoke('disconnect_master', { id: selectedConnectionId.value })
  } catch (e) {
    // "NotConnected" is benign: backend already saw the socket close before
    // the user clicked. For any other error we still surface it but also
    // force the UI to Disconnected so the user isn't stuck with a dead
    // button while the backend reconciles.
    const msg = String(e)
    if (!msg.includes('NotConnected') && !msg.includes('not connected')) {
      alertErr = e
    }
  } finally {
    selectedConnectionState.value = 'Disconnected'
    refreshTree()
  }
  if (alertErr !== null) {
    await showAlert(String(alertErr))
  }
}

async function deleteMaster() {
  if (!selectedConnectionId.value) return
  try {
    await invoke('delete_connection', { id: selectedConnectionId.value })
    selectedConnectionId.value = null
    selectedConnectionState.value = 'Disconnected'
    refreshTree()
  } catch (e) {
    await showAlert(String(e))
  }
}

async function sendGI() {
  if (!selectedConnectionId.value) return
  try {
    await fanOutCAs('send_interrogation')
    refreshData()
    setTimeout(() => refreshTree(), 3000)
  } catch (e) {
    await showAlert(String(e))
  }
}

async function sendClockSync() {
  if (!selectedConnectionId.value) return
  try {
    await fanOutCAs('send_clock_sync')
  } catch (e) {
    await showAlert(String(e))
  }
}

async function sendCounterRead() {
  if (!selectedConnectionId.value) return
  try {
    await fanOutCAs('send_counter_read')
    refreshData()
    setTimeout(() => refreshTree(), 3000)
  } catch (e) {
    await showAlert(String(e))
  }
}

const isConnected = () => selectedConnectionState.value === 'Connected'
const hasConnection = () => selectedConnectionId.value !== null
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-group">
      <button class="toolbar-btn" @click="openNewConnection">
        <span class="btn-icon">+</span> {{ t('toolbar.newConnection') }}
      </button>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn btn-start" :disabled="!hasConnection() || isConnected()" @click="connectMaster">
        {{ t('toolbar.connect') }}
      </button>
      <button class="toolbar-btn btn-stop" :disabled="!hasConnection() || !isConnected()" @click="disconnectMaster">
        {{ t('toolbar.disconnect') }}
      </button>
      <button class="toolbar-btn btn-close" :disabled="!hasConnection()" @click="deleteMaster">
        {{ t('toolbar.delete') }}
      </button>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn" :disabled="!hasConnection() || !isConnected()" @click="sendGI">
        {{ t('toolbar.sendGI') }}
      </button>
      <button class="toolbar-btn" :disabled="!hasConnection() || !isConnected()" @click="sendClockSync">
        {{ t('toolbar.clockSync') }}
      </button>
      <button class="toolbar-btn" :disabled="!hasConnection() || !isConnected()" @click="sendCounterRead">
        {{ t('toolbar.counterRead') }}
      </button>
      <button class="toolbar-btn" :disabled="!hasConnection() || !isConnected()" @click="openCustomControl">
        {{ t('toolbar.customControl') }}
      </button>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn" @click="openParseFrame()">
        {{ t('toolbar.parseFrame') }}
      </button>
    </div>

    <div class="toolbar-spacer"></div>
    <button class="toolbar-btn" :disabled="updateChecking" @click="manualCheckUpdate">
      {{ updateChecking ? t('toolbar.checkingUpdate') : t('toolbar.checkUpdate') }}
    </button>
    <LangSwitch />
    <VersionBadge />
    <button class="toolbar-title as-button" @click="showAbout = true" :title="t('toolbar.about')">
      {{ t('toolbar.appTitle') }}
    </button>
  </div>

  <AboutDialog :visible="showAbout" @close="showAbout = false" />

  <!-- Free-form control dialog. The user can pick a CA, type any IOA,
       choose a command type, and send — independent of any selected
       data point. Useful for sending control commands to IOAs that
       haven't been received yet (e.g. write-only points). -->
  <ControlDialog
    :visible="showCustomControl"
    :connection-id="selectedConnectionId"
    :common-address="customControlCA"
    :prefill-ioa="null"
    :prefill-command-type="null"
    @close="showCustomControl = false"
  />

  <NewConnectionModal ref="newConnModalRef" v-model:visible="showNewConn" />
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  height: 42px;
  padding: 0 8px;
  gap: 0;
}

.toolbar-group {
  display: flex;
  gap: 2px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--c-surface0);
  margin: 0 6px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: none;
  background: transparent;
  color: var(--c-text);
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.toolbar-btn:hover:not(:disabled) {
  background: var(--c-surface0);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.btn-icon {
  font-weight: bold;
  font-size: 14px;
}

.btn-start { color: var(--c-green); }
.btn-stop { color: var(--c-peach); }
.btn-close { color: var(--c-red); }

.toolbar-spacer {
  flex: 1;
}

.toolbar-title {
  font-size: 13px;
  font-weight: 600;
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
