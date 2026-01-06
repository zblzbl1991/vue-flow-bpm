# Vue Flow BPMN Editor

A web-based BPMN 2.0 workflow editor built with Vue 3 and vue-flow, supporting export to Flowable-compatible BPMN XML.

## Features

- **Visual Workflow Editor**: Drag-and-drop interface for creating BPMN workflows
- **BPMN 2.0 Support**: Full support for common BPMN elements
- **XML Export**: Generate BPMN 2.0 XML compatible with Flowable
- **Validation**: Built-in validation using bpmn-js
- **JSON Import/Export**: Save and load workflows as JSON

## Supported BPMN Elements

| Element | Icon | Description |
|---------|------|-------------|
| Start Event | ● | Starting point of a workflow |
| End Event | ◉ | Ending point of a workflow |
| User Task | 👤 | Task performed by a human user |
| Service Task | ⚙ | Automated service task |
| Exclusive Gateway | ◇ (X) | Decision gateway with mutually exclusive paths |
| Parallel Gateway | ◈ (+) | Gateway for parallel execution paths |

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Usage

### Creating a Workflow

1. **Add Elements**: Drag elements from the left panel onto the canvas
2. **Connect Elements**: Click and drag from a node's output handle to another node's input handle
3. **Edit Properties**: Click on any node or connection to edit its properties in the right panel
4. **Validate**: Click the "Validate" button to check BPMN compliance
5. **Export**: Click "Export XML" to download the BPMN file

### Node Properties

#### User Task
- **Label**: Display name
- **Assignee**: Task assignee expression (e.g., `${initiator}`)
- **Candidate Users**: List of candidate users
- **Candidate Groups**: List of candidate groups
- **Priority**: Task priority (1-10)
- **Due Date**: Due date expression

#### Service Task
- **Label**: Display name
- **Expression**: Service task expression
- **Delegate Expression**: Bean delegate expression
- **Class**: Java class name
- **Async**: Execute asynchronously

#### Gateway
- **Label**: Display name
- **Default Flow**: Default outgoing flow ID

### Sequence Flow Properties

- **Name**: Flow label
- **Condition**: Condition expression (for gateways)
- **Documentation**: Flow documentation

### Validation

The editor validates workflows for:
- Required start and end events
- Isolated nodes
- Self-loops
- Invalid connections

## Development

### Project Structure

```
src/
├── components/
│   ├── BpmnEditor/
│   │   ├── BpmnEditor.vue        # Main editor component
│   │   ├── ControlPanel.vue      # Element palette
│   │   ├── PropertyPanel.vue     # Property editor
│   │   └── PreviewModal.vue      # BPMN preview modal
│   └── nodes/
│       ├── StartEvent.vue
│       ├── EndEvent.vue
│       ├── UserTask.vue
│       ├── ServiceTask.vue
│       ├── ExclusiveGateway.vue
│       └── ParallelGateway.vue
├── composables/
│   ├── useBpmnEditor.ts          # Editor state management
│   ├── useBpmnConverter.ts       # XML conversion
│   └── useBpmnValidator.ts       # BPMN validation
├── types/
│   └── bpmn.ts                   # Type definitions
└── utils/
    └── bpmn-converter.ts         # BPMN XML converter
```

### Adding Custom Node Types

1. Create a new node component in `src/components/nodes/`
2. Define the node type in `src/types/bpmn.ts`
3. Add the node configuration to `BPMN_ELEMENT_CONFIGS`
4. Register the node in `BpmnEditor.vue`
5. Add the conversion logic in `bpmn-converter.ts`

### Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run

# Generate coverage report
npm run test:coverage
```

## BPMN Element Mapping

The editor maps vue-flow node types to BPMN 2.0 XML elements:

| vue-flow Type | BPMN Element | XML Tag |
|---------------|--------------|---------|
| `startEvent` | Start Event | `<bpmn:startEvent>` |
| `endEvent` | End Event | `<bpmn:endEvent>` |
| `userTask` | User Task | `<bpmn:userTask>` |
| `serviceTask` | Service Task | `<bpmn:serviceTask>` |
| `exclusiveGateway` | Exclusive Gateway | `<bpmn:exclusiveGateway>` |
| `parallelGateway` | Parallel Gateway | `<bpmn:parallelGateway>` |
| edge | Sequence Flow | `<bpmn:sequenceFlow>` |

## Export Format

The editor generates BPMN 2.0 XML with Flowable extensions. Example output:

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
  <bpmn:process id="my-process" name="My Process" version="1" isExecutable="true">
    <bpmn:startEvent id="bpmn-start1" name="Start"/>
    <bpmn:userTask id="bpmn-task1" name="Review">
      <flowable:assignee>${initiator}</flowable:assignee>
    </bpmn:userTask>
    <bpmn:endEvent id="bpmn-end1" name="End"/>
    <bpmn:sequenceFlow id="flow-edge1" sourceRef="bpmn-start1" targetRef="bpmn-task1"/>
    <bpmn:sequenceFlow id="flow-edge2" sourceRef="bpmn-task1" targetRef="bpmn-end1"/>
  </bpmn:process>
  <!-- BPMN DI information -->
</bpmn:definitions>
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
