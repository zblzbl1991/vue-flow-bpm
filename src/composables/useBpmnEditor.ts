import { ref, computed } from 'vue'
import type { BpmnNode, BpmnEdge, BpmnElementType, BpmnProcess } from '@/types/bpmn'
import { BPMN_ELEMENT_CONFIGS } from '@/types/bpmn'

export function useBpmnEditor() {
  const nodes = ref<BpmnNode[]>([])
  const edges = ref<BpmnEdge[]>([])
  const selectedNodeId = ref<string | null>(null)
  const selectedEdgeId = ref<string | null>(null)

  const processInfo = ref<BpmnProcess>({
    id: '',
    name: 'My Process',
    version: 1,
    executable: true,
    documentation: '',
    candidateStarterGroups: []
  })

  let nodeIdCounter = 0
  let edgeIdCounter = 0

  const generateNodeId = () => {
    return `node-${nodeIdCounter++}`
  }

  const generateEdgeId = () => {
    return `edge-${edgeIdCounter++}`
  }

  const addNode = (type: BpmnElementType, position: { x: number; y: number }) => {
    const config = BPMN_ELEMENT_CONFIGS[type]
    const newNode: BpmnNode = {
      id: generateNodeId(),
      type,
      position,
      data: {
        label: config.label,
        width: config.defaultSize.width,
        height: config.defaultSize.height
      }
    }
    nodes.value.push(newNode)
    return newNode
  }

  const deleteNode = (nodeId: string) => {
    const index = nodes.value.findIndex(n => n.id === nodeId)
    if (index !== -1) {
      nodes.value.splice(index, 1)
      // Remove connected edges
      edges.value = edges.value.filter(e => e.source !== nodeId && e.target !== nodeId)
      if (selectedNodeId.value === nodeId) {
        selectedNodeId.value = null
      }
    }
  }

  const updateNode = (nodeId: string, updates: Partial<BpmnNode>) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (node) {
      Object.assign(node, updates)
      if (updates.data) {
        Object.assign(node.data, updates.data)
      }
    }
  }

  const addEdge = (source: string, target: string, condition?: string) => {
    // Check if edge already exists
    const existingEdge = edges.value.find(e => e.source === source && e.target === target)
    if (existingEdge) {
      return existingEdge
    }

    // Check for self-loop
    if (source === target) {
      throw new Error('Cannot connect a node to itself')
    }

    const newEdge: BpmnEdge = {
      id: generateEdgeId(),
      source,
      target,
      type: 'default',
      data: {
        condition,
        label: condition || ''
      },
      markerEnd: 'arrow-closed',
      animated: false
    }
    edges.value.push(newEdge)
    return newEdge
  }

  const deleteEdge = (edgeId: string) => {
    const index = edges.value.findIndex(e => e.id === edgeId)
    if (index !== -1) {
      edges.value.splice(index, 1)
      if (selectedEdgeId.value === edgeId) {
        selectedEdgeId.value = null
      }
    }
  }

  const updateEdge = (edgeId: string, updates: Partial<BpmnEdge>) => {
    const edge = edges.value.find(e => e.id === edgeId)
    if (edge) {
      Object.assign(edge, updates)
      if (updates.data) {
        Object.assign(edge.data, updates.data)
      }
    }
  }

  const selectNode = (nodeId: string | null) => {
    selectedNodeId.value = nodeId
    selectedEdgeId.value = null
  }

  const selectEdge = (edgeId: string | null) => {
    selectedEdgeId.value = edgeId
    selectedNodeId.value = null
  }

  const clearSelection = () => {
    selectedNodeId.value = null
    selectedEdgeId.value = null
  }

  const getSelectedNode = computed(() => {
    return nodes.value.find(n => n.id === selectedNodeId.value) || null
  })

  const getSelectedEdge = computed(() => {
    return edges.value.find(e => e.id === selectedEdgeId.value) || null
  })

  const clearAll = () => {
    nodes.value = []
    edges.value = []
    selectedNodeId.value = null
    selectedEdgeId.value = null
    nodeIdCounter = 0
    edgeIdCounter = 0
  }

  const loadFromJson = (json: string) => {
    try {
      const data = JSON.parse(json)
      if (data.nodes && Array.isArray(data.nodes)) {
        nodes.value = data.nodes
      }
      if (data.edges && Array.isArray(data.edges)) {
        edges.value = data.edges
      }
      if (data.process) {
        processInfo.value = data.process
      }
      // Update counters to avoid ID conflicts
      const maxNodeId = nodes.value.reduce((max, n) => {
        const match = n.id.match(/node-(\d+)/)
        return match ? Math.max(max, parseInt(match[1])) : max
      }, -1)
      nodeIdCounter = maxNodeId + 1

      const maxEdgeId = edges.value.reduce((max, e) => {
        const match = e.id.match(/edge-(\d+)/)
        return match ? Math.max(max, parseInt(match[1])) : max
      }, -1)
      edgeIdCounter = maxEdgeId + 1
      return true
    } catch (e) {
      console.error('Failed to load workflow:', e)
      return false
    }
  }

  const exportToJson = () => {
    return JSON.stringify({
      process: processInfo.value,
      nodes: nodes.value,
      edges: edges.value
    }, null, 2)
  }

  // Validate ID format (XML NCName rules)
  const isValidId = (id: string): boolean => {
    return /^[a-zA-Z_][a-zA-Z0-9_.-]*$/.test(id)
  }

  // Check if ID is unique
  const isUniqueId = (id: string, excludeNodeId?: string): boolean => {
    return !nodes.value.some(n => n.id === id && n.id !== excludeNodeId)
  }

  // Update node ID with validation and reference updates
  const updateNodeId = (oldId: string, newId: string): boolean => {
    if (!isValidId(newId)) {
      return false
    }
    if (!isUniqueId(newId, oldId)) {
      return false
    }

    const node = nodes.value.find(n => n.id === oldId)
    if (!node) {
      return false
    }

    // Update node ID
    node.id = newId

    // Update all edge references
    edges.value.forEach(edge => {
      if (edge.source === oldId) {
        edge.source = newId
      }
      if (edge.target === oldId) {
        edge.target = newId
      }
    })

    // Update selection if needed
    if (selectedNodeId.value === oldId) {
      selectedNodeId.value = newId
    }

    return true
  }

  // Delete selected element (node or edge)
  const deleteSelected = () => {
    if (selectedNodeId.value) {
      deleteNode(selectedNodeId.value)
    } else if (selectedEdgeId.value) {
      deleteEdge(selectedEdgeId.value)
    }
  }

  return {
    nodes,
    edges,
    processInfo,
    selectedNodeId,
    selectedEdgeId,
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
    isValidId,
    isUniqueId,
    updateNodeId,
    deleteSelected
  }
}
