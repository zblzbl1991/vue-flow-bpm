# Change: Add BPMN.js Testing Suite with Bidirectional Conversion

## Why

The current vue-flow-bpm editor supports exporting BPMN 2.0 XML from vue-flow JSON, but lacks:
1. **BPMN XML import functionality** - Cannot load existing BPMN files into the editor
2. **Comprehensive testing infrastructure** - No systematic way to test JSON ↔ XML conversions
3. **BPMN.js integration testing** - Limited validation coverage for BPMN compliance
4. **Test fixtures** - Missing diverse workflow examples for validation

This limits the ability to:
- Test round-trip conversions (export → import → export)
- Validate BPMN 2.0 specification compliance thoroughly
- Ensure compatibility with BPMN engines (Flowable, Camunda, etc.)
- Provide users with import capabilities for existing BPMN files

## What Changes

### New Capabilities
- **bpmn-import**: Add BPMN XML → vue-flow JSON conversion using bpmn-js
- **bpmn-testing**: Add comprehensive testing suite with test fixtures and utilities

### Modified Capabilities
- **bpmn-conversion**: Extend to support bidirectional conversion (add import)

### New Features
1. **BPMN Import Module** (`src/utils/bpmn-importer.ts`)
   - Parse BPMN XML using bpmn-js moddle
   - Convert BPMN elements to vue-flow nodes/edges
   - Extract BPMN DI information for layout
   - Support Flowable/Camunda extensions

2. **BPMN.js Testing Page** (`src/components/BpmnTestingPage.vue`)
   - Standalone test page for manual validation
   - Upload vue-flow JSON → export to BPMN XML → preview with bpmn-js
   - Upload BPMN XML → import to vue-flow JSON → preview
   - Side-by-side comparison of vue-flow and bpmn-js rendering

3. **Integrated Preview Panel** (extend `BpmnEditor.vue`)
   - Add real-time BPMN.js preview panel
   - Live synchronization between vue-flow canvas and bpmn-js viewer
   - Highlight selected elements in both views

4. **Test Fixtures** (`tests/fixtures/`)
   - Simple workflows (linear, single branch, single loop)
   - Complex workflows (nested gateways, parallel branches, complex conditions)
   - Edge cases (100+ nodes, special characters, boundary values)
   - Both vue-flow JSON and BPMN XML formats for each fixture

5. **Test Utilities** (`tests/helpers/`)
   - `bpmnjs-test-helpers.ts`: Mock bpmn-js viewer, test fixtures loader
   - `xml-test-helpers.ts`: XML parsing/comparison utilities
   - `conversion-test-helpers.ts`: Round-trip conversion testers

6. **Integration Tests** (`tests/integration/`)
   - Round-trip conversion tests (JSON → XML → JSON)
   - BPMN spec compliance tests
   - Flowable/Camunda extension compatibility tests
   - Performance tests for large diagrams

### Non-Breaking Changes
- All existing functionality preserved
- Existing tests continue to pass
- Backward compatible with current vue-flow JSON format

## Impact

### Affected Specs
- **bpmn-conversion**: Add import functionality (MODIFIED)
- **bpmn-validation**: Update for comprehensive testing (MODIFIED)
- **bpmn-editor**: Add integrated preview panel (MODIFIED)
- **NEW: bpmn-import**: BPMN XML import capability
- **NEW: bpmn-testing**: Testing infrastructure and fixtures

### Affected Code
- **New files:**
  - `src/utils/bpmn-importer.ts` - BPMN XML parser
  - `src/composables/useBpmnImporter.ts` - Import composable
  - `src/components/BpmnTestingPage.vue` - Standalone test page
  - `src/components/BpmnTestingPage/SideBySidePreview.vue` - Comparison view
  - `src/components/BpmnEditor/BpmnJsPreviewPanel.vue` - Integrated preview
  - `tests/helpers/bpmnjs-test-helpers.ts`
  - `tests/helpers/xml-test-helpers.ts`
  - `tests/helpers/conversion-test-helpers.ts`
  - `tests/integration/bpmn-roundtrip.test.ts`
  - `tests/integration/bpmn-compliance.test.ts`
  - `tests/integration/bpmn-performance.test.ts`
  - `tests/fixtures/simple-linear.{json,bpmn.xml}`
  - `tests/fixtures/simple-branch.{json,bpmn.xml}`
  - `tests/fixtures/simple-loop.{json,bpmn.xml}`
  - `tests/fixtures/complex-nested-gateways.{json,bpmn.xml}`
  - `tests/fixtures/complex-parallel.{json,bpmn.xml}`
  - `tests/fixtures/complex-conditions.{json,bpmn.xml}`
  - `tests/fixtures/edge-case-large.{json,bpmn.xml}`
  - `tests/fixtures/edge-case-special-chars.{json,bpmn.xml}`

- **Modified files:**
  - `src/types/bpmn.ts` - Add import-related types
  - `src/utils/bpmn-converter.ts` - Minor adjustments for round-trip compatibility
  - `src/composables/useBpmnConverter.ts` - Add import function
  - `src/App.vue` - Add route to testing page
  - `src/router/index.ts` - Add testing route (if using router)
  - `package.json` - Add testing dependencies (if needed)

### Dependencies
- **Already installed:** `bpmn-js@^17.0.0` (bpmn-js has moddle built-in)
- **Optional additions:**
  - `@testing-library/vue` - For component testing
  - `@testing-library/user-event` - For user interaction testing
  - `xml2js` or `fast-xml-parser` - For XML test helpers

### Migration
- No migration needed - all additions are non-breaking
- New features are opt-in via separate testing page
- Integrated preview can be toggled on/off

### Performance Considerations
- Large BPMN files (>100 elements) may impact import performance
- Round-trip tests may be slow; consider marking as `@slow` in test suite
- Preview panel lazy-loads bpmn-js viewer only when shown
