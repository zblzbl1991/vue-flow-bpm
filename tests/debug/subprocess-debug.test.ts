/**
 * Debug test for subProcess import
 */

import { describe, it, expect } from 'vitest'
import { importBpmnXml } from '@/utils/bpmn-importer'

describe('SubProcess Debug', () => {
  it('debug simple subProcess', async () => {
    const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC">
  <process id="test-process" name="Test Process" isExecutable="true">
    <startEvent id="startEvent" name="Start"></startEvent>
    <endEvent id="endEvent"></endEvent>
  </process>
  <bpmndi:BPMNDiagram>
    <bpmndi:BPMNPlane>
      <bpmndi:BPMNShape bpmnElement="startEvent">
        <omgdc:Bounds x="100" y="100" width="30" height="30"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`

    const result = await importBpmnXml(bpmnXml)
    console.log('Result:', JSON.stringify(result, null, 2))

    expect(result.success).toBe(true)
  })
})
