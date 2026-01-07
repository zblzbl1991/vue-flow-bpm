<template>
  <div class="bpmn-editor">
    <ControlPanel
      @add-element="onAddElement"
      @clear="onClear"
    />

    <div class="editor-canvas">
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :node-types="nodeTypes"
        :edge-types="edgeTypes"
        :default-viewport="{ zoom: 1, x: 0, y: 0 }"
        :min-zoom="0.25"
        :max-zoom="2"
        fit-view-on-init
        @node-click="onNodeClick"
        @edge-click="onEdgeClick"
        @connect="onConnect"
        @drop="onDrop"
        @dragover="onDragOver"
        @delete="onDelete"
        @contextmenu="onContextMenu"
      >
        <Background />
        <Controls />
      </VueFlow>

      <div class="canvas-toolbar">
        <button class="toolbar-btn" @click="onValidate">
          <span>✓</span> Validate
        </button>
        <button class="toolbar-btn" @click="onExportJson">
          <span>💾</span> Save JSON
        </button>
        <label class="toolbar-btn">
          <span>📂</span> Load JSON
          <input
            ref="jsonFileInput"
            type="file"
            accept=".json"
            @change="onLoadJson"
            style="display: none"
          />
        </label>
        <label class="toolbar-btn">
          <span>📋</span> Load BPMN
          <input
            ref="bpmnFileInput"
            type="file"
            accept=".bpmn,.xml"
            @change="onLoadBpmn"
            style="display: none"
          />
        </label>
      </div>
    </div>

    <PropertyPanel
      :selected-node="getSelectedNode"
      :selected-edge="getSelectedEdge"
      :all-nodes="nodes"
      :all-edges="edges"
      :process-info="processInfo"
      @update-node="onUpdateNode"
      @update-edge="onUpdateEdge"
      @delete-node="onDeleteNode"
      @delete-edge="onDeleteEdge"
      @set-default-flow="onSetDefaultFlow"
      @update-process="onUpdateProcess"
    />

    <PreviewModal
      :is-open="showPreview"
      :bpmn-xml="generatedBpmnXml"
      @close="showPreview = false"
      @export-xml="onExportXml"
    />

    <ContextMenu
      :visible="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      @copy="onContextMenuCopy"
      @delete="onContextMenuDelete"
      @close="onContextMenuClose"
    />

    <BpmnJsPreviewPanel
      :is-open="showBpmnPreviewPanel"
      :nodes="nodes"
      :edges="edges"
      :process-id="processInfo.id"
      :process-name="processInfo.name"
      @close="onPreviewPanelClose"
      @export-bpmn="onExportBpmnFromPanel"
    />

    <ImportNotification
      ref="notificationRef"
      :type="notificationType"
      :title="notificationTitle"
      :message="notificationMessage"
      :warnings="notificationWarnings"
      :persistent="notificationPersistent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw, onMounted, provide } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import type { Connection, Edge, Node } from '@vue-flow/core/dist/types'
import StartEvent from '@/components/nodes/StartEvent.vue'
import EndEvent from '@/components/nodes/EndEvent.vue'
import UserTask from '@/components/nodes/UserTask.vue'
import ServiceTask from '@/components/nodes/ServiceTask.vue'
import ExclusiveGateway from '@/components/nodes/ExclusiveGateway.vue'
import ParallelGateway from '@/components/nodes/ParallelGateway.vue'
import SubProcess from '@/components/nodes/SubProcess.vue'
import SubProcessBoundary from '@/components/nodes/SubProcessBoundary.vue'
import BpmnEdge from '@/components/edges/BpmnEdge.vue'
import ControlPanel from './ControlPanel.vue'
import PropertyPanel from './PropertyPanel.vue'
import PreviewModal from './PreviewModal.vue'
import ContextMenu from './ContextMenu.vue'
import BpmnJsPreviewPanel from './BpmnJsPreviewPanel.vue'
import ImportNotification from './ImportNotification.vue'
import { useBpmnEditor } from '@/composables/useBpmnEditor'
import { useBpmnConverter } from '@/composables/useBpmnConverter'
import { useWorkflowImporter } from '@/composables/useWorkflowImporter'
import type { BpmnElementType, BpmnWorkflow } from '@/types/bpmn'
import type { NotificationType } from './ImportNotification.vue'

const nodeTypes = {
  startEvent: markRaw(StartEvent),
  endEvent: markRaw(EndEvent),
  userTask: markRaw(UserTask),
  serviceTask: markRaw(ServiceTask),
  exclusiveGateway: markRaw(ExclusiveGateway),
  parallelGateway: markRaw(ParallelGateway),
  subProcess: markRaw(SubProcess),
  subProcessBoundary: markRaw(SubProcessBoundary)
}

const edgeTypes = {
  default: markRaw(BpmnEdge)
}

const {
  nodes,
  edges,
  getSelectedNode,
  getSelectedEdge,
  addNode,
  deleteNode,
  updateNode,
  addEdge,
  deleteEdge,
  updateEdge,
  selectNode,
  selectEdge,
  clearSelection,
  clearAll,
  loadFromJson,
  exportToJson,
  deleteSelected,
  toggleExpandSubProcess
} = useBpmnEditor()

// Provide toggleExpandSubProcess to child components (e.g., SubProcess nodes)
provide('toggleExpand', toggleExpandSubProcess)

const { validateAndConvert, downloadBpmnFile } = useBpmnConverter()
const { importFromFile, loading: importLoading } = useWorkflowImporter()

const showPreview = ref(false)
const generatedBpmnXml = ref('')
const showBpmnPreviewPanel = ref(false)

// Process info state
const processInfo = ref({
  id: `process-${Date.now()}`,
  name: 'My Process',
  version: 1,
  executable: true,
  documentation: '',
  candidateStarterGroups: []
})

// Context menu state
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)

// Notification state
const notificationRef = ref<InstanceType<typeof ImportNotification> | null>(null)
const notificationType = ref<NotificationType>('success')
const notificationTitle = ref('')
const notificationMessage = ref('')
const notificationWarnings = ref<string[]>([])
const notificationPersistent = ref(false)

// File input refs
const jsonFileInput = ref<HTMLInputElement | null>(null)
const bpmnFileInput = ref<HTMLInputElement | null>(null)

const onAddElement = (type: BpmnElementType) => {
  // Add node at a default position with some offset
  const offset = nodes.value.length * 50
  addNode(type, { x: 100 + offset, y: 100 + offset })
}

const onClear = () => {
  clearAll()
}

const onNodeClick = (_event: any, node: Node) => {
  if (!node) return
  selectNode(node.id)
  contextMenuVisible.value = false
}

const onEdgeClick = (_event: any, edge: Edge) => {
  if (!edge) return
  selectEdge(edge.id)
  contextMenuVisible.value = false
}

// Handle right-click on canvas
const onContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  // Only show context menu if clicking on a node or edge
  const target = event.target as HTMLElement
  if (target.closest('.vue-flow__node') || target.closest('.vue-flow__edge')) {
    contextMenuX.value = event.clientX
    contextMenuY.value = event.clientY
    contextMenuVisible.value = true
  }
}

const onContextMenuDelete = () => {
  deleteSelected()
}

const onContextMenuCopy = () => {
  const selectedNode = getSelectedNode.value
  const selectedEdge = getSelectedEdge.value

  if (selectedNode) {
    // Copy node data to clipboard as JSON
    const nodeData = JSON.stringify({
      type: 'node',
      data: selectedNode
    }, null, 2)
    navigator.clipboard.writeText(nodeData).then(() => {
      // Optional: Show a toast or notification
      console.log('Node copied to clipboard')
    }).catch(err => {
      console.error('Failed to copy:', err)
    })
  } else if (selectedEdge) {
    // Copy edge data to clipboard as JSON
    const edgeData = JSON.stringify({
      type: 'edge',
      data: selectedEdge
    }, null, 2)
    navigator.clipboard.writeText(edgeData).then(() => {
      console.log('Edge copied to clipboard')
    }).catch(err => {
      console.error('Failed to copy:', err)
    })
  }
}

const onContextMenuClose = () => {
  contextMenuVisible.value = false
}

const onConnect = (connection: Connection) => {
  try {
    addEdge(connection.source!, connection.target!)
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Failed to create connection')
  }
}

const onDrop = (event: DragEvent) => {
  const type = event.dataTransfer?.getData('application/vue-flow') as BpmnElementType
  if (!type) return

  const position = {
    x: event.offsetX,
    y: event.offsetY
  }

  addNode(type, position)
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDelete = () => {
  deleteSelected()
}

// Keyboard shortcuts for deletion
const handleKeyDown = (event: KeyboardEvent) => {
  // Delete or Backspace to delete selected element
  if (event.key === 'Delete' || event.key === 'Backspace') {
    // Don't delete if user is typing in an input
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return
    }
    event.preventDefault()
    deleteSelected()
  }
}

const onUpdateNode = (nodeId: string, data: any) => {
  updateNode(nodeId, { data })
}

const onUpdateEdge = (edgeId: string, data: any) => {
  updateEdge(edgeId, { data })
}

const onDeleteNode = (nodeId: string) => {
  deleteNode(nodeId)
}

const onDeleteEdge = (edgeId: string) => {
  deleteEdge(edgeId)
}

const onSetDefaultFlow = (edgeId: string) => {
  // Find the source node of this edge
  const edge = edges.value.find(e => e.id === edgeId)
  if (edge) {
    // Set this edge as default for the gateway
    updateNode(edge.source, { data: { default: edgeId } })
  }
}

const onUpdateProcess = (key: string, value: any) => {
  processInfo.value = { ...processInfo.value, [key]: value }
}

const onValidate = () => {
  const result = validateAndConvert(
    nodes.value,
    edges.value,
    processInfo.value.id,
    processInfo.value.name
  )

  if (result.success && result.xml) {
    generatedBpmnXml.value = result.xml
    showBpmnPreviewPanel.value = true
  } else {
    const errorMsg = `Validation failed:\n${result.errors?.join('\n') || 'Unknown error'}`
    // Output to console for easy copying
    console.error('=== BPMN Validation Error ===')
    console.error(result.errors?.join('\n') || 'Unknown error')
    console.error('==============================')
    alert(errorMsg)
  }
}

const onExportJson = () => {
  const json = exportToJson()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `workflow-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const onLoadJson = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // Check if editor has content and prompt for confirmation
  const hasContent = nodes.value.length > 0 || edges.value.length > 0
  if (hasContent) {
    const confirmed = confirm('Importing will replace the current workflow. Do you want to continue?')
    if (!confirmed) {
      // Reset file input
      if (jsonFileInput.value) jsonFileInput.value.value = ''
      return
    }
  }

  const result = await importFromFile(file)

  if (result.success && result.workflow) {
    applyWorkflow(result.workflow)
    showNotification(
      'success',
      'Import Successful',
      `Loaded ${result.workflow.nodes.length} nodes and ${result.workflow.edges.length} edges.`,
      result.warnings || []
    )
  } else {
    showNotification(
      'error',
      'Import Failed',
      result.error || 'Failed to import workflow',
      [],
      true
    )
  }

  // Reset file input
  if (jsonFileInput.value) jsonFileInput.value.value = ''
}

const onLoadBpmn = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // Check if editor has content and prompt for confirmation
  const hasContent = nodes.value.length > 0 || edges.value.length > 0
  if (hasContent) {
    const confirmed = confirm('Importing will replace the current workflow. Do you want to continue?')
    if (!confirmed) {
      // Reset file input
      if (bpmnFileInput.value) bpmnFileInput.value.value = ''
      return
    }
  }

  const result = await importFromFile(file)

  if (result.success && result.workflow) {
    applyWorkflow(result.workflow)
    showNotification(
      'success',
      'BPMN Import Successful',
      `Loaded ${result.workflow.nodes.length} nodes and ${result.workflow.edges.length} edges.`,
      result.warnings || []
    )
  } else {
    showNotification(
      'error',
      'BPMN Import Failed',
      result.error || 'Failed to import BPMN file',
      [],
      true
    )
  }

  // Reset file input
  if (bpmnFileInput.value) bpmnFileInput.value.value = ''
}

/**
 * Apply imported workflow to editor state
 */
const applyWorkflow = (workflow: BpmnWorkflow) => {
  // Clear current content
  clearAll()

  // Update process info
  processInfo.value = {
    id: workflow.process.id,
    name: workflow.process.name,
    version: workflow.process.version,
    executable: workflow.process.executable ?? true,
    documentation: workflow.process.documentation || '',
    candidateStarterGroups: workflow.process.candidateStarterGroups || []
  }

  // Load nodes and edges using the editor's loadFromJson method
  // We need to construct the JSON format expected by loadFromJson
  const jsonData = JSON.stringify({
    process: workflow.process,
    nodes: workflow.nodes,
    edges: workflow.edges
  })

  loadFromJson(jsonData)
}

/**
 * Show notification with specified parameters
 */
const showNotification = (
  type: NotificationType,
  title: string,
  message: string,
  warnings: string[] = [],
  persistent = false
) => {
  notificationType.value = type
  notificationTitle.value = title
  notificationMessage.value = message
  notificationWarnings.value = warnings
  notificationPersistent.value = persistent

  // Trigger the notification
  notificationRef.value?.show()
}

const onExportXml = () => {
  if (generatedBpmnXml.value) {
    downloadBpmnFile(generatedBpmnXml.value, `workflow-${Date.now()}.bpmn`)
  }
}

const onExportBpmnFromPanel = () => {
  const result = validateAndConvert(
    nodes.value,
    edges.value,
    processInfo.value.id,
    processInfo.value.name
  )

  if (result.success && result.xml) {
    downloadBpmnFile(result.xml, `${processInfo.value.id || 'workflow'}-${Date.now()}.bpmn`)
  }
}

const onPreviewPanelClose = () => {
  showBpmnPreviewPanel.value = false
}

// Click outside to deselect
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  if (!target.closest('.vue-flow') && !target.closest('.property-panel')) {
    clearSelection()
  }
})

// Keyboard event listener
document.addEventListener('keydown', handleKeyDown)

onMounted(() => {
  // Add initial nodes for demo
  const start = addNode('startEvent', { x: 100, y: 150 })
  const task1 = addNode('userTask', { x: 300, y: 150 })
  task1.data.label = 'Review Request'
  task1.data.assignee = '${initiator}'

  const gateway = addNode('exclusiveGateway', { x: 550, y: 150 })
  gateway.data.label = 'Approved?'

  const task2a = addNode('userTask', { x: 750, y: 80 })
  task2a.data.label = 'Process Request'

  const task2b = addNode('userTask', { x: 750, y: 220 })
  task2b.data.label = 'Reject Request'

  const end = addNode('endEvent', { x: 950, y: 150 })

  // Connect nodes
  addEdge(start.id, task1.id)
  addEdge(task1.id, gateway.id)

  const flowYes = addEdge(gateway.id, task2a.id)
  flowYes.data.condition = '${approved}'

  const flowNo = addEdge(gateway.id, task2b.id)
  flowNo.data.condition = '${!approved}'

  addEdge(task2a.id, end.id)
  addEdge(task2b.id, end.id)
})
</script>

<style scoped>
.bpmn-editor {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.editor-canvas {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

.canvas-toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 13px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.toolbar-btn span:first-child {
  font-size: 14px;
}

/* Vue Flow styles override */
:deep(.vue-flow) {
  background: #f8f9fa;
}

:deep(.vue-flow__node) {
  border-radius: 4px;
}

:deep(.vue-flow__edge-path) {
  stroke: #bdc3c7;
  stroke-width: 2;
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path) {
  stroke: #3498db;
  stroke-width: 3;
}

:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background: white;
  border: 2px solid #3498db;
}
</style>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
</style>
