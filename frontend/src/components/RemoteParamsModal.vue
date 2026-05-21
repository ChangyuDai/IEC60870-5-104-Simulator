<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from '@shared/i18n'
import { useRemoteParams } from '../composables/useRemoteParams'
import RemoteParamsForm from './RemoteParamsForm.vue'

const { t } = useI18n()

interface Props {
  visible: boolean
  serverId: string | null
  serverLabel?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  saved: []
}>()

// 独立的 serverId ref —— 不污染 App 的全局 selectedServerId
const localServerId = ref<string | null>(props.serverId)
watch(() => props.serverId, v => { localServerId.value = v })

const { timing, ops, loading, lastError, applyTiming, applyOps, setFixedMutation } =
  useRemoteParams(localServerId)

const isSaving = ref(false)

async function handleSave() {
  if (!localServerId.value) return
  isSaving.value = true
  lastError.value = null
  try {
    await applyTiming()
    if (lastError.value) return
    await applyOps()
    if (lastError.value) return
    await setFixedMutation({ ...ops.value.fixed_mutation })
    if (lastError.value) return
    emit('saved')
    emit('close')
  } finally {
    isSaving.value = false
  }
}

function handleBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
    emit('close')
  }
}

function handleEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.visible) emit('close')
}

watch(() => props.visible, (v) => {
  if (v) {
    window.addEventListener('keydown', handleEsc)
  } else {
    window.removeEventListener('keydown', handleEsc)
    isSaving.value = false
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-pop">
      <div v-if="visible" class="modal-backdrop dialog-blur" @click="handleBackdropClick">
        <div class="modal">
          <div class="modal-header">
            <span class="modal-title">
              {{ t('runtimeParams.title') }}
              <span v-if="serverLabel" class="modal-subtitle">— {{ serverLabel }}</span>
            </span>
            <button class="btn-close" @click="emit('close')">×</button>
          </div>

          <div class="modal-body">
            <div v-if="loading" class="muted">{{ t('runtimeParams.loading') }}</div>
            <RemoteParamsForm v-else :timing="timing" :ops="ops">
              <template #actions-fixed="{ enabled }">
                <label class="fixed-enable">
                  <input type="checkbox" v-model="ops.fixed_mutation.enabled" />
                  <span class="track" :class="{ on: enabled }">
                    <span class="thumb" />
                  </span>
                  <span class="fixed-enable-label">
                    保存后<strong>{{ enabled ? '运行' : '停止' }}</strong>
                  </span>
                </label>
              </template>
            </RemoteParamsForm>
            <p v-if="lastError" class="error">{{ lastError }}</p>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="emit('close')" :disabled="isSaving">
              {{ t('runtimeParams.cancel') }}
            </button>
            <button class="btn btn-primary" @click="handleSave" :disabled="isSaving || loading">
              {{ isSaving ? t('runtimeParams.saving') : t('runtimeParams.save') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  background: var(--c-base);
  border: 1px solid var(--c-surface1);
  border-radius: 8px;
  width: 520px;
  max-width: 92vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--c-surface0);
}

.modal-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text);
}

.modal-subtitle {
  font-weight: 400;
  font-size: 13px;
  color: var(--c-subtext0);
  margin-left: 6px;
}

.btn-close {
  background: none;
  border: none;
  color: var(--c-overlay0);
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.btn-close:hover {
  color: var(--c-text);
}

.modal-body {
  padding: 14px 18px;
  overflow-y: auto;
  color: var(--c-text);
  font-size: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 18px;
  border-top: 1px solid var(--c-surface0);
}

.btn {
  padding: 7px 18px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.btn-primary {
  background: var(--c-blue);
  color: var(--c-base);
  font-weight: 600;
}

.btn-primary:hover { background: var(--c-sapphire); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-secondary {
  background: var(--c-surface1);
  color: var(--c-text);
}

.btn-secondary:hover { background: var(--c-surface2); }
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

.muted { color: var(--c-subtext0); font-size: 12px; }
.error {
  margin-top: 10px;
  padding: 6px 8px;
  font-size: 11.5px;
  color: var(--c-red);
  background: color-mix(in srgb, var(--c-red) 12%, transparent);
  border-left: 2px solid var(--c-red);
  border-radius: 3px;
}

</style>
