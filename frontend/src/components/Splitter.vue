<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  axis: 'x' | 'y'
  min: number
  max: number
  reverse?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: number): void
}>()

let startVal = 0
let startPos = 0

function onMouseDown(e: MouseEvent) {
  e.preventDefault()
  startVal = props.modelValue
  startPos = props.axis === 'x' ? e.clientX : e.clientY
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  document.body.style.userSelect = 'none'
  document.body.style.cursor = props.axis === 'x' ? 'col-resize' : 'row-resize'
}

function onMouseMove(e: MouseEvent) {
  const cur = props.axis === 'x' ? e.clientX : e.clientY
  let delta = cur - startPos
  if (props.reverse) delta = -delta
  const next = Math.min(props.max, Math.max(props.min, startVal + delta))
  emit('update:modelValue', next)
}

function onMouseUp() {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}

function onDoubleClick() {
  // Allow consumers to reset via dblclick by emitting min value;
  // App.vue handles default by watching for the sentinel min.
  // Keep this empty to avoid surprising behavior — user can use settings.
}
</script>

<template>
  <div
    :class="['splitter', `axis-${axis}`]"
    @mousedown="onMouseDown"
    @dblclick="onDoubleClick"
    role="separator"
    :aria-orientation="axis === 'x' ? 'vertical' : 'horizontal'"
  />
</template>

<style scoped>
.splitter {
  position: relative;
  background: transparent;
  z-index: 5;
}

.axis-x {
  width: 4px;
  height: 100%;
  cursor: col-resize;
}

.axis-y {
  height: 4px;
  width: 100%;
  cursor: row-resize;
}

/* Visible 1px hairline mimicking the original border */
.splitter::before {
  content: '';
  position: absolute;
  background: #313244;
  transition: background 0.12s, transform 0.12s;
}

.axis-x::before {
  top: 0;
  bottom: 0;
  left: 1px;
  width: 1px;
}

.axis-y::before {
  left: 0;
  right: 0;
  top: 1px;
  height: 1px;
}

.splitter:hover::before,
.splitter:active::before {
  background: #89b4fa;
}

.axis-x:hover::before,
.axis-x:active::before {
  width: 2px;
  left: 1px;
}

.axis-y:hover::before,
.axis-y:active::before {
  height: 2px;
  top: 1px;
}
</style>
