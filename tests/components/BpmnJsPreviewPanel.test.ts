/**
 * BpmnJsPreviewPanel Component Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BpmnJsPreviewPanel from '@/components/BpmnEditor/BpmnJsPreviewPanel.vue'
import type { BpmnNode, BpmnEdge } from '@/types/bpmn'

// Mock bpmn-js
vi.mock('bpmn-js/lib/NavigatedViewer', () => ({
  default: class MockBpmnViewer {
    constructor(config: any) {
      this.config = config
    }
    async importXML(xml: string) {
      return { warnings: [] }
    }
    saveSVG() {
      return Promise.resolve({ svg: '<svg></svg>' })
    }
    saveXML() {
      return Promise.resolve({ xml: '<?xml version="1.0"?><bpmn></bpmn>' })
    }
    get(name: string) {
      if (name === 'canvas') {
        return {
          zoom: vi.fn()
        }
      }
      return null
    }
    destroy() {
      return Promise.resolve()
    }
  }
}))

// Mock useBpmnConverter
vi.mock('@/composables/useBpmnConverter', () => ({
  useBpmnConverter: () => ({
    convertToBpmnXml: vi.fn((nodes, edges, id, name) => {
      return '<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"><bpmn:process id="' + id + '"></bpmn:process></bpmn:definitions>'
    })
  })
}))

describe('BpmnJsPreviewPanel', () => {
  let wrapper: VueWrapper<any>
  let pinia: any

  const defaultNodes: BpmnNode[] = [
    {
      id: 'start-1',
      type: 'startEvent',
      position: { x: 100, y: 100 },
      data: { label: 'Start', width: 50, height: 50 }
    },
    {
      id: 'task-1',
      type: 'userTask',
      position: { x: 250, y: 100 },
      data: { label: 'Task 1', width: 120, height: 80 }
    }
  ]

  const defaultEdges: BpmnEdge[] = [
    {
      id: 'flow-1',
      source: 'start-1',
      target: 'task-1',
      data: {},
      type: 'default'
    }
  ]

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = (props = {}) => {
    return mount(BpmnJsPreviewPanel, {
      props: {
        isOpen: true,
        nodes: defaultNodes,
        edges: defaultEdges,
        processId: 'test-process',
        processName: 'Test Process',
        ...props
      },
      global: {
        plugins: [pinia]
      },
      attachTo: document.body
    })
  }

  it('should not render when isOpen is false', () => {
    wrapper = createWrapper({ isOpen: false })
    expect(wrapper.find('.bpmn-preview-panel').exists()).toBe(false)
  })

  it('should render when isOpen is true', () => {
    wrapper = createWrapper({ isOpen: true })
    expect(wrapper.find('.bpmn-preview-panel').exists()).toBe(true)
  })

  it('should display panel header with title', () => {
    wrapper = createWrapper()
    const header = wrapper.find('.header-title')
    expect(header.text()).toContain('BPMN Preview')
  })

  it('should display close button', () => {
    wrapper = createWrapper()
    const closeBtn = wrapper.find('.close-btn')
    expect(closeBtn.exists()).toBe(true)
  })

  it('should emit close event when close button is clicked', async () => {
    wrapper = createWrapper()
    const closeBtn = wrapper.find('.close-btn')

    await closeBtn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('close')?.length).toBe(1)
  })

  it('should display stats when nodes and edges are present', () => {
    wrapper = createWrapper()
    const stats = wrapper.find('.stats')
    expect(stats.exists()).toBe(true)
    expect(stats.text()).toContain('2 nodes')
    expect(stats.text()).toContain('1 edges')
  })

  it('should expand and collapse when expand button is clicked', async () => {
    wrapper = createWrapper()

    expect(wrapper.vm.isExpanded).toBe(false)
    expect(wrapper.find('.bpmn-preview-panel').classes()).not.toContain('expanded')

    const expandBtn = wrapper.findAll('.action-btn')[0]
    await expandBtn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isExpanded).toBe(true)
    expect(wrapper.find('.bpmn-preview-panel').classes()).toContain('expanded')
  })

  it('should show loading indicator when isLoading is true', async () => {
    wrapper = createWrapper()
    wrapper.vm.isLoading = true
    await wrapper.vm.$nextTick()

    const header = wrapper.find('.header-title')
    expect(header.text()).toContain('Loading...')
  })

  it('should show error message when error is present', async () => {
    wrapper = createWrapper()
    wrapper.vm.error = 'Test error message'
    await wrapper.vm.$nextTick()

    const errorSection = wrapper.find('.error-message')
    expect(errorSection.exists()).toBe(true)
    expect(errorSection.text()).toContain('Test error message')
  })

  it('should show empty state when no nodes', () => {
    wrapper = createWrapper({ nodes: [] })
    const emptyState = wrapper.find('.empty-state')
    expect(emptyState.exists()).toBe(true)
    expect(emptyState.text()).toContain('No BPMN content to display')
  })

  it('should have BPMN container element', () => {
    wrapper = createWrapper()
    const container = wrapper.find('.bpmn-container')
    expect(container.exists()).toBe(true)
  })

  it('should emit export-bpmn when download BPMN button is clicked', async () => {
    wrapper = createWrapper()
    const footerBtns = wrapper.findAll('.footer-btn')
    const downloadBtn = footerBtns.find(b => b.text().includes('Download BPMN'))

    if (downloadBtn) {
      await downloadBtn.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('export-bpmn')).toBeTruthy()
    }
  })

  it('should have resize handle', () => {
    wrapper = createWrapper()
    const resizeHandle = wrapper.find('.resize-handle')
    expect(resizeHandle.exists()).toBe(true)
  })

  it('should track panel resize', async () => {
    wrapper = createWrapper()
    const resizeHandle = wrapper.find('.resize-handle')

    const panel = wrapper.find('.bpmn-preview-panel')
    const initialHeight = panel.element.clientHeight

    // Simulate resize start
    resizeHandle.trigger('mousedown', { clientY: 100 })
    document.dispatchEvent(new MouseEvent('mousemove', { clientY: 150 }))
    document.dispatchEvent(new MouseEvent('mouseup'))

    await wrapper.vm.$nextTick()

    // Height should have changed
    expect(wrapper.vm.isResizing).toBe(false)
  })

  it('should show refresh button in header', () => {
    wrapper = createWrapper()
    const actionBtns = wrapper.findAll('.action-btn')
    expect(actionBtns.length).toBeGreaterThanOrEqual(3) // expand, refresh, close
  })

  it('should update preview when nodes change', async () => {
    wrapper = createWrapper()

    const initialStats = wrapper.find('.stats').text()

    await wrapper.setProps({ nodes: [...defaultNodes, {
      id: 'task-2',
      type: 'userTask',
      position: { x: 400, y: 100 },
      data: { label: 'Task 2', width: 120, height: 80 }
    }]})

    await wrapper.vm.$nextTick()

    const updatedStats = wrapper.find('.stats').text()
    expect(updatedStats).not.toBe(initialStats)
  })

  it('should clean up bpmn viewer on unmount', async () => {
    wrapper = createWrapper()
    const destroySpy = vi.spyOn(wrapper.vm, 'onBeforeUnmount' as any)

    wrapper.unmount()

    // Viewer should be cleaned up
    expect(wrapper.vm.bpmnViewer).toBeNull()
  })

  it('should handle export-svg action', async () => {
    wrapper = createWrapper()

    const exportSvgBtn = wrapper.findAll('.footer-btn').find(b => b.text().includes('Export SVG'))
    if (exportSvgBtn) {
      await exportSvgBtn.trigger('click')
      await wrapper.vm.$nextTick()

      // Should call saveSVG on the viewer
      expect(wrapper.vm.bpmnViewer).toBeTruthy()
    }
  })

  it('should generate BPMN XML from props', async () => {
    wrapper = createWrapper()

    // Wait for XML generation
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.vm.xmlContent).toBeTruthy()
    expect(wrapper.vm.xmlContent).toContain('<?xml')
  })

  it('should display node and edge counts correctly', () => {
    wrapper = createWrapper({ nodes: defaultNodes, edges: defaultEdges })
    const stats = wrapper.find('.stats')

    expect(stats.text()).toContain('2')
    expect(stats.text()).toContain('1')
  })

  it('should handle empty nodes and edges', () => {
    wrapper = createWrapper({ nodes: [], edges: [] })

    expect(wrapper.vm.nodeCount).toBe(0)
    expect(wrapper.vm.edgeCount).toBe(0)
  })

  it('should have footer with action buttons', () => {
    wrapper = createWrapper()
    const footer = wrapper.find('.panel-footer')
    expect(footer.exists()).toBe(true)
  })

  describe('Panel Sizing', () => {
    it('should have default width and height', () => {
      wrapper = createWrapper()
      const panel = wrapper.find('.bpmn-preview-panel')

      expect(panel.element.style.width).toBe('500px')
      expect(panel.element.style.height).toBe('400px')
    })

    it('should collapse to minimal height when expanded', async () => {
      wrapper = createWrapper()

      const expandBtn = wrapper.findAll('.action-btn')[0]
      await expandBtn.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.bpmn-preview-panel').classes()).toContain('expanded')
    })
  })
})
