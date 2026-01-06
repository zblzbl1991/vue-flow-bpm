# Developer Guide - BPMN Testing Infrastructure

This guide explains the BPMN testing infrastructure for developers who want to extend or maintain the vue-flow-bpm project.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      vue-flow-bpm                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │ BpmnEditor   │──────│ PreviewPanel │ (bpmn-js)          │
│  │  (vue-flow)  │      │              │                    │
│  └──────┬───────┘      └──────────────┘                    │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────┐                     │
│  │     BPMN Conversion Layer          │                     │
│  ├─────────────────────────────────────┤                     │
│  │ • bpmn-converter (JSON → XML) ✓    │                     │
│  │ • bpmn-importer (XML → JSON) ⚠     │                     │
│  └─────────────────────────────────────┘                     │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────┐                     │
│  │      Testing Infrastructure        │                     │
│  ├─────────────────────────────────────┤                     │
│  │ • Test fixtures (JSON + XML pairs)  │                    │
│  │ • Test helpers (parsing, mocking)   │                    │
│  │ • Integration tests                 │                     │
│  │ • Performance tests                 │                     │
│  └─────────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

## Core Modules

### 1. BPMN Converter (`src/utils/bpmn-converter.ts`)

**Purpose:** Convert vue-flow JSON to BPMN 2.0 XML

**Key Function:**
```typescript
function convertToBpmnXml(
  nodes: BpmnNode[],
  edges: BpmnEdge[],
  processId: string,
  processName: string,
  format?: 'pretty' | 'minified'
): string
```

**Implementation Details:**
- Uses `xmlbuilder2` for XML generation
- Supports BPMN 2.0 specification namespaces
- Includes BPMN DI (Diagram Interchange) for layout
- Handles Flowable/Camunda extensions

**Adding New Element Types:**

1. Update type mapping in `BPMN_TYPE_MAPPING`
2. Add element-specific rendering in `convertNode`
3. Update type definitions in `src/types/bpmn.ts`
4. Add tests in `bpmn-converter.test.ts`

### 2. BPMN Importer (`src/utils/bpmn-importer.ts`)

**Purpose:** Convert BPMN 2.0 XML to vue-flow JSON

**Status:** ⚠️ Has structural issues with bpmn-moddle schema parsing

**Key Function:**
```typescript
async function importBpmnXml(
  xml: string
): Promise<BpmnImportResult>
```

**Known Issues:**
- bpmn-moddle requires proper schema configuration
- Complex BPMN schemas need careful handling
- Some element types may not parse correctly

**Fixing Import:**
The importer needs:
1. Proper bpmn-moddle schema setup
2. Better error handling for schema validation
3. Support for all BPMN element types
4. Robust extension element parsing

### 3. Composables

#### `useBpmnConverter` (`src/composables/useBpmnConverter.ts`)

```typescript
function useBpmnConverter() {
  return {
    convertToBpmnXml,
    validateAndConvert,
    downloadBpmnFile
  }
}
```

#### `useBpmnImporter` (`src/composables/useBpmnImporter.ts`)

```typescript
function useBpmnImporter() {
  return {
    importFromFile,
    importFromString,
    validateBpmnFile,
    importState,
    hasErrors,
    hasWarnings,
    getErrorMessages,
    getWarningMessages
  }
}
```

## Type System

### Core Types (`src/types/bpmn.ts`)

```typescript
// Process definition
interface BpmnProcess {
  id: string
  name: string
  version: number
  executable?: boolean
  documentation?: string
  candidateStarterGroups?: string[]
}

// Node types
type BpmnElementType =
  | 'startEvent'
  | 'endEvent'
  | 'userTask'
  | 'serviceTask'
  | 'exclusiveGateway'
  | 'parallelGateway'

interface BpmnNode {
  id: string
  type: BpmnElementType
  position: { x: number; y: number }
  data: BpmnNodeData
}

interface BpmnNodeData {
  label: string
  width: number
  height: number
  // Type-specific properties...
}

// Edge types
interface BpmnEdge {
  id: string
  source: string
  target: string
  data: BpmnEdgeData
  type: string
  animated?: boolean
}

interface BpmnEdgeData {
  label?: string
  name?: string
  condition?: string
  documentation?: string
}

// Complete workflow
interface BpmnWorkflow {
  process: BpmnProcess
  nodes: BpmnNode[]
  edges: BpmnEdge[]
}
```

## Test Infrastructure

### Test Helpers (`tests/helpers/`)

#### `bpmnjs-test-helpers.ts`

```typescript
// Mock bpmn-js viewer
class MockBpmnViewer {
  async importXML(xml: string)
  saveSVG()
  saveXML()
  get(name: string)
  destroy()
}

// Load fixture files
async function loadFixture(path: string): Promise<any>

// Create test elements
function createMockBpmnElement(
  type: BpmnElementType,
  props?: Partial<BpmnNode>
): BpmnNode

// Create test workflows
function createLinearWorkflow(): BpmnWorkflow
function createGatewayWorkflow(): BpmnWorkflow
```

#### `xml-test-helpers.ts`

```typescript
// Parse XML string
function parseXml(xml: string): Document

// Assert XML namespace
function assertXmlNamespace(doc: Document, namespace: string)

// Assert element exists
function assertXmlElement(doc: Document, xpath: string): Element

// Normalize for comparison
function normalizeXml(xml: string): string

// Validate BPMN structure
function assertBpmnNamespaces(doc: Document)
```

#### `conversion-test-helpers.ts`

```typescript
// Test round-trip conversion
async function testRoundtrip(
  originalWorkflow: BpmnWorkflow,
  options?: RoundTripOptions
): Promise<RoundTripResult>

// Compare nodes
function compareNodes(
  actual: BpmnNode[],
  expected: BpmnNode[]
): ComparisonResult

// Compare edges
function compareEdges(
  actual: BpmnEdge[],
  expected: BpmnEdge[]
): ComparisonResult
```

### Test Fixtures

Fixtures are stored as pairs: `name.json` and `name.bpmn.xml`

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

**Adding New Fixtures:**

1. Create the JSON file with vue-flow workflow
2. Export to BPMN XML using the converter
3. Manually verify the BPMN XML is valid
4. Place both files in the appropriate directory
5. Add to test helpers' `listFixtures()` if needed

## Component Testing

### BpmnTestingPage

**Location:** `src/components/BpmnTestingPage.vue`

**Props:** None (uses internal state)

**Emits:** None

**Key Features:**
- Tab switching between JSON→BPMN and BPMN→JSON
- File upload handling
- Preview display
- Statistics display

**Testing:**
```bash
npm run test:src tests/components/BpmnTestingPage.test.ts
```

### BpmnJsPreviewPanel

**Location:** `src/components/BpmnEditor/BpmnJsPreviewPanel.vue`

**Props:**
```typescript
interface Props {
  isOpen: boolean
  nodes: BpmnNode[]
  edges: BpmnEdge[]
  processId?: string
  processName?: string
}
```

**Emits:**
```typescript
interface Emits {
  (e: 'close'): void
  (e: 'export-bpmn'): void
  (e: 'export-svg'): void
}
```

## Running Tests

### All Tests
```bash
npm run test
```

### Specific Test Files
```bash
npm run test:run -- src/utils/bpmn-converter.test.ts
npm run test:run -- tests/integration/bpmn-roundtrip.test.ts
npm run test:run -- tests/integration/bpmn-compliance.test.ts
```

### Performance Tests (skipped by default)
```bash
# Remove .skip from describe to run
npm run test:run -- tests/integration/bpmn-performance.test.ts
```

## Development Workflow

### Adding a New BPMN Element Type

1. **Update Types:**
   ```typescript
   // src/types/bpmn.ts
   export type BpmnElementType =
     | 'startEvent'
     | 'endEvent'
     | 'yourNewType'  // Add here
   ```

2. **Update Export:**
   ```typescript
   // src/utils/bpmn-converter.ts
   const BPMN_TYPE_MAPPING: Record<BpmnElementType, string> = {
     // ...
     yourNewType: 'bpmn:yourNewType'
   }

   function renderYourNodeType(node: BpmnNode): XmlNode {
     // Implementation
   }
   ```

3. **Update Import:**
   ```typescript
   // src/utils/bpmn-importer.ts
   const BPMN_TYPE_MAPPING: Record<string, BpmnElementType> = {
     'bpmn:yourNewType': 'yourNewType'
   }
   ```

4. **Add Tests:**
   - Create fixture in `tests/fixtures/simple/`
   - Add test in `bpmn-converter.test.ts`
   - Add test in `bpmn-compliance.test.ts`

### Fixing the Import Functionality

The BPMN importer has issues with bpmn-moddle. To fix:

1. **Research bpmn-moddle:**
   - Read bpmn-moddle documentation
   - Study BPMN 2.0 schema
   - Understand moddle's schema loading

2. **Update importer:**
   ```typescript
   // src/utils/bpmn-importer.ts
   export async function importBpmnXml(xml: string): Promise<BpmnImportResult> {
     // Configure moddle with proper schemas
     const customModdle = new BpmnModdle({
       // Add correct schema configuration
     })

     // Handle parsing errors gracefully
     // Support all BPMN element types
     // Extract extension elements correctly
   }
   ```

3. **Fix tests:**
   - Update round-trip tests
   - Fix compliance tests
   - Ensure import warnings are clear

## Known Limitations

1. **Import Not Working:** BPMN XML → JSON conversion has schema parsing issues
2. **Limited Element Types:** Only basic BPMN elements are supported
3. **No Subprocesses:** Subprocess support not implemented
4. **No Events:** Only start/end events, no intermediate events
5. **No Pools/Lanes:** Collaboration diagrams not supported

## Future Enhancements

1. **Fix Import:** Resolve bpmn-moddle schema issues
2. **More Element Types:** Add support for all BPMN 2.0 elements
3. **Subprocess Support:** Add embedded subprocess handling
4. **Event Support:** Add intermediate events (timer, message, etc.)
5. **Pools/Lanes:** Add collaboration diagram support
6. **Better Validation:** Enhanced BPMN spec validation
7. **Performance:** Optimize for very large workflows

## Contributing

When contributing to BPMN testing:

1. **Test both directions:** Always test export AND import
2. **Use fixtures:** Create fixtures for new features
3. **Update docs:** Keep this guide updated
4. **Follow conventions:** Match existing code style
5. **Add tests:** Ensure test coverage is maintained

## Resources

- [BPMN 2.0 Spec](https://www.omg.org/spec/BPMN/2.0/)
- [bpmn-js Docs](https://bpmn.io/toolkit/bpmn-js/)
- [bpmn-moddle](https://github.com/bpmn-io/bpmn-moddle)
- [vue-flow Docs](https://vueflow.dev/)
- [xmlbuilder2](https://github.com/oozcitak/xmlbuilder2)
