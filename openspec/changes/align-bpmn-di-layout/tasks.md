# Tasks: Align BPMN DI Layout with bpmn-js

## Implementation Tasks

### Phase 1: Type Definitions
- [x] Add `waypoints` and `path` to `BpmnEdgeData` interface in `src/types/bpmn.ts`
- [x] Update `DiInfo` interface in `src/utils/bpmn-importer.ts` to include waypoints
- [x] Add `EdgeDiInfo` type for edge-specific DI information

### Phase 2: Import Enhancement
- [x] Modify `extractDiInfo()` in `bpmn-importer.ts` to parse edge waypoints from `BPMNEdge` elements
- [x] Update `extractDiInfo()` to handle both `omgdi:waypoint` and `di:waypoint` namespaces
- [x] Pass `diInfos` map to `convertSequenceFlowsToEdges()` function
- [x] Update `convertSequenceFlowsToEdges()` to extract waypoints from DI info and store in edge data
- [x] Create `waypointsToSvgPath()` utility function to convert waypoints to SVG path string

### Phase 3: Edge Rendering
- [x] Create `src/components/edges/BpmnEdge.vue` custom edge component
- [x] Implement edge path logic: use stored `path` from waypoints, fall back to bezier calculation
- [x] Register `BpmnEdge` component in `BpmnEditor.vue` edge types
- [x] Update Vue Flow configuration to use custom edge type as default

### Phase 4: Export Enhancement
- [x] Modify `generateBpmnXml()` in `bpmn-converter.ts` to preserve waypoints on export
- [x] For edges with stored waypoints: use original waypoint list
- [x] For edges without waypoints: use existing start-end calculation
- [x] Ensure waypoint namespace uses correct prefix (`di:waypoint` or `omgdi:waypoint`)

### Phase 5: Testing
- [x] Add unit test for `extractDiInfo()` waypoint extraction
- [x] Add unit test for `waypointsToSvgPath()` path generation
- [ ] Add integration test importing ExpenseProcess.bpmn20.xml with all edge waypoints
- [ ] Add test verifying 4-waypoint edge (directorNotPassFlow) renders correctly
- [ ] Add round-trip test: Import → Export → Import preserves waypoints
- [ ] Visual regression test comparing with bpmn-js rendering

### Phase 6: Documentation
- [x] Update `src/utils/bpmn-importer.ts` JSDoc for waypoint handling
- [ ] Update `src/utils/bpmn-converter.ts` JSDoc for waypoint preservation
- [ ] Document edge data structure in types documentation

## Task Breakdown by File

### `src/types/bpmn.ts`
- [x] Extend `BpmnEdgeData` interface with waypoints and path properties

### `src/utils/bpmn-importer.ts`
- [x] Update `DiInfo` interface (internal)
- [x] Modify `extractDiInfo()` to extract edge waypoints
- [x] Modify `convertSequenceFlowsToEdges()` to use diInfos and populate waypoints
- [x] Add `waypointsToSvgPath()` utility function
- [x] Update JSDoc comments

### `src/utils/bpmn-converter.ts`
- [x] Modify BPMNEdge generation in `generateBpmnXml()` to preserve waypoints
- [ ] Update JSDoc comments

### `src/components/edges/BpmnEdge.vue` (NEW)
- [x] Create custom edge component
- [x] Implement path selection logic (stored path vs bezier)
- [x] Style edge to match BPMN standards

### `src/components/BpmnEditor/BpmnEditor.vue`
- [x] Import and register `BpmnEdge` component
- [x] Add to `edgeTypes` configuration

### Tests
- [x] `tests/utils/bpmn-importer.test.ts`: Add waypoint extraction tests
- [ ] `tests/integration/bpmn-di-layout.test.ts`: Create new integration test file
- [x] `tests/fixtures/bpmn20/`: Ensure ExpenseProcess.bpmn20.xml is available

## Dependencies

- Must complete after: existing `bpmn-xml-import` changes
- Must complete before: any edge routing enhancements
- Parallel work: Node positioning (already working correctly)

## Validation Criteria

Each task should be verified by:
1. Unit tests passing
2. Integration tests passing
3. Visual inspection against bpmn-js reference
4. Round-trip preservation verified

## Estimated Complexity

- Phase 1 (Types): 3 tasks, ~15 minutes **COMPLETED**
- Phase 2 (Import): 5 tasks, ~2 hours **COMPLETED**
- Phase 3 (Rendering): 4 tasks, ~2 hours **COMPLETED**
- Phase 4 (Export): 4 tasks, ~1.5 hours **COMPLETED**
- Phase 5 (Testing): 6 tasks, ~3 hours **PARTIALLY COMPLETED** (unit tests done, integration tests pending)
- Phase 6 (Documentation): 3 tasks, ~1 hour **PARTIALLY COMPLETED**

**Total**: 25 tasks, ~10 hours of development time
**Status**: Core implementation complete, additional integration tests and documentation updates pending
