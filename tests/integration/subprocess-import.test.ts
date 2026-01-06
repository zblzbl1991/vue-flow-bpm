/**
 * Tests for subProcess BPMN import functionality
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { importBpmnXml } from '@/utils/bpmn-importer'

describe('BPMN SubProcess Import', () => {
  it('should import expanded subProcess (internal elements flattened)', async () => {
    const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC">
  <process id="test-process" name="Test Process" isExecutable="true">
    <startEvent id="startEvent" name="Start"></startEvent>
    <subProcess id="subProcess" name="My Sub Process">
      <startEvent id="subStart"></startEvent>
      <userTask id="subTask" name="Task in SubProcess"></userTask>
      <endEvent id="subEnd"></endEvent>
      <sequenceFlow id="subFlow1" sourceRef="subStart" targetRef="subTask"></sequenceFlow>
      <sequenceFlow id="subFlow2" sourceRef="subTask" targetRef="subEnd"></sequenceFlow>
    </subProcess>
    <endEvent id="endEvent"></endEvent>
    <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="subProcess"></sequenceFlow>
    <sequenceFlow id="flow2" sourceRef="subProcess" targetRef="endEvent"></sequenceFlow>
  </process>
  <bpmndi:BPMNDiagram>
    <bpmndi:BPMNPlane>
      <bpmndi:BPMNShape bpmnElement="subProcess" isExpanded="false">
        <omgdc:Bounds x="100" y="100" width="200" height="150"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`

    const result = await importBpmnXml(bpmnXml)

    expect(result.success).toBe(true)
    expect(result.workflow).toBeDefined()

    // With expanded subProcess: internal elements are flattened into main process
    // Should have: startEvent, subStart, subTask, subEnd, endEvent = 5 nodes
    // The subProcess node itself is NOT added when expanded
    expect(result.workflow?.nodes.length).toBeGreaterThanOrEqual(5)

    // Verify internal elements are present
    const subStartNode = result.workflow?.nodes.find(n => n.id === 'subStart')
    const subTaskNode = result.workflow?.nodes.find(n => n.id === 'subTask')
    const subEndNode = result.workflow?.nodes.find(n => n.id === 'subEnd')

    expect(subStartNode).toBeDefined()
    expect(subTaskNode).toBeDefined()
    expect(subEndNode).toBeDefined()
    expect(subTaskNode?.type).toBe('userTask')
    expect(subTaskNode?.data.label).toBe('Task in SubProcess')

    // Verify internal sequence flows are present
    const subFlow1 = result.workflow?.edges.find(e => e.id === 'subFlow1')
    const subFlow2 = result.workflow?.edges.find(e => e.id === 'subFlow2')

    expect(subFlow1).toBeDefined()
    expect(subFlow2).toBeDefined()

    // Verify warning about expanded subProcess
    expect(result.warnings).toBeDefined()
    expect(result.warnings?.some(w => w.includes('expanded'))).toBe(true)
  })

  it('should import the actual collapsed-subprocess.bpmn20.xml file with expanded content', async () => {
    // Read the actual file content
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const filePath = path.resolve(process.cwd(), 'process/collapsed-subprocess.bpmn20.xml')
    const xml = await fs.readFile(filePath, 'utf-8')

    const result = await importBpmnXml(xml)

    expect(result.success).toBe(true)
    expect(result.workflow).toBeDefined()

    // With expanded subProcess, should have internal elements:
    // Main: startEvent (sid-89C70A03...), endEvent (sid-BF04B244...)
    // SubProcess internal: startEvent (sid-D8198785...), userTask (sid-F64640C9...), endEvent (sid-4EDFEC94...)
    // Total: at least 5 nodes
    expect(result.workflow?.nodes.length).toBeGreaterThanOrEqual(5)

    // Verify internal elements from subProcess are present
    const internalStart = result.workflow?.nodes.find(n => n.id === 'sid-D8198785-4F74-43A8-A4CD-AF383CEEBE04')
    const internalTask = result.workflow?.nodes.find(n => n.id === 'sid-F64640C9-9585-4927-806B-8B0A03DB2B8B')
    const internalEnd = result.workflow?.nodes.find(n => n.id === 'sid-4EDFEC94-82D6-48E2-8422-DE0F098CE7A3')

    expect(internalStart).toBeDefined()
    expect(internalTask).toBeDefined()
    expect(internalEnd).toBeDefined()
    expect(internalTask?.type).toBe('userTask')
    expect(internalTask?.data.label).toBe('User task 1')

    // Verify internal sequence flows exist
    const internalFlow1 = result.workflow?.edges.find(e => e.id === 'sid-C633903D-1169-42A4-933D-4D9AAB959792')
    const internalFlow2 = result.workflow?.edges.find(e => e.id === 'sid-C1EFE310-3B12-42DA-AEE6-5E442C2FEF19')

    expect(internalFlow1).toBeDefined()
    expect(internalFlow2).toBeDefined()

    // Verify warning about expanded subProcess
    expect(result.warnings).toBeDefined()
    expect(result.warnings?.some(w => w.includes('advance') && w.includes('expanded'))).toBe(true)
  })
})
