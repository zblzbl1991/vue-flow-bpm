import { ref } from 'vue'
import type { BpmnWorkflow, BpmnNode, BpmnEdge } from '@/types/bpmn'
import { generateBpmnXml, validateWorkflow } from '@/utils/bpmn-converter'

export function useBpmnConverter() {
  const isConverting = ref(false)
  const conversionError = ref<string | null>(null)

  const convertToBpmnXml = (nodes: BpmnNode[], edges: BpmnEdge[], processId?: string, processName?: string): string => {
    isConverting.value = true
    conversionError.value = null

    try {
      const workflow: BpmnWorkflow = {
        process: {
          id: processId || `process-${Date.now()}`,
          name: processName || 'My Process',
          version: 1
        },
        nodes,
        edges
      }

      const xml = generateBpmnXml(workflow)
      return xml
    } catch (error) {
      conversionError.value = error instanceof Error ? error.message : 'Unknown conversion error'
      throw error
    } finally {
      isConverting.value = false
    }
  }

  const validateAndConvert = (nodes: BpmnNode[], edges: BpmnEdge[], processId?: string, processName?: string): { success: boolean; xml?: string; errors?: string[] } => {
    const validation = validateWorkflow(nodes, edges)

    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors
      }
    }

    try {
      const xml = convertToBpmnXml(nodes, edges, processId, processName)
      return {
        success: true,
        xml
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown conversion error']
      }
    }
  }

  const downloadBpmnFile = (xml: string, filename?: string) => {
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `workflow-${Date.now()}.bpmn`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {
    isConverting,
    conversionError,
    convertToBpmnXml,
    validateAndConvert,
    downloadBpmnFile
  }
}
