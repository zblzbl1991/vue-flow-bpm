/**
 * JsonUploader Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import JsonUploader from '@/components/BpmnTestingPage/JsonUploader.vue'

describe('JsonUploader', () => {
  it('renders correctly with default state', () => {
    const wrapper = mount(JsonUploader)
    expect(wrapper.find('.json-uploader').exists()).toBe(true)
    expect(wrapper.find('.drop-zone').exists()).toBe(true)
    expect(wrapper.find('.icon').text()).toBe('📄')
    expect(wrapper.find('h3').text()).toBe('Upload JSON File')
  })

  it('has-file class is applied when file is set', () => {
    const wrapper = mount(JsonUploader, {
      props: { modelValue: new File(['{}'], 'test.json') }
    })
    expect(wrapper.find('.drop-zone').classes()).toContain('has-file')
  })

  it('emits file-selected event with valid JSON file', async () => {
    const wrapper = mount(JsonUploader)
    const validJson = '{"nodes": [], "edges": []}'
    const file = new File([validJson], 'workflow.json', { type: 'application/json' })

    await wrapper.vm.handleFile(file)

    // Wait for FileReader to complete
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.emitted('file-selected')).toBeTruthy()
  })

  it('shows validation success for valid JSON', async () => {
    const wrapper = mount(JsonUploader)
    const validJson = '{"nodes": [], "edges": []}'
    const file = new File([validJson], 'good.json', { type: 'application/json' })

    await wrapper.vm.handleFile(file)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.vm.validationStatus.type).toBe('success')
    expect(wrapper.vm.validationStatus.icon).toBe('✓')
  })

  it('shows validation error for invalid JSON', async () => {
    const wrapper = mount(JsonUploader)
    const invalidJson = '{invalid json}'
    const file = new File([invalidJson], 'bad.json', { type: 'application/json' })

    await wrapper.vm.handleFile(file)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.vm.validationStatus.type).toBe('error')
    expect(wrapper.vm.validationStatus.icon).toBe('✗')
    expect(wrapper.vm.validationStatus.message).toContain('Invalid JSON')
  })

  it('shows validation error for non-JSON file', async () => {
    const wrapper = mount(JsonUploader)
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })

    await wrapper.vm.handleFile(file)

    expect(wrapper.vm.validationStatus.type).toBe('error')
    expect(wrapper.vm.validationStatus.message).toContain('.json')
  })

  it('resets validation on new file selection', async () => {
    const wrapper = mount(JsonUploader)
    // First invalid file (has .json extension but invalid content)
    const invalidFile = new File(['{bad}'], 'bad.json', { type: 'application/json' })
    await wrapper.vm.handleFile(invalidFile)
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(wrapper.vm.validationStatus.type).toBe('error')

    // Then valid file
    const validFile = new File(['{}'], 'good.json', { type: 'application/json' })
    await wrapper.vm.handleFile(validFile)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.vm.validationStatus.type).toBe('success')
  })

  it('handles drag-over events', async () => {
    const wrapper = mount(JsonUploader)
    const dropZone = wrapper.find('.drop-zone')

    await dropZone.trigger('dragover')
    expect(wrapper.vm.isDragOver).toBe(true)
    expect(dropZone.classes()).toContain('drag-over')
  })

  it('handles drag-leave events', async () => {
    const wrapper = mount(JsonUploader)
    const dropZone = wrapper.find('.drop-zone')

    await dropZone.trigger('dragover')
    await dropZone.trigger('dragleave')
    expect(wrapper.vm.isDragOver).toBe(false)
    expect(dropZone.classes()).not.toContain('drag-over')
  })

  it('handles drop events with valid file', async () => {
    const wrapper = mount(JsonUploader)
    const file = new File(['{}'], 'test.json')

    const mockEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { files: [file] }
    }

    await wrapper.vm.onDrop(mockEvent)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(mockEvent.preventDefault).toHaveBeenCalled()
    expect(wrapper.vm.isDragOver).toBe(false)
  })

  it('updates modelValue when file is selected', async () => {
    const wrapper = mount(JsonUploader)
    const file = new File(['{}'], 'test.json')

    await wrapper.vm.handleFile(file)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('triggers file input click on drop zone click', async () => {
    const wrapper = mount(JsonUploader)
    const clickSpy = vi.fn()

    wrapper.vm.fileInput = { click: clickSpy }
    await wrapper.vm.onClick()

    expect(clickSpy).toHaveBeenCalled()
  })

  it('clears file on clear button click', async () => {
    const wrapper = mount(JsonUploader, {
      props: { modelValue: new File(['{}'], 'test.json') }
    })

    await wrapper.vm.onClear()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
  })

  it('formats file size correctly', () => {
    const wrapper = mount(JsonUploader)

    expect(wrapper.vm.formatFileSize(500)).toBe('500 B')
    expect(wrapper.vm.formatFileSize(1024)).toBe('1.0 KB')
    expect(wrapper.vm.formatFileSize(1024 * 1024)).toBe('1.0 MB')
  })
})
