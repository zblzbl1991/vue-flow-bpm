/**
 * SideBySidePreview Component Tests
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SideBySidePreview from '@/components/BpmnTestingPage/SideBySidePreview.vue'
import type { BpmnNode, BpmnEdge } from '@/types/bpmn'

describe('SideBySidePreview', () => {
  const mockNodes: BpmnNode[] = [
    { id: '1', type: 'startEvent', position: { x: 100, y: 100 }, data: { label: 'Start' } },
    { id: '2', type: 'userTask', position: { x: 300, y: 100 }, data: { label: 'Task 1', assignee: 'user1' } },
    { id: '3', type: 'endEvent', position: { x: 500, y: 100 }, data: { label: 'End' } }
  ]

  const mockEdges: BpmnEdge[] = [
    { id: 'e1-2', source: '1', target: '2', type: 'default' },
    { id: 'e2-3', source: '2', target: '3', type: 'default' }
  ]

  const mockBpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI">
  <process id="test" />
</definitions>`

  it('renders correctly with props', () => {
    const wrapper = mount(SideBySidePreview, {
      props: {
        nodes: mockNodes,
        edges: mockEdges,
        bpmnXml: mockBpmnXml,
        processId: 'test-process',
        processName: 'Test Process',
        conversionTime: 15.5
      }
    })

    expect(wrapper.find('.side-by-side-preview').exists()).toBe(true)
    expect(wrapper.find('.preview-header h3').text()).toBe('Side-by-Side Comparison')
  })

  it('displays comparison stats correctly', () => {
    const wrapper = mount(SideBySidePreview, {
      props: {
        nodes: mockNodes,
        edges: mockEdges,
        bpmnXml: mockBpmnXml,
        conversionTime: 15.5
      }
    })

    expect(wrapper.find('.stat-value').text()).toContain('3') // nodes
    expect(wrapper.findAll('.stat-value')[1].text()).toContain('2') // edges
    expect(wrapper.findAll('.stat-value')[2].text()).toContain('15.5ms')
  })

  it('displays node type summary', () => {
    const wrapper = mount(SideBySidePreview, {
      props: {
        nodes: mockNodes,
        edges: mockEdges,
        bpmnXml: mockBpmnXml
      }
    })

    const summaryItems = wrapper.findAll('.summary-item')
    expect(summaryItems.length).toBeGreaterThan(0)
    expect(wrapper.html()).toContain('startEvent')
    expect(wrapper.html()).toContain('userTask')
  })

  it('shows empty state when no nodes', () => {
    const wrapper = mount(SideBySidePreview, {
      props: {
        nodes: [],
        edges: [],
        bpmnXml: ''
      }
    })

    expect(wrapper.find('.vue-flow-panel .empty-state').text()).toBe('No workflow loaded')
    expect(wrapper.find('.bpmn-panel .empty-state').text()).toBe('No BPMN generated')
  })

  it('shows BPMN info when BPMN XML is provided', () => {
    const wrapper = mount(SideBySidePreview, {
      props: {
        nodes: mockNodes,
        edges: mockEdges,
        bpmnXml: mockBpmnXml,
        processId: 'my-process',
        processName: 'My Process'
      }
    })

    expect(wrapper.html()).toContain('BPMN Version:')
    expect(wrapper.html()).toContain('2.0')
    expect(wrapper.html()).toContain('my-process')
    expect(wrapper.html()).toContain('My Process')
  })

  it('shows extensions info for Flowable/Camunda BPMN', () => {
    const extendedBpmn = '<?xml version="1.0"?>' +
'<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
'             xmlns:flowable="http://flowable.org/bpmn">' +
'  <process id="test">' +
'    <userTask id="task1" flowable:assignee="$\\{currentUser}" />' +
'  </process>' +
'</definitions>'

    const wrapper = mount(SideBySidePreview, {
      props: {
        nodes: mockNodes,
        edges: mockEdges,
        bpmnXml: extendedBpmn
      }
    })

    expect(wrapper.html()).toContain('Extensions:')
    expect(wrapper.html()).toContain('Flowable/Camunda')
  })

  it('displays differences when provided', () => {
    const differences = [
      { icon: '⚠', message: 'Position difference', severity: 'warning' },
      { icon: '✓', message: 'All nodes preserved', severity: 'info' }
    ]

    const wrapper = mount(SideBySidePreview, {
      props: {
        nodes: mockNodes,
        edges: mockEdges,
        bpmnXml: mockBpmnXml,
        differences
      }
    })

    expect(wrapper.find('.differences-section').exists()).toBe(true)
    expect(wrapper.html()).toContain('Position difference')
    expect(wrapper.html()).toContain('All nodes preserved')
  })

  it('sync button is enabled when both nodes and BPMN exist', () => {
    const wrapper = mount(SideBySidePreview, {
      props: {
        nodes: mockNodes,
        edges: mockEdges,
        bpmnXml: mockBpmnXml
      }
    })

    const syncBtn = wrapper.findAll('.action-btn').find(b => b.text().includes('Sync'))
    expect(syncBtn?.attributes('disabled')).toBeUndefined()
  })

  it('sync button is disabled when missing data', () => {
    const wrapper = mount(SideBySidePreview, {
      props: {
        nodes: mockNodes,
        edges: mockEdges,
        bpmnXml: ''
      }
    })

    const syncBtn = wrapper.findAll('.action-btn').find(b => b.text().includes('Sync'))
    expect(syncBtn?.attributes('disabled')).toBeDefined()
  })

  it('emits sync event when sync button clicked', async () => {
    const wrapper = mount(SideBySidePreview, {
      props: {
        nodes: mockNodes,
        edges: mockEdges,
        bpmnXml: mockBpmnXml
      }
    })

    const syncBtn = wrapper.findAll('.action-btn').find(b => b.text().includes('Sync'))
    await syncBtn?.trigger('click')

    expect(wrapper.emitted('sync')).toBeTruthy()
  })

  it('emits reset event when reset button clicked', async () => {
    const wrapper = mount(SideBySidePreview, {
      props: {
        nodes: mockNodes,
        edges: mockEdges,
        bpmnXml: mockBpmnXml
      }
    })

    const resetBtn = wrapper.findAll('.action-btn').find(b => b.text().includes('Reset'))
    await resetBtn?.trigger('click')

    expect(wrapper.emitted('reset')).toBeTruthy()
  })

  it('emits export-json event when export JSON button clicked', async () => {
    const wrapper = mount(SideBySidePreview, {
      props: {
        nodes: mockNodes,
        edges: mockEdges,
        bpmnXml: mockBpmnXml
      }
    })

    const exportBtn = wrapper.findAll('.action-btn').find(b => b.text().includes('Export JSON'))
    await exportBtn?.trigger('click')

    expect(wrapper.emitted('export-json')).toBeTruthy()
  })

  it('emits export-bpmn event when export BPMN button clicked', async () => {
    const wrapper = mount(SideBySidePreview, {
      props: {
        nodes: mockNodes,
        edges: mockEdges,
        bpmnXml: mockBpmnXml
      }
    })

    const exportBtn = wrapper.findAll('.action-btn').find(b => b.text().includes('Export BPMN'))
    await exportBtn?.trigger('click')

    expect(wrapper.emitted('export-bpmn')).toBeTruthy()
  })

  it('export buttons are disabled when no data', () => {
    const wrapper = mount(SideBySidePreview, {
      props: {
        nodes: [],
        edges: [],
        bpmnXml: ''
      }
    })

    const primaryBtns = wrapper.findAll('.action-btn.primary')
    primaryBtns.forEach(btn => {
      expect(btn.attributes('disabled')).toBeDefined()
    })
  })

  it('shows download diff button when differences exist', () => {
    const differences = [
      { icon: '⚠', message: 'Some difference', severity: 'warning' }
    ]

    const wrapper = mount(SideBySidePreview, {
      props: {
        nodes: mockNodes,
        edges: mockEdges,
        bpmnXml: mockBpmnXml,
        differences
      }
    })

    expect(wrapper.html()).toContain('Download Diff')
  })

  it('emits download-diff event when download diff button clicked', async () => {
    const differences = [
      { icon: '⚠', message: 'Some difference', severity: 'warning' }
    ]

    const wrapper = mount(SideBySidePreview, {
      props: {
        nodes: mockNodes,
        edges: mockEdges,
        bpmnXml: mockBpmnXml,
        differences
      }
    })

    const diffBtn = wrapper.findAll('.action-btn').find(b => b.text().includes('Download Diff'))
    await diffBtn?.trigger('click')

    expect(wrapper.emitted('download-diff')).toBeTruthy()
  })

  it('correctly identifies node types with icons', () => {
    const wrapper = mount(SideBySidePreview, {
      props: {
        nodes: mockNodes,
        edges: mockEdges,
        bpmnXml: mockBpmnXml
      }
    })

    expect(wrapper.html()).toContain('⚪') // startEvent
    expect(wrapper.html()).toContain('👤') // userTask
    expect(wrapper.html()).toContain('🔴') // endEvent
  })
})
