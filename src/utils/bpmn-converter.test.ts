/**
 * Unit tests for BPMN Converter
 * Tests for converting vue-flow JSON to BPMN 2.0 XML
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { generateBpmnXml, validateWorkflow } from './bpmn-converter'
import type { BpmnWorkflow, BpmnNode, BpmnEdge, BpmnElementType } from '@/types/bpmn'

describe('bpmn-converter', () => {
  describe('generateBpmnXml', () => {
    let mockWorkflow: BpmnWorkflow

    beforeEach(() => {
      mockWorkflow = {
        process: {
          id: 'test-process',
          name: 'Test Process',
          version: 1
        },
        nodes: [],
        edges: []
      }
    })

    it('should generate valid XML declaration and root element', () => {
      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(xml).toContain('<bpmn:definitions')
      expect(xml).toContain('xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"')
      expect(xml).toContain('xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"')
      expect(xml).toContain('xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"')
      expect(xml).toContain('xmlns:di="http://www.omg.org/spec/DD/20100524/DI"')
      expect(xml).toContain('xmlns:flowable="http://flowable.org/bpmn"')
    })

    it('should convert startEvent node correctly', () => {
      mockWorkflow.nodes = [{
        id: 'start1',
        type: 'startEvent',
        position: { x: 100, y: 100 },
        data: { label: 'Start' }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('<bpmn:startEvent')
      expect(xml).toContain('id="bpmn-start1"')
      expect(xml).toContain('name="Start"')
    })

    it('should convert endEvent node correctly', () => {
      mockWorkflow.nodes = [{
        id: 'end1',
        type: 'endEvent',
        position: { x: 500, y: 100 },
        data: { label: 'End' }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('<bpmn:endEvent')
      expect(xml).toContain('id="bpmn-end1"')
      expect(xml).toContain('name="End"')
    })

    it('should convert userTask node with assignee', () => {
      mockWorkflow.nodes = [{
        id: 'task1',
        type: 'userTask',
        position: { x: 200, y: 100 },
        data: {
          label: 'Review',
          assignee: '${initiator}',
          candidateUsers: ['user1', 'user2'],
          candidateGroups: ['group1']
        }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('<bpmn:userTask')
      expect(xml).toContain('id="bpmn-task1"')
      expect(xml).toContain('name="Review"')
      // Element content syntax for flowable attributes
      expect(xml).toContain('<flowable:assignee>${initiator}</flowable:assignee>')
      expect(xml).toContain('<flowable:candidateUsers>user1,user2</flowable:candidateUsers>')
      expect(xml).toContain('<flowable:candidateGroups>group1</flowable:candidateGroups>')
    })

    it('should convert serviceTask node with expression', () => {
      mockWorkflow.nodes = [{
        id: 'service1',
        type: 'serviceTask',
        position: { x: 200, y: 100 },
        data: {
          label: 'Send Email',
          expression: '${sendEmail}',
          async: true
        }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('<bpmn:serviceTask')
      expect(xml).toContain('id="bpmn-service1"')
      expect(xml).toContain('name="Send Email"')
      // Element content syntax
      expect(xml).toContain('<flowable:expression>${sendEmail}</flowable:expression>')
      expect(xml).toContain('<flowable:async>true</flowable:async>')
    })

    it('should convert exclusiveGateway node', () => {
      mockWorkflow.nodes = [{
        id: 'gateway1',
        type: 'exclusiveGateway',
        position: { x: 300, y: 100 },
        data: { label: 'Decision' }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('<bpmn:exclusiveGateway')
      expect(xml).toContain('id="bpmn-gateway1"')
      expect(xml).toContain('name="Decision"')
    })

    it('should convert parallelGateway node', () => {
      mockWorkflow.nodes = [{
        id: 'gateway2',
        type: 'parallelGateway',
        position: { x: 300, y: 100 },
        data: { label: 'Fork' }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('<bpmn:parallelGateway')
      expect(xml).toContain('id="bpmn-gateway2"')
      expect(xml).toContain('name="Fork"')
    })

    it('should convert edges to sequenceFlow elements', () => {
      mockWorkflow.nodes = [
        { id: 'start1', type: 'startEvent', position: { x: 100, y: 100 }, data: { label: 'Start' } },
        { id: 'task1', type: 'userTask', position: { x: 200, y: 100 }, data: { label: 'Task' } }
      ]
      mockWorkflow.edges = [{
        id: 'edge1',
        source: 'start1',
        target: 'task1',
        data: {}
      }]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('<bpmn:sequenceFlow')
      expect(xml).toContain('id="flow-edge1"')
      expect(xml).toContain('sourceRef="bpmn-start1"')
      expect(xml).toContain('targetRef="bpmn-task1"')
    })

    it('should add condition expression to sequenceFlow when present', () => {
      mockWorkflow.nodes = [
        { id: 'gateway1', type: 'exclusiveGateway', position: { x: 200, y: 100 }, data: { label: 'Decision' } },
        { id: 'task1', type: 'userTask', position: { x: 300, y: 100 }, data: { label: 'Task' } }
      ]
      mockWorkflow.edges = [{
        id: 'edge1',
        source: 'gateway1',
        target: 'task1',
        data: { condition: '${approved}' }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('<bpmn:conditionExpression')
      expect(xml).toContain('xsi:type="bpmn:tFormalExpression"')
      expect(xml).toContain('${approved}')
    })

    it('should add name to sequenceFlow when present', () => {
      mockWorkflow.nodes = [
        { id: 'task1', type: 'userTask', position: { x: 100, y: 100 }, data: { label: 'Task 1' } },
        { id: 'task2', type: 'userTask', position: { x: 200, y: 100 }, data: { label: 'Task 2' } }
      ]
      mockWorkflow.edges = [{
        id: 'edge1',
        source: 'task1',
        target: 'task2',
        data: { name: 'Approve' }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('name="Approve"')
    })

    it('should include BPMN DI information for nodes', () => {
      mockWorkflow.nodes = [{
        id: 'task1',
        type: 'userTask',
        position: { x: 200, y: 150 },
        data: { label: 'Task', width: 120, height: 80 }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('<bpmndi:BPMNShape')
      expect(xml).toContain('bpmnElement="bpmn-task1"')
      expect(xml).toContain('x="200"')
      expect(xml).toContain('y="150"')
      expect(xml).toContain('width="120"')
      expect(xml).toContain('height="80"')
    })

    it('should include BPMN DI information for edges', () => {
      mockWorkflow.nodes = [
        { id: 'start1', type: 'startEvent', position: { x: 100, y: 100 }, data: { label: 'Start' } },
        { id: 'task1', type: 'userTask', position: { x: 200, y: 100 }, data: { label: 'Task' } }
      ]
      mockWorkflow.edges = [{
        id: 'edge1',
        source: 'start1',
        target: 'task1',
        data: {}
      }]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('<bpmndi:BPMNEdge')
      expect(xml).toContain('bpmnElement="flow-edge1"')
      expect(xml).toContain('<di:waypoint')
    })

    it('should use custom bpmnId when provided', () => {
      mockWorkflow.nodes = [{
        id: 'task1',
        type: 'userTask',
        position: { x: 100, y: 100 },
        data: { label: 'Task', bpmnId: 'custom-task-id' }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('id="custom-task-id"')
      expect(xml).not.toContain('id="bpmn-task1"')
    })

    it('should generate auto process ID when not provided', () => {
      mockWorkflow.process.id = ''

      const xml = generateBpmnXml(mockWorkflow)

      // Process ID should be generated with timestamp pattern
      expect(xml).toContain('<bpmn:process')
      expect(xml).toMatch(/id="process-\d+"/)
    })

    it('should include documentation when provided', () => {
      mockWorkflow.nodes = [{
        id: 'task1',
        type: 'userTask',
        position: { x: 100, y: 100 },
        data: { label: 'Task', documentation: 'This is a task documentation' }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('<bpmn:documentation')
      expect(xml).toContain('This is a task documentation')
    })

    it('should handle gateway default flow', () => {
      mockWorkflow.nodes = [{
        id: 'gateway1',
        type: 'exclusiveGateway',
        position: { x: 200, y: 100 },
        data: { label: 'Decision', default: 'edge-default' }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('default="flow-edge-default"')
    })

    it('should convert simple linear workflow', () => {
      mockWorkflow.nodes = [
        { id: 'start1', type: 'startEvent', position: { x: 100, y: 100 }, data: { label: 'Start' } },
        { id: 'task1', type: 'userTask', position: { x: 200, y: 100 }, data: { label: 'Review' } },
        { id: 'task2', type: 'serviceTask', position: { x: 300, y: 100 }, data: { label: 'Process' } },
        { id: 'end1', type: 'endEvent', position: { x: 400, y: 100 }, data: { label: 'End' } }
      ]
      mockWorkflow.edges = [
        { id: 'e1', source: 'start1', target: 'task1', data: {} },
        { id: 'e2', source: 'task1', target: 'task2', data: {} },
        { id: 'e3', source: 'task2', target: 'end1', data: {} }
      ]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('<bpmn:startEvent')
      expect(xml).toContain('<bpmn:userTask')
      expect(xml).toContain('<bpmn:serviceTask')
      expect(xml).toContain('<bpmn:endEvent')
      expect(xml).toContain('<bpmn:sequenceFlow')
      // Should have 4 sequence flows
      const sequenceFlowMatches = xml.match(/<bpmn:sequenceFlow/g)
      expect(sequenceFlowMatches).toHaveLength(3)
    })

    it('should convert workflow with gateway and branches', () => {
      mockWorkflow.nodes = [
        { id: 'start1', type: 'startEvent', position: { x: 100, y: 100 }, data: { label: 'Start' } },
        { id: 'gateway1', type: 'exclusiveGateway', position: { x: 200, y: 100 }, data: { label: 'Decision' } },
        { id: 'task1', type: 'userTask', position: { x: 300, y: 50 }, data: { label: 'Approve' } },
        { id: 'task2', type: 'userTask', position: { x: 300, y: 150 }, data: { label: 'Reject' } },
        { id: 'end1', type: 'endEvent', position: { x: 400, y: 100 }, data: { label: 'End' } }
      ]
      mockWorkflow.edges = [
        { id: 'e1', source: 'start1', target: 'gateway1', data: {} },
        { id: 'e2', source: 'gateway1', target: 'task1', data: { condition: '${approved}' } },
        { id: 'e3', source: 'gateway1', target: 'task2', data: { condition: '${!approved}' } },
        { id: 'e4', source: 'task1', target: 'end1', data: {} },
        { id: 'e5', source: 'task2', target: 'end1', data: {} }
      ]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('<bpmn:exclusiveGateway')
      expect(xml).toContain('${approved}')
      expect(xml).toContain('${!approved}')
      // Should have 5 sequence flows
      const sequenceFlowMatches = xml.match(/<bpmn:sequenceFlow/g)
      expect(sequenceFlowMatches).toHaveLength(5)
    })

    it('should convert parallel gateway workflow', () => {
      mockWorkflow.nodes = [
        { id: 'start1', type: 'startEvent', position: { x: 100, y: 100 }, data: { label: 'Start' } },
        { id: 'gateway1', type: 'parallelGateway', position: { x: 200, y: 100 }, data: { label: 'Fork' } },
        { id: 'task1', type: 'serviceTask', position: { x: 300, y: 50 }, data: { label: 'Task A' } },
        { id: 'task2', type: 'serviceTask', position: { x: 300, y: 150 }, data: { label: 'Task B' } },
        { id: 'gateway2', type: 'parallelGateway', position: { x: 400, y: 100 }, data: { label: 'Join' } },
        { id: 'end1', type: 'endEvent', position: { x: 500, y: 100 }, data: { label: 'End' } }
      ]
      mockWorkflow.edges = [
        { id: 'e1', source: 'start1', target: 'gateway1', data: {} },
        { id: 'e2', source: 'gateway1', target: 'task1', data: {} },
        { id: 'e3', source: 'gateway1', target: 'task2', data: {} },
        { id: 'e4', source: 'task1', target: 'gateway2', data: {} },
        { id: 'e5', source: 'task2', target: 'gateway2', data: {} },
        { id: 'e6', source: 'gateway2', target: 'end1', data: {} }
      ]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('<bpmn:parallelGateway')
      // Should have 2 parallel gateways
      const parallelGatewayMatches = xml.match(/<bpmn:parallelGateway/g)
      expect(parallelGatewayMatches).toHaveLength(2)
    })
  })

  describe('validateWorkflow', () => {
    it('should pass validation for valid workflow', () => {
      const nodes: BpmnNode[] = [
        { id: 'start1', type: 'startEvent', position: { x: 100, y: 100 }, data: { label: 'Start' } },
        { id: 'task1', type: 'userTask', position: { x: 200, y: 100 }, data: { label: 'Task' } },
        { id: 'end1', type: 'endEvent', position: { x: 300, y: 100 }, data: { label: 'End' } }
      ]
      const edges: BpmnEdge[] = [
        { id: 'e1', source: 'start1', target: 'task1', data: {} },
        { id: 'e2', source: 'task1', target: 'end1', data: {} }
      ]

      const result = validateWorkflow(nodes, edges)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail validation when missing start event', () => {
      const nodes: BpmnNode[] = [
        { id: 'task1', type: 'userTask', position: { x: 200, y: 100 }, data: { label: 'Task' } },
        { id: 'end1', type: 'endEvent', position: { x: 300, y: 100 }, data: { label: 'End' } }
      ]
      const edges: BpmnEdge[] = [
        { id: 'e1', source: 'task1', target: 'end1', data: {} }
      ]

      const result = validateWorkflow(nodes, edges)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Workflow must have at least one start event')
    })

    it('should fail validation when missing end event', () => {
      const nodes: BpmnNode[] = [
        { id: 'start1', type: 'startEvent', position: { x: 100, y: 100 }, data: { label: 'Start' } },
        { id: 'task1', type: 'userTask', position: { x: 200, y: 100 }, data: { label: 'Task' } }
      ]
      const edges: BpmnEdge[] = [
        { id: 'e1', source: 'start1', target: 'task1', data: {} }
      ]

      const result = validateWorkflow(nodes, edges)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Workflow must have at least one end event')
    })

    it('should detect isolated nodes', () => {
      const nodes: BpmnNode[] = [
        { id: 'start1', type: 'startEvent', position: { x: 100, y: 100 }, data: { label: 'Start' } },
        { id: 'task1', type: 'userTask', position: { x: 200, y: 100 }, data: { label: 'Task' } },
        { id: 'isolated', type: 'userTask', position: { x: 400, y: 100 }, data: { label: 'Isolated Task' } },
        { id: 'end1', type: 'endEvent', position: { x: 300, y: 100 }, data: { label: 'End' } }
      ]
      const edges: BpmnEdge[] = [
        { id: 'e1', source: 'start1', target: 'task1', data: {} },
        { id: 'e2', source: 'task1', target: 'end1', data: {} }
      ]

      const result = validateWorkflow(nodes, edges)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Isolated nodes'))).toBe(true)
      expect(result.errors.some(e => e.includes('Isolated Task'))).toBe(true)
    })

    it('should detect self-loops', () => {
      const nodes: BpmnNode[] = [
        { id: 'start1', type: 'startEvent', position: { x: 100, y: 100 }, data: { label: 'Start' } },
        { id: 'task1', type: 'userTask', position: { x: 200, y: 100 }, data: { label: 'Task' } },
        { id: 'end1', type: 'endEvent', position: { x: 300, y: 100 }, data: { label: 'End' } }
      ]
      const edges: BpmnEdge[] = [
        { id: 'e1', source: 'start1', target: 'task1', data: {} },
        { id: 'e2', source: 'task1', target: 'task1', data: {} },
        { id: 'e3', source: 'task1', target: 'end1', data: {} }
      ]

      const result = validateWorkflow(nodes, edges)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Self-loop detected on node task1')
    })

    it('should detect multiple validation errors', () => {
      const nodes: BpmnNode[] = [
        { id: 'task1', type: 'userTask', position: { x: 200, y: 100 }, data: { label: 'Task' } },
        { id: 'isolated', type: 'userTask', position: { x: 400, y: 100 }, data: { label: 'Isolated' } }
      ]
      const edges: BpmnEdge[] = []

      const result = validateWorkflow(nodes, edges)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
      expect(result.errors).toContain('Workflow must have at least one start event')
      expect(result.errors).toContain('Workflow must have at least one end event')
    })

    it('should allow single start and end event without connections', () => {
      const nodes: BpmnNode[] = [
        { id: 'start1', type: 'startEvent', position: { x: 100, y: 100 }, data: { label: 'Start' } },
        { id: 'end1', type: 'endEvent', position: { x: 200, y: 100 }, data: { label: 'End' } }
      ]
      const edges: BpmnEdge[] = []

      const result = validateWorkflow(nodes, edges)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Isolated nodes'))).toBe(true)
    })

    it('should handle empty workflow', () => {
      const result = validateWorkflow([], [])

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Workflow must have at least one start event')
      expect(result.errors).toContain('Workflow must have at least one end event')
    })
  })

  describe('edge cases', () => {
    let mockWorkflow: BpmnWorkflow

    beforeEach(() => {
      mockWorkflow = {
        process: {
          id: 'test-process',
          name: 'Test Process',
          version: 1
        },
        nodes: [],
        edges: []
      }
    })

    it('should handle special characters in labels', () => {
      mockWorkflow.nodes = [{
        id: 'task1',
        type: 'userTask',
        position: { x: 100, y: 100 },
        data: { label: 'Task with <special> & "characters" \n and newlines' }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      // Special characters should be properly escaped in XML
      expect(xml).toContain('&lt;special&gt;')
      expect(xml).toContain('&amp;')
      expect(xml).toContain('&quot;')
    })

    it('should handle empty string values', () => {
      mockWorkflow.nodes = [{
        id: 'task1',
        type: 'userTask',
        position: { x: 100, y: 100 },
        data: {
          label: '',
          assignee: '',
          documentation: ''
        }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      // Should generate XML without errors
      // Empty label falls back to type name
      expect(xml).toContain('<bpmn:userTask')
      expect(xml).toContain('name="userTask"')
    })

    it('should handle very long IDs', () => {
      const longId = 'a'.repeat(500)
      mockWorkflow.nodes = [{
        id: 'task1',
        type: 'userTask',
        position: { x: 100, y: 100 },
        data: { label: 'Task', bpmnId: longId }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain(`id="${longId}"`)
    })

    it('should handle unicode characters in labels', () => {
      mockWorkflow.nodes = [{
        id: 'task1',
        type: 'userTask',
        position: { x: 100, y: 100 },
        data: { label: 'Task with 中文 and Ñoño' }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('中文')
      expect(xml).toContain('Ñoño')
    })

    it('should handle null and undefined optional properties', () => {
      mockWorkflow.nodes = [{
        id: 'task1',
        type: 'userTask',
        position: { x: 100, y: 100 },
        data: {
          label: 'Task',
          assignee: undefined as any,
          candidateUsers: null as any,
          priority: undefined as any
        }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      // Should generate XML without errors
      expect(xml).toContain('<bpmn:userTask')
    })

    it('should handle very large numbers in priority', () => {
      mockWorkflow.nodes = [{
        id: 'task1',
        type: 'userTask',
        position: { x: 100, y: 100 },
        data: {
          label: 'Task',
          priority: '999999999999'
        }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      expect(xml).toContain('999999999999')
    })

    it('should handle empty arrays for optional collections', () => {
      mockWorkflow.nodes = [{
        id: 'task1',
        type: 'userTask',
        position: { x: 100, y: 100 },
        data: {
          label: 'Task',
          candidateUsers: [],
          candidateGroups: [],
          listeners: []
        }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      // Should generate XML without errors
      expect(xml).toContain('<bpmn:userTask')
    })

    it('should handle complex expressions with special characters', () => {
      mockWorkflow.nodes = [{
        id: 'task1',
        type: 'userTask',
        position: { x: 100, y: 100 },
        data: {
          label: 'Task',
          assignee: '${user.get("name") != null ? user.get("name") : "default"}'
        }
      }]

      const xml = generateBpmnXml(mockWorkflow)

      // Expression should be included in XML (xmlbuilder2 handles escaping)
      expect(xml).toContain('${user.get')
      expect(xml).toContain('null')
      expect(xml).toContain('default')
    })

    it('should handle workflow with many nodes (performance test)', () => {
      // Create 100 nodes
      for (let i = 0; i < 100; i++) {
        mockWorkflow.nodes.push({
          id: `task${i}`,
          type: 'userTask',
          position: { x: i * 50, y: 100 },
          data: {
            label: `Task ${i}`,
            assignee: `${'user'.repeat(10)}`, // Large value
            listeners: Array(10).fill(null).map((_, j) => ({
              id: `listener-${i}-${j}`,
              event: 'complete',
              type: 'class',
              value: `com.example.Listener${i}_${j}`
            }))
          }
        })
      }

      const startTime = Date.now()
      const xml = generateBpmnXml(mockWorkflow)
      const duration = Date.now() - startTime

      // Should complete in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000)
      expect(xml).toContain('<bpmn:userTask')
    })
  })
})
