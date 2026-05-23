// fix-data-display-stability 验证项 4.4 / 4.2(主站计数部分):
// 切换分类只改变过滤结果,底层 dataMap 不丢数据;categoryCounts 实时派生。
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick, type Ref } from 'vue'
import DataTable from '../src/components/DataTable.vue'

const invokeMock = vi.fn()
vi.mock('@tauri-apps/api/core', () => ({ invoke: (...a: unknown[]) => invokeMock(...a) }))

function pt(ioa: number, category: string, value: string, ca = 1) {
  return { ioa, asdu_type: 'M_X', value, category, common_address: ca, quality_ov: false, quality_bl: false, quality_sb: false, quality_nt: false, quality_iv: false, timestamp: null }
}

function provideRefs() {
  return {
    selectedConnectionId: ref<string | null>('conn-1') as Ref<string | null>,
    selectedCA: ref<number | null>(null) as Ref<number | null>,
    selectedCategory: ref<string | null>(null) as Ref<string | null>,
    dataRefreshKey: ref(0),
    changedCategories: ref(new Map()),
    categoryCounts: ref(new Map()),
  }
}

describe('DataTable 分类筛选 (4.4 / 4.2)', () => {
  beforeEach(() => {
    invokeMock.mockReset()
    vi.useFakeTimers() // 阻止 1s 轮询真正触发,保持确定性
  })

  it('切换分类只过滤,dataMap 不丢数据;来回切换可复原', async () => {
    const points = [pt(1, '单点', 'on'), pt(2, '单点', 'off'), pt(3, '浮点', '1.5')]
    invokeMock.mockResolvedValueOnce({ points, seq: 1 }).mockResolvedValue({ points: [], seq: 1 })

    const provide = provideRefs()
    const wrapper = mount(DataTable, { global: { provide } })
    await flushPromises() // onMounted -> fetchData
    await nextTick()

    const vm = wrapper.vm as unknown as { filteredPoints: unknown[] }
    expect(vm.filteredPoints.length).toBe(3) // 无筛选:全部

    provide.selectedCategory.value = '单点'
    await nextTick()
    expect(vm.filteredPoints.length).toBe(2) // 仅单点

    provide.selectedCategory.value = null // 来回切换
    await nextTick()
    expect(vm.filteredPoints.length).toBe(3) // 数据未丢失,复原

    wrapper.unmount()
  })

  it('categoryCounts 按 conn->ca->category 实时派生', async () => {
    const points = [pt(1, '单点', 'on'), pt(2, '单点', 'off'), pt(3, '浮点', '1.5'), pt(1, '单点', 'on', 2)]
    invokeMock.mockResolvedValueOnce({ points, seq: 1 }).mockResolvedValue({ points: [], seq: 1 })

    const provide = provideRefs()
    const wrapper = mount(DataTable, { global: { provide } })
    await flushPromises()
    await nextTick()

    const byCa = provide.categoryCounts.value.get('conn-1') as Map<number, Map<string, number>>
    expect(byCa.get(1)!.get('单点')).toBe(2)
    expect(byCa.get(1)!.get('浮点')).toBe(1)
    expect(byCa.get(2)!.get('单点')).toBe(1) // 不同 CA 独立计数
    wrapper.unmount()
  })
})
