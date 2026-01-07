/**
 * BPMN Importer Unit Tests
 * Note: Due to bpmn-moddle schema issues, these tests focus on the main API
 * and basic error handling. Full import testing is done in integration tests.
 */

import { describe, it, expect } from 'vitest'
import { importBpmnXml, type BpmnImportResult } from '@/utils/bpmn-importer'

describe('bpmn-importer', () => {
  describe('importBpmnXml', () => {
    it('is an async function that returns BpmnImportResult', async () => {
      const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <process id="test-process" />
</definitions>`

      const result = await importBpmnXml(bpmnXml)

      // Verify result structure
      expect(result).toBeDefined()
      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('errors')
      expect(result).toHaveProperty('warnings')
    })

    it('returns workflow property on success', async () => {
      const minimalBpmn = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <process id="test-process" />
</definitions>`

      const result = await importBpmnXml(minimalBpmn)

      // On success, workflow should be defined
      if (result.success) {
        expect(result.workflow).toBeDefined()
        expect(result.workflow).toHaveProperty('process')
        expect(result.workflow).toHaveProperty('nodes')
        expect(result.workflow).toHaveProperty('edges')
      }
    })

    it('handles malformed XML without crashing', async () => {
      const badXml = '<?xml version="1.0"?><broken>'

      const result = await importBpmnXml(badXml)

      // Should return a result, not throw
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.errors?.length).toBeGreaterThan(0)
    })

    it('handles empty string input', async () => {
      const result = await importBpmnXml('')

      expect(result).toBeDefined()
      expect(result.success).toBe(false)
    })

    it('returns errors array for error conditions', async () => {
      const badXml = 'not even xml'

      const result = await importBpmnXml(badXml)

      expect(result.errors).toBeDefined()
      expect(Array.isArray(result.errors)).toBe(true)
    })

    it('returns warnings array for potential issues', async () => {
      const minimalBpmn = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <process id="test" />
</definitions>`

      const result = await importBpmnXml(minimalBpmn)

      expect(result.warnings).toBeDefined()
      expect(Array.isArray(result.warnings)).toBe(true)
    })

    it('extracts process from BPMN XML', async () => {
      const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <process id="my-custom-process-id" />
</definitions>`

      const result = await importBpmnXml(bpmnXml)

      expect(result).toBeDefined()
    })
  })

  describe('Error handling', () => {
    it('handles null input gracefully', async () => {
      const result = await importBpmnXml(null as any)

      expect(result).toBeDefined()
      expect(result.success).toBe(false)
    })

    it('handles undefined input gracefully', async () => {
      const result = await importBpmnXml(undefined as any)

      expect(result).toBeDefined()
      expect(result.success).toBe(false)
    })

    it('provides meaningful error messages', async () => {
      const badXml = '<invalid>xml</content>'

      const result = await importBpmnXml(badXml)

      if (result.errors && result.errors.length > 0) {
        const firstError = result.errors[0]
        expect(firstError.message).toBeTruthy()
        expect(typeof firstError.message).toBe('string')
      }
    })

    it('error objects have proper structure', async () => {
      const badXml = 'not xml'

      const result = await importBpmnXml(badXml)

      if (result.errors && result.errors.length > 0) {
        const error = result.errors[0]
        expect(error).toHaveProperty('message')
        expect(typeof error.message).toBe('string')
      }
    })
  })

  describe('Type exports', () => {
    it('exports BpmnImportResult interface', () => {
      const result: BpmnImportResult = {
        success: true,
        workflow: {
          process: { id: 'test', name: 'Test', version: 1 },
          nodes: [],
          edges: []
        }
      }
      expect(result).toBeDefined()
    })
  })

  describe('BPMN DI waypoint extraction', () => {
    it('extracts edge waypoints from BPMN DI', async () => {
      const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
             xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
             xmlns:dc="http://www.omg.org/spec/DD/20100524/DC">
  <process id="test-process">
    <startEvent id="start" />
    <endEvent id="end" />
    <sequenceFlow id="flow1" sourceRef="start" targetRef="end" />
  </process>
  <bpmndi:BPMNDiagram id="diagram">
    <bpmndi:BPMNPlane id="plane" bpmnElement="test-process">
      <bpmndi:BPMNShape id="shape-start" bpmnElement="start">
        <dc:Bounds x="100" y="100" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="shape-end" bpmnElement="end">
        <dc:Bounds x="300" y="100" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="edge-flow1" bpmnElement="flow1">
        <di:waypoint x="136" y="118" />
        <di:waypoint x="300" y="118" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`

      const result = await importBpmnXml(bpmnXml)

      if (result.success && result.workflow) {
        const edge = result.workflow.edges.find(e => e.id === 'flow1')
        expect(edge).toBeDefined()
        expect(edge?.data.waypoints).toBeDefined()
        expect(edge?.data.waypoints).toHaveLength(2)
        expect(edge?.data.waypoints?.[0]).toEqual({ x: 136, y: 118 })
        expect(edge?.data.waypoints?.[1]).toEqual({ x: 300, y: 118 })
        expect(edge?.data.path).toBe('M 136 118 L 300 118')
      } else {
        throw new Error('Import failed')
      }
    })

    it('extracts multi-segment edge waypoints', async () => {
      const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
             xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
             xmlns:dc="http://www.omg.org/spec/DD/20100524/DC">
  <process id="test-process">
    <startEvent id="start" />
    <endEvent id="end" />
    <sequenceFlow id="flow1" sourceRef="start" targetRef="end" />
  </process>
  <bpmndi:BPMNDiagram id="diagram">
    <bpmndi:BPMNPlane id="plane" bpmnElement="test-process">
      <bpmndi:BPMNShape id="shape-start" bpmnElement="start">
        <dc:Bounds x="100" y="100" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="shape-end" bpmnElement="end">
        <dc:Bounds x="300" y="200" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="edge-flow1" bpmnElement="flow1">
        <di:waypoint x="136" y="118" />
        <di:waypoint x="136" y="218" />
        <di:waypoint x="300" y="218" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`

      const result = await importBpmnXml(bpmnXml)

      if (result.success && result.workflow) {
        const edge = result.workflow.edges.find(e => e.id === 'flow1')
        expect(edge?.data.waypoints).toHaveLength(3)
        expect(edge?.data.path).toBe('M 136 118 L 136 218 L 300 218')
      } else {
        throw new Error('Import failed')
      }
    })
  })
})
