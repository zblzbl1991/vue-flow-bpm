import { ref, shallowRef } from 'vue'
import BpmnJS from 'bpmn-js/lib/NavigatedViewer'

export function useBpmnValidator() {
  const isValidating = ref(false)
  const isValid = ref<boolean | null>(null)
  const validationErrors = ref<Array<{ message: string; elementId?: string }>>([])
  const viewer = shallowRef<any>(null)
  const containerRef = ref<HTMLElement | null>(null)

  const initViewer = async () => {
    if (viewer.value) {
      return
    }

    try {
      viewer.value = new BpmnJS({
        container: containerRef.value || undefined
      })
    } catch (error) {
      console.error('Failed to initialize BPMN viewer:', error)
      throw error
    }
  }

  const validateBpmnXml = async (xml: string): Promise<{ valid: boolean; errors: Array<{ message: string; elementId?: string }> }> => {
    isValidating.value = true
    validationErrors.value = []

    try {
      await initViewer()

      if (!viewer.value) {
        throw new Error('Viewer not initialized')
      }

      try {
        await viewer.value.importXML(xml)
        isValid.value = true
        return { valid: true, errors: [] }
      } catch (importError) {
        isValid.value = false
        const errors = parseImportError(importError)
        validationErrors.value = errors
        return { valid: false, errors }
      }
    } catch (error) {
      isValid.value = false
      const errorMsg = error instanceof Error ? error.message : 'Unknown validation error'
      validationErrors.value = [{ message: errorMsg }]
      return { valid: false, errors: [{ message: errorMsg }] }
    } finally {
      isValidating.value = false
    }
  }

  const parseImportError = (error: unknown): Array<{ message: string; elementId?: string }> => {
    const errors: Array<{ message: string; elementId?: string }> = []

    if (error instanceof Error) {
      // Parse common BPMN validation errors
      const message = error.message || 'Unknown error'

      // Check for specific error patterns
      if (message.includes('unresolved reference')) {
        const match = message.match(/unresolved reference <([^>]+)>/i)
        if (match) {
          errors.push({ message: `Unresolved reference: ${match[1]}` })
        }
      } else if (message.includes('missing required')) {
        const match = message.match(/missing required ([^,]+)/i)
        if (match) {
          errors.push({ message: `Missing required property: ${match[1]}` })
        }
      } else {
        errors.push({ message })
      }
    }

    return errors
  }

  const highlightElement = (elementId: string) => {
    if (!viewer.value) return

    try {
      const elementRegistry = (viewer.value as any).get('elementRegistry')
      const element = elementRegistry.get(elementId)
      if (element) {
        const overlays = (viewer.value as any).get('overlays')
        overlays.add(elementId, {
          position: { top: 0, left: 0 },
          html: '<div style="background: rgba(255, 0, 0, 0.3); width: 100%; height: 100%; position: absolute;"></div>'
        })
      }
    } catch (error) {
      console.error('Failed to highlight element:', error)
    }
  }

  const clearHighlights = () => {
    if (!viewer.value) return

    try {
      const overlays = (viewer.value as any).get('overlays')
      overlays.clear()
    } catch (error) {
      console.error('Failed to clear highlights:', error)
    }
  }

  const fitViewport = () => {
    if (!viewer.value) return

    try {
      const canvas = (viewer.value as any).get('canvas')
      canvas.zoom('fit-viewport')
    } catch (error) {
      console.error('Failed to fit viewport:', error)
    }
  }

  const destroyViewer = () => {
    if (viewer.value) {
      viewer.value.destroy()
      viewer.value = null
    }
    isValid.value = null
    validationErrors.value = []
  }

  return {
    isValidating,
    isValid,
    validationErrors,
    containerRef,
    validateBpmnXml,
    highlightElement,
    clearHighlights,
    fitViewport,
    destroyViewer
  }
}
