import { ref, onUnmounted } from 'vue'
import { openUrl } from '@tauri-apps/plugin-opener'
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

  // Open an external URL in the system browser. Inside a Tauri webview a plain
  // <a>/window.open can't reach the OS browser, so we go through the opener
  // plugin. Outside Tauri (pure-browser static render) openUrl throws — fall
  // back to copying the URL so the action is never a dead click.
  async function openOrCopy(url: string, label?: string) {
    try {
      await openUrl(url)
    } catch {
      await copy(url, label)
    }
  }

  onUnmounted(() => {
    if (timer !== null) clearTimeout(timer)
  })

  return { flash, copy, openOrCopy }
}
