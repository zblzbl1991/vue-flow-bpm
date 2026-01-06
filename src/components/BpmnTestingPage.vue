<script setup lang="ts">
/**
 * BPMN Testing Page
 * Standalone page for testing BPMN import/export conversions
 */

import { ref, computed } from 'vue'
import { useBpmnConverter } from '@/composables/useBpmnConverter'
import { useBpmnImporter } from '@/composables/useBpmnImporter'
import JsonUploader from './BpmnTestingPage/JsonUploader.vue'
import BpmnUploader from './BpmnTestingPage/BpmnUploader.vue'
import SideBySidePreview from './BpmnTestingPage/SideBySidePreview.vue'
import type { BpmnNode, BpmnEdge } from '@/types/bpmn'

// State
const activeTab = ref<'json-upload' | 'bpmn-upload'>('json-upload')
const showPreview = ref(false)
const testStats = ref<{
  nodes: number
  edges: number
  conversionTime: number
} | null>(null)

// Composables
const { downloadBpmnFile, convertToBpmnXml } = useBpmnConverter()
const { importFromFile, importState, hasWarnings, hasErrors, getWarningMessages, getErrorMessages } = useBpmnImporter()

// Editor state
const editorNodes = ref<BpmnNode[]>([])
const editorEdges = ref<BpmnEdge[]>([])

// File upload state
const jsonFileName = ref('')
const bpmnFileName = ref('')
const jsonFile = ref<File | null>(null)
const bpmnFile = ref<File | null>(null)
const generatedBpmnXml = ref('')

// Computed
const hasContent = computed(() => editorNodes.value.length > 0)
const showWarnings = computed(() => hasWarnings.value && !hasErrors.value)
const showErrors = computed(() => hasErrors.value)

// JSON Upload handler
const handleJsonUpload = async (file: File) => {
  jsonFileName.value = file.name

  try {
    const text = await file.text()
    const workflow = JSON.parse(text)

    editorNodes.value = workflow.nodes || []
    editorEdges.value = workflow.edges || []

    // Export to BPMN XML
    const startTime = performance.now()
    const xml = convertToBpmnXml(editorNodes.value, editorEdges.value, workflow.process?.id, workflow.process?.name)
    const endTime = performance.now()

    generatedBpmnXml.value = xml

    testStats.value = {
      nodes: editorNodes.value.length,
      edges: editorEdges.value.length,
      conversionTime: endTime - startTime
    }

    showPreview.value = true
  } catch (error) {
    alert(`Error parsing JSON: ${error instanceof Error ? error.message : error}`)
  }
}

// Handle JSON file selected from JsonUploader
const handleJsonFileSelected = async (file: File) => {
  jsonFileName.value = file.name
  await handleJsonUpload(file)
}

// Handle JSON validation
const handleJsonValidated = (isValid: boolean) => {
  if (!isValid) {
    showPreview.value = false
  }
}

// Handle BPMN file selected from BpmnUploader
const handleBpmnFileSelected = async (file: File, xmlContent?: string) => {
  bpmnFileName.value = file.name
  await handleBpmnUpload(file)
}

// Handle BPMN validation
const handleBpmnValidated = (isValid: boolean, xmlContent?: string) => {
  if (!isValid) {
    showPreview.value = false
  }
}

// BPMN Upload handler
const handleBpmnUpload = async (file: File) => {
  bpmnFileName.value = file.name

  const workflow = await importFromFile(file)

  if (workflow) {
    editorNodes.value = workflow.nodes
    editorEdges.value = workflow.edges

    testStats.value = {
      nodes: workflow.nodes.length,
      edges: workflow.edges.length,
      conversionTime: 0
    }

    showPreview.value = true
  }
}

// Download current workflow as BPMN
const handleDownloadBpmn = () => {
  const xml = convertToBpmnXml(editorNodes.value, editorEdges.value, 'test-process', 'Test Process')
  downloadBpmnFile(xml, 'test-workflow.bpmn')
}

// Download current workflow as JSON
const handleDownloadJson = () => {
  const workflow = {
    process: {
      id: 'test-process',
      name: 'Test Process',
      version: 1
    },
    nodes: editorNodes.value,
    edges: editorEdges.value
  }

  const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'test-workflow.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Reset
const handleReset = () => {
  editorNodes.value = []
  editorEdges.value = []
  showPreview.value = false
  testStats.value = null
  jsonFileName.value = ''
  bpmnFileName.value = ''
  jsonFile.value = null
  bpmnFile.value = null
  generatedBpmnXml.value = ''
}

// Tab change
const handleTabChange = (tab: 'json-upload' | 'bpmn-upload') => {
  activeTab.value = tab
  handleReset()
}

// Sync preview
const handleSync = () => {
  // Re-generate BPMN XML
  if (editorNodes.value.length > 0) {
    const xml = convertToBpmnXml(
      editorNodes.value,
      editorEdges.value,
      'test-process',
      'Test Process'
    )
    generatedBpmnXml.value = xml
  }
}

// Keyboard shortcuts handler
const handleKeydown = (e: KeyboardEvent) => {
  // Ctrl/Cmd + 1: Go to Editor
  if ((e.ctrlKey || e.metaKey) && e.key === '1') {
    e.preventDefault()
    window.location.href = '/editor'
  }

  // Ctrl/Cmd + 2: Go to Testing
  if ((e.ctrlKey || e.metaKey) && e.key === '2') {
    e.preventDefault()
    window.location.href = '/testing'
  }

  // Ctrl/Cmd + R: Reset
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault()
    handleReset()
  }

  // Ctrl/Cmd + S: Download BPMN (if available)
  if ((e.ctrlKey || e.metaKey) && e.key === 's' && showPreview.value) {
    e.preventDefault()
    handleDownloadBpmn()
  }

  // Escape: Close preview or reset
  if (e.key === 'Escape') {
    if (showPreview.value) {
      showPreview.value = false
    } else {
      handleReset()
    }
  }
}
</script>

<template>
  <div class="bpmn-testing-page" @keydown="handleKeydown">
    <header class="page-header">
      <h1>BPMN Testing Page</h1>
      <p>Test BPMN import/export conversions and validate BPMN 2.0 compliance</p>
      <p class="keyboard-hint">
        <kbd>Ctrl</kbd>+<kbd>1</kbd> Editor | <kbd>Ctrl</kbd>+<kbd>2</kbd> Testing | <kbd>Ctrl</kbd>+<kbd>R</kbd> Reset
      </p>
    </header>

    <div class="tabs" role="tablist" aria-label="Conversion mode">
      <button
        :class="['tab', { active: activeTab === 'json-upload' }]"
        role="tab"
        :aria-selected="activeTab === 'json-upload'"
        :aria-controls="json-upload-panel"
        :tabindex="activeTab === 'json-upload' ? 0 : -1"
        @click="handleTabChange('json-upload')"
      >
        JSON → BPMN XML
      </button>
      <button
        :class="['tab', { active: activeTab === 'bpmn-upload' }]"
        role="tab"
        :aria-selected="activeTab === 'bpmn-upload'"
        :aria-controls="bpmn-upload-panel"
        :tabindex="activeTab === 'bpmn-upload' ? 0 : -1"
        @click="handleTabChange('bpmn-upload')"
      >
        BPMN XML → JSON
      </button>
    </div>

    <div class="content">
      <!-- JSON Upload Section -->
      <div v-if="activeTab === 'json-upload'" class="upload-section" id="json-upload-panel" role="tabpanel" aria-labelledby="tab-json-upload">
        <h2 id="tab-json-upload">Upload vue-flow JSON</h2>
        <p class="hint">Upload a JSON file exported from vue-flow to convert to BPMN XML</p>
        <JsonUploader
          v-model="jsonFile"
          @file-selected="handleJsonFileSelected"
          @validated="handleJsonValidated"
        />
      </div>

      <!-- BPMN Upload Section -->
      <div v-if="activeTab === 'bpmn-upload'" class="upload-section" id="bpmn-upload-panel" role="tabpanel" aria-labelledby="tab-bpmn-upload">
        <h2 id="tab-bpmn-upload">Upload BPMN XML</h2>
        <p class="hint">Upload a BPMN .bpmn or .xml file to convert to vue-flow JSON</p>
        <BpmnUploader
          v-model="bpmnFile"
          @file-selected="handleBpmnFileSelected"
          @validated="handleBpmnValidated"
        />
      </div>

      <!-- Loading State -->
      <div v-if="importState.loading" class="loading">
        <p>Loading...</p>
      </div>

      <!-- Error Messages -->
      <div v-if="showErrors" class="error-messages">
        <h3>Errors:</h3>
        <ul>
          <li v-for="(error, i) in getErrorMessages()" :key="i">{{ error }}</li>
        </ul>
      </div>

      <!-- Warning Messages -->
      <div v-if="showWarnings" class="warning-messages">
        <h3>Warnings:</h3>
        <ul>
          <li v-for="(warning, i) in getWarningMessages()" :key="i">{{ warning }}</li>
        </ul>
      </div>

      <!-- Preview Section -->
      <div v-if="showPreview" class="preview-section">
        <SideBySidePreview
          :nodes="editorNodes"
          :edges="editorEdges"
          :bpmn-xml="generatedBpmnXml"
          :process-id="testStats?.nodes ? 'test-process' : ''"
          :process-name="testStats?.nodes ? 'Test Process' : ''"
          :conversion-time="testStats?.conversionTime || 0"
          :differences="[]"
          @sync="handleSync"
          @reset="handleReset"
          @export-json="handleDownloadJson"
          @export-bpmn="handleDownloadBpmn"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bpmn-testing-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 8px;
}

.page-header p {
  color: #666;
}

.keyboard-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #6c757d;
  text-align: center;
}

.keyboard-hint kbd {
  display: inline-block;
  padding: 2px 6px;
  font-size: 11px;
  line-height: 1.4;
  color: #495057;
  vertical-align: middle;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
  margin: 0 2px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.tab {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
}

.tab:hover {
  color: #333;
}

.tab.active {
  color: #2196f3;
  border-bottom-color: #2196f3;
}

.upload-section {
  padding: 20px 0;
}

.upload-section h2 {
  margin-top: 0;
  margin-bottom: 8px;
  color: #495057;
}

.hint {
  color: #6c757d;
  margin-bottom: 16px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error-messages {
  padding: 15px;
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 4px;
  margin-bottom: 20px;
}

.error-messages h3 {
  margin-top: 0;
  color: #c62828;
}

.error-messages ul {
  margin-bottom: 0;
}

.warning-messages {
  padding: 15px;
  background: #fff3e0;
  border: 1px solid #ff9800;
  border-radius: 4px;
  margin-bottom: 20px;
}

.warning-messages h3 {
  margin-top: 0;
  color: #ef6c00;
}

.warning-messages ul {
  margin-bottom: 0;
}

.preview-section {
  margin-top: 20px;
}
</style>
