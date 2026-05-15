import { ref, onUnmounted } from 'vue'
import { useI18n } from '../i18n'

export function useClipboardFlash(timeoutMs = 1500) {
  const { t } = useI18n()
  const flash = ref('')
  let timer: number | null = null

  async function copy(text: string, label?: string) {
    try {
      await navigator.clipboard.writeText(text)
      flash.value = `${label ?? text} ${t('about.copiedSuffix')}`
    } catch {
      flash.value = text
    }
    if (timer !== null) clearTimeout(timer)
    timer = window.setTimeout(() => { flash.value = ''; timer = null }, timeoutMs)
  }

  onUnmounted(() => {
    if (timer !== null) clearTimeout(timer)
  })

  return { flash, copy }
}
