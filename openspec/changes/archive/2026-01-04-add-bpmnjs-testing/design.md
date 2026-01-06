# Design: BPMN.js Testing Suite with Bidirectional Conversion

## Context

### Current State
- vue-flow-bpm editor exports BPMN 2.0 XML from vue-flow JSON
- bpmn-js NavigatedViewer used for validation preview
- Existing tests cover XML export (36 passing tests in `bpmn-converter.test.ts`)
- No import functionality exists
- No comprehensive BPMN.js integration tests

### Goals
1. Enable round-trip conversion (JSON ↔ XML) for testing
2. Provide comprehensive BPMN compliance validation
3. Create reusable test fixtures for future development
4. Offer both standalone testing page and integrated preview

### Non-Goals
- Full BPMN modeler (bpmn-js Modeler) - stick to NavigatedViewer for preview
- Editing capabilities in bpmn-js view - read-only preview
- Support for all BPMN 2.0 elements - focus on currently supported 6 types
- Production-grade import for end users - this is primarily for testing/validation

## Constraints

### Technical Constraints
- Must use existing bpmn-js dependency (v17.x)
- Must not break existing export functionality
- Must maintain vue-flow JSON structure compatibility
- Test suite must run in reasonable time (<30s total)

### BPMN 2.0 Constraints
Currently supported elements (must maintain):
- StartEvent, EndEvent
- UserTask, ServiceTask
- ExclusiveGateway, ParallelGateway
- SequenceFlow with conditions

### Browser Constraints
- bpmn-js requires DOM environment (happy-dom for tests)
- File upload requires browser File API

## Goals / Non-Goals

### Goals
- ✓ Parse BPMN XML to vue-flow JSON using bpmn-js moddle
- ✓ Create test fixtures covering basic, complex, and edge cases
- ✓ Provide standalone testing page for manual validation
- ✓ Add integrated preview panel in main editor
- ✓ Test round-trip conversion consistency
- ✓ Validate BPMN 2.0 spec compliance
- ✓ Test Flowable extension compatibility

### Non-Goals
- ✗ Full BPMN modeler with editing capabilities
- ✗ Support for all BPMN 2.0 element types (events, sub-processes, etc.)
- ✗ Visual diff tools for comparing diagrams
- ✗ Automated screenshot/visual regression testing
- ✗ Production-grade import workflow (user-facing feature)
- ✗ BPMN file management (save, load, version control)

## Decisions

### Decision 1: Use bpmn-js Moddle for XML Parsing

**Choice:** Use bpmn-js's built-in moddle (Moddle) for XML parsing and object model access.

**Rationale:**
- Already bundled with bpmn-js dependency
- Provides validated BPMN 2.0 object model
- Handles namespace resolution automatically
- Type-safe access to BPMN elements

**Alternatives considered:**
1. **xml2js/fast-xml-parser**: Lower-level, manual parsing required, more error-prone
2. **Custom regex/string parsing**: Fragile, doesn't handle XML edge cases
3. **Camunda Model API**: Too specific to Camunda, less flexible

**Trade-offs:**
- ✅ Pros: Validated model, handles namespaces, well-tested
- ❌ Cons: Learning curve for moddle API, heavier than pure XML parsers

### Decision 2: Separate Test Page vs Integrated Preview

**Choice:** Implement BOTH standalone test page AND integrated preview panel.

**Rationale:**
- **Standalone page** allows focused testing without editor clutter
- **Integrated preview** provides real-time feedback during editing
- User can choose based on workflow (testing vs editing)
- Both share common utilities (importers, converters)

**Alternatives considered:**
1. **Only standalone page**: Clean testing, but disrupts editing workflow
2. **Only integrated preview**: Convenient, but editor UI becomes cluttered
3. **Toggle in editor**: Middle ground, but still affects editor performance

**Trade-offs:**
- ✅ Pros: Flexibility, optimized workflows, better UX for both use cases
- ❌ Cons: More code to maintain, duplicated viewer instances

### Decision 3: Test Fixture Structure

**Choice:** Dual-format fixtures (JSON + BPMN XML) in `tests/fixtures/`.

**Rationale:**
- Allows testing both import and export directions
- Fixtures serve as ground truth for round-trip tests
- Easy to add new fixtures by exporting from vue-flow editor
- XML fixtures can be validated with external BPMN tools

**Structure:**
```
tests/fixtures/
├── simple/
│   ├── linear-flow.{json,bpmn.xml}
│   ├── single-branch.{json,bpmn.xml}
│   └── single-loop.{json,bpmn.xml}
├── complex/
│   ├── nested-gateways.{json,bpmn.xml}
│   ├── parallel-merge.{json,bpmn.xml}
│   └── complex-conditions.{json,bpmn.xml}
└── edge-cases/
    ├── large-flow.{json,bpmn.xml}
    ├── special-chars.{json,bpmn.xml}
    └── boundary-values.{json,bpmn.xml}
```

**Alternatives considered:**
1. **JSON only**: Generate XML on-demand - can't validate import, no ground truth
2. **XML only**: Import to JSON - can't validate export, no ground truth
3. **Single directory**: Flat structure - harder to organize/find tests

**Trade-offs:**
- ✅ Pros: Complete test coverage, clear fixture categorization
- ❌ Cons: More files to maintain, need to keep JSON/XML in sync

### Decision 4: Test Utility Architecture

**Choice:** Create dedicated test helpers in `tests/helpers/` for common testing operations.

**Rationale:**
- DRY principle - avoid repeating test setup/teardown
- Centralized BPMN.js mocking for consistent behavior
- Reusable assertion helpers for BPMN-specific validations
- Easier to maintain as test suite grows

**Helper modules:**
1. **`bpmnjs-test-helpers.ts`**:
   - `mockBpmnViewer()`: Create mock bpmn-js viewer for unit tests
   - `loadFixture(path)`: Load JSON/XML fixture files
   - `createMockBpmnElement(type, props)`: Generate test BPMN elements

2. **`xml-test-helpers.ts`**:
   - `parseXml(xml)`: Parse XML string to DOM
   - `assertXmlNamespace(doc, ns)`: Validate namespace declarations
   - `assertXmlElement(doc, xpath)`: Find and validate XML elements
   - `normalizeXml(xml)`: Format XML for comparison

3. **`conversion-test-helpers.ts`**:
   - `testRoundtrip(json, tolerance)`: Test JSON → XML → JSON consistency
   - `assertNodesEqual(actual, expected)`: Compare node arrays
   - `assertEdgesEqual(actual, expected)`: Compare edge arrays

**Alternatives considered:**
1. **Inline all test logic**: Simpler initially, but becomes unmaintainable
2. **Use testing-library utilities**: Good for DOM tests, but not BPMN-specific
3. **Custom test framework**: Overkill, adds complexity

**Trade-offs:**
- ✅ Pros: Maintainable, reusable, readable tests
- ❌ Cons: More initial setup, learning curve for new contributors

### Decision 5: Layout Algorithm for Import

**Choice:** Use BPMN DI information for layout when available; fallback to auto-layout if missing.

**Rationale:**
- BPMN DI contains original positioning information
- Preserves visual layout when importing existing BPMN files
- Auto-layout as fallback ensures nodes are always visible
- Auto-layout can use existing `dagre` library (if available) or simple algorithm

**Implementation approach:**
```typescript
function importBpmnXml(xml: string): BpmnWorkflow {
  const definitions = moddle.fromXML(xml);
  const process = definitions.rootElements[0];

  // Extract DI information
  const diElements = parseDiInfo(definitions);

  // Convert to nodes with positions
  const nodes = process.flowElements.map(el => ({
    id: el.id,
    type: mapBpmnType(el.$type),
    position: diElements[el.id]?.position || autoLayout(el),
    data: extractProperties(el)
  }));

  // Convert to edges
  const edges = process.flowElements
    .filter(el => el.$type === 'bpmn:SequenceFlow')
    .map(el => ({
      id: el.id,
      source: el.sourceRef.id,
      target: el.targetRef.id,
      data: { condition: el.conditionExpression }
    }));
}
```

**Alternatives considered:**
1. **Always auto-layout**: Loses original layout information
2. **Require DI**: Fail import if DI missing - too restrictive
3. **Manual positioning**: Random or grid placement - poor UX

**Trade-offs:**
- ✅ Pros: Best of both worlds, preserves layout when available
- ❌ Cons: More complex, auto-layout algorithm needed

## Architecture

### Module Structure

```
src/
├── utils/
│   ├── bpmn-converter.ts          # JSON → XML (existing)
│   └── bpmn-importer.ts           # XML → JSON (new)
├── composables/
│   ├── useBpmnConverter.ts        # Export wrapper (existing)
│   ├── useBpmnImporter.ts         # Import wrapper (new)
│   └── useBpmnValidator.ts        # Validation (existing, enhance)
├── components/
│   ├── BpmnEditor/
│   │   ├── BpmnEditor.vue         # Main editor (modify for preview)
│   │   └── BpmnJsPreviewPanel.vue # Integrated preview (new)
│   └── BpmnTestingPage/           # New test page
│       ├── BpmnTestingPage.vue
│       ├── JsonUploader.vue
│       ├── BpmnUploader.vue
│       └── SideBySidePreview.vue
└── types/
    └── bpmn.ts                    # Add import-related types

tests/
├── helpers/
│   ├── bpmnjs-test-helpers.ts
│   ├── xml-test-helpers.ts
│   └── conversion-test-helpers.ts
├── integration/
│   ├── bpmn-roundtrip.test.ts
│   ├── bpmn-compliance.test.ts
│   └── bpmn-performance.test.ts
└── fixtures/
    ├── simple/
    ├── complex/
    └── edge-cases/
```

### Data Flow

**Import Flow (XML → JSON):**
```
BPMN XML File
    ↓
File Upload (BpmnUploader)
    ↓
bpmn-js moddle.fromXML()
    ↓
Parse BPMN elements + DI
    ↓
Map to vue-flow nodes/edges
    ↓
Validate workflow structure
    ↓
BpmnWorkflow JSON
    ↓
Load into BpmnEditor
```

**Export Flow (JSON → XML):**
```
BpmnWorkflow JSON
    ↓
bpmn-converter.generateBpmnXml()
    ↓
xmlbuilder2.create()
    ↓
BPMN XML String
    ↓
bpmn-js NavigatedViewer.importXML()
    ↓
Validate + Preview
```

**Round-trip Test Flow:**
```
Fixture JSON
    ↓
Export to XML (bpmn-converter)
    ↓
Import from XML (bpmn-importer)
    ↓
Compare with original JSON
    ↓
Assert: structures ≈ equal
```

### Component Relationships

```
App.vue
├── BpmnEditor.vue (main editor)
│   ├── BpmnJsPreviewPanel.vue (new, integrated)
│   └── PreviewModal.vue (existing, validation only)
│
└── BpmnTestingPage.vue (new, standalone)
    ├── JsonUploader.vue
    ├── BpmnUploader.vue
    └── SideBySidePreview.vue
        ├── VueFlow (left)
        └── bpmn-js Viewer (right)
```

## Risks / Trade-offs

### Risk 1: Round-trip Information Loss

**Risk:** Export → Import may lose information (formatting, layout, some properties).

**Mitigation:**
- Document which properties are preserved/lost
- Use fuzzy comparison in tests (allow minor differences)
- Store metadata in JSON for round-trip validation
- Prioritize functional equivalence over exact equality

**Acceptance:**
- Some information loss is acceptable (e.g., exact positioning)
- Critical properties (type, connections, conditions) must be preserved

### Risk 2: BPMN.js Performance with Large Diagrams

**Risk:** Large BPMN files (100+ elements) may cause slow imports or hangs.

**Mitigation:**
- Mark performance tests as `@slow`
- Add loading indicators for import/export
- Consider lazy loading for very large diagrams
- Set reasonable timeout limits in tests

**Acceptance:**
- Performance degradation is acceptable for very large diagrams
- Tests ensure no crashes or hangs, just slower performance

### Risk 3: Incomplete BPMN 2.0 Support

**Risk:** Import may fail for BPMN files with unsupported elements (sub-processes, events, etc.).

**Mitigation:**
- Clearly document supported element types
- Provide clear error messages for unsupported elements
- Option: Skip unsupported elements with warnings
- Option: Implement graceful degradation

**Acceptance:**
- Only support currently exported element types (StartEvent, EndEvent, UserTask, ServiceTask, Gateways)
- Unsupported elements cause import error with clear message

### Risk 4: Test Maintenance Overhead

**Risk:** Maintaining dual-format fixtures (JSON + XML) increases maintenance burden.

**Mitigation:**
- Create fixture generator tool (export from editor → save both formats)
- Use scripts to synchronize fixtures
- Version control fixtures to track changes
- Document fixture creation/update process

**Acceptance:**
- Initial setup is more work, but pays off in long-term test reliability
- Fixtures are valuable for regression testing

### Risk 5: Code Duplication Between Test Page and Editor

**Risk:** Similar functionality in separate components may lead to code duplication.

**Mitigation:**
- Share composables (`useBpmnConverter`, `useBpmnImporter`)
- Share utility functions
- Extract common logic into shared utilities
- Use shared types

**Acceptance:**
- Some duplication is acceptable for different UX patterns
- Focus on sharing business logic, not UI code

## Migration Plan

### Phase 1: Core Import Functionality
1. Implement `bpmn-importer.ts`
2. Add `useBpmnImporter` composable
3. Create basic import tests
4. Update types for import support

### Phase 2: Test Infrastructure
1. Create test helpers (`bpmnjs-test-helpers.ts`, `xml-test-helpers.ts`, `conversion-test-helpers.ts`)
2. Generate initial fixture set (simple workflows)
3. Add round-trip tests
4. Add compliance tests

### Phase 3: Testing UI
1. Build `BpmnTestingPage.vue` with uploaders
2. Implement side-by-side preview
3. Add manual testing controls
4. Style and polish

### Phase 4: Integrated Preview
1. Create `BpmnJsPreviewPanel.vue`
2. Integrate into `BpmnEditor.vue`
3. Add toggle control
4. Implement synchronization

### Phase 5: Comprehensive Fixtures
1. Generate complex workflow fixtures
2. Generate edge case fixtures
3. Add performance tests
4. Document fixture creation process

### Phase 6: Polish and Documentation
1. Add comprehensive error handling
2. Improve error messages
3. Write user documentation
4. Write developer documentation

### Rollback Strategy
- All changes are additive (no breaking changes)
- Can disable test page by removing route
- Can disable integrated preview by toggle
- Can revert to previous version if issues arise

## Open Questions

1. **Auto-layout algorithm**: Should we use a library (dagre, elk) or implement a simple algorithm?
   - **Recommendation**: Start with simple grid/fixed-size layout, evaluate if more sophisticated layout is needed

2. **Performance thresholds**: What are acceptable import/export times for different diagram sizes?
   - **Recommendation**: Define after performance tests: <2s for small, <5s for medium, <30s for large

3. **Fixture generation**: Should fixtures be hand-crafted or generated from the editor?
   - **Recommendation**: Generate from editor to ensure they match actual usage, then manually tweak for edge cases

4. **Test environment**: Should we use browser automation (Playwright) for E2E tests?
   - **Recommendation**: Start with Vitest + happy-dom, add Playwright later if needed for true E2E

5. **User-facing import**: Is this purely for testing, or should we expose import to end users?
   - **Recommendation**: Start as testing tool, evaluate user-facing import in future proposal
