import { ref, inject, watch, onUnmounted, type Ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'

export function useMutationTimer() {
  const selectedServerId = inject<Ref<string | null>>('selectedServerId')!
  const selectedCA = inject<Ref<number | null>>('selectedCA')!
  const refreshData = inject<() => void>('refreshData')!

  const active = ref(false)
  const rateMs = ref(1000)
  let timer: number | null = null

  function stop() {
    active.value = false
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  function schedule() {
    if (!active.value) return
    timer = window.setTimeout(async () => {
      if (!active.value || !selectedServerId.value || selectedCA.value === null) {
        stop()
        return
      }
      try {
        await invoke('random_mutate_data_points', {
          request: {
            server_id: selectedServerId.value,
            common_address: selectedCA.value,
          },
        })
        refreshData()
      } catch (e) {
        console.error('mutation failed:', e)
      }
      schedule()
    }, rateMs.value)
  }

  function start() {
    if (!selectedServerId.value || selectedCA.value === null) return
    active.value = true
    schedule()
  }

  function toggle() {
    if (active.value) stop()
    else start()
  }

  watch([selectedServerId, selectedCA], () => {
    if (active.value) stop()
  })

  onUnmounted(() => {
    if (timer !== null) clearTimeout(timer)
  })

  return { active, rateMs, toggle }
}
