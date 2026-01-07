# Design: BPMN DI Layout Alignment

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      BPMN XML Import                             │
│  <bpmndi:BPMNShape> → Node bounds (x, y, width, height)         │
│  <bpmndi:BPMNEdge> → Waypoint list [{x, y}, {x, y}, ...]        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Internal Data Model                          │
│  BpmnNode: position = { x, y }, data = { width, height }        │
│  BpmnEdge: data = { waypoints: [{x, y}, ...], path: "d..." }    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Vue Flow Rendering                         │
│  Node: uses position directly                                    │
│  Edge: custom edge component with path from waypoints            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BPMN XML Export                            │
│  <dc:Bounds> from node.position & node.data                      │
│  <di:waypoint> list from edge.data.waypoints (if preserved)     │
└─────────────────────────────────────────────────────────────────┘
```

## Data Model Changes

### Edge Extensions

```typescript
// src/types/bpmn.ts
interface BpmnEdgeData {
  label?: string
  name?: string
  condition?: string
  documentation?: string

  // NEW: BPMN DI path information
  waypoints?: Array<{ x: number; y: number }>
  path?: string  // SVG path d attribute (computed from waypoints)
}
```

### DI Info Storage

```typescript
// Internal to bpmn-importer.ts
interface EdgeDiInfo {
  id: string
  bpmnElement: string
  waypoints: Array<{ x: number; y: number }>
}

interface DiInfo {
  id: string
  bpmnElement: string
  bounds?: { x: number; y: number; width: number; height: number }
  isExpanded?: boolean

  // For edges, store waypoints
  waypoints?: Array<{ x: number; y: number }>
}
```

## Component Changes

### 1. Import Pipeline (`bpmn-importer.ts`)

```typescript
// extractDiInfo - ENHANCED for edges
function extractDiInfo(definitions: any): Map<string, DiInfo> {
  const diMap = new Map<string, DiInfo>()

  const diagrams = definitions.diagrams || []
  diagrams.forEach((diagram: any) => {
    const plane = diagram.plane

    // Extract shapes (existing code)
    const shapes = plane.shapes || []
    shapes.forEach((shape: any) => {
      const bounds = shape.bounds
      diMap.set(shape.bpmnElement?.id, {
        id: shape.id,
        bpmnElement: shape.bpmnElement?.id,
        bounds: bounds ? {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height
        } : undefined,
        isExpanded: shape.isExpanded === true
      })
    })

    // Extract edges with waypoints - NEW
    const edges = plane.edges || []
    edges.forEach((edge: any) => {
      const waypoints = edge.waypoint || []
      const parsedWaypoints = waypoints.map((wp: any) => ({
        x: wp.x,
        y: wp.y
      }))

      diMap.set(edge.bpmnElement?.id, {
        id: edge.id,
        bpmnElement: edge.bpmnElement?.id,
        waypoints: parsedWaypoints
      })
    })
  })

  return diMap
}
```

### 2. Edge Conversion with Waypoints

```typescript
// convertSequenceFlowsToEdges - ENHANCED
function convertSequenceFlowsToEdges(
  sequenceFlows: any[],
  subProcessInfoMap: Map<string, any>,
  diInfos: Map<string, DiInfo>  // ADD parameter
): BpmnEdge[] {
  return sequenceFlows.map(flow => {
    // ... existing source/target resolution ...

    const data: BpmnEdgeData = {
      label: flow.name || '',
      name: flow.name || '',
      documentation: flow.documentation
    }

    // Extract condition expression (existing)
    if (flow.conditionExpression) {
      data.condition = flow.conditionExpression.body || flow.conditionExpression.text || ''
    }

    // NEW: Extract waypoints from DI
    const diInfo = diInfos.get(flow.id)
    if (diInfo?.waypoints && diInfo.waypoints.length >= 2) {
      data.waypoints = diInfo.waypoints
      data.path = waypointsToSvgPath(diInfo.waypoints)
    }

    return {
      id: flow.id,
      source: sourceId,
      target: targetId,
      data,
      type: 'default',
      animated: false
    }
  })
}

// NEW: Convert waypoints to SVG path
function waypointsToSvgPath(waypoints: Array<{x: number, y: number}>): string {
  if (waypoints.length === 0) return ''

  const [first, ...rest] = waypoints
  let d = `M ${first.x} ${first.y}`

  for (const wp of rest) {
    d += ` L ${wp.x} ${wp.y}`
  }

  return d
}
```

### 3. Custom Edge Component

```typescript
// src/components/edges/BpmnEdge.vue
<template>
  <BaseEdge
    :path="edgePath"
    :marker-end="markerEnd"
    :style="edgeStyle"
  />
</template>

<script setup lang="ts">
import { BaseEdge, getBezierPath } from '@vue-flow/core'
import { computed } from 'vue'
import type { EdgeProps } from '@vue-flow/core'

const props = defineProps<EdgeProps>()

// Use stored path from waypoints, or fall back to bezier
const edgePath = computed(() => {
  // If edge has stored path from BPMN waypoints, use it
  if (props.data.path) {
    return props.data.path
  }

  // Otherwise, use default bezier curve calculation
  const [path] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  })

  return path
})

const edgeStyle = computed(() => ({
  strokeWidth: 2,
  stroke: '#bdc3c7',
}))
</script>
```

### 4. Export with Waypoint Preservation

```typescript
// bpmn-converter.ts - ENHANCED edge export
'bpmndi:BPMNEdge': edges.map(edge => {
  const edgeData = edge.data || {}

  // If edge has stored waypoints from original import, preserve them
  const waypoints = edgeData.waypoints

  if (waypoints && waypoints.length >= 2) {
    // Use original waypoints
    return {
      '@id': `edge-${edge.id}`,
      '@bpmnElement': generateFlowId(edge.id),
      'di:waypoint': waypoints.map((wp: {x: number, y: number}) => ({
        '@x': wp.x,
        '@y': wp.y
      }))
    }
  } else {
    // Calculate simple start-end path (existing behavior)
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)
    const sourceX = (sourceNode?.position?.x || 0) + (sourceNode?.data?.width || 120)
    const sourceY = (sourceNode?.position?.y || 0) + ((sourceNode?.data?.height || 80) / 2)
    const targetX = targetNode?.position?.x || 0
    const targetY = (targetNode?.position?.y || 0) + ((targetNode?.data?.height || 80) / 2)

    return {
      '@id': `edge-${edge.id}`,
      '@bpmnElement': generateFlowId(edge.id),
      'di:waypoint': [
        { '@x': sourceX, '@y': sourceY },
        { '@x': targetX, '@y': targetY }
      ]
    }
  }
})
```

## Implementation Strategy

### Phase 1: Import Enhancement
1. Modify `extractDiInfo()` to parse edge waypoints
2. Update `convertSequenceFlowsToEdges()` to use waypoints
3. Add `waypointsToSvgPath()` utility function

### Phase 2: Rendering Support
4. Create or enhance custom edge component to use waypoint paths
5. Ensure edges render correctly with preserved paths

### Phase 3: Export Preservation
6. Modify `generateBpmnXml()` to preserve waypoints on export
7. Handle edges without waypoints (use existing calculation)

### Phase 4: Testing
8. Add tests for waypoint extraction and rendering
9. Round-trip test with ExpenseProcess.bpmn20.xml
10. Visual comparison with bpmn-js output

## Trade-offs

1. **Memory overhead**: Storing waypoints for all edges
   - Mitigation: Waypoints are small objects (2 numbers each), typically 2-6 per edge

2. **Edge editing complexity**: If user manually routes edges in Vue Flow
   - Current scope: Focus on import/export preservation
   - Future: Could compute waypoints from Vue Flow's internal edge path

3. **Namespace differences**: BPMN files may use `omgdi:waypoint` or `di:waypoint`
   - Solution: Handle both in moddle parsing (moddle normalizes namespaces)

## Testing Strategy

### Unit Tests
- `extractDiInfo()` verifies waypoint extraction
- `waypointsToSvgPath()` path generation correctness
- Edge data structure contains waypoints after import

### Integration Tests
- Import ExpenseProcess.bpmn20.xml
- Verify all 9 edges have correct waypoints
- Verify 4-waypoint edge (directorNotPassFlow) renders correctly

### Visual Regression Tests
- Compare vue-flow render with bpmn-js render
- Use screenshot comparison for key diagrams

### Round-trip Tests
- Import → Export → Import
- Assert waypoints are preserved
- Assert generated XML matches original structure
