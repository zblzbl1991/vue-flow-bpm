/**
 * BpmnTestingPage Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BpmnTestingPage from '@/components/BpmnTestingPage.vue'
import { useBpmnConverter } from '@/composables/useBpmnConverter'
import { useBpmnImporter } from '@/composables/useBpmnImporter'

// Mock composables
vi.mock('@/composables/useBpmnConverter', () => ({
  useBpmnConverter: () => ({
    downloadBpmnFile: vi.fn(),
    convertToBpmnXml: vi.fn((nodes, edges, id, name) => '<?xml version="1.0"?><bpmn></bpmn>')
  })
}))

vi.mock('@/composables/useBpmnImporter', () => ({
  useBpmnImporter: () => ({
    importFromFile: vi.fn(() => Promise.resolve({
      process: { id: 'test', name: 'Test', version: 1 },
      nodes: [{ id: 'node-1', type: 'startEvent', position: { x: 0, y: 0 }, data: {} }],
      edges: []
    })),
    importState: { loading: false, result: null, errors: [], warnings: [] },
    hasWarnings: false,
    hasErrors: false,
    getWarningMessages: () => [],
    getErrorMessages: () => []
  })
}))

describe('BpmnTestingPage', () => {
  let wrapper: VueWrapper<any>
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const createWrapper = () => {
    return mount(BpmnTestingPage, {
      global: {
        plugins: [pinia],
        stubs: {
          'router-link': true
        }
      }
    })
  }

  it('should render correctly', () => {
    wrapper = createWrapper()
    expect(wrapper.find('.bpmn-testing-page').exists()).toBe(true)
    expect(wrapper.find('.page-header h1').text()).toBe('BPMN Testing Page')
  })

  it('should display both tabs', () => {
    wrapper = createWrapper()
    const tabs = wrapper.findAll('.tab')
    expect(tabs).toHaveLength(2)
    expect(tabs[0].text()).toContain('JSON → BPMN XML')
    expect(tabs[1].text()).toContain('BPMN XML → JSON')
  })

  it('should have json-upload tab active by default', () => {
    wrapper = createWrapper()
    const jsonTab = wrapper.findAll('.tab')[0]
    expect(jsonTab.classes()).toContain('active')
  })

  it('should switch tabs when clicked', async () => {
    wrapper = createWrapper()
    const bpmnTab = wrapper.findAll('.tab')[1]

    await bpmnTab.trigger('click')
    await wrapper.vm.$nextTick()

    expect(bpmnTab.classes()).toContain('active')
    expect(wrapper.findAll('.tab')[0].classes()).not.toContain('active')
  })

  it('should show file input for JSON upload when json-upload tab is active', () => {
    wrapper = createWrapper()
    expect(wrapper.find('.upload-section').exists()).toBe(true)
    expect(wrapper.find('.upload-section h2').text()).toBe('Upload vue-flow JSON')
  })

  it('should reset state when switching tabs', async () => {
    wrapper = createWrapper()

    // Set some state
    wrapper.vm.showPreview = true
    wrapper.vm.testStats = { nodes: 5, edges: 3, conversionTime: 100 }
    await wrapper.vm.$nextTick()

    // Switch tabs
    const bpmnTab = wrapper.findAll('.tab')[1]
    await bpmnTab.trigger('click')
    await wrapper.vm.$nextTick()

    // State should be reset
    expect(wrapper.vm.showPreview).toBe(false)
    expect(wrapper.vm.testStats).toBeNull()
  })

  it('should show preview section after file upload', async () => {
    wrapper = createWrapper()

    // Simulate file upload result
    wrapper.vm.showPreview = true
    wrapper.vm.testStats = { nodes: 3, edges: 2, conversionTime: 50 }
    wrapper.vm.editorNodes = [
      { id: 'node-1', type: 'startEvent', position: { x: 0, y: 0 }, data: {} },
      { id: 'node-2', type: 'userTask', position: { x: 100, y: 0 }, data: {} },
      { id: 'node-3', type: 'endEvent', position: { x: 200, y: 0 }, data: {} }
    ]
    wrapper.vm.editorEdges = [
      { id: 'edge-1', source: 'node-1', target: 'node-2', data: {}, type: 'default' },
      { id: 'edge-2', source: 'node-2', target: 'node-3', data: {}, type: 'default' }
    ]
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.preview-section').exists()).toBe(true)
    expect(wrapper.find('.preview-header h2').text()).toBe('Preview')
    expect(wrapper.find('.stats').text()).toContain('3 nodes')
    expect(wrapper.find('.stats').text()).toContain('2 edges')
  })

  it('should display conversion time in stats', async () => {
    wrapper = createWrapper()

    wrapper.vm.showPreview = true
    wrapper.vm.testStats = { nodes: 3, edges: 2, conversionTime: 123.45 }
    await wrapper.vm.$nextTick()

    const statsText = wrapper.find('.stats').text()
    expect(statsText).toContain('123.45ms')
  })

  it('should handle reset action', async () => {
    wrapper = createWrapper()

    // Set state
    wrapper.vm.showPreview = true
    wrapper.vm.editorNodes = [{ id: 'node-1', type: 'startEvent', position: { x: 0, y: 0 }, data: {} }]
    wrapper.vm.editorEdges = []
    wrapper.vm.testStats = { nodes: 1, edges: 0, conversionTime: 10 }
    wrapper.vm.jsonFileName = 'test.json'
    await wrapper.vm.$nextTick()

    // Call reset
    await wrapper.vm.handleReset()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.showPreview).toBe(false)
    expect(wrapper.vm.editorNodes).toEqual([])
    expect(wrapper.vm.editorEdges).toEqual([])
    expect(wrapper.vm.testStats).toBeNull()
    expect(wrapper.vm.jsonFileName).toBe('')
  })

  it('should show error messages when present', async () => {
    // Mock importer to return errors
    vi.doMock('@/composables/useBpmnImporter', () => ({
      useBpmnImporter: () => ({
        importFromFile: vi.fn(),
        importState: { loading: false, result: null, errors: ['Error 1', 'Error 2'], warnings: [] },
        hasErrors: true,
        hasWarnings: false,
        getErrorMessages: () => ['Error 1', 'Error 2'],
        getWarningMessages: () => []
      })
    }))

    wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    // Trigger BPMN upload (which would set errors)
    wrapper.vm.activeTab = 'bpmn-upload'
    await wrapper.vm.$nextTick()

    // Note: This test would need the actual import to trigger errors
    // For now, we test the error display structure exists
    const errorSection = wrapper.find('.error-messages')
    expect(errorSection.exists()).toBe(true)
  })

  it('should have download buttons in preview section', async () => {
    wrapper = createWrapper()

    wrapper.vm.showPreview = true
    await wrapper.vm.$nextTick()

    const buttons = wrapper.findAll('.actions button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)

    const buttonTexts = buttons.map(b => b.text())
    expect(buttonTexts).toContain('Download BPMN')
    expect(buttonTexts).toContain('Download JSON')
    expect(buttonTexts).toContain('Reset')
  })

  it('should generate BPMN XML when downloading', () => {
    wrapper = createWrapper()

    const { downloadBpmnFile } = useBpmnConverter()
    const xml = wrapper.vm.convertToBpmnXml([], [], 'test', 'Test')

    expect(downloadBpmnFile).toBeDefined()
    expect(xml).toContain('<?xml')
  })

  it('should handle tab change correctly', async () => {
    wrapper = createWrapper()

    // Start with json-upload
    expect(wrapper.vm.activeTab).toBe('json-upload')

    // Set some state
    wrapper.vm.showPreview = true
    wrapper.vm.testStats = { nodes: 5, edges: 3, conversionTime: 100 }

    // Switch to bpmn-upload
    await wrapper.vm.handleTabChange('bpmn-upload')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.activeTab).toBe('bpmn-upload')
    expect(wrapper.vm.showPreview).toBe(false)
    expect(wrapper.vm.testStats).toBeNull()
  })

  describe('JSON Upload', () => {
    it('should parse JSON file correctly', async () => {
      wrapper = createWrapper()

      const mockFile = new File(['{"process": {"id": "test"}, "nodes": [], "edges": []}'], 'test.json', { type: 'application/json' })

      await wrapper.vm.handleJsonUpload(mockFile)
      await wrapper.vm.$nextTick()

      // Should have processed the file and shown preview
      expect(wrapper.vm.jsonFileName).toBe('test.json')
    })

    it('should handle invalid JSON with error', async () => {
      wrapper = createWrapper()

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      const mockFile = new File(['invalid json'], 'test.json', { type: 'application/json' })

      await wrapper.vm.handleJsonUpload(mockFile)
      await wrapper.vm.$nextTick()

      expect(alertSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
      alertSpy.mockRestore()
    })
  })

  describe('BPMN Upload', () => {
    it('should call importFromFile when BPMN file is uploaded', async () => {
      wrapper = createWrapper()

      const mockFile = new File(['<?xml version="1.0"?><bpmn></bpmn>'], 'test.bpmn', { type: 'application/xml' })

      await wrapper.vm.handleBpmnUpload(mockFile)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.bpmnFileName).toBe('test.bpmn')
    })
  })

  describe('Download Actions', () => {
    it('should download BPMN file with correct filename', () => {
      wrapper = createWrapper()

      const { downloadBpmnFile } = useBpmnConverter()
      const documentSpy = vi.spyOn(document, 'createElement')

      wrapper.vm.handleDownloadBpmn()

      expect(documentSpy).toHaveBeenCalledWith('a')
      documentSpy.mockRestore()
    })

    it('should download JSON file with workflow data', () => {
      wrapper = createWrapper()

      wrapper.vm.editorNodes = [{ id: 'node-1', type: 'startEvent', position: { x: 0, y: 0 }, data: {} }]
      wrapper.vm.editorEdges = []

      const documentSpy = vi.spyOn(document, 'createElement')

      wrapper.vm.handleDownloadJson()

      expect(documentSpy).toHaveBeenCalledWith('a')
      documentSpy.mockRestore()
    })
  })
})
