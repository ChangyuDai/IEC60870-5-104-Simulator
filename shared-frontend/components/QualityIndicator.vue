<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../i18n'

export interface QualityBits {
  ov: boolean
  bl: boolean
  sb: boolean
  nt: boolean
  iv: boolean
}

const props = withDefaults(defineProps<{
  quality: QualityBits
  /** 可编辑时徽章可点击切换(子站);只读时仅展示(主站)。 */
  editable?: boolean
  /** OV 仅测量类适用;非测量类传 false 隐藏 OV 徽章。 */
  showOv?: boolean
  /** 是否渲染 (?) 图例按钮(表格行内场景关闭)。 */
  showHelp?: boolean
  /** 紧凑模式:只渲染置位的品质位,全部正常时显示 OK(用于窄表格列)。 */
  compact?: boolean
}>(), { editable: false, showOv: true, showHelp: true, compact: false })

const emit = defineEmits<{ (e: 'toggle', bit: keyof QualityBits): void }>()
const { t } = useI18n()

// 协议固定顺序与字母,语言无关。
const ALL_BITS: { key: keyof QualityBits; letter: string }[] = [
  { key: 'iv', letter: 'IV' },
  { key: 'nt', letter: 'NT' },
  { key: 'sb', letter: 'SB' },
  { key: 'bl', letter: 'BL' },
  { key: 'ov', letter: 'OV' },
]
// 适用的位(按 showOv 过滤 OV)
const applicable = computed(() => (props.showOv ? ALL_BITS : ALL_BITS.filter((b) => b.key !== 'ov')))
// 实际渲染的徽章:紧凑模式只留置位的
const bits = computed(() =>
  props.compact ? applicable.value.filter((b) => props.quality[b.key]) : applicable.value,
)
const anyLit = computed(() => applicable.value.some((b) => props.quality[b.key]))

const showLegend = ref(false)
function onBadge(key: keyof QualityBits) {
  if (props.editable) emit('toggle', key)
}
</script>

<template>
  <div class="quality-indicator">
    <span class="q-badges">
      <button
        v-for="b in bits"
        :key="b.key"
        type="button"
        class="q-badge"
        :class="[`q-${b.key}`, { lit: quality[b.key], editable }]"
        :disabled="!editable"
        :title="t(`quality.bits.${b.key}.name`)"
        @click="onBadge(b.key)"
      >{{ b.letter }}</button>
      <span v-if="compact && !anyLit" class="q-ok">OK</span>
    </span>
    <button
      v-if="showHelp"
      type="button"
      class="q-help"
      :aria-label="t('quality.legendTitle')"
      @click.stop="showLegend = !showLegend"
    >?</button>
    <div v-if="showLegend" class="q-legend" @click.stop>
      <div class="q-legend-title">{{ t('quality.legendTitle') }}</div>
      <div v-for="b in ALL_BITS" :key="b.key" class="q-legend-row">
        <span class="q-legend-letter">{{ b.letter }}</span>
        <span class="q-legend-name">{{ t(`quality.bits.${b.key}.name`) }}</span>
        <span class="q-legend-desc">{{ t(`quality.bits.${b.key}.desc`) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quality-indicator {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.q-badges {
  display: inline-flex;
  gap: 3px;
}
.q-ok {
  font: 600 11px/1 ui-monospace, monospace;
  color: var(--c-green);
}
.q-badge {
  font: 600 11px/1 ui-monospace, monospace;
  padding: 2px 4px;
  border-radius: 3px;
  border: 1px solid var(--c-surface1);
  background: var(--c-surface0);
  color: var(--c-overlay0);
  cursor: default;
}
.q-badge.editable {
  cursor: pointer;
}
.q-badge.editable:hover {
  border-color: var(--c-overlay0);
}
/* 置位高亮:IV 最严重用红,其余用桃色警示 */
.q-badge.lit {
  color: var(--c-crust);
  border-color: transparent;
  background: var(--c-peach);
}
.q-badge.q-iv.lit {
  background: var(--c-red);
}
.q-help {
  width: 16px;
  height: 16px;
  line-height: 14px;
  border-radius: 50%;
  border: 1px solid var(--c-surface2);
  background: var(--c-surface0);
  color: var(--c-subtext0);
  font-size: 11px;
  cursor: pointer;
  padding: 0;
}
.q-help:hover {
  border-color: var(--c-blue);
  color: var(--c-blue);
}
.q-legend {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 50;
  min-width: 280px;
  padding: 8px 10px;
  background: var(--c-mantle);
  border: 1px solid var(--c-surface1);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}
.q-legend-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--c-subtext1);
  margin-bottom: 6px;
  white-space: nowrap;
}
.q-legend-row {
  display: grid;
  grid-template-columns: 28px 56px 1fr;
  gap: 6px;
  align-items: baseline;
  font-size: 12px;
  padding: 2px 0;
}
.q-legend-letter {
  font: 600 11px/1 ui-monospace, monospace;
  color: var(--c-peach);
}
.q-legend-name {
  color: var(--c-text);
}
.q-legend-desc {
  color: var(--c-subtext0);
  font-size: 11px;
}
</style>
