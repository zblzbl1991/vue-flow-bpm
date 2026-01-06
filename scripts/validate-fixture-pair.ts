/**
 * Fixture Pair Validator
 * Validates that JSON and BPMN XML fixture pairs match
 *
 * Usage:
 *   npx tsx scripts/validate-fixture-pair.ts <json-file> <bpmn-file>
 */

import { readFileSync } from 'fs'
import { parseXml } from '../tests/helpers/xml-test-helpers'

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

async function validateFixturePair(jsonPath: string, bpmnPath: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  }

  try {
    // Read JSON
    const jsonContent = readFileSync(jsonPath, 'utf-8')
    const workflow = JSON.parse(jsonContent)

    // Read BPMN XML
    const bpmnContent = readFileSync(bpmnPath, 'utf-8')

    // Parse XML
    const doc = parseXml(bpmnContent)

    // Validate process ID matches
    const processId = workflow.process.id
    const bpmnProcess = doc.querySelector(`process[id="${processId}"]`)

    if (!bpmnProcess) {
      result.errors.push(`Process ID "${processId}" not found in BPMN XML`)
      result.valid = false
    }

    // Validate node count
    const nodeCount = workflow.nodes.length
    const bpmnNodes = doc.querySelectorAll('process[id="' + processId + '"] > *')
    const bpmnNodeCount = Array.from(bpmnNodes).filter(n =>
      n.tagName.includes('startEvent') ||
      n.tagName.includes('endEvent') ||
      n.tagName.includes('userTask') ||
      n.tagName.includes('serviceTask') ||
      n.tagName.includes('exclusiveGateway') ||
      n.tagName.includes('parallelGateway')
    ).length

    if (nodeCount !== bpmnNodeCount) {
      result.errors.push(
        `Node count mismatch: JSON has ${nodeCount} nodes, BPMN has ${bpmnNodeCount} nodes`
      )
      result.valid = false
    }

    // Validate edge count
    const edgeCount = workflow.edges.length
    const bpmnEdges = doc.querySelectorAll(`sequenceFlow`)
    if (edgeCount !== bpmnEdges.length) {
      result.errors.push(
        `Edge count mismatch: JSON has ${edgeCount} edges, BPMN has ${bpmnEdges.length} edges`
      )
      result.valid = false
    }

    // Validate each node exists in BPMN
    for (const node of workflow.nodes) {
      const bpmnNode = doc.querySelector(`[id="${node.id}"]`)
      if (!bpmnNode) {
        result.errors.push(`Node "${node.id}" (${node.type}) not found in BPMN XML`)
        result.valid = false
      }
    }

    // Validate each edge exists in BPMN
    for (const edge of workflow.edges) {
      const bpmnEdge = doc.querySelector(`sequenceFlow[id="${edge.id}"]`)
      if (!bpmnEdge) {
        result.errors.push(`Edge "${edge.id}" not found in BPMN XML`)
        result.valid = false
      }
    }

    // Check for nodes without labels
    const nodesWithoutLabels = workflow.nodes.filter(n => !n.data.label || n.data.label === '')
    if (nodesWithoutLabels.length > 0) {
      result.warnings.push(
        `${nodesWithoutLabels.length} nodes without labels: ${nodesWithoutLabels.map(n => n.id).join(', ')}`
      )
    }

    // Check for orphaned nodes
    const connectedNodeIds = new Set<string>()
    workflow.edges.forEach(e => {
      connectedNodeIds.add(e.source)
      connectedNodeIds.add(e.target)
    })

    const orphanedNodes = workflow.nodes.filter(n => !connectedNodeIds.has(n.id))
    if (orphanedNodes.length > 0) {
      result.warnings.push(
        `${orphanedNodes.length} orphaned nodes: ${orphanedNodes.map(n => n.id).join(', ')}`
      )
    }

  } catch (error) {
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : error}`)
    result.valid = false
  }

  return result
}

// CLI interface
const args = process.argv.slice(2)

if (args.length < 2) {
  console.log('Fixture Pair Validator')
  console.log('')
  console.log('Usage:')
  console.log('  npx tsx scripts/validate-fixture-pair.ts <json-file> <bpmn-file>')
  console.log('')
  console.log('Examples:')
  console.log('  npx tsx scripts/validate-fixture-pair.ts tests/fixtures/simple/linear-flow.json tests/fixtures/simple/linear-flow.bpmn.xml')
  process.exit(1)
}

validateFixturePair(args[0], args[1]).then(result => {
  if (result.valid) {
    console.log('✓ Fixture pair is valid')
    if (result.warnings.length > 0) {
      console.log('')
      console.log('Warnings:')
      result.warnings.forEach(w => console.log(`  ⚠ ${w}`))
    }
    process.exit(0)
  } else {
    console.log('✗ Fixture pair is invalid')
    console.log('')
    console.log('Errors:')
    result.errors.forEach(e => console.log(`  ✗ ${e}`))

    if (result.warnings.length > 0) {
      console.log('')
      console.log('Warnings:')
      result.warnings.forEach(w => console.log(`  ⚠ ${w}`))
    }

    process.exit(1)
  }
})
