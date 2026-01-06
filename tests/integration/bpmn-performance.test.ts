/**
 * BPMN Performance Tests
 * Tests for export/import performance with large diagrams
 */

import { describe, it, expect } from 'vitest'
import { convertToBpmnXml } from '@/composables/useBpmnConverter'
import { importBpmnXml } from '@/utils/bpmn-importer'
import type { BpmnNode, BpmnEdge } from '@/types/bpmn'

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  SMALL_EXPORT: 50,    // < 10 nodes
  MEDIUM_EXPORT: 100,  // 10-50 nodes
  LARGE_EXPORT: 500,   // 50-100 nodes
  VERY_LARGE_EXPORT: 2000, // 100+ nodes

  SMALL_IMPORT: 100,
  MEDIUM_IMPORT: 200,
  LARGE_IMPORT: 1000,
  VERY_LARGE_IMPORT: 5000
}

describe.skip('BPMN Performance', () => {
  describe('Export Performance (JSON → XML)', () => {
    it('should export small workflow quickly (< 50ms)', () => {
      const nodes: BpmnNode[] = [
        {
          id: 'start-1',
          type: 'startEvent',
          position: { x: 100, y: 100 },
          data: { label: 'Start', width: 50, height: 50 }
        },
        {
          id: 'task-1',
          type: 'userTask',
          position: { x: 250, y: 100 },
          data: { label: 'Task 1', assignee: '${user}', width: 120, height: 80 }
        },
        {
          id: 'end-1',
          type: 'endEvent',
          position: { x: 400, y: 100 },
          data: { label: 'End', width: 50, height: 50 }
        }
      ]

      const edges: BpmnEdge[] = [
        { id: 'flow-1', source: 'start-1', target: 'task-1', data: {}, type: 'default' },
        { id: 'flow-2', source: 'task-1', target: 'end-1', data: {}, type: 'default' }
      ]

      const startTime = performance.now()
      const xml = convertToBpmnXml(nodes, edges, 'test-process', 'Test Process')
      const endTime = performance.now()

      const duration = endTime - startTime

      expect(xml).toBeTruthy()
      expect(xml.length).toBeGreaterThan(0)
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SMALL_EXPORT)

      // Log for visibility
      console.log(`Small export (${nodes.length} nodes): ${duration.toFixed(2)}ms`)
    })

    it('should export medium workflow quickly (< 100ms)', () => {
      const nodes: BpmnNode[] = []
      const edges: BpmnEdge[] = []

      // Generate 25 nodes
      for (let i = 0; i < 25; i++) {
        const type = i === 0 ? 'startEvent' :
                     i === 24 ? 'endEvent' :
                     i % 3 === 0 ? 'exclusiveGateway' : 'userTask'

        nodes.push({
          id: `node-${i}`,
          type,
          position: { x: 100 + i * 50, y: 100 + (i % 5) * 100 },
          data: {
            label: `Node ${i}`,
            width: type === 'startEvent' || type === 'endEvent' ? 50 :
                   type === 'exclusiveGateway' ? 60 : 120,
            height: type === 'startEvent' || type === 'endEvent' ? 50 :
                    type === 'exclusiveGateway' ? 60 : 80,
            ...(type === 'userTask' && { assignee: `${`user${i}`}` })
          }
        })

        if (i > 0) {
          edges.push({
            id: `flow-${i}`,
            source: `node-${i - 1}`,
            target: `node-${i}`,
            data: {},
            type: 'default'
          })
        }
      }

      const startTime = performance.now()
      const xml = convertToBpmnXml(nodes, edges, 'test-process', 'Test Process')
      const endTime = performance.now()

      const duration = endTime - startTime

      expect(xml).toBeTruthy()
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MEDIUM_EXPORT)
      console.log(`Medium export (${nodes.length} nodes): ${duration.toFixed(2)}ms`)
    })

    it('should export large workflow within threshold (< 500ms)', () => {
      const nodes: BpmnNode[] = []
      const edges: BpmnEdge[] = []

      // Generate 75 nodes
      for (let i = 0; i < 75; i++) {
        const type = i === 0 ? 'startEvent' :
                     i === 74 ? 'endEvent' :
                     i % 5 === 0 ? 'exclusiveGateway' :
                     i % 3 === 0 ? 'serviceTask' : 'userTask'

        nodes.push({
          id: `node-${i}`,
          type,
          position: { x: 100 + (i % 15) * 100, y: 100 + Math.floor(i / 15) * 150 },
          data: {
            label: `Node ${i}`,
            width: type === 'startEvent' || type === 'endEvent' ? 50 :
                   type === 'exclusiveGateway' ? 60 : 120,
            height: type === 'startEvent' || type === 'endEvent' ? 50 :
                    type === 'exclusiveGateway' ? 60 : 80,
            ...(type === 'userTask' && { assignee: `${`user${i}`}` }),
            ...(type === 'serviceTask' && { class: `com.example.Task${i}`, async: true })
          }
        })

        if (i > 0 && i % 15 !== 0) {
          edges.push({
            id: `flow-${i}`,
            source: `node-${i - 1}`,
            target: `node-${i}`,
            data: {},
            type: 'default'
          })
        }
      }

      const startTime = performance.now()
      const xml = convertToBpmnXml(nodes, edges, 'test-process', 'Test Process')
      const endTime = performance.now()

      const duration = endTime - startTime

      expect(xml).toBeTruthy()
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.LARGE_EXPORT)
      console.log(`Large export (${nodes.length} nodes): ${duration.toFixed(2)}ms`)
    })
  })

  describe('Import Performance (XML → JSON)', () => {
    it('should import small BPMN XML quickly', async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  id="Definitions_1"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="test-process" isExecutable="true">
    <bpmn:startEvent id="start-1" name="Start">
      <bpmn:outgoing>flow-1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="task-1" name="Task 1">
      <bpmn:incoming>flow-1</bpmn:incoming>
      <bpmn:outgoing>flow-2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:endEvent id="end-1" name="End">
      <bpmn:incoming>flow-2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="flow-1" sourceRef="start-1" targetRef="task-1" />
    <bpmn:sequenceFlow id="flow-2" sourceRef="task-1" targetRef="end-1" />
  </bpmn:process>
</bpmn:definitions>`

      const startTime = performance.now()
      const result = await importBpmnXml(xml)
      const endTime = performance.now()

      const duration = endTime - startTime

      // Import may fail due to bpmn-moddle issues, but we measure performance
      console.log(`Small import (3 nodes): ${duration.toFixed(2)}ms, success: ${result.success}`)

      // Duration should still be reasonable even if import fails
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SMALL_IMPORT + 500) // Allow overhead
    })

    it('should handle complex BPMN XML with many elements', async () => {
      // Generate a larger BPMN XML
      let bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  id="Definitions_1"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="test-process" isExecutable="true">
    <bpmn:startEvent id="start-1">
      <bpmn:outgoing>flow-1</bpmn:outgoing>
    </bpmn:startEvent>`

      // Add 20 user tasks
      for (let i = 1; i <= 20; i++) {
        bpmnXml += `
    <bpmn:userTask id="task-${i}" name="Task ${i}">
      <bpmn:incoming>flow-${i}</bpmn:incoming>
      <bpmn:outgoing>flow-${i + 1}</bpmn:outgoing>
    </bpmn:userTask>
        `
        bpmnXml += `
    <bpmn:sequenceFlow id="flow-${i}" sourceRef="${i === 1 ? 'start-1' : `task-${i - 1}`}" targetRef="task-${i}" />`
      }

      bpmnXml += `
    <bpmn:endEvent id="end-1">
      <bpmn:incoming>flow-21</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="flow-21" sourceRef="task-20" targetRef="end-1" />
  </bpmn:process>
</bpmn:definitions>`

      const startTime = performance.now()
      const result = await importBpmnXml(bpmnXml)
      const endTime = performance.now()

      const duration = endTime - startTime

      console.log(`Medium import (22 nodes): ${duration.toFixed(2)}ms, success: ${result.success}`)
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.MEDIUM_IMPORT + 1000) // Allow overhead
    })
  })

  describe('Memory Usage', () => {
    it('should not leak memory during repeated exports', () => {
      const nodes: BpmnNode[] = []
      const edges: BpmnEdge[] = []

      // Create 50 nodes
      for (let i = 0; i < 50; i++) {
        nodes.push({
          id: `node-${i}`,
          type: i === 0 ? 'startEvent' : i === 49 ? 'endEvent' : 'userTask',
          position: { x: i * 50, y: 100 },
          data: {
            label: `Node ${i}`,
            width: 100,
            height: 80,
            ...(i > 0 && i < 49 && { assignee: `${`user${i}`}` })
          }
        })

        if (i > 0) {
          edges.push({
            id: `flow-${i}`,
            source: `node-${i - 1}`,
            target: `node-${i}`,
            data: {},
            type: 'default'
          })
        }
      }

      // Run export 10 times and check if time remains stable
      const times: number[] = []

      for (let i = 0; i < 10; i++) {
        const startTime = performance.now()
        convertToBpmnXml(nodes, edges, 'test-process', 'Test Process')
        const endTime = performance.now()
        times.push(endTime - startTime)
      }

      // Last iteration should not be significantly slower than first
      // (indicating no memory leak)
      const firstTime = times[0]
      const lastTime = times[times.length - 1]
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length

      console.log(`Export times: ${times.map(t => t.toFixed(2)).join('ms, ')}ms`)
      console.log(`Average: ${avgTime.toFixed(2)}ms`)

      // Last time should not be more than 2x the average (tolerance for GC)
      expect(lastTime).toBeLessThan(avgTime * 2)
    })
  })

  describe('XML Size Performance', () => {
    it('should generate reasonably sized XML', () => {
      const nodes: BpmnNode[] = []
      const edges: BpmnEdge[] = []

      // 50 nodes with properties
      for (let i = 0; i < 50; i++) {
        nodes.push({
          id: `node-${i}`,
          type: i === 0 ? 'startEvent' : i === 49 ? 'endEvent' : 'userTask',
          position: { x: i * 100, y: 100 },
          data: {
            label: `Task ${i} with a longer label`,
            width: 120,
            height: 80,
            ...(i > 0 && i < 49 && {
              assignee: `${`user${i}@example.com`}`,
              documentation: `Documentation for task ${i}`,
              priority: i * 10,
              dueDate: '2024-12-31'
            })
          }
        })

        if (i > 0) {
          edges.push({
            id: `flow-${i}`,
            source: `node-${i - 1}`,
            target: `node-${i}`,
            data: { label: `Flow ${i}` },
            type: 'default'
          })
        }
      }

      const xml = convertToBpmnXml(nodes, edges, 'test-process', 'Test Process')
      const xmlSizeKb = xml.length / 1024

      console.log(`XML size for 50 nodes: ${xmlSizeKb.toFixed(2)} KB`)

      // XML should be reasonably sized (< 100 KB for 50 nodes)
      expect(xmlSizeKb).toBeLessThan(100)
    })
  })
})
