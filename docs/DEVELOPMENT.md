# Development Guide

This guide is for developers who want to extend or modify the BPMN Editor.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Architecture](#architecture)
3. [Directory Structure](#directory-structure)
4. [Key Concepts](#key-concepts)
5. [Extending the Editor](#extending-the-editor)
6. [Testing](#testing)
7. [Building](#building)

## Project Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd vue-flow-bpm

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## Architecture

### Technology Stack

| Technology | Purpose |
|------------|---------|
| Vue 3 | Frontend framework |
| TypeScript | Type safety |
| Vite | Build tool |
| vue-flow | Flow chart library |
| bpmn-js | BPMN validation and preview |
| xmlbuilder2 | XML generation |
| Vitest | Testing framework |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Application Layer                        │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────────┐ │
│  │ BpmnEditor    │  │ ControlPanel  │  │   PropertyPanel     │ │
│  │   (Main UI)   │  │ (Palette)     │  │   (Form Editor)     │ │
│  └───────┬───────┘  └───────┬───────┘  └──────────┬──────────┘ │
│          │                  │                      │            │
└──────────┼──────────────────┼──────────────────────┼───────────┘
           │                  │                      │
┌──────────┼──────────────────┼──────────────────────┼───────────┐
│          │         State Management Layer           │            │
│  ┌───────▼──────────────────────────────────────────▼───────┐  │
│  │              useBpmnEditor (Composable)                   │  │
│  │  • Nodes state      • Edges state      • Selection        │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │ useBpmnConverter│  │useBpmnValidator │  │  Node Types    │  │
│  └────────────────┘  └─────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
           │                  │                      │
┌──────────┼──────────────────┼──────────────────────┼───────────┐
│          │            Utility Layer                  │            │
│  ┌───────▼──────────────────────────────────────────▼───────┐  │
│  │            bpmn-converter.ts                            │  │
│  │  • Node to BPMN element  • Edge to sequence flow        │  │
│  │  • XML generation         • Validation                  │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── components/
│   ├── BpmnEditor/
│   │   ├── BpmnEditor.vue        # Main editor canvas
│   │   ├── ControlPanel.vue      # Node palette
│   │   ├── PropertyPanel.vue     # Property editor
│   │   ├── PreviewModal.vue      # BPMN preview
│   │   ├── ContextMenu.vue       # Right-click menu
│   │   └── properties/           # Property forms
│   │       ├── CommonProperties.vue
│   │       ├── UserTaskProperties.vue
│   │       ├── ServiceTaskProperties.vue
│   │       ├── GatewayProperties.vue
│   │       ├── SequenceFlowProperties.vue
│   │       ├── EventProperties.vue
│   │       ├── ListenerConfig.vue
│   │       └── MultiInstanceConfig.vue
│   └── nodes/                    # Custom node components
│       ├── StartEvent.vue
│       ├── EndEvent.vue
│       ├── UserTask.vue
│       ├── ServiceTask.vue
│       ├── ExclusiveGateway.vue
│       └── ParallelGateway.vue
├── composables/
│   ├── useBpmnEditor.ts          # Editor state management
│   ├── useBpmnConverter.ts       # XML export composable
│   └── useBpmnValidator.ts       # BPMN validation composable
├── types/
│   ├── bpmn.ts                   # BPMN type definitions
│   └── vue-flow.d.ts             # Vue Flow extensions
├── utils/
│   └── bpmn-converter.ts         # BPMN XML conversion logic
├── App.vue                       # Root component
└── main.ts                       # Application entry

docs/                             # Documentation
├── USAGE.md                      # User guide
├── ELEMENT_MAPPING.md            # BPMN element reference
└── DEVELOPMENT.md                # This file

tests/                            # Test files
└── bpmn-converter.test.ts        # Converter unit tests
```

## Key Concepts

### Node Types

Nodes are the building blocks of BPMN workflows. Each node type:

1. **Visual Component**: Vue component in `src/components/nodes/`
2. **Type Definition**: Defined in `BPMN_ELEMENT_CONFIGS`
3. **Conversion Logic**: Mapped in `bpmn-converter.ts`

### Node Data Structure

```typescript
interface BpmnNode {
  id: string              // Unique identifier
  type: string            // Node type (startEvent, userTask, etc.)
  position?: {            // Canvas position
    x: number
    y: number
  }
  data: BpmnNodeData      // Node properties
}

interface BpmnNodeData {
  label: string           // Display name
  width?: number          // Visual width
  height?: number         // Visual height
  // ... type-specific properties
}
```

### Edge Data Structure

```typescript
interface BpmnEdge {
  id: string              // Unique identifier
  source: string          // Source node ID
  target: string          // Target node ID
  type?: string           // Edge type (default: default)
  data: BpmnEdgeData      // Edge properties
}

interface BpmnEdgeData {
  condition?: string      // Condition expression
  label?: string          // Display label
  name?: string           // Flow name
  documentation?: string  // Flow description
}
```

### Composables

The editor uses Vue 3 composables for state management:

#### useBpmnEditor

Main editor state management:

```typescript
const {
  nodes,           // Ref<BpmnNode[]> - All nodes
  edges,           // Ref<BpmnEdge[]> - All edges
  processInfo,     // Ref<BpmnProcess> - Process metadata
  selectedNodeId,  // Ref<string | null> - Selected node
  selectedEdgeId,  // Ref<string | null> - Selected edge
  addNode,         // (type, position) => void
  deleteNode,      // (id) => void
  updateNode,      // (id, data) => void
  addEdge,         // (edge) => void
  deleteEdge,      // (id) => void
  selectNode,      // (id) => void
  selectEdge,      // (id) => void
  clearSelection,  // () => void
  loadFromJson,    // (json) => void
  exportToJson     // () => string
} = useBpmnEditor()
```

#### useBpmnConverter

BPMN XML conversion:

```typescript
const {
  isConverting,         // Ref<boolean> - Conversion state
  conversionError,      // Ref<string | null> - Error message
  convertToBpmnXml,     // (workflow) => Promise<string>
  validateAndConvert,   // (nodes, edges) => Promise<string | null>
  downloadBpmnFile      // (xml, filename) => void
} = useBpmnConverter()
```

#### useBpmnValidator

BPMN validation using bpmn-js:

```typescript
const {
  isValidating,         // Ref<boolean> - Validation state
  isValid,              // Ref<boolean> - Validation result
  validationErrors,     // Ref<ValidationError[]> - Error list
  containerRef,         // Ref<HTMLElement> - Preview container
  validateBpmnXml,      // (xml) => Promise<boolean>
  highlightElement,     // (elementId) => void
  clearHighlights,      // () => void
  fitViewport,          // () => void
  destroyViewer         // () => void - Cleanup
} = useBpmnValidator()
```

## Extending the Editor

### Adding a New Node Type

#### Step 1: Define the Type

In `src/types/bpmn.ts`:

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

#### Step 2: Add Configuration

In `src/types/bpmn.ts`:

```typescript
export const BPMN_ELEMENT_CONFIGS: Record<BpmnElementType, BpmnElementConfig> = {
  // ... existing configs
  scriptTask: {
    type: 'scriptTask',
    label: 'Script Task',
    icon: '📜',
    description: 'Execute a script',
    defaultSize: { width: 120, height: 80 }
  }
}
```

#### Step 3: Create Node Component

Create `src/components/nodes/ScriptTask.vue`:

```vue
<template>
  <div class="script-task-node" :style="nodeStyle">
    <div class="icon">📜</div>
    <Handle type="target" :position="Position.Left" />
    <div class="label">{{ data.label }}</div>
    <Handle type="source" :position="Position.Right" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
import type { BpmnNodeData } from '@/types/bpmn'

interface Props extends NodeProps {
  data: BpmnNodeData
}

const props = defineProps<Props>()

const nodeStyle = computed(() => ({
  width: `${props.data.width || 120}px`,
  height: `${props.data.height || 80}px`
}))
</script>

<style scoped>
.script-task-node {
  /* Styles for the node */
}
</style>
```

#### Step 4: Register Node Type

In `src/components/BpmnEditor/BpmnEditor.vue`:

```typescript
import ScriptTask from '@/components/nodes/ScriptTask.vue'

const nodeTypes = {
  startEvent: StartEvent,
  endEvent: EndEvent,
  userTask: UserTask,
  serviceTask: ServiceTask,
  exclusiveGateway: ExclusiveGateway,
  parallelGateway: ParallelGateway,
  scriptTask: ScriptTask  // Add new type
}
```

#### Step 5: Add Conversion Logic

In `src/utils/bpmn-converter.ts`:

```typescript
const NODE_TYPE_MAPPING: Record<BpmnElementType, string> = {
  // ... existing mappings
  scriptTask: 'bpmn:scriptTask'
}

// Add conversion logic in convertNodeToBpmnElement
if (node.type === 'scriptTask') {
  if (node.data.scriptFormat) {
    element['bpmn:scriptFormat'] = node.data.scriptFormat
  }
  if (node.data.script) {
    element['bpmn:script'] = node.data.script
  }
}
```

#### Step 6: Create Property Panel

Create `src/components/BpmnEditor/properties/ScriptTaskProperties.vue`:

```vue
<template>
  <div class="script-task-properties">
    <CommonProperties :node="node" @update="handleUpdate" />

    <h3>Script Task Properties</h3>
    <div class="form-group">
      <label>Script Format</label>
      <select v-model="localData.scriptFormat" @change="handleChange">
        <option value="groovy">Groovy</option>
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
      </select>
    </div>

    <div class="form-group">
      <label>Script</label>
      <textarea v-model="localData.script" @input="handleChange" rows="10" />
    </div>
  </div>
</template>

<script setup lang="ts">
import CommonProperties from './CommonProperties.vue'
import type { BpmnNode } from '@/types/bpmn'

const props = defineProps<{
  node: BpmnNode
}>()

const emit = defineEmits<{
  update: [data: Partial<BpmnNode['data']]>
}>()
</script>
```

### Adding Custom Properties

To add a new property to an existing node type:

1. Update the `BpmnNodeData` interface in `src/types/bpmn.ts`
2. Add form controls to the property panel component
3. Add conversion logic in `bpmn-converter.ts`
4. Update tests to cover the new property

### Custom Validation Rules

To add custom validation rules:

1. Add the rule to `validateWorkflow()` in `src/utils/bpmn-converter.ts`:

```typescript
export function validateWorkflow(nodes: BpmnNode[], edges: BpmnEdge[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // ... existing validation

  // Custom rule: Maximum one start event
  const startEvents = nodes.filter(n => n.type === 'startEvent')
  if (startEvents.length > 1) {
    errors.push('Workflow should have only one start event')
  }

  return { valid: errors.length === 0, errors }
}
```

2. Add tests for the new rule

## Testing

### Unit Tests

Located in `src/utils/bpmn-converter.test.ts`:

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

### Adding Tests

Example test:

```typescript
import { describe, it, expect } from 'vitest'
import { generateBpmnXml } from './bpmn-converter'

describe('Custom Feature', () => {
  it('should handle new node type', () => {
    const workflow = {
      process: { id: 'test', name: 'Test', version: 1 },
      nodes: [{
        id: 'script1',
        type: 'scriptTask',
        position: { x: 100, y: 100 },
        data: { label: 'Script', script: 'println("Hello")' }
      }],
      edges: []
    }

    const xml = generateBpmnXml(workflow)
    expect(xml).toContain('<bpmn:scriptTask')
    expect(xml).toContain('println("Hello")')
  })
})
```

### Manual Testing

```bash
# Start dev server
npm run dev

# Open browser to http://localhost:3001

# Test workflow:
# 1. Create nodes
# 2. Connect nodes
# 3. Edit properties
# 4. Validate
# 5. Export XML
# 6. Import to Flowable
```

## Building

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

Output is in `dist/` directory.

### Type Checking

```bash
npm run build:check
```

This runs `vue-tsc` before building to catch type errors.

## Debugging

### Vue DevTools

Install Vue DevTools browser extension for component inspection.

### Console Logging

```typescript
console.log('Nodes:', nodes.value)
console.log('Edges:', edges.value)
console.log('Selected:', selectedNodeId.value)
```

### Breakpoints

Use your IDE's debugger with sourcemaps enabled.

## Performance Considerations

1. **Large Workflows**: For workflows with 100+ nodes, consider:
   - Lazy loading property panels
   - Virtual scrolling for node lists
   - Debouncing validation

2. **Frequent Updates**: Use computed properties and watchers efficiently

3. **Memory Management**:
   - Clean up bpmn-js viewer instances
   - Remove event listeners on unmount
   - Use `shallowRef` for large objects

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run `npm run build:check`
6. Submit a pull request

## Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [vue-flow Documentation](https://vueflow.dev/)
- [BPMN 2.0 Specification](https://www.omg.org/spec/BPMN/2.0/)
- [Flowable Documentation](https://flowable.com/open-source/docs/)
- [xmlbuilder2 Documentation](https://www.npmjs.com/package/xmlbuilder2)
