/**
 * Tests for workflow import functionality (JSON and BPMN XML)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useWorkflowImporter } from '@/composables/useWorkflowImporter'
import type { BpmnWorkflow } from '@/types/bpmn'

describe('useWorkflowImporter', () => {
  let importer: ReturnType<typeof useWorkflowImporter>

  beforeEach(() => {
    importer = useWorkflowImporter()
  })

  describe('JSON import', () => {
    it('should import valid JSON workflow', async () => {
      const validJson = JSON.stringify({
        process: {
          id: 'test-process',
          name: 'Test Process',
          version: 1,
          executable: true
        },
        nodes: [
          {
            id: 'node1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start' }
          },
          {
            id: 'node2',
            type: 'userTask',
            position: { x: 300, y: 100 },
            data: { label: 'Task 1', assignee: '${initiator}' }
          }
        ],
        edges: [
          {
            id: 'edge1',
            source: 'node1',
            target: 'node2',
            data: {}
          }
        ]
      })

      const result = await importer.importJson(validJson)

      expect(result.success).toBe(true)
      expect(result.workflow).toBeDefined()
      expect(result.workflow?.nodes).toHaveLength(2)
      expect(result.workflow?.edges).toHaveLength(1)
      expect(result.workflow?.process.id).toBe('test-process')
    })

    it('should reject invalid JSON format', async () => {
      const invalidJson = '{ invalid json }'

      const result = await importer.importJson(invalidJson)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid JSON')
    })

    it('should validate required fields', async () => {
      const missingFieldsJson = JSON.stringify({
        nodes: [
          {
            id: 'node1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start' }
          }
        ]
        // Missing edges array
      })

      const result = await importer.importJson(missingFieldsJson)

      expect(result.success).toBe(false)
      expect(result.error).toContain('edges')
    })

    it('should warn about unsupported node types', async () => {
      const unsupportedNodeJson = JSON.stringify({
        process: { id: 'test', name: 'Test', version: 1 },
        nodes: [
          {
            id: 'node1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start' }
          },
          {
            id: 'node2',
            type: 'unsupportedTask',
            position: { x: 300, y: 100 },
            data: { label: 'Unsupported' }
          }
        ],
        edges: []
      })

      const result = await importer.importJson(unsupportedNodeJson)

      expect(result.success).toBe(true)
      expect(result.warnings).toBeDefined()
      expect(result.warnings?.length).toBeGreaterThan(0)
      expect(result.warnings?.[0]).toContain('Unsupported node types')
    })

    it('should warn about edges with invalid references', async () => {
      const invalidEdgeJson = JSON.stringify({
        process: { id: 'test', name: 'Test', version: 1 },
        nodes: [
          {
            id: 'node1',
            type: 'startEvent',
            position: { x: 100, y: 100 },
            data: { label: 'Start' }
          }
        ],
        edges: [
          {
            id: 'edge1',
            source: 'node1',
            target: 'nonexistent',
            data: {}
          }
        ]
      })

      const result = await importer.importJson(invalidEdgeJson)

      expect(result.success).toBe(true)
      expect(result.warnings).toBeDefined()
      expect(result.warnings?.[0]).toContain('edge')
    })
  })

  describe('BPMN XML import', () => {
    it('should import valid BPMN XML', async () => {
      const validBpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <bpmn:process id="test-process" name="Test Process">
    <bpmn:startEvent id="startEvent" name="Start" />
    <bpmn:userTask id="userTask" name="User Task" />
    <bpmn:sequenceFlow id="flow1" sourceRef="startEvent" targetRef="userTask" />
  </bpmn:process>
</bpmn:definitions>`

      const result = await importer.importBpmn(validBpmnXml)

      expect(result.success).toBe(true)
      expect(result.workflow).toBeDefined()
      expect(result.workflow?.nodes.length).toBeGreaterThan(0)
    })

    it('should reject invalid XML', async () => {
      const invalidXml = '<invalid>xml</content>'

      const result = await importer.importBpmn(invalidXml)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('File format detection', () => {
    it('should detect JSON format', () => {
      expect(importer.detectFormat('workflow.json')).toBe('json')
    })

    it('should detect BPMN format', () => {
      expect(importer.detectFormat('workflow.bpmn')).toBe('bpmn')
      expect(importer.detectFormat('workflow.xml')).toBe('bpmn')
    })

    it('should return null for unknown formats', () => {
      expect(importer.detectFormat('workflow.txt')).toBeNull()
    })
  })

  describe('File size validation', () => {
    it('should accept JSON files under 5MB', async () => {
      // Create a small JSON file (1KB)
      const smallJson = JSON.stringify({
        process: { id: 'test', name: 'Test', version: 1 },
        nodes: [{ id: 'n1', type: 'startEvent', position: { x: 0, y: 0 }, data: { label: 'Start' } }],
        edges: []
      })
      const file = new File([smallJson], 'small.json', { type: 'application/json' })

      const result = await importer.importFromFile(file)

      expect(result.success).toBe(true)
    })

    it('should reject JSON files over 5MB', async () => {
      // Create a file larger than 5MB
      const largeContent = 'x'.repeat(6 * 1024 * 1024) // 6MB
      const file = new File([largeContent], 'large.json', { type: 'application/json' })

      const result = await importer.importFromFile(file)

      expect(result.success).toBe(false)
      expect(result.error).toContain('too large')
    })

    it('should accept BPMN files under 10MB', async () => {
      const smallXml = '<?xml version="1.0"?><bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"><bpmn:process id="p"><bpmn:startEvent id="s"/></bpmn:process></bpmn:definitions>'
      const file = new File([smallXml], 'small.bpmn', { type: 'application/xml' })

      const result = await importer.importFromFile(file)

      expect(result.success).toBe(true)
    })

    it('should reject BPMN files over 10MB', async () => {
      const largeContent = 'x'.repeat(11 * 1024 * 1024) // 11MB
      const file = new File([largeContent], 'large.bpmn', { type: 'application/xml' })

      const result = await importer.importFromFile(file)

      expect(result.success).toBe(false)
      expect(result.error).toContain('too large')
    })
  })

  describe('State management', () => {
    it('should reset state correctly', () => {
      importer.error.value = 'test error'
      importer.warnings.value = ['warning 1']
      importer.loading.value = true

      importer.reset()

      expect(importer.error.value).toBeNull()
      expect(importer.warnings.value).toHaveLength(0)
      expect(importer.loading.value).toBe(false)
    })
  })
})
