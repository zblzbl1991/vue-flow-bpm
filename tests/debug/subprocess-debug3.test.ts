/**
 * Debug test for subProcess import - check sourceRef/targetRef structure
 */

import { describe, it, expect } from 'vitest'
import { importBpmnXml } from '@/utils/bpmn-importer'

describe('SubProcess Debug 3', () => {
  it('debug sourceRef targetRef structure', async () => {
    const bpmnXml = '<?xml version="1.0" encoding="UTF-8"?>' +
'<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC">' +
'  <process id="test-process" name="Test Process" isExecutable="true">' +
'    <startEvent id="startEvent" name="Start"></startEvent>' +
'    <subProcess id="subProcess" name="My Sub Process">' +
'      <startEvent id="subStart"></startEvent>' +
'      <userTask id="subTask" name="Task in SubProcess"></userTask>' +
'      <endEvent id="subEnd"></endEvent>' +
'      <sequenceFlow id="subFlow1" sourceRef="subStart" targetRef="subTask"></sequenceFlow>' +
'      <sequenceFlow id="subFlow2" sourceRef="subTask" targetRef="subEnd"></sequenceFlow>' +
'    </subProcess>' +
'    <endEvent id="endEvent"></endEvent>' +
'    <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="subProcess"></sequenceFlow>' +
'    <sequenceFlow id="flow2" sourceRef="subProcess" targetRef="endEvent"></sequenceFlow>' +
'  </process>' +
'  <bpmndi:BPMNDiagram>' +
'    <bpmndi:BPMNPlane>' +
'      <bpmndi:BPMNShape bpmnElement="startEvent">' +
'        <omgdc:Bounds x="50" y="100" width="30" height="30"/>' +
'      </bpmndi:BPMNShape>' +
'      <bpmndi:BPMNShape bpmnElement="subProcess" isExpanded="false">' +
'        <omgdc:Bounds x="150" y="80" width="200" height="100"/>' +
'      </bpmndi:BPMNShape>' +
'      <bpmndi:BPMNShape bpmnElement="endEvent">' +
'        <omgdc:Bounds x="400" y="100" width="30" height="30"/>' +
'      </bpmndi:BPMNShape>' +
'    </bpmndi:BPMNPlane>' +
'  </bpmndi:BPMNDiagram>' +
'</definitions>'

    const result = await importBpmnXml(bpmnXml)

    console.log('Import success:', result.success)
    if (!result.success && result.errors) {
      console.log('Errors:', result.errors)
    }
    if (result.warnings) {
      console.log('Warnings:', result.warnings)
    }
    if (result.workflow) {
      console.log('Nodes:', result.workflow.nodes.length)
      console.log('Edges:', result.workflow.edges.length)
    }

    expect(result.success).toBe(true)
  })
})
