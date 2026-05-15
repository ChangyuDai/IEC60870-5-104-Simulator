import { ref, inject, watch, type Ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { dialogKey } from '@shared/composables/useDialog'
import type { showAlert as ShowAlert } from '@shared/composables/useDialog'

export function useCyclicTransmission() {
  const selectedServerId = inject<Ref<string | null>>('selectedServerId')!
  const selectedCA = inject<Ref<number | null>>('selectedCA')!
  const { showAlert } = inject<{ showAlert: typeof ShowAlert }>(dialogKey)!

  const active = ref(false)
  const intervalMs = ref(2000)

  async function toggle() {
    if (!selectedServerId.value || selectedCA.value === null) return
    active.value = !active.value
    try {
      await invoke('set_cyclic_config', {
        request: {
          server_id: selectedServerId.value,
          common_address: selectedCA.value,
          enabled: active.value,
          interval_ms: intervalMs.value,
        },
      })
    } catch (e) {
      await showAlert(String(e))
      active.value = false
    }
  }

  watch([selectedServerId, selectedCA], () => {
    active.value = false
  })

  return { active, intervalMs, toggle }
}
