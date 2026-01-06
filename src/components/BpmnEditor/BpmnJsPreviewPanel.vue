<template>
  <div
    v-if="isOpen"
    class="bpmn-preview-panel"
    :class="{ expanded: isExpanded }"
  >
    <!-- Panel Header -->
    <div class="panel-header">
      <div class="header-title">
        <span class="title-icon">📊</span>
        <span>BPMN Preview</span>
        <span v-if="isLoading" class="loading-indicator">Loading...</span>
      </div>
      <div class="header-actions">
        <button
          class="action-btn"
          :title="isExpanded ? 'Collapse' : 'Expand'"
          @click="toggleExpand"
        >
          {{ isExpanded ? '▼' : '▲' }}
        </button>
        <button
          class="action-btn"
          title="Refresh"
          @click="onRefresh"
        >
          ↻
        </button>
        <button
          class="action-btn close-btn"
          title="Close"
          @click="onClose"
        >
          ×
        </button>
      </div>
    </div>

    <!-- Panel Content -->
    <div v-show="!isExpanded" class="panel-content">
      <!-- Error Message -->
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="onRetry">Retry</button>
      </div>

      <!-- BPMN Container -->
      <div
        v-show="!error"
        ref="bpmnContainer"
        class="bpmn-container"
      />

      <!-- Empty State -->
      <div v-if="!xmlContent && !error && !isLoading" class="empty-state">
        <p>No BPMN content to display</p>
        <p class="hint">Add nodes and connections to generate BPMN</p>
      </div>
    </div>

    <!-- Panel Footer -->
    <div v-show="!isExpanded && xmlContent" class="panel-footer">
      <div class="stats">
        <span>{{ nodeCount }} nodes</span>
        <span>{{ edgeCount }} edges</span>
      </div>
      <div class="footer-actions">
        <button class="footer-btn" @click="onExportBpmn" title="Export BPMN XML">
          Download BPMN
        </button>
        <button class="footer-btn" @click="onExportSvg" title="Export as SVG">
          Export SVG
        </button>
      </div>
    </div>

    <!-- Resize Handle -->
    <div
      v-if="!isExpanded"
      class="resize-handle"
      @mousedown="onResizeStart"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { BpmnNode, BpmnEdge } from '@/types/bpmn'

interface Props {
  isOpen: boolean
  nodes: BpmnNode[]
  edges: BpmnEdge[]
  processId?: string
  processName?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'export-bpmn'): void
  (e: 'export-svg'): void
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  processId: 'process',
  processName: 'Process'
})

const emit = defineEmits<Emits>()

// State
const isExpanded = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const bpmnContainer = ref<HTMLElement | null>(null)
const xmlContent = ref('')

// Computed stats
const nodeCount = ref(0)
const edgeCount = ref(0)

// BPMN.js viewer instance
let bpmnViewer: any = null
let isResizing = false
let startY = 0
let startHeight = 0

// Load bpmn-js dynamically
const loadBpmnViewer = async () => {
  try {
    const { default: BpmnJS } = await import('bpmn-js/lib/NavigatedViewer')
    return BpmnJS
  } catch (err) {
    console.error('Failed to load bpmn-js:', err)
    throw new Error('BPMN viewer library not available')
  }
}

// Initialize BPMN viewer
const initializeViewer = async () => {
  if (!bpmnContainer.value) return

  try {
    isLoading.value = true
    error.value = null

    // Clean up existing viewer
    if (bpmnViewer) {
      try {
        await bpmnViewer.destroy()
      } catch {
        // Ignore destroy errors
      }
      bpmnViewer = null
    }

    const BpmnJS = await loadBpmnViewer()

    // Create new viewer instance
    bpmnViewer = new BpmnJS({
      container: bpmnContainer.value,
      height: bpmnContainer.value.clientHeight || 400,
      width: '100%'
    })

    // Import BPMN XML if available
    if (xmlContent.value) {
      const result = await bpmnViewer.importXML(xmlContent.value)
      if (result.warnings && result.warnings.length > 0) {
        console.warn('BPMN import warnings:', result.warnings)
      }
    }

    // Fit to viewport
    const canvas = bpmnViewer.get('canvas')
    if (canvas) {
      canvas.zoom('fit-viewport')
    }

    isLoading.value = false
  } catch (err) {
    console.error('Failed to initialize BPMN viewer:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load BPMN viewer'
    isLoading.value = false
  }
}

// Generate BPMN XML from nodes and edges
const generateBpmnXml = async () => {
  if (props.nodes.length === 0) {
    xmlContent.value = ''
    nodeCount.value = 0
    edgeCount.value = 0
    return
  }

  try {
    isLoading.value = true
    error.value = null

    // Use the bpmn converter utility
    const { convertToBpmnXml } = await import('@/composables/useBpmnConverter')
    const xml = convertToBpmnXml(
      props.nodes,
      props.edges,
      props.processId,
      props.processName
    )

    xmlContent.value = xml
    nodeCount.value = props.nodes.length
    edgeCount.value = props.edges.length

    // Update viewer if initialized
    if (bpmnViewer && xmlContent.value) {
      try {
        await bpmnViewer.importXML(xmlContent.value)
        const canvas = bpmnViewer.get('canvas')
        if (canvas) {
          canvas.zoom('fit-viewport')
        }
      } catch (err) {
        console.error('Failed to update BPMN viewer:', err)
        error.value = err instanceof Error ? err.message : 'Failed to update preview'
      }
    }

    isLoading.value = false
  } catch (err) {
    console.error('Failed to generate BPMN XML:', err)
    error.value = err instanceof Error ? err.message : 'Failed to generate BPMN'
    isLoading.value = false
  }
}

// Watch for content changes
watch(
  () => [props.nodes, props.edges],
  async () => {
    if (props.isOpen) {
      await generateBpmnXml()
    }
  },
  { deep: true }
)

// Watch for panel open/close
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      await nextTick()
      await initializeViewer()
      await generateBpmnXml()
    } else {
      // Clean up when closed
      if (bpmnViewer) {
        try {
          await bpmnViewer.destroy()
        } catch {
          // Ignore
        }
        bpmnViewer = null
      }
      xmlContent.value = ''
    }
  }
)

// Refresh preview
const onRefresh = async () => {
  await initializeViewer()
  await generateBpmnXml()
}

// Retry loading
const onRetry = async () => {
  error.value = null
  await initializeViewer()
  await generateBpmnXml()
}

// Toggle expand/collapse
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// Close panel
const onClose = () => {
  emit('close')
}

// Export BPMN
const onExportBpmn = () => {
  emit('export-bpmn')
}

// Export SVG
const onExportSvg = async () => {
  if (!bpmnViewer) return

  try {
    const { svg } = await bpmnViewer.saveSVG()
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${props.processId || 'workflow'}-${Date.now()}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to export SVG:', err)
    alert('Failed to export SVG')
  }
}

// Resize handlers
const onResizeStart = (e: MouseEvent) => {
  isResizing = true
  startY = e.clientY
  const panel = (e.currentTarget as HTMLElement).parentElement
  if (panel) {
    startHeight = panel.clientHeight
  }
  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
}

const onResizeMove = (e: MouseEvent) => {
  if (!isResizing) return
  const deltaY = startY - e.clientY
  const newHeight = Math.max(200, Math.min(800, startHeight + deltaY))
  const panel = document.querySelector('.bpmn-preview-panel')
  if (panel) {
    panel.style.height = `${newHeight}px`
  }
}

const onResizeEnd = () => {
  isResizing = false
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)

  // Update viewer size after resize
  if (bpmnViewer) {
    nextTick(() => {
      const canvas = bpmnViewer.get('canvas')
      if (canvas) {
        canvas.zoom('fit-viewport')
      }
    })
  }
}

// Cleanup
onBeforeUnmount(async () => {
  if (bpmnViewer) {
    try {
      await bpmnViewer.destroy()
    } catch {
      // Ignore
    }
  }
})
</script>

<style scoped>
.bpmn-preview-panel {
  position: fixed;
  right: 0;
  bottom: 0;
  width: 500px;
  height: 400px;
  background: white;
  border-left: 1px solid #dee2e6;
  border-top: 1px solid #dee2e6;
  border-radius: 8px 0 0 0;
  box-shadow: -2px -2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: height 0.2s ease;
}

.bpmn-preview-panel.expanded {
  height: 40px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  border-radius: 8px 0 0 0;
  user-select: none;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #495057;
}

.title-icon {
  font-size: 16px;
}

.loading-indicator {
  font-size: 11px;
  color: #868e96;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #868e96;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.action-btn.close-btn:hover {
  background: #ffebee;
  color: #c62828;
}

.panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #c62828;
  text-align: center;
}

.error-message p {
  margin-bottom: 15px;
}

.error-message button {
  padding: 8px 16px;
  background: #c62828;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.bpmn-container {
  flex: 1;
  width: 100%;
  height: 100%;
  background: #f8f9fa;
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #868e96;
  text-align: center;
  padding: 20px;
}

.empty-state .hint {
  font-size: 12px;
  margin-top: 8px;
  color: #adb5bd;
}

.panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  font-size: 12px;
}

.stats {
  display: flex;
  gap: 15px;
  color: #868e96;
}

.stats span {
  padding: 4px 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.footer-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 11px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
}

.footer-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  cursor: ns-resize;
  background: transparent;
  transition: background 0.2s;
}

.resize-handle:hover {
  background: #3498db;
}

/* BPMN.js container styles */
:deep(.bpmn-container > div) {
  width: 100% !important;
  height: 100% !important;
}
</style>
