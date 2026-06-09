import { ref, watch, type Ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import {
  type ProtocolTimingConfig,
  type RemoteOperationConfig,
  DEFAULT_PROTOCOL_TIMING,
  DEFAULT_REMOTE_OPS,
} from '../types'

/**
 * 与当前选中的从站服务器联动:加载/应用协议时序与远动运行参数,
 * 启停固定变位后台任务。所有命令对接 commands.rs 中的 Tauri 命令。
 */
export function useRemoteParams(selectedServerId: Ref<string | null>) {
  const timing = ref<ProtocolTimingConfig>({ ...DEFAULT_PROTOCOL_TIMING })
  const ops = ref<RemoteOperationConfig>(JSON.parse(JSON.stringify(DEFAULT_REMOTE_OPS)))
  const loading = ref(false)
  const lastError = ref<string | null>(null)

  async function load() {
    const id = selectedServerId.value
    if (!id) {
      timing.value = { ...DEFAULT_PROTOCOL_TIMING }
      ops.value = JSON.parse(JSON.stringify(DEFAULT_REMOTE_OPS))
      return
    }
    loading.value = true
    lastError.value = null
    try {
      const [t, o] = await Promise.all([
        invoke<ProtocolTimingConfig>('get_protocol_timing', { serverId: id }),
        invoke<RemoteOperationConfig>('get_remote_operation_config', { serverId: id }),
      ])
      timing.value = t
      ops.value = o
    } catch (e) {
      lastError.value = String(e)
    } finally {
      loading.value = false
    }
  }

  async function applyTiming() {
    const id = selectedServerId.value
    if (!id) return
    try {
      await invoke('set_protocol_timing', { request: { server_id: id, timing: timing.value } })
    } catch (e) {
      lastError.value = String(e)
    }
  }

  async function applyOps() {
    const id = selectedServerId.value
    if (!id) return
    try {
      await invoke('set_remote_operation_config', { request: { server_id: id, ops: ops.value } })
    } catch (e) {
      lastError.value = String(e)
    }
  }

  watch(selectedServerId, load, { immediate: true })

  return { timing, ops, loading, lastError, load, applyTiming, applyOps }
}
