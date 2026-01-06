/**
 * Conversion Test Helpers
 * Utilities for testing round-trip conversions and comparing BPMN structures
 */

import type { BpmnNode, BpmnEdge, BpmnWorkflow } from '@/types/bpmn'
import { generateBpmnXml } from '@/utils/bpmn-converter'
import { importBpmnXml } from '@/utils/bpmn-importer'

/**
 * Test round-trip conversion (JSON → XML → JSON)
 * Returns the result of the round-trip with any differences
 */
export async function testRoundtrip(
  originalWorkflow: BpmnWorkflow,
  options: {
    ignorePositions?: boolean
    ignoreIds?: boolean
    tolerance?: number
  } = {}
): Promise<{
  success: boolean
  finalWorkflow?: BpmnWorkflow
  differences: RoundtripDifference[]
}> {
  const { ignorePositions = false, ignoreIds = false } = options

  const differences: RoundtripDifference[] = []

  try {
    // Step 1: Export to BPMN XML
    const xml = generateBpmnXml(originalWorkflow)

    // Step 2: Import back from BPMN XML
    const importResult = await importBpmnXml(xml)

    if (!importResult.success || !importResult.workflow) {
      differences.push({
        type: 'import-error',
        message: 'Import failed',
        errors: importResult.errors?.map(e => e.message) || []
      })
      return { success: false, differences }
    }

    const finalWorkflow = importResult.workflow

    // Compare nodes
    const nodeDiffs = compareNodes(
      originalWorkflow.nodes,
      finalWorkflow.nodes,
      ignoreIds,
      ignorePositions
    )
    differences.push(...nodeDiffs)

    // Compare edges
    const edgeDiffs = compareEdges(originalWorkflow.edges, finalWorkflow.edges, ignoreIds)
    differences.push(...edgeDiffs)

    // Compare process
    const processDiffs = compareProcess(originalWorkflow.process, finalWorkflow.process)
    differences.push(...processDiffs)

    return {
      success: differences.filter(d => d.severity === 'error').length === 0,
      finalWorkflow,
      differences
    }
  } catch (error) {
    differences.push({
      type: 'conversion-error',
      severity: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
    return { success: false, differences }
  }
}

/**
 * Compare two node arrays
 */
function compareNodes(
  original: BpmnNode[],
  final: BpmnNode[],
  ignoreIds: boolean,
  ignorePositions: boolean
): RoundtripDifference[] {
  const differences: RoundtripDifference[] = []

  if (original.length !== final.length) {
    differences.push({
      type: 'node-count',
      severity: 'error',
      message: `Node count mismatch: ${original.length} vs ${final.length}`
    })
    return differences
  }

  // Simple comparison by index (assumes order is preserved)
  for (let i = 0; i < original.length; i++) {
    const origNode = original[i]
    const finalNode = final[i]

    // Check node type
    if (origNode.type !== finalNode.type) {
      differences.push({
        type: 'node-type',
        severity: 'error',
        nodeId: origNode.id,
        message: `Type mismatch: ${origNode.type} vs ${finalNode.type}`
      })
    }

    // Check position (if not ignored)
    if (!ignorePositions) {
      const origX = origNode.position?.x || 0
      const origY = origNode.position?.y || 0
      const finalX = finalNode.position?.x || 0
      const finalY = finalNode.position?.y || 0

      if (Math.abs(origX - finalX) > 5 || Math.abs(origY - finalY) > 5) {
        differences.push({
          type: 'node-position',
          severity: 'warning',
          nodeId: origNode.id,
          message: `Position differs: (${origX}, ${origY}) vs (${finalX}, ${finalY})`
        })
      }
    }

    // Check label
    if (origNode.data.label !== finalNode.data.label) {
      differences.push({
        type: 'node-label',
        severity: 'warning',
        nodeId: origNode.id,
        message: `Label differs: "${origNode.data.label}" vs "${finalNode.data.label}"`
      })
    }
  }

  return differences
}

/**
 * Compare two edge arrays
 */
function compareEdges(original: BpmnEdge[], final: BpmnEdge[], ignoreIds: boolean): RoundtripDifference[] {
  const differences: RoundtripDifference[] = []

  if (original.length !== final.length) {
    differences.push({
      type: 'edge-count',
      severity: 'error',
      message: `Edge count mismatch: ${original.length} vs ${final.length}`
    })
    return differences
  }

  for (let i = 0; i < original.length; i++) {
    const origEdge = original[i]
    const finalEdge = final[i]

    // Check source and target
    if (!ignoreIds) {
      if (origEdge.source !== finalEdge.source) {
        differences.push({
          type: 'edge-source',
          severity: 'error',
          edgeId: origEdge.id,
          message: `Source differs: ${origEdge.source} vs ${finalEdge.source}`
        })
      }

      if (origEdge.target !== finalEdge.target) {
        differences.push({
          type: 'edge-target',
          severity: 'error',
          edgeId: origEdge.id,
          message: `Target differs: ${origEdge.target} vs ${finalEdge.target}`
        })
      }
    }

    // Check condition
    if (origEdge.data.condition !== finalEdge.data.condition) {
      differences.push({
        type: 'edge-condition',
        severity: 'warning',
        edgeId: origEdge.id,
        message: `Condition differs: "${origEdge.data.condition}" vs "${finalEdge.data.condition}"`
      })
    }
  }

  return differences
}

/**
 * Compare process metadata
 */
function compareProcess(orig: BpmnWorkflow['process'], final: BpmnWorkflow['process']): RoundtripDifference[] {
  const differences: RoundtripDifference[] = []

  if (orig.name !== final.name) {
    differences.push({
      type: 'process-name',
      severity: 'warning',
      message: `Process name differs: "${orig.name}" vs "${final.name}"`
    })
  }

  if (orig.version !== final.version) {
    differences.push({
      type: 'process-version',
      severity: 'warning',
      message: `Process version differs: ${orig.version} vs ${final.version}`
    })
  }

  return differences
}

/**
 * Assert nodes are equal (for testing)
 */
export function assertNodesEqual(actual: BpmnNode[], expected: BpmnNode[]): void {
  if (actual.length !== expected.length) {
    throw new Error(`Node count mismatch: ${actual.length} vs ${expected.length}`)
  }

  for (let i = 0; i < actual.length; i++) {
    const act = actual[i]
    const exp = expected[i]

    if (act.type !== exp.type) {
      throw new Error(`Node ${i} type mismatch: ${act.type} vs ${exp.type}`)
    }

    if (act.data.label !== exp.data.label) {
      throw new Error(`Node ${i} label mismatch: "${act.data.label}" vs "${exp.data.label}"`)
    }
  }
}

/**
 * Assert edges are equal (for testing)
 */
export function assertEdgesEqual(actual: BpmnEdge[], expected: BpmnEdge[]): void {
  if (actual.length !== expected.length) {
    throw new Error(`Edge count mismatch: ${actual.length} vs ${expected.length}`)
  }

  for (let i = 0; i < actual.length; i++) {
    const act = actual[i]
    const exp = expected[i]

    if (act.source !== exp.source) {
      throw new Error(`Edge ${i} source mismatch: ${act.source} vs ${exp.source}`)
    }

    if (act.target !== exp.target) {
      throw new Error(`Edge ${i} target mismatch: ${act.target} vs ${exp.target}`)
    }
  }
}

/**
 * Round-trip difference type
 */
export interface RoundtripDifference {
  type: string
  severity: 'error' | 'warning' | 'info'
  message: string
  nodeId?: string
  edgeId?: string
  errors?: string[]
}

/**
 * Workflow summary for debugging
 */
export function summarizeWorkflow(workflow: BpmnWorkflow): string {
  const nodeTypeCounts: Record<string, number> = {}
  workflow.nodes.forEach(n => {
    nodeTypeCounts[n.type] = (nodeTypeCounts[n.type] || 0) + 1
  })

  return `Process: ${workflow.process.name} (v${workflow.process.version})\n` +
    `Nodes: ${workflow.nodes.length} (${Object.entries(nodeTypeCounts).map(([k, v]) => `${k}:${v}`).join(', ')})\n` +
    `Edges: ${workflow.edges.length}`
}
