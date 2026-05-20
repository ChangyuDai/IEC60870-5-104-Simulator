<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { dialogKey } from '@shared/composables/useDialog'
import type { showAlert as ShowAlert } from '@shared/composables/useDialog'
import { useI18n } from '@shared/i18n'
import { ASDU_TYPE_OPTIONS } from '../constants/asduTypes'
import type { DataPointInfo } from '../types'
import {
  IOA_MAX,
  compressRanges,
  lowerBound,
  findNextFreeGap,
} from './batchAdd/ioaRanges'

const { t } = useI18n()
const { showAlert } = inject<{ showAlert: typeof ShowAlert }>(dialogKey)!

interface Props {
  visible: boolean
  serverId: string
  commonAddress: number
  // Caller passes the parent's already-IOA-sorted point list. We filter by
  // current ASDU type — same-IOA collisions across different types are not
  // collisions, so we never need the full DataPointInfo, just (ioa, asdu_type).
  existingPoints: ReadonlyArray<Pick<DataPointInfo, 'ioa' | 'asdu_type'>>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  added: []
}>()

const ASDU_TYPES = computed(() =>
  ASDU_TYPE_OPTIONS.map(o => ({ value: o.value, label: t(o.labelKey), typeId: o.typeId }))
)

const startIoa = ref(0)
const count = ref(10)
const formAsduType = ref('MSpNa1')
const namePrefix = ref('')
const isSaving = ref(false)

const endIoa = computed(() => startIoa.value + count.value - 1)

const isValid = computed(() => {
  return count.value > 0 && count.value <= 100000 && startIoa.value >= 0
})

// existingPoints arrives IOA-sorted from the parent and (ioa, asdu_type) is
// unique upstream (DataPointTable's dataMap is keyed by that pair), so
// filter alone is enough — no Set/sort needed.
const existingSameTypeIoas = computed<number[]>(() =>
  props.existingPoints
    .filter(p => p.asdu_type === formAsduType.value)
    .map(p => p.ioa),
)

const existingRangesText = computed<string>(() =>
  compressRanges(existingSameTypeIoas.value),
)

const conflictCount = computed<number>(() => {
  const xs = existingSameTypeIoas.value
  if (xs.length === 0 || count.value <= 0 || startIoa.value < 0) return 0
  const lo = startIoa.value
  const hi = lo + count.value - 1
  return lowerBound(xs, hi + 1) - lowerBound(xs, lo)
})

const conflictRanges = computed<string>(() => {
  const xs = existingSameTypeIoas.value
  if (xs.length === 0 || conflictCount.value === 0) return ''
  const lo = startIoa.value
  const hi = lo + count.value - 1
  const start = lowerBound(xs, lo)
  const end = lowerBound(xs, hi + 1)
  return compressRanges(xs.slice(start, end))
})

const nextAvailableIoa = computed<number | null>(() => {
  const xs = existingSameTypeIoas.value
  if (xs.length === 0) return null
  const next = xs[xs.length - 1] + 1
  return next > IOA_MAX ? null : next
})

const nextFreeGapStart = computed<number | null>(() =>
  count.value > 0 ? findNextFreeGap(existingSameTypeIoas.value, count.value) : null,
)

const canApplyNextIoa = computed(() => nextAvailableIoa.value !== null)
const canApplyNextGap = computed(() => nextFreeGapStart.value !== null)

const nextIoaDisabledTooltip = computed(() => {
  if (existingSameTypeIoas.value.length === 0) return t('batchModal.nextIoaTooltipEmpty')
  if (nextAvailableIoa.value === null) return t('batchModal.capacityFullTooltip')
  return ''
})

const nextGapDisabledTooltip = computed(() =>
  nextFreeGapStart.value === null ? t('batchModal.capacityFullTooltip') : '',
)

function applyNextAvailableIoa() {
  if (nextAvailableIoa.value !== null) startIoa.value = nextAvailableIoa.value
}

function applyNextFreeGap() {
  if (nextFreeGapStart.value !== null) startIoa.value = nextFreeGapStart.value
}

// Task-5 template will consume these — suppress noUnusedLocals until then.
void conflictRanges
void canApplyNextIoa
void canApplyNextGap
void nextIoaDisabledTooltip
void nextGapDisabledTooltip
void applyNextAvailableIoa
void applyNextFreeGap

watch(() => props.visible, (visible) => {
  if (visible) {
    startIoa.value = 0
    count.value = 10
    formAsduType.value = 'MSpNa1'
    namePrefix.value = ''
    isSaving.value = false
  }
})

async function handleConfirm() {
  if (!isValid.value) return
  isSaving.value = true

  try {
    await invoke('batch_add_data_points', {
      request: {
        server_id: props.serverId,
        common_address: props.commonAddress,
        start_ioa: startIoa.value,
        count: count.value,
        asdu_type: formAsduType.value,
        name_prefix: namePrefix.value || null,
      },
    })
    emit('added')
  } catch (e) {
    await showAlert(t('batchModal.failedPrefix', { err: String(e) }))
  } finally {
    isSaving.value = false
  }
}

function handleBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-pop">
    <div v-if="visible" class="modal-backdrop dialog-blur" @click="handleBackdropClick">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">{{ t('batchModal.title') }}</span>
          <button class="btn-close" @click="$emit('close')">×</button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <div class="form-group half">
              <label class="form-label">{{ t('batchModal.startIoa') }}</label>
              <input
                v-model.number="startIoa"
                type="number"
                class="form-input"
                min="0"
              />
            </div>
            <div class="form-group half">
              <label class="form-label">{{ t('batchModal.count') }}</label>
              <input
                v-model.number="count"
                type="number"
                class="form-input"
                min="1"
                max="100000"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('batchModal.asduTypeLabel') }}</label>
            <select v-model="formAsduType" class="form-select">
              <option v-for="opt in ASDU_TYPES" :key="opt.value" :value="opt.value">
                {{ opt.label }} · {{ opt.typeId }}
              </option>
            </select>
            <div v-if="existingSameTypeIoas.length > 0" class="existing-summary">
              {{ t('batchModal.existingSameType', { count: existingSameTypeIoas.length }) }}
              <span class="ioa-ranges">IOA: {{ existingRangesText }}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('batchModal.namePrefix') }}</label>
            <input
              v-model="namePrefix"
              type="text"
              class="form-input"
              :placeholder="t('batchModal.namePrefixPlaceholder')"
            />
          </div>

          <div class="count-info">
            <span v-if="count > 100000" class="count-warn">{{ t('batchModal.countWarn') }}</span>
            <template v-else>
              <span>{{ t('batchModal.rangeHint', { startIoa, endIoa, count }) }}</span>
            </template>
          </div>
          <div v-if="conflictCount > 0" class="conflict-warn">
            {{ t('batchModal.conflictWarn', { count: conflictCount }) }}
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="$emit('close')" :disabled="isSaving">{{ t('common.cancel') }}</button>
          <button class="btn btn-primary" @click="handleConfirm" :disabled="!isValid || isSaving">
            {{ isSaving ? t('batchModal.saving') : t('batchModal.add') }}
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
  width: 420px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--c-surface0);
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--c-text);
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
  padding: 20px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group.half {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 13px;
  color: var(--c-overlay0);
  margin-bottom: 6px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 8px 12px;
  background: var(--c-crust);
  border: 1px solid var(--c-surface1);
  border-radius: 6px;
  color: var(--c-text);
  font-size: 14px;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--c-blue);
}

.count-info {
  font-size: 13px;
  color: var(--c-subtext0);
  padding: 8px 0;
}

.count-info strong {
  color: var(--c-green);
}

.count-warn {
  color: var(--c-red);
}

.existing-summary {
  margin-top: 6px;
  font-size: 12px;
  color: var(--c-overlay1);
}

.existing-summary .ioa-ranges {
  font-family: var(--font-mono);
  color: var(--c-text);
  margin-left: 6px;
  word-break: break-all;
}

.conflict-warn {
  color: var(--c-red);
  font-size: 12px;
  margin-top: 2px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid var(--c-surface0);
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: var(--c-blue);
  color: var(--c-base);
  font-weight: 600;
}

.btn-primary:hover {
  background: var(--c-sapphire);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--c-surface1);
  color: var(--c-text);
}

.btn-secondary:hover {
  background: var(--c-surface2);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
