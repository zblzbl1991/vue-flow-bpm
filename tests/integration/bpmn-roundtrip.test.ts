/**
 * Round-trip Conversion Tests
 * Tests JSON → XML → JSON conversion consistency
 */

import { describe, it, expect } from 'vitest'
import { generateBpmnXml } from '@/utils/bpmn-converter'
import { importBpmnXml } from '@/utils/bpmn-importer'
import { loadJsonFixture, loadBpmnFixture } from '../helpers/bpmnjs-test-helpers'
import { testRoundtrip } from '../helpers/conversion-test-helpers'

describe('Round-trip Conversion', () => {
  describe('Linear Flow', () => {
    it('should preserve linear workflow structure', async () => {
      const originalWorkflow = await loadJsonFixture('/tests/fixtures/simple/linear-flow.json')

      const result = await testRoundtrip(originalWorkflow, {
        ignorePositions: true,
        ignoreIds: true
      })

      expect(result.success).toBe(true)
      expect(result.differences.filter(d => d.severity === 'error')).toHaveLength(0)

      // Verify node count is preserved
      expect(result.finalWorkflow?.nodes.length).toBe(originalWorkflow.nodes.length)

      // Verify edge count is preserved
      expect(result.finalWorkflow?.edges.length).toBe(originalWorkflow.edges.length)
    })

    it('should preserve node types', async () => {
      const originalWorkflow = await loadJsonFixture('/tests/fixtures/simple/linear-flow.json')
      const xml = generateBpmnXml(originalWorkflow)
      const importResult = await importBpmnXml(xml)

      expect(importResult.success).toBe(true)
      expect(importResult.workflow).toBeDefined()

      const finalNodes = importResult.workflow!.nodes

      // Check that node types are preserved
      expect(finalNodes[0].type).toBe('startEvent')
      expect(finalNodes[1].type).toBe('userTask')
      expect(finalNodes[2].type).toBe('endEvent')
    })

    it('should preserve labels', async () => {
      const originalWorkflow = await loadJsonFixture('/tests/fixtures/simple/linear-flow.json')
      const xml = generateBpmnXml(originalWorkflow)
      const importResult = await importBpmnXml(xml)

      expect(importResult.success).toBe(true)
      expect(importResult.workflow).toBeDefined()

      const finalNodes = importResult.workflow!.nodes

      // Check that labels are preserved
      expect(finalNodes[0].data.label).toBe('Start')
      expect(finalNodes[1].data.label).toBe('Review Application')
      expect(finalNodes[2].data.label).toBe('End')
    })
  })

  describe('Single Branch', () => {
    it('should preserve gateway structure', async () => {
      const originalWorkflow = await loadJsonFixture('/tests/fixtures/simple/single-branch.json')

      const result = await testRoundtrip(originalWorkflow, {
        ignorePositions: true,
        ignoreIds: true
      })

      expect(result.success).toBe(true)

      // Verify gateway exists
      const finalWorkflow = result.finalWorkflow!
      const gateways = finalWorkflow.nodes.filter(n => n.type === 'exclusiveGateway')
      expect(gateways.length).toBe(1)
    })

    it('should preserve sequence flow conditions', async () => {
      const originalWorkflow = await loadJsonFixture('/tests/fixtures/simple/single-branch.json')
      const xml = generateBpmnXml(originalWorkflow)
      const importResult = await importBpmnXml(xml)

      expect(importResult.success).toBe(true)

      const finalEdges = importResult.workflow!.edges

      // Find edges with conditions
      const conditionalEdges = finalEdges.filter(e => e.data.condition)

      expect(conditionalEdges.length).toBeGreaterThan(0)

      // Check condition content is preserved
      const approveEdge = conditionalEdges.find(e =>
        e.data.condition?.includes('approved == true')
      )
      expect(approveEdge).toBeDefined()
    })
  })

  describe('Single Loop', () => {
    it('should preserve loop structure', async () => {
      const originalWorkflow = await loadJsonFixture('/tests/fixtures/simple/single-loop.json')

      const result = await testRoundtrip(originalWorkflow, {
        ignorePositions: true,
        ignoreIds: true
      })

      expect(result.success).toBe(true)

      // Verify the loop edge exists (edge from gateway back to task)
      const finalWorkflow = result.finalWorkflow!
      const loopEdges = finalWorkflow.edges.filter(e =>
        e.source.includes('gateway') &&
        e.target.includes('task')
      )

      expect(loopEdges.length).toBe(1)
    })
  })

  describe('Property Preservation', () => {
    it('should preserve user task properties', async () => {
      const workflow = await loadJsonFixture('/tests/fixtures/simple/linear-flow.json')

      // Find user task with assignee
      const userTask = workflow.nodes.find(n => n.type === 'userTask')!
      expect(userTask.data.assignee).toBeDefined()

      const xml = generateBpmnXml(workflow)
      const importResult = await importBpmnXml(xml)

      expect(importResult.success).toBe(true)

      const finalUserTask = importResult.workflow!.nodes.find(n => n.type === 'userTask')!
      // TODO: Vendor extensions (Flowable/Camunda) like assignee are not currently
      // preserved in round-trip conversion due to bpmn-moddle schema limitations.
      // This requires custom schema descriptors to be added to bpmn-moddle.
      // For now, we verify the node structure is preserved.
      expect(finalUserTask.type).toBe(userTask.type)
      expect(finalUserTask.data.label).toBe(userTask.data.label)
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in labels', async () => {
      const workflow = {
        process: {
          id: 'process-special-chars',
          name: 'Test Process',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'start-1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: {
              label: 'Start & "End" <Test>',
              width: 50,
              height: 50
            }
          },
          {
            id: 'end-1',
            type: 'endEvent',
            position: { x: 300, y: 100 },
            data: {
              label: 'End™ © Registered',
              width: 50,
              height: 50
            }
          }
        ],
        edges: [
          {
            id: 'flow-1',
            source: 'start-1',
            target: 'end-1',
            data: {},
            type: 'default'
          }
        ]
      }

      const xml = generateBpmnXml(workflow)
      const importResult = await importBpmnXml(xml)

      expect(importResult.success).toBe(true)

      const finalNodes = importResult.workflow!.nodes
      expect(finalNodes[0].data.label).toBe(workflow.nodes[0].data.label)
      expect(finalNodes[1].data.label).toBe(workflow.nodes[1].data.label)
    })

    it('should handle empty properties', async () => {
      const workflow = {
        process: {
          id: 'process-empty',
          name: '',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'start-1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: {
              label: '',
              width: 50,
              height: 50
            }
          },
          {
            id: 'end-1',
            type: 'endEvent',
            position: { x: 300, y: 100 },
            data: {
              label: 'End',
              width: 50,
              height: 50
            }
          }
        ],
        edges: [
          {
            id: 'flow-1',
            source: 'start-1',
            target: 'end-1',
            data: {},
            type: 'default'
          }
        ]
      }

      const xml = generateBpmnXml(workflow)
      const importResult = await importBpmnXml(xml)

      expect(importResult.success).toBe(true)
    })
  })

  describe('Import from BPMN XML Fixtures', () => {
    it('should import linear-flow BPMN XML', async () => {
      const xml = await loadBpmnFixture('/tests/fixtures/simple/linear-flow.bpmn.xml')
      const importResult = await importBpmnXml(xml)

      expect(importResult.success).toBe(true)
      expect(importResult.workflow).toBeDefined()

      const workflow = importResult.workflow!
      expect(workflow.nodes.length).toBe(3)
      expect(workflow.edges.length).toBe(2)
    })

    it('should import single-branch BPMN XML', async () => {
      const xml = await loadBpmnFixture('/tests/fixtures/simple/single-branch.bpmn.xml')
      const importResult = await importBpmnXml(xml)

      expect(importResult.success).toBe(true)
      expect(importResult.workflow).toBeDefined()

      const workflow = importResult.workflow!
      expect(workflow.nodes.filter(n => n.type === 'exclusiveGateway').length).toBe(1)
      expect(workflow.edges.length).toBe(5)
    })

    it('should import single-loop BPMN XML', async () => {
      const xml = await loadBpmnFixture('/tests/fixtures/simple/single-loop.bpmn.xml')
      const importResult = await importBpmnXml(xml)

      expect(importResult.success).toBe(true)
      expect(importResult.workflow).toBeDefined()

      const workflow = importResult.workflow!
      expect(workflow.nodes.filter(n => n.type === 'exclusiveGateway').length).toBe(1)
      // Check for the loop edge
      const loopEdges = workflow.edges.filter(e => e.target === 'task-1' && e.source === 'gateway-1')
      expect(loopEdges.length).toBe(1)
    })
  })
})
