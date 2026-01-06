/**
 * BPMN Compliance Tests
 * Tests BPMN 2.0 specification compliance of exported XML
 */

import { describe, it, expect } from 'vitest'
import { generateBpmnXml } from '@/utils/bpmn-converter'
import { loadJsonFixture } from '../helpers/bpmnjs-test-helpers'
import {
  parseXml,
  assertXmlNamespace,
  assertXmlElement,
  assertBpmnNamespaces,
  countElements,
  getElementAttribute
} from '../helpers/xml-test-helpers'

describe('BPMN 2.0 Compliance', () => {
  describe('XML Structure', () => {
    it('should have valid XML declaration', () => {
      const workflow = {
        process: {
          id: 'test-process',
          name: 'Test',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'start-1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start', width: 50, height: 50 }
          },
          {
            id: 'end-1',
            type: 'endEvent',
            position: { x: 300, y: 100 },
            data: { label: 'End', width: 50, height: 50 }
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

      // Check for XML declaration
      expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/)
    })

    it('should include required BPMN namespaces', () => {
      const workflow = {
        process: {
          id: 'test-process',
          name: 'Test',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'start-1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start', width: 50, height: 50 }
          },
          {
            id: 'end-1',
            type: 'endEvent',
            position: { x: 300, y: 100 },
            data: { label: 'End', width: 50, height: 50 }
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
      const doc = parseXml(xml)

      assertBpmnNamespaces(doc)
    })

    it('should have definitions as root element', () => {
      const workflow = {
        process: {
          id: 'test-process',
          name: 'Test',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'start-1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start', width: 50, height: 50 }
          },
          {
            id: 'end-1',
            type: 'endEvent',
            position: { x: 300, y: 100 },
            data: { label: 'End', width: 50, height: 50 }
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
      const doc = parseXml(xml)

      assertXmlElement(doc, '//bpmn:definitions')
    })
  })

  describe('Element Types', () => {
    it('should correctly export start event', () => {
      const workflow = {
        process: {
          id: 'test-process',
          name: 'Test',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'start-1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start', width: 50, height: 50 }
          },
          {
            id: 'end-1',
            type: 'endEvent',
            position: { x: 300, y: 100 },
            data: { label: 'End', width: 50, height: 50 }
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
      const doc = parseXml(xml)

      assertXmlElement(doc, '//bpmn:startEvent')
      expect(countElements(doc, '//bpmn:startEvent')).toBe(1)
    })

    it('should correctly export user task', () => {
      const workflow = {
        process: {
          id: 'test-process',
          name: 'Test',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'start-1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start', width: 50, height: 50 }
          },
          {
            id: 'task-1',
            type: 'userTask',
            position: { x: 300, y: 100 },
            data: { label: 'Task', width: 120, height: 80, assignee: 'user1' }
          },
          {
            id: 'end-1',
            type: 'endEvent',
            position: { x: 500, y: 100 },
            data: { label: 'End', width: 50, height: 50 }
          }
        ],
        edges: [
          {
            id: 'flow-1',
            source: 'start-1',
            target: 'task-1',
            data: {},
            type: 'default'
          },
          {
            id: 'flow-2',
            source: 'task-1',
            target: 'end-1',
            data: {},
            type: 'default'
          }
        ]
      }

      const xml = generateBpmnXml(workflow)
      const doc = parseXml(xml)

      assertXmlElement(doc, '//bpmn:userTask')
      expect(countElements(doc, '//bpmn:userTask')).toBe(1)
    })

    it('should correctly export exclusive gateway', () => {
      const workflow = {
        process: {
          id: 'test-process',
          name: 'Test',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'start-1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start', width: 50, height: 50 }
          },
          {
            id: 'gateway-1',
            type: 'exclusiveGateway',
            position: { x: 300, y: 100 },
            data: { label: 'Gateway', width: 60, height: 60 }
          },
          {
            id: 'end-1',
            type: 'endEvent',
            position: { x: 500, y: 100 },
            data: { label: 'End', width: 50, height: 50 }
          }
        ],
        edges: [
          {
            id: 'flow-1',
            source: 'start-1',
            target: 'gateway-1',
            data: {},
            type: 'default'
          },
          {
            id: 'flow-2',
            source: 'gateway-1',
            target: 'end-1',
            data: {},
            type: 'default'
          }
        ]
      }

      const xml = generateBpmnXml(workflow)
      const doc = parseXml(xml)

      assertXmlElement(doc, '//bpmn:exclusiveGateway')
      expect(countElements(doc, '//bpmn:exclusiveGateway')).toBe(1)
    })

    it('should correctly export parallel gateway', () => {
      const workflow = {
        process: {
          id: 'test-process',
          name: 'Test',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'start-1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start', width: 50, height: 50 }
          },
          {
            id: 'gateway-1',
            type: 'parallelGateway',
            position: { x: 300, y: 100 },
            data: { label: 'Parallel', width: 60, height: 60 }
          },
          {
            id: 'end-1',
            type: 'endEvent',
            position: { x: 500, y: 100 },
            data: { label: 'End', width: 50, height: 50 }
          }
        ],
        edges: [
          {
            id: 'flow-1',
            source: 'start-1',
            target: 'gateway-1',
            data: {},
            type: 'default'
          },
          {
            id: 'flow-2',
            source: 'gateway-1',
            target: 'end-1',
            data: {},
            type: 'default'
          }
        ]
      }

      const xml = generateBpmnXml(workflow)
      const doc = parseXml(xml)

      assertXmlElement(doc, '//bpmn:parallelGateway')
      expect(countElements(doc, '//bpmn:parallelGateway')).toBe(1)
    })
  })

  describe('Sequence Flows', () => {
    it('should correctly export sequence flows', () => {
      const workflow = {
        process: {
          id: 'test-process',
          name: 'Test',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'start-1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start', width: 50, height: 50 }
          },
          {
            id: 'task-1',
            type: 'userTask',
            position: { x: 300, y: 100 },
            data: { label: 'Task', width: 120, height: 80 }
          },
          {
            id: 'end-1',
            type: 'endEvent',
            position: { x: 500, y: 100 },
            data: { label: 'End', width: 50, height: 50 }
          }
        ],
        edges: [
          {
            id: 'flow-1',
            source: 'start-1',
            target: 'task-1',
            data: {},
            type: 'default'
          },
          {
            id: 'flow-2',
            source: 'task-1',
            target: 'end-1',
            data: {},
            type: 'default'
          }
        ]
      }

      const xml = generateBpmnXml(workflow)
      const doc = parseXml(xml)

      expect(countElements(doc, '//bpmn:sequenceFlow')).toBe(2)
    })

    it('should export sequence flow with condition expression', () => {
      const workflow = {
        process: {
          id: 'test-process',
          name: 'Test',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'start-1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start', width: 50, height: 50 }
          },
          {
            id: 'gateway-1',
            type: 'exclusiveGateway',
            position: { x: 300, y: 100 },
            data: { label: 'Gateway', width: 60, height: 60 }
          },
          {
            id: 'end-1',
            type: 'endEvent',
            position: { x: 500, y: 100 },
            data: { label: 'End', width: 50, height: 50 }
          }
        ],
        edges: [
          {
            id: 'flow-1',
            source: 'start-1',
            target: 'gateway-1',
            data: {},
            type: 'default'
          },
          {
            id: 'flow-2',
            source: 'gateway-1',
            target: 'end-1',
            data: { condition: '${approved}' },
            type: 'default'
          }
        ]
      }

      const xml = generateBpmnXml(workflow)
      const doc = parseXml(xml)

      assertXmlElement(doc, '//bpmn:sequenceFlow[@id]/bpmn:conditionExpression')
    })

    it('should have correct sourceRef and targetRef', () => {
      const workflow = {
        process: {
          id: 'test-process',
          name: 'Test',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'start-1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start', width: 50, height: 50 }
          },
          {
            id: 'task-1',
            type: 'userTask',
            position: { x: 300, y: 100 },
            data: { label: 'Task', width: 120, height: 80 }
          }
        ],
        edges: [
          {
            id: 'flow-1',
            source: 'start-1',
            target: 'task-1',
            data: {},
            type: 'default'
          }
        ]
      }

      const xml = generateBpmnXml(workflow)
      const doc = parseXml(xml)

      const sourceRef = getElementAttribute(doc, '//bpmn:sequenceFlow[1]', 'sourceRef')
      const targetRef = getElementAttribute(doc, '//bpmn:sequenceFlow[1]', 'targetRef')

      expect(sourceRef).toBeTruthy()
      expect(targetRef).toBeTruthy()
    })
  })

  describe('BPMN DI', () => {
    it('should include BPMN DI diagram', () => {
      const workflow = {
        process: {
          id: 'test-process',
          name: 'Test',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'start-1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start', width: 50, height: 50 }
          },
          {
            id: 'end-1',
            type: 'endEvent',
            position: { x: 300, y: 100 },
            data: { label: 'End', width: 50, height: 50 }
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
      const doc = parseXml(xml)

      assertXmlElement(doc, '//bpmndi:BPMNDiagram')
      assertXmlElement(doc, '//bpmndi:BPMNPlane')
    })

    it('should include BPMNShape for each node', () => {
      const workflow = {
        process: {
          id: 'test-process',
          name: 'Test',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'start-1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start', width: 50, height: 50 }
          },
          {
            id: 'end-1',
            type: 'endEvent',
            position: { x: 300, y: 100 },
            data: { label: 'End', width: 50, height: 50 }
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
      const doc = parseXml(xml)

      expect(countElements(doc, '//bpmndi:BPMNShape')).toBe(2)
    })

    it('should include BPMNEdge for each edge', () => {
      const workflow = {
        process: {
          id: 'test-process',
          name: 'Test',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'start-1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start', width: 50, height: 50 }
          },
          {
            id: 'end-1',
            type: 'endEvent',
            position: { x: 300, y: 100 },
            data: { label: 'End', width: 50, height: 50 }
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
      const doc = parseXml(xml)

      expect(countElements(doc, '//bpmndi:BPMNEdge')).toBe(1)
    })

    it('should include dc:Bounds with correct coordinates', () => {
      const workflow = {
        process: {
          id: 'test-process',
          name: 'Test',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'start-1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start', width: 50, height: 50 }
          }
        ],
        edges: []
      }

      const xml = generateBpmnXml(workflow)
      const doc = parseXml(xml)

      const x = getElementAttribute(doc, '//bpmndi:BPMNShape[1]/dc:Bounds', 'x')
      const y = getElementAttribute(doc, '//bpmndi:BPMNShape[1]/dc:Bounds', 'y')
      const width = getElementAttribute(doc, '//bpmndi:BPMNShape[1]/dc:Bounds', 'width')
      const height = getElementAttribute(doc, '//bpmndi:BPMNShape[1]/dc:Bounds', 'height')

      expect(x).toBe('100')
      expect(y).toBe('100')
      expect(width).toBe('50')
      expect(height).toBe('50')
    })
  })

  describe('Flowable Extensions', () => {
    it('should include Flowable namespace for Flowable properties', () => {
      const workflow = {
        process: {
          id: 'test-process',
          name: 'Test',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'task-1',
            type: 'userTask',
            position: { x: 100, y: 100 },
            data: {
              label: 'Task',
              width: 120,
              height: 80,
              assignee: 'user1'
            }
          }
        ],
        edges: []
      }

      const xml = generateBpmnXml(workflow)
      const doc = parseXml(xml)

      assertXmlNamespace(doc, 'http://flowable.org/bpmn', 'flowable')
    })

    it('should export Flowable-specific user task properties', () => {
      const workflow = {
        process: {
          id: 'test-process',
          name: 'Test',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'task-1',
            type: 'userTask',
            position: { x: 100, y: 100 },
            data: {
              label: 'Task',
              width: 120,
              height: 80,
              assignee: 'user1',
              priority: '1',
              dueDate: '2024-01-01'
            }
          }
        ],
        edges: []
      }

      const xml = generateBpmnXml(workflow)
      const doc = parseXml(xml)

      expect(getElementAttribute(doc, '//bpmn:userTask', 'flowable:assignee')).toBe('user1')
      expect(getElementAttribute(doc, '//bpmn:userTask', 'flowable:priority')).toBe('1')
      expect(getElementAttribute(doc, '//bpmn:userTask', 'flowable:dueDate')).toBe('2024-01-01')
    })
  })

  describe('Process Attributes', () => {
    it('should export process with correct attributes', () => {
      const workflow = {
        process: {
          id: 'my-process',
          name: 'My Process',
          version: 2,
          executable: false,
          documentation: 'Test documentation'
        },
        nodes: [
          {
            id: 'start-1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start', width: 50, height: 50 }
          },
          {
            id: 'end-1',
            type: 'endEvent',
            position: { x: 300, y: 100 },
            data: { label: 'End', width: 50, height: 50 }
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
      const doc = parseXml(xml)

      expect(getElementAttribute(doc, '//bpmn:process', 'id')).toBe('my-process')
      expect(getElementAttribute(doc, '//bpmn:process', 'name')).toBe('My Process')
      expect(getElementAttribute(doc, '//bpmn:process', 'version')).toBe('2')
      expect(getElementAttribute(doc, '//bpmn:process', 'isExecutable')).toBe('false')
    })
  })
})
