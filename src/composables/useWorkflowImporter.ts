/**
 * Unified workflow import handler
 * Supports both JSON and BPMN XML import formats
 */

import { ref, computed } from 'vue'
import type { BpmnWorkflow, BpmnNode, BpmnEdge, BpmnProcess } from '@/types/bpmn'
import { importBpmnXml, type BpmnImportResult } from '@/utils/bpmn-importer'

export type ImportFormat = 'json' | 'bpmn'

export interface ImportResult {
  success: boolean
  workflow?: BpmnWorkflow
  error?: string
  warnings?: string[]
}

export interface JsonWorkflowData {
  process?: BpmnProcess
  nodes?: BpmnNode[]
  edges?: BpmnEdge[]
}

export function useWorkflowImporter() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const warnings = ref<string[]>([])

  const importState = computed(() => ({
    loading: loading.value,
    error: error.value,
    warnings: warnings.value
  }))

  /**
   * Detect file format from filename
   */
  const detectFormat = (filename: string): ImportFormat | null => {
    if (filename.endsWith('.json')) return 'json'
    if (filename.endsWith('.bpmn') || filename.endsWith('.xml')) return 'bpmn'
    return null
  }

  /**
   * Import workflow from file
   */
  const importFromFile = async (file: File): Promise<ImportResult> => {
    loading.value = true
    error.value = null
    warnings.value = []

    try {
      const format = detectFormat(file.name)

      if (!format) {
        return {
          success: false,
          error: `Unsupported file type. Please upload .json, .bpmn, or .xml files.`
        }
      }

      // Validate file size
      const maxSize = format === 'json' ? 5 * 1024 * 1024 : 10 * 1024 * 1024 // 5MB for JSON, 10MB for BPMN
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0)
        return {
          success: false,
          error: `File too large. Maximum size for ${format.toUpperCase()} files is ${maxSizeMB}MB.`
        }
      }

      // Read file content
      const content = await readFileAsText(file)

      // Import based on format
      if (format === 'json') {
        return await importJson(content)
      } else {
        return await importBpmn(content)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown import error'
      error.value = errorMessage
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Import JSON workflow
   */
  const importJson = async (jsonContent: string): Promise<ImportResult> => {
    try {
      // Parse JSON
      const data = JSON.parse(jsonContent) as JsonWorkflowData

      // Validate structure
      const validation = validateJsonStructure(data)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Extract workflow components
      const nodes = data.nodes || []
      const edges = data.edges || []
      const process = data.process || {
        id: `process-${Date.now()}`,
        name: 'Imported Process',
        version: 1,
        executable: true
      }

      // Collect warnings
      const importWarnings: string[] = []

      // Check for unsupported node types
      const supportedTypes = ['startEvent', 'endEvent', 'userTask', 'serviceTask', 'exclusiveGateway', 'parallelGateway', 'subProcess']
      const unsupportedNodes = nodes.filter(n => !supportedTypes.includes(n.type))
      if (unsupportedNodes.length > 0) {
        const types = [...new Set(unsupportedNodes.map(n => n.type))]
        importWarnings.push(`Unsupported node types: ${types.join(', ')}. These nodes will be skipped.`)
        // Filter out unsupported nodes
        nodes.splice(0, nodes.length, ...nodes.filter(n => supportedTypes.includes(n.type)))
      }

      // Check for edges with invalid references
      const nodeIds = new Set(nodes.map(n => n.id))
      const invalidEdges = edges.filter(e => !nodeIds.has(e.source) || !nodeIds.has(e.target))
      if (invalidEdges.length > 0) {
        importWarnings.push(`${invalidEdges.length} edge(s) reference non-existent nodes and will be skipped.`)
        // Filter out invalid edges
        edges.splice(0, edges.length, ...edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target)))
      }

      warnings.value = importWarnings

      const workflow: BpmnWorkflow = {
        process,
        nodes,
        edges
      }

      return {
        success: true,
        workflow,
        warnings: importWarnings.length > 0 ? importWarnings : undefined
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        return {
          success: false,
          error: 'Invalid JSON format. Please check the file syntax.'
        }
      }
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error importing JSON'
      }
    }
  }

  /**
   * Import BPMN XML workflow
   */
  const importBpmn = async (xmlContent: string): Promise<ImportResult> => {
    try {
      const result: BpmnImportResult = await importBpmnXml(xmlContent)

      if (!result.success) {
        const errorMessage = result.errors?.map(e => {
          const location = e.elementId ? ` (Element: ${e.elementId})` : ''
          return `${e.message}${location}`
        }).join('; ') || 'Import failed'

        return {
          success: false,
          error: errorMessage
        }
      }

      warnings.value = result.warnings || []

      return {
        success: true,
        workflow: result.workflow,
        warnings: result.warnings
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error importing BPMN XML'
      }
    }
  }

  /**
   * Reset state
   */
  const reset = () => {
    loading.value = false
    error.value = null
    warnings.value = []
  }

  return {
    importState,
    loading,
    error,
    warnings,
    detectFormat,
    importFromFile,
    importJson,
    importBpmn,
    reset
  }
}

/**
 * Validate JSON workflow structure
 */
function validateJsonStructure(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid JSON: expected an object' }
  }

  const workflowData = data as JsonWorkflowData

  // Check for nodes array (required)
  if (!workflowData.nodes || !Array.isArray(workflowData.nodes)) {
    return { valid: false, error: 'Invalid workflow format: missing or invalid "nodes" array' }
  }

  // Check for edges array (required)
  if (!workflowData.edges || !Array.isArray(workflowData.edges)) {
    return { valid: false, error: 'Invalid workflow format: missing or invalid "edges" array' }
  }

  // Validate node structure
  for (let i = 0; i < workflowData.nodes.length; i++) {
    const node = workflowData.nodes[i]
    if (!node.id || typeof node.id !== 'string') {
      return { valid: false, error: `Invalid node at index ${i}: missing or invalid "id"` }
    }
    if (!node.type || typeof node.type !== 'string') {
      return { valid: false, error: `Invalid node at index ${i}: missing or invalid "type"` }
    }
    if (!node.position || typeof node.position !== 'object') {
      return { valid: false, error: `Invalid node at index ${i}: missing or invalid "position"` }
    }
    if (!node.data || typeof node.data !== 'object') {
      return { valid: false, error: `Invalid node at index ${i}: missing or invalid "data"` }
    }
  }

  // Validate edge structure
  for (let i = 0; i < workflowData.edges.length; i++) {
    const edge = workflowData.edges[i]
    if (!edge.id || typeof edge.id !== 'string') {
      return { valid: false, error: `Invalid edge at index ${i}: missing or invalid "id"` }
    }
    if (!edge.source || typeof edge.source !== 'string') {
      return { valid: false, error: `Invalid edge at index ${i}: missing or invalid "source"` }
    }
    if (!edge.target || typeof edge.target !== 'string') {
      return { valid: false, error: `Invalid edge at index ${i}: missing or invalid "target"` }
    }
    if (!edge.data || typeof edge.data !== 'object') {
      return { valid: false, error: `Invalid edge at index ${i}: missing or invalid "data"` }
    }
  }

  return { valid: true }
}

/**
 * Read file as text
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      resolve(reader.result as string)
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}
