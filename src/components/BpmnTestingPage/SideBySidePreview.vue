<template>
  <div class="side-by-side-preview">
    <!-- Header -->
    <div class="preview-header">
      <h3>Side-by-Side Comparison</h3>
      <div class="header-actions">
        <button class="action-btn" @click="onSync" :disabled="!canSync">
          🔄 Sync
        </button>
        <button class="action-btn" @click="onReset">
          ↺ Reset
        </button>
      </div>
    </div>

    <!-- Comparison Stats -->
    <div class="comparison-stats">
      <div class="stat-item">
        <span class="stat-label">Nodes:</span>
        <span class="stat-value">{{ nodeCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Edges:</span>
        <span class="stat-value">{{ edgeCount }}</span>
      </div>
      <div class="stat-item" v-if="conversionTime">
        <span class="stat-label">Time:</span>
        <span class="stat-value">{{ conversionTime }}ms</span>
      </div>
    </div>

    <!-- Panels Container -->
    <div class="panels-container">
      <!-- Vue Flow Panel -->
      <div class="panel vue-flow-panel">
        <div class="panel-header">
          <span class="panel-title">Vue Flow</span>
          <span class="panel-status" v-if="vueFlowStatus">{{ vueFlowStatus }}</span>
        </div>
        <div class="panel-content">
          <div v-if="hasNodes" class="workflow-summary">
            <div class="summary-item" v-for="node in nodeTypeSummary" :key="node.type">
              <span class="type-icon">{{ getTypeIcon(node.type) }}</span>
              <span class="type-name">{{ node.type }}</span>
              <span class="type-count">{{ node.count }}</span>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>No workflow loaded</p>
          </div>
        </div>
      </div>

      <!-- Separator -->
      <div class="panel-separator">
        <span>VS</span>
      </div>

      <!-- BPMN Panel -->
      <div class="panel bpmn-panel">
        <div class="panel-header">
          <span class="panel-title">BPMN.js</span>
          <span class="panel-status" v-if="bpmnStatus">{{ bpmnStatus }}</span>
        </div>
        <div class="panel-content">
          <div v-if="bpmnXml" class="bpmn-summary">
            <div class="summary-info">
              <p><strong>BPMN Version:</strong> 2.0</p>
              <p><strong>Process ID:</strong> {{ processId }}</p>
              <p><strong>Process Name:</strong> {{ processName }}</p>
              <p><strong>Namespaces:</strong> ✓ BPMN, BPMNDI, DC, DI</p>
              <p v-if="hasExtensions"><strong>Extensions:</strong> Flowable/Camunda</p>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>No BPMN generated</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Differences -->
    <div v-if="differences.length > 0" class="differences-section">
      <h4>Differences</h4>
      <ul class="differences-list">
        <li v-for="(diff, i) in differences" :key="i" :class="diff.severity">
          <span class="diff-icon">{{ diff.icon }}</span>
          <span class="diff-message">{{ diff.message }}</span>
        </li>
      </ul>
    </div>

    <!-- Actions -->
    <div class="preview-actions">
      <button class="action-btn primary" @click="onExportJson" :disabled="!hasNodes">
        💾 Export JSON
      </button>
      <button class="action-btn primary" @click="onExportBpmn" :disabled="!bpmnXml">
        📋 Export BPMN
      </button>
      <button class="action-btn" @click="onDownloadDiff" v-if="differences.length > 0">
        📄 Download Diff
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BpmnNode, BpmnEdge } from '@/types/bpmn'

interface Props {
  nodes?: BpmnNode[]
  edges?: BpmnEdge[]
  bpmnXml?: string
  processId?: string
  processName?: string
  conversionTime?: number
  differences?: Array<{ icon: string; message: string; severity: string }>
}

interface Emits {
  (e: 'sync'): void
  (e: 'reset'): void
  (e: 'export-json'): void
  (e: 'export-bpmn'): void
  (e: 'download-diff'): void
}

const props = withDefaults(defineProps<Props>(), {
  nodes: () => [],
  edges: () => [],
  bpmnXml: '',
  processId: '',
  processName: '',
  conversionTime: 0,
  differences: () => []
})

const emit = defineEmits<Emits>()

const vueFlowStatus = ref('Loaded')
const bpmnStatus = ref('Generated')

const hasNodes = computed(() => props.nodes.length > 0)
const nodeCount = computed(() => props.nodes.length)
const edgeCount = computed(() => props.edges.length)
const canSync = computed(() => hasNodes.value && props.bpmnXml)
const hasExtensions = computed(() => {
  if (!props.bpmnXml) return false
  return props.bpmnXml.includes('flowable:') || props.bpmnXml.includes('camunda:')
})

const nodeTypeSummary = computed(() => {
  const typeCount: Record<string, number> = {}
  props.nodes.forEach(node => {
    typeCount[node.type] = (typeCount[node.type] || 0) + 1
  })
  return Object.entries(typeCount).map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
})

const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    startEvent: '⚪',
    endEvent: '🔴',
    userTask: '👤',
    serviceTask: '⚙️',
    exclusiveGateway: '💎',
    parallelGateway: '⚡'
  }
  return icons[type] || '📦'
}

const onSync = () => {
  emit('sync')
}

const onReset = () => {
  emit('reset')
}

const onExportJson = () => {
  emit('export-json')
}

const onExportBpmn = () => {
  emit('export-bpmn')
}

const onDownloadDiff = () => {
  emit('download-diff')
}
</script>

<style scoped>
.side-by-side-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #dee2e6;
}

.preview-header h3 {
  margin: 0;
  color: #495057;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.primary {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.action-btn.primary:hover:not(:disabled) {
  background: #2980b9;
  border-color: #2980b9;
}

.comparison-stats {
  display: flex;
  gap: 20px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.stat-item {
  display: flex;
  gap: 6px;
  font-size: 13px;
}

.stat-label {
  color: #6c757d;
}

.stat-value {
  font-weight: 600;
  color: #495057;
}

.panels-container {
  display: flex;
  gap: 12px;
  min-height: 300px;
}

.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-size: 13px;
  font-weight: 500;
}

.panel-title {
  color: #495057;
}

.panel-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #d4edda;
  color: #155724;
}

.panel-content {
  flex: 1;
  padding: 12px;
  background: white;
}

.workflow-summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 12px;
}

.type-icon {
  font-size: 16px;
}

.type-name {
  flex: 1;
  color: #495057;
}

.type-count {
  font-weight: 600;
  color: #3498db;
}

.bpmn-summary {
  font-size: 12px;
}

.summary-info p {
  margin: 4px 0;
  color: #495057;
}

.panel-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  font-weight: bold;
  color: #adb5bd;
  font-size: 12px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #adb5bd;
  font-size: 13px;
}

.differences-section {
  padding: 12px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
}

.differences-section h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #856404;
}

.differences-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.differences-list li {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  font-size: 12px;
}

.differences-list li.info {
  color: #495057;
}

.differences-list li.warning {
  color: #856404;
}

.differences-list li.error {
  color: #721c24;
}

.diff-icon {
  font-size: 14px;
}

.preview-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #dee2e6;
}
</style>
