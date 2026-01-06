# Fixture Creation Guide

This guide explains how to create and validate BPMN test fixtures for vue-flow-bpm.

## Overview

Test fixtures come in pairs:
- `.json` - vue-flow workflow format
- `.bpmn.xml` - BPMN 2.0 XML format

Both files should represent the same workflow for round-trip testing.

## Fixture Structure

```
tests/fixtures/
├── simple/           # Basic workflow patterns
├── complex/          # Complex workflow patterns
└── edge-cases/       # Edge cases and stress tests
```

## Creating New Fixtures

### Method 1: Manual JSON + Export

1. **Create the JSON file:**

```json
{
  "process": {
    "id": "my-process",
    "name": "My Process",
    "version": 1,
    "executable": true
  },
  "nodes": [
    {
      "id": "start-1",
      "type": "startEvent",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Start",
        "width": 50,
        "height": 50
      }
    },
    {
      "id": "task-1",
      "type": "userTask",
      "position": { "x": 250, "y": 100 },
      "data": {
        "label": "My Task",
        "assignee": "${user}",
        "width": 120,
        "height": 80
      }
    },
    {
      "id": "end-1",
      "type": "endEvent",
      "position": { "x": 400, "y": 100 },
      "data": {
        "label": "End",
        "width": 50,
        "height": 50
      }
    }
  ],
  "edges": [
    {
      "id": "flow-1",
      "source": "start-1",
      "target": "task-1",
      "data": {},
      "type": "default"
    },
    {
      "id": "flow-2",
      "source": "task-1",
      "target": "end-1",
      "data": {},
      "type": "default"
    }
  ]
}
```

2. **Generate BPMN XML:**

```bash
npx tsx scripts/generate-bpmn-fixture.ts tests/fixtures/simple/my-flow.json
```

3. **Validate the pair:**

```bash
npx tsx scripts/validate-fixture-pair.ts \
  tests/fixtures/simple/my-flow.json \
  tests/fixtures/simple/my-flow.bpmn.xml
```

### Method 2: Using BPMN Tool

1. **Create workflow in Camunda Modeler** (or similar)
2. **Export as BPMN XML**
3. **Create JSON manually** to match the XML
4. **Validate the pair**

### Method 3: Programmatic Generation

For complex or large fixtures, use scripts:

```typescript
// scripts/generate-custom-fixture.ts
import { writeFileSync } from 'fs'

const nodes = []
const edges = []

// Generate nodes programmatically
for (let i = 0; i < 50; i++) {
  nodes.push({
    id: `node-${i}`,
    type: i === 0 ? 'startEvent' : i === 49 ? 'endEvent' : 'userTask',
    position: { x: i * 100, y: 100 },
    data: { label: `Node ${i}`, width: 100, height: 80 }
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

const workflow = {
  process: { id: 'auto-generated', name: 'Auto Generated', version: 1 },
  nodes,
  edges
}

writeFileSync('tests/fixtures/custom/auto-generated.json', JSON.stringify(workflow, null, 2))
```

## Validation Checklist

### JSON Validation

- [ ] Valid JSON format
- [ ] Has `process` object with `id`, `name`, `version`
- [ ] All nodes have unique `id`
- [ ] All edges have unique `id`
- [ ] All edge `source` and `target` reference valid node IDs
- [ ] Nodes have required `data` properties (label, width, height)
- [ ] Positions are reasonable (not negative, not overlapping)

### BPMN XML Validation

- [ ] Valid XML format
- [ ] Has correct namespace declarations
- [ ] Has `definitions` and `process` elements
- [ ] Process ID matches JSON
- [ ] All nodes are present in BPMN
- [ ] All sequence flows are present in BPMN
- [ ] Gateway default flows marked (if applicable)
- [ ] Condition expressions properly formatted

### Pair Validation

- [ ] Node count matches between JSON and BPMN
- [ ] Edge count matches between JSON and BPMN
- [ ] All node IDs exist in both files
- [ ] All edge IDs exist in both files
- [ ] Node labels match
- [ ] Edge conditions match (if any)

## Best Practices

### Naming Conventions

- Use kebab-case for filenames: `my-workflow.json`
- Use descriptive names: `parallel-merge` not `test-3`
- Include category in directory: `simple/`, `complex/`, `edge-cases/`

### ID Conventions

- Use consistent prefixes: `start-1`, `task-1`, `gateway-1`, `end-1`
- Make IDs meaningful: not `node-123` but `review-task`
- Keep IDs unique across the workflow

### Positioning

- Space nodes reasonably (100-200px apart)
- Keep layout organized (left to right, top to bottom)
- Avoid overlapping nodes
- Consider DI bounds for proper rendering

### Content

- **Simple fixtures:** Focus on single patterns (gateway, loop, etc.)
- **Complex fixtures:** Combine multiple patterns realistically
- **Edge cases:** Test limits (max strings, special chars, large counts)

## Common Patterns

### Linear Flow

```json
{
  "nodes": [
    { "id": "start-1", "type": "startEvent", ... },
    { "id": "task-1", "type": "userTask", ... },
    { "id": "end-1", "type": "endEvent", ... }
  ],
  "edges": [
    { "source": "start-1", "target": "task-1" },
    { "source": "task-1", "target": "end-1" }
  ]
}
```

### Gateway Branching

```json
{
  "nodes": [
    { "id": "start-1", "type": "startEvent" },
    { "id": "gateway-1", "type": "exclusiveGateway" },
    { "id": "task-a", "type": "userTask" },
    { "id": "task-b", "type": "userTask" },
    { "id": "end-1", "type": "endEvent" }
  ],
  "edges": [
    { "source": "start-1", "target": "gateway-1" },
    { "source": "gateway-1", "target": "task-a", "data": { "condition": "${approved}" } },
    { "source": "gateway-1", "target": "task-b", "data": { "condition": "${!approved}" } },
    { "source": "task-a", "target": "end-1" },
    { "source": "task-b", "target": "end-1" }
  ]
}
```

### Parallel Split and Merge

```json
{
  "nodes": [
    { "id": "start-1", "type": "startEvent" },
    { "id": "fork", "type": "parallelGateway" },
    { "id": "task-1", "type": "userTask" },
    { "id": "task-2", "type": "userTask" },
    { "id": "task-3", "type": "userTask" },
    { "id": "merge", "type": "parallelGateway" },
    { "id": "end-1", "type": "endEvent" }
  ],
  "edges": [
    { "source": "start-1", "target": "fork" },
    { "source": "fork", "target": "task-1" },
    { "source": "fork", "target": "task-2" },
    { "source": "fork", "target": "task-3" },
    { "source": "task-1", "target": "merge" },
    { "source": "task-2", "target": "merge" },
    { "source": "task-3", "target": "merge" },
    { "source": "merge", "target": "end-1" }
  ]
}
```

## Testing Fixtures

After creating fixtures:

1. **Run converter tests:**
```bash
npm run test:run -- src/utils/bpmn-converter.test.ts
```

2. **Test with Testing Page:**
   - Open Testing Page in browser
   - Upload the JSON file
   - Verify BPMN XML is generated
   - Download BPMN and verify in external tool

3. **Test round-trip:**
   - Export JSON → BPMN
   - Import BPMN → JSON
   - Compare original and final JSON

## Troubleshooting

### BPMN XML Generation Fails

**Check:**
- JSON format is valid
- Node types are supported
- Edge sources/targets exist
- No duplicate IDs

### Import Fails

**Check:**
- BPMN XML is valid
- Namespaces are correct
- All required attributes present
- Element types are supported

### Validation Fails

**Check:**
- Node IDs match between files
- Edge IDs match between files
- Node count is the same
- Edge count is the same

## Adding Fixtures to Tests

After creating and validating fixtures:

1. **Update test helpers:**

```typescript
// tests/helpers/bpmnjs-test-helpers.ts
export function listFixtures(): string[] {
  return [
    // ... existing fixtures
    'tests/fixtures/simple/my-new-flow.json',
    'tests/fixtures/simple/my-new-flow.bpmn.xml'
  ]
}
```

2. **Add tests:**

```typescript
// tests/integration/bpmn-roundtrip.test.ts
describe('My New Fixture', () => {
  it('should handle my-new-flow fixture', async () => {
    const json = await loadJsonFixture('/tests/fixtures/simple/my-new-flow.json')
    // Test logic...
  })
})
```

## Resources

- [BPMN 2.0 Specification](https://www.omg.org/spec/BPMN/2.0/)
- [Camunda Modeler](https://camunda.com/download/modeler/)
- [BPMN.io](https://bpmn.io/)
- [vue-flow Documentation](https://vueflow.dev/)
