# BPMN Element Mapping Guide

This document describes how the Vue Flow BPMN Editor maps visual elements to BPMN 2.0 XML elements.

## Overview

The editor uses a node-based visual representation that is converted to BPMN 2.0 XML format compatible with Flowable. Each node type in the editor corresponds to a specific BPMN element type.

## Node Type Mapping

### Start Event

**Visual Representation**: Green circle (●)

**Editor Type**: `startEvent`

**BPMN XML Output**:
```xml
<bpmn:startEvent id="bpmn-{nodeId}" name="{label}" />
```

**Properties**:
| Property | BPMN Attribute | Description |
|----------|----------------|-------------|
| Label | `name` | Display name |
| BPMN ID | `id` | Custom element ID |
| Documentation | `bpmn:documentation` | Element description |

**Example**:
```xml
<bpmn:startEvent id="bpmn-start1" name="Process Start">
  <bpmn:documentation>Starts the approval process</bpmn:documentation>
</bpmn:startEvent>
```

---

### End Event

**Visual Representation**: Red circle with thick border (◉)

**Editor Type**: `endEvent`

**BPMN XML Output**:
```xml
<bpmn:endEvent id="bpmn-{nodeId}" name="{label}" />
```

**Properties**:
| Property | BPMN Attribute | Description |
|----------|----------------|-------------|
| Label | `name` | Display name |
| BPMN ID | `id` | Custom element ID |
| Documentation | `bpmn:documentation` | Element description |

**Example**:
```xml
<bpmn:endEvent id="bpmn-end1" name="Process End">
  <bpmn:documentation>Terminates the approval process</bpmn:documentation>
</bpmn:endEvent>
```

---

### User Task

**Visual Representation**: Rounded rectangle with user icon (👤)

**Editor Type**: `userTask`

**BPMN XML Output**:
```xml
<bpmn:userTask id="bpmn-{nodeId}" name="{label}">
  <!-- Flowable extensions -->
</bpmn:userTask>
```

**Properties**:
| Property | BPMN/Flowable Attribute | Description |
|----------|-------------------------|-------------|
| Label | `name` | Display name |
| Assignee | `flowable:assignee` | Task assignee expression |
| Candidate Users | `flowable:candidateUsers` | Comma-separated user list |
| Candidate Groups | `flowable:candidateGroups` | Comma-separated group list |
| Priority | `flowable:priority` | Task priority (1-10) |
| Due Date | `flowable:dueDate` | Due date expression |
| Form Key | `flowable:formKey` | Form reference |
| Skip Expression | `flowable:skipExpression` | Skip condition |
| Async Before | `flowable:asyncBefore` | Execute async before |
| Async After | `flowable:asyncAfter` | Execute async after |

**Example**:
```xml
<bpmn:userTask id="bpmn-task1" name="Review Document">
  <flowable:assignee>${initiator}</flowable:assignee>
  <flowable:candidateUsers>user1, user2</flowable:candidateUsers>
  <flowable:candidateGroups>reviewers</flowable:candidateGroups>
  <flowable:priority>5</flowable:priority>
  <flowable:dueDate>${dueDate}</flowable:dueDate>
  <flowable:formKey>review-form</flowable:formKey>
</bpmn:userTask>
```

---

### Service Task

**Visual Representation**: Rounded rectangle with gear icon (⚙)

**Editor Type**: `serviceTask`

**BPMN XML Output**:
```xml
<bpmn:serviceTask id="bpmn-{nodeId}" name="{label}">
  <!-- Flowable extensions -->
</bpmn:serviceTask>
```

**Properties**:
| Property | BPMN/Flowable Attribute | Description |
|----------|-------------------------|-------------|
| Label | `name` | Display name |
| Expression | `flowable:expression` | Service expression |
| Delegate Expression | `flowable:delegateExpression` | Spring bean expression |
| Class | `flowable:class` | Java class name |
| Triggerable | `flowable:triggerable` | Can be triggered |
| Async Before | `flowable:asyncBefore` | Execute async before |
| Async After | `flowable:asyncAfter` | Execute async after |
| Async | `flowable:async` | Execute async |

**Example**:
```xml
<bpmn:serviceTask id="bpmn-service1" name="Send Email">
  <flowable:expression>${sendEmail}</flowable:expression>
  <flowable:async>true</flowable:async>
</bpmn:serviceTask>
```

---

### Exclusive Gateway (XOR Gateway)

**Visual Representation**: Diamond with "X" marker (◇)

**Editor Type**: `exclusiveGateway`

**BPMN XML Output**:
```xml
<bpmn:exclusiveGateway id="bpmn-{nodeId}" name="{label}" default="{defaultFlowId}" />
```

**Properties**:
| Property | BPMN Attribute | Description |
|----------|----------------|-------------|
| Label | `name` | Display name |
| Default | `default` | Default outgoing flow ID |

**Outgoing Sequence Flows**:
Each outgoing flow from an exclusive gateway typically has a condition expression.

**Example**:
```xml
<bpmn:exclusiveGateway id="bpmn-gateway1" name="Approval Decision" default="flow-default" />

<bpmn:sequenceFlow id="flow-approved" sourceRef="bpmn-gateway1" targetRef="bpmn-approveTask">
  <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${approved == true}</bpmn:conditionExpression>
</bpmn:sequenceFlow>

<bpmn:sequenceFlow id="flow-rejected" sourceRef="bpmn-gateway1" targetRef="bpmn-rejectTask">
  <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${approved == false}</bpmn:conditionExpression>
</bpmn:sequenceFlow>

<bpmn:sequenceFlow id="flow-default" sourceRef="bpmn-gateway1" targetRef="bpmn-reviewTask" />
```

---

### Parallel Gateway

**Visual Representation**: Diamond with "+" marker (◈)

**Editor Type**: `parallelGateway`

**BPMN XML Output**:
```xml
<bpmn:parallelGateway id="bpmn-{nodeId}" name="{label}" />
```

**Properties**:
| Property | BPMN Attribute | Description |
|----------|----------------|-------------|
| Label | `name` | Display name |
| Default | `default` | Default outgoing flow ID |

**Usage**:
- **Fork**: Multiple outgoing sequence flows execute in parallel
- **Join**: Multiple incoming sequence flows must all complete before continuing

**Example**:
```xml
<!-- Fork Gateway -->
<bpmn:parallelGateway id="bpmn-fork1" name="Split" />

<bpmn:sequenceFlow id="flow-taskA" sourceRef="bpmn-fork1" targetRef="bpmn-taskA" />
<bpmn:sequenceFlow id="flow-taskB" sourceRef="bpmn-fork1" targetRef="bpmn-taskB" />

<!-- Join Gateway -->
<bpmn:parallelGateway id="bpmn-join1" name="Join" />

<bpmn:sequenceFlow id="flow-complete" sourceRef="bpmn-join1" targetRef="bpmn-end1" />
```

---

## Sequence Flow (Connections)

**Visual Representation**: Arrow connecting nodes

**Editor Type**: `edge`

**BPMN XML Output**:
```xml
<bpmn:sequenceFlow id="flow-{edgeId}" sourceRef="{sourceBpmnId}" targetRef="{targetBpmnId}" name="{name}">
  <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">{condition}</bpmn:conditionExpression>
</bpmn:sequenceFlow>
```

**Properties**:
| Property | BPMN Attribute | Description |
|----------|----------------|-------------|
| Name | `name` | Flow label |
| Condition | `bpmn:conditionExpression` | Condition expression |
| Documentation | `bpmn:documentation` | Flow description |

**ID Mapping**:
- Node IDs are prefixed with `bpmn-`
- Edge (sequence flow) IDs are prefixed with `flow-`

**Example**:
```xml
<bpmn:sequenceFlow id="flow-edge1" sourceRef="bpmn-start1" targetRef="bpmn-task1" name="Start">
  <bpmn:documentation>Initial transition from start to task</bpmn:documentation>
</bpmn:sequenceFlow>
```

---

## BPMN Namespaces

The generated XML includes the following namespaces:

| Prefix | Namespace |
|--------|-----------|
| `bpmn` | `http://www.omg.org/spec/BPMN/20100524/MODEL` |
| `bpmndi` | `http://www.omg.org/spec/BPMN/20100524/DI` |
| `dc` | `http://www.omg.org/spec/DD/20100524/DC` |
| `di` | `http://www.omg.org/spec/DD/20100524/DI` |
| `flowable` | `http://flowable.org/bpmn` |
| `xsi` | `http://www.w3.org/2001/XMLSchema-instance` |

---

## Complete Workflow Example

**Editor Nodes**:
```
[start1: Start Event] --> [gateway1: Exclusive Gateway]
                              |
                              +--> [task1: User Task (Approved)]
                              |
                              +--> [task2: Service Task (Rejected)]
                              |
                              v
                         [end1: End Event]
```

**Generated BPMN XML**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  xmlns:flowable="http://flowable.org/bpmn"
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  id="definitions-1"
                  targetNamespace="http://bpmn.io/schema/bpmn">

  <bpmn:process id="approval-process" name="Approval Process" version="1" isExecutable="true">

    <!-- Start Event -->
    <bpmn:startEvent id="bpmn-start1" name="Start" />

    <!-- Exclusive Gateway -->
    <bpmn:exclusiveGateway id="bpmn-gateway1" name="Decision" />

    <!-- User Task -->
    <bpmn:userTask id="bpmn-task1" name="Process Approval">
      <flowable:assignee>${initiator}</flowable:assignee>
    </bpmn:userTask>

    <!-- Service Task -->
    <bpmn:serviceTask id="bpmn-task2" name="Send Rejection">
      <flowable:expression>${sendRejection}</flowable:expression>
    </bpmn:serviceTask>

    <!-- End Event -->
    <bpmn:endEvent id="bpmn-end1" name="End" />

    <!-- Sequence Flows -->
    <bpmn:sequenceFlow id="flow-edge1" sourceRef="bpmn-start1" targetRef="bpmn-gateway1" />

    <bpmn:sequenceFlow id="flow-edge2" sourceRef="bpmn-gateway1" targetRef="bpmn-task1">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${approved}</bpmn:conditionExpression>
    </bpmn:sequenceFlow>

    <bpmn:sequenceFlow id="flow-edge3" sourceRef="bpmn-gateway1" targetRef="bpmn-task2">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${!approved}</bpmn:conditionExpression>
    </bpmn:sequenceFlow>

    <bpmn:sequenceFlow id="flow-edge4" sourceRef="bpmn-task1" targetRef="bpmn-end1" />
    <bpmn:sequenceFlow id="flow-edge5" sourceRef="bpmn-task2" targetRef="bpmn-end1" />

  </bpmn:process>

  <!-- BPMN Diagram Information -->
  <bpmndi:BPMNDiagram id="bpmn-diagram-1">
    <bpmndi:BPMNPlane id="bpmn-plane-1" bpmnElement="approval-process">
      <!-- Shape and edge definitions -->
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>

</bpmn:definitions>
```

---

## Extension Points

### Adding New Node Types

To add a new BPMN element type:

1. **Define the type** in `src/types/bpmn.ts`:
   ```typescript
   export type BpmnElementType =
     | 'startEvent'
     | 'endEvent'
     | 'userTask'
     | 'serviceTask'
     | 'exclusiveGateway'
     | 'parallelGateway'
     | 'scriptTask'  // New type
   ```

2. **Add configuration** to `BPMN_ELEMENT_CONFIGS`:
   ```typescript
   scriptTask: {
     type: 'scriptTask',
     label: 'Script Task',
     icon: '📜',
     description: 'Script execution task',
     defaultSize: { width: 120, height: 80 }
   }
   ```

3. **Create node component** in `src/components/nodes/ScriptTask.vue`

4. **Add conversion logic** in `src/utils/bpmn-converter.ts`:
   ```typescript
   const NODE_TYPE_MAPPING: Record<BpmnElementType, string> = {
     // ... existing mappings
     scriptTask: 'bpmn:scriptTask'
   }
   ```

5. **Register node** in `src/components/BpmnEditor/BpmnEditor.vue`

### Adding New Properties

To add new properties to existing nodes:

1. **Update the interface** in `src/types/bpmn.ts`:
   ```typescript
   export interface BpmnNodeData {
     // ... existing properties
     scriptFormat?: string  // For script tasks
   }
   ```

2. **Add UI controls** in the property panel component

3. **Update conversion logic** in `bpmn-converter.ts` to include the new property in the XML output
