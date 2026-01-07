# Proposal: Align BPMN DI Layout with bpmn-js

## Why
Users expect BPMN 2.0 XML files to render identically in vue-flow-bpm and bpmn-js. The current implementation only extracts node positions from BPMN DI but ignores edge waypoint information, resulting in incorrect edge routing for complex diagrams with multi-segment paths.

## What Changes
This change enhances BPMN 2.0 XML import/export to fully support Diagram Interchange (DI) layout information:

1. **Edge Waypoint Extraction** - Parse `<di:waypoint>` elements from `BPMNEdge` during import
2. **Multi-segment Path Rendering** - Convert waypoints to SVG paths for accurate edge visualization
3. **Waypoint Preservation** - Maintain original waypoint data through round-trip conversion
4. **Custom Edge Component** - Use stored paths instead of bezier curves for imported edges
5. **Enhanced Type Definitions** - Add `waypoints` and `path` properties to `BpmnEdgeData`
6. **Comprehensive Testing** - Unit and integration tests for waypoint handling

## Summary
Fix BPMN 2.0 XML import to correctly parse and render `<bpmndi:BPMNDiagram>` layout information, ensuring visual consistency with bpmn-js imported files. Currently, imported BPMN files display with incorrect node positions and edge routing compared to bpmn-js.

## Problem Statement

When importing BPMN 2.0 XML files, the layout differs from bpmn-js rendering due to incomplete handling of:

1. **BPMNShape bounds**: Node positions (`x`, `y`) and dimensions (`width`, `height`) from `<dc:Bounds>`
2. **BPMNEdge waypoints**: Multi-segment edge paths with multiple `<di:waypoint>` elements
3. **Edge routing**: Complex edge paths (e.g., the "reject" flows with 4 waypoints in ExpenseProcess.bpmn20.xml:84-88)

### Current Issues

In `src/utils/bpmn-importer.ts:176-211`:
- `extractDiInfo()` extracts node bounds correctly
- Edge DI information is stored but waypoints are **not** extracted or used
- In `extractDiInfo()` line 203: "Could store edge DI info if needed for waypoints" - this is a TODO

In `src/utils/bpmn-converter.ts:377-394`:
- Export generates only 2-point edges (source to target directly)
- Loses multi-segment waypoint information from original BPMN files

### Example from ExpenseProcess.bpmn20.xml

```xml
<bpmndi:BPMNEdge bpmnElement="directorNotPassFlow" id="BPMNEdge_directorNotPassFlow">
    <omgdi:waypoint x="785.0" y="110.0"></omgdi:waypoint>
    <omgdi:waypoint x="785.0" y="37.0"></omgdi:waypoint>
    <omgdi:waypoint x="455.0" y="37.0"></omgdi:waypoint>
    <omgdi:waypoint x="455.0" y="110.0"></omgdi:waypoint>
</bpmndi:BPMNEdge>
```

This edge has 4 waypoints creating a "U-shaped" path around other elements. Current implementation only connects start to end directly.

## Proposed Solution

### 1. Enhance Edge DI Extraction (`bpmn-importer.ts`)

Extract and store all waypoints from `BPMNEdge` elements:

```typescript
interface EdgeDiInfo {
  id: string
  bpmnElement: string
  waypoints: Array<{ x: number; y: number }>
}
```

### 2. Add Vue Flow Edge Path Support

Vue Flow supports custom edge paths via `path` property. Convert BPMN waypoints to SVG path commands.

### 3. Preserve Waypoints on Export (`bpmn-converter.ts`)

When exporting, if edge has stored waypoint data, preserve it instead of calculating simple start-end path.

## Scope

### In Scope
- Parse `BPMNEdge` waypoints during import
- Store waypoint data in edge metadata
- Render edges using waypoint paths in Vue Flow
- Export waypoints back to BPMN XML

### Out of Scope
- Automatic layout calculation (handled by Vue Flow's default behavior)
- Edge routing optimization (preserve original BPMN routing)
- Label positioning on edges (future enhancement)

## Alternatives Considered

1. **Auto-layout only**: Ignore BPMN DI, let Vue Flow calculate positions
   - *Rejected*: Loses original layout intent, user experience differs from bpmn-js

2. **Use bpmn-js for rendering**: Embed bpmn-js viewer alongside vue-flow
   - *Rejected*: Adds dependency weight, complicates architecture

3. **Partial waypoint support**: Only extract first/last waypoints
   - *Rejected*: Loses multi-segment path information critical for complex diagrams

## Related Changes

- Depends on: `bpmn-xml-import` spec (already implemented)
- May affect: `bpmn-conversion` spec (edge export behavior)
- Test coverage: Update existing BPMN import tests

## Success Criteria

1. Import ExpenseProcess.bpmn20.xml and verify:
   - Nodes match bpmn-js positions exactly
   - Edges follow same multi-segment paths
   - "Reject" flows route around elements as intended

2. Round-trip test: Import → Export → Import produces identical layout

3. No regressions in existing BPMN import/export functionality
