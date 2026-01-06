<template>
  <div class="bpmn-uploader">
    <div
      class="drop-zone"
      :class="{ 'drag-over': isDragOver, 'has-file': hasFile }"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="onClick"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".bpmn,.xml"
        @change="onFileChange"
        style="display: none"
      />
      <div class="drop-zone-content">
        <div class="icon">📋</div>
        <h3>Upload BPMN File</h3>
        <p class="hint">
          {{ fileName || 'Drag and drop a BPMN file here, or click to browse' }}
        </p>
        <p class="requirements">
          Accepts .bpmn or .xml files (BPMN 2.0 format)
        </p>
      </div>
    </div>

    <!-- File Info -->
    <div v-if="hasFile" class="file-info">
      <div class="file-details">
        <span class="file-name">{{ fileName }}</span>
        <span class="file-size">({{ formatFileSize(fileSize) }})</span>
      </div>
      <button class="clear-btn" @click="onClear" title="Remove file">
        ×
      </button>
    </div>

    <!-- Validation Status -->
    <div v-if="validationStatus" class="validation-status" :class="validationStatus.type">
      <span class="status-icon">{{ validationStatus.icon }}</span>
      <span class="status-message">{{ validationStatus.message }}</span>
    </div>

    <!-- XML Preview -->
    <div v-if="xmlPreview" class="xml-preview">
      <div class="preview-header">
        <span>XML Preview</span>
        <button class="toggle-btn" @click="togglePreview">
          {{ showFullPreview ? 'Hide' : 'Show' }}
        </button>
      </div>
      <pre v-if="showFullPreview" class="xml-content">{{ xmlPreview }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue?: File | null
}

interface Emits {
  (e: 'update:modelValue', file: File | null): void
  (e: 'file-selected', file: File): void
  (e: 'validated', isValid: boolean, xmlContent?: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null
})

const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const validationStatus = ref<{ type: string; icon: string; message: string } | null>(null)
const xmlPreview = ref<string | null>(null)
const showFullPreview = ref(false)

const hasFile = computed(() => props.modelValue !== null)
const fileName = computed(() => props.modelValue?.name || '')
const fileSize = computed(() => props.modelValue?.size || 0)

const onClick = () => {
  fileInput.value?.click()
}

const onDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const onDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
}

const onDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

const handleFile = (file: File) => {
  // Validate file extension
  if (!file.name.endsWith('.bpmn') && !file.name.endsWith('.xml')) {
    validationStatus.value = {
      type: 'error',
      icon: '✗',
      message: 'Invalid file type. Please upload a .bpmn or .xml file.'
    }
    emit('validated', false)
    return
  }

  // Validate file size (max 10MB for XML)
  const MAX_SIZE = 10 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    validationStatus.value = {
      type: 'error',
      icon: '✗',
      message: 'File too large. Maximum size is 10MB.'
    }
    emit('validated', false)
    return
  }

  // Read and validate XML content
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string

    // Basic XML validation
    if (!content || content.trim().length === 0) {
      validationStatus.value = {
        type: 'error',
        icon: '✗',
        message: 'File is empty'
      }
      emit('validated', false)
      return
    }

    // Check for XML declaration and BPMN namespaces
    const hasXmlDeclaration = content.trim().startsWith('<?xml')
    const hasBpmnNamespace = content.includes('http://www.omg.org/spec/BPMN/20100524/MODEL')

    if (!hasBpmnNamespace) {
      validationStatus.value = {
        type: 'warning',
        icon: '⚠',
        message: 'Warning: BPMN namespace not found. File may not be valid BPMN 2.0.'
      }
      // Still allow it, but with warning
    } else {
      validationStatus.value = {
        type: 'success',
        icon: '✓',
        message: 'Valid BPMN file'
      }
    }

    // Store XML preview (first 500 chars)
    xmlPreview.value = content.substring(0, 500) + (content.length > 500 ? '...' : '')
    showFullPreview.value = false

    emit('update:modelValue', file)
    emit('file-selected', file)
    emit('validated', true, content)
  }

  reader.onerror = () => {
    validationStatus.value = {
      type: 'error',
      icon: '✗',
      message: 'Failed to read file'
    }
    emit('validated', false)
  }

  reader.readAsText(file)
}

const onClear = () => {
  emit('update:modelValue', null)
  validationStatus.value = null
  xmlPreview.value = null
  showFullPreview.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const togglePreview = () => {
  showFullPreview.value = !showFullPreview.value
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
.bpmn-uploader {
  width: 100%;
}

.drop-zone {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8f9fa;
}

.drop-zone:hover {
  border-color: #3498db;
  background: #e7f5ff;
}

.drop-zone.drag-over {
  border-color: #3498db;
  background: #d4edda;
  transform: scale(1.02);
}

.drop-zone.has-file {
  border-color: #28a745;
  background: #d4edda;
}

.drop-zone-content .icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.drop-zone-content h3 {
  margin: 0 0 8px 0;
  color: #495057;
}

.drop-zone-content .hint {
  color: #6c757d;
  margin: 8px 0;
}

.drop-zone-content .requirements {
  color: #adb5bd;
  font-size: 12px;
  margin: 0;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin-top: 12px;
}

.file-details {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name {
  font-weight: 500;
  color: #495057;
}

.file-size {
  color: #6c757d;
  font-size: 12px;
}

.clear-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: #c82333;
}

.validation-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 4px;
  margin-top: 12px;
  font-size: 14px;
}

.validation-status.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.validation-status.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.validation-status.warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-icon {
  font-size: 16px;
  font-weight: bold;
}

.xml-preview {
  margin-top: 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-size: 13px;
  font-weight: 500;
}

.toggle-btn {
  padding: 4px 8px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: #e9ecef;
}

.xml-content {
  margin: 0;
  padding: 12px;
  background: #f8f9fa;
  font-size: 11px;
  line-height: 1.4;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
