/**
 * BpmnUploader Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BpmnUploader from '@/components/BpmnTestingPage/BpmnUploader.vue'

describe('BpmnUploader', () => {
  it('renders correctly with default state', () => {
    const wrapper = mount(BpmnUploader)
    expect(wrapper.find('.bpmn-uploader').exists()).toBe(true)
    expect(wrapper.find('.drop-zone').exists()).toBe(true)
    expect(wrapper.find('.icon').text()).toBe('📋')
    expect(wrapper.find('h3').text()).toBe('Upload BPMN File')
  })

  it('has-file class is applied when file is set', () => {
    const wrapper = mount(BpmnUploader, {
      props: { modelValue: new File(['<xml />'], 'test.bpmn') }
    })
    expect(wrapper.find('.drop-zone').classes()).toContain('has-file')
  })

  it('emits file-selected event with valid BPMN file', async () => {
    const wrapper = mount(BpmnUploader)
    const validBpmn = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
             targetNamespace="http://bpmn.io/schema/bpmn">
  <process id="test" />
  <BPMNDiagram id="diagram">
    <BPMNPlane id="plane" bpmnElement="test" />
  </BPMNDiagram>
</definitions>`
    const file = new File([validBpmn], 'workflow.bpmn', { type: 'application/xml' })

    await wrapper.vm.handleFile(file)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.emitted('file-selected')).toBeTruthy()
  })

  it('shows validation success for valid BPMN', async () => {
    const wrapper = mount(BpmnUploader)
    const validBpmn = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <process id="test" />
</definitions>`
    const file = new File([validBpmn], 'test.bpmn')

    await wrapper.vm.handleFile(file)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.vm.validationStatus.type).toBe('success')
    expect(wrapper.vm.validationStatus.icon).toBe('✓')
  })

  it('shows validation error for non-BPMN file extension', async () => {
    const wrapper = mount(BpmnUploader)
    const file = new File(['<xml />'], 'test.txt', { type: 'text/plain' })

    await wrapper.vm.handleFile(file)

    expect(wrapper.vm.validationStatus.type).toBe('error')
    expect(wrapper.vm.validationStatus.message).toContain('.bpmn or .xml')
  })

  it('shows warning for BPMN without namespace', async () => {
    const wrapper = mount(BpmnUploader)
    const invalidBpmn = '<?xml version="1.0"?><process />'
    const file = new File([invalidBpmn], 'test.bpmn')

    await wrapper.vm.handleFile(file)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.vm.validationStatus.type).toBe('warning')
    expect(wrapper.vm.validationStatus.icon).toBe('⚠')
    expect(wrapper.vm.validationStatus.message).toContain('namespace')
  })

  it('displays XML preview for valid BPMN', async () => {
    const wrapper = mount(BpmnUploader)
    const validBpmn = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <process id="test" />
</definitions>`
    const file = new File([validBpmn], 'test.bpmn')

    await wrapper.vm.handleFile(file)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.vm.xmlPreview).toBeTruthy()
    expect(wrapper.vm.xmlPreview).toContain('<?xml')
  })

  it('limits XML preview to first 500 characters', async () => {
    const wrapper = mount(BpmnUploader)
    const longBpmn = '<?xml version="1.0"?>' + '<a></a>'.repeat(300)
    const file = new File([longBpmn], 'test.bpmn')

    await wrapper.vm.handleFile(file)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.vm.xmlPreview!.length).toBeLessThanOrEqual(503) // 500 + '...'
  })

  it('emits validated event after file processing', async () => {
    const wrapper = mount(BpmnUploader)
    const validBpmn = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <process id="test" />
</definitions>`
    const file = new File([validBpmn], 'test.bpmn')

    await wrapper.vm.handleFile(file)
    await new Promise(resolve => setTimeout(resolve, 50))

    const validatedEvent = wrapper.emitted('validated')
    expect(validatedEvent).toBeTruthy()
    expect(validatedEvent?.[0]?.[0]).toBe(true)
    expect(validatedEvent?.[0]?.[1]).toBeTruthy()
  })

  it('updates modelValue when file is selected', async () => {
    const wrapper = mount(BpmnUploader)
    const file = new File(['<xml />'], 'test.bpmn')

    await wrapper.vm.handleFile(file)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('handles drag-over events', async () => {
    const wrapper = mount(BpmnUploader)
    const dropZone = wrapper.find('.drop-zone')

    await dropZone.trigger('dragover')
    expect(wrapper.vm.isDragOver).toBe(true)
    expect(dropZone.classes()).toContain('drag-over')
  })

  it('handles drag-leave events', async () => {
    const wrapper = mount(BpmnUploader)
    const dropZone = wrapper.find('.drop-zone')

    await dropZone.trigger('dragover')
    await dropZone.trigger('dragleave')
    expect(wrapper.vm.isDragOver).toBe(false)
    expect(dropZone.classes()).not.toContain('drag-over')
  })

  it('handles drop events', async () => {
    const wrapper = mount(BpmnUploader)
    const file = new File(['<xml />'], 'test.bpmn')

    const mockEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { files: [file] }
    }

    await wrapper.vm.onDrop(mockEvent)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(mockEvent.preventDefault).toHaveBeenCalled()
    expect(wrapper.vm.isDragOver).toBe(false)
  })

  it('triggers file input click on drop zone click', async () => {
    const wrapper = mount(BpmnUploader)
    const clickSpy = vi.fn()

    wrapper.vm.fileInput = { click: clickSpy }
    await wrapper.vm.onClick()

    expect(clickSpy).toHaveBeenCalled()
  })

  it('clears file on clear button click', async () => {
    const wrapper = mount(BpmnUploader, {
      props: { modelValue: new File(['<xml />'], 'test.bpmn') }
    })

    await wrapper.vm.onClear()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
    expect(wrapper.vm.xmlPreview).toBeNull()
  })

  it('toggles XML preview', async () => {
    const wrapper = mount(BpmnUploader)
    wrapper.vm.xmlPreview = 'some xml content'
    wrapper.vm.showFullPreview = false

    await wrapper.vm.togglePreview()

    expect(wrapper.vm.showFullPreview).toBe(true)

    await wrapper.vm.togglePreview()

    expect(wrapper.vm.showFullPreview).toBe(false)
  })

  it('formats file size correctly', () => {
    const wrapper = mount(BpmnUploader)

    expect(wrapper.vm.formatFileSize(500)).toBe('500 B')
    expect(wrapper.vm.formatFileSize(1024)).toBe('1.0 KB')
    expect(wrapper.vm.formatFileSize(1024 * 1024)).toBe('1.0 MB')
  })
})
