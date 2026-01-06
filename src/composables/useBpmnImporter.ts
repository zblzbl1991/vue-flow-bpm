/**
 * Composable for BPMN XML import functionality
 * Manages import state, file upload, and orchestration
 */

import { ref, computed } from 'vue'
import type { BpmnWorkflow, BpmnNode, BpmnEdge } from '@/types/bpmn'
import { importBpmnXml, type BpmnImportResult } from '@/utils/bpmn-importer'

export interface ImportState {
  loading: boolean
  error: string | null
  result: BpmnImportResult | null
}

export function useBpmnImporter() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<BpmnImportResult | null>(null)

  const importState = computed<ImportState>(() => ({
    loading: loading.value,
    error: error.value,
    result: result.value
  }))

  const hasWarnings = computed(() => result.value?.warnings && result.value.warnings.length > 0)
  const hasErrors = computed(() => result.value?.errors && result.value.errors.length > 0)

  /**
   * Import BPMN XML file and convert to vue-flow workflow
   */
  const importFromFile = async (file: File): Promise<BpmnWorkflow | null> => {
    loading.value = true
    error.value = null
    result.value = null

    try {
      // Validate file type
      if (!file.name.endsWith('.bpmn') && !file.name.endsWith('.xml')) {
        throw new Error('Invalid file type. Please upload a .bpmn or .xml file.')
      }

      // Read file content
      const xml = await readFileAsText(file)

      // Import BPMN XML
      const importResult = await importBpmnXml(xml)
      result.value = importResult

      if (!importResult.success) {
        const errorMessage = importResult.errors?.map(e => e.message).join('; ') || 'Import failed'
        error.value = errorMessage
        return null
      }

      return importResult.workflow || null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown import error'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Import BPMN XML from string
   */
  const importFromString = async (xml: string): Promise<BpmnWorkflow | null> => {
    loading.value = true
    error.value = null
    result.value = null

    try {
      const importResult = await importBpmnXml(xml)
      result.value = importResult

      if (!importResult.success) {
        const errorMessage = importResult.errors?.map(e => e.message).join('; ') || 'Import failed'
        error.value = errorMessage
        return null
      }

      return importResult.workflow || null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown import error'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset import state
   */
  const reset = () => {
    loading.value = false
    error.value = null
    result.value = null
  }

  /**
   * Get formatted error messages
   */
  const getErrorMessages = (): string[] => {
    return result.value?.errors?.map(e => {
      const location = e.elementId ? ` (Element: ${e.elementId})` : ''
      return `${e.message}${location}`
    }) || []
  }

  /**
   * Get formatted warning messages
   */
  const getWarningMessages = (): string[] => {
    return result.value?.warnings || []
  }

  return {
    importState,
    loading,
    error,
    result,
    hasWarnings,
    hasErrors,
    importFromFile,
    importFromString,
    reset,
    getErrorMessages,
    getWarningMessages
  }
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

/**
 * Validate BPMN XML file before import
 */
export function validateBpmnFile(file: File): { valid: boolean; error?: string } {
  // Check file extension
  if (!file.name.endsWith('.bpmn') && !file.name.endsWith('.xml')) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a .bpmn or .xml file.'
    }
  }

  // Check file size (max 10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.'
    }
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty.'
    }
  }

  return { valid: true }
}
