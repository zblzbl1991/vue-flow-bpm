# Tasks: add-json-bpmn-import

## 1. Create import handler composable
- [x] Create `useWorkflowImporter.ts` to handle both JSON and BPMN XML imports with:
- [x] File reading and parsing
- [x] Validation against expected schema
- [x] Error message formatting
- [x] Workflow state extraction

**Validation**: Import handler can parse valid JSON and BPMN XML, returns structured errors for invalid files ✓

## 2. Create import notification component
- [x] Create `ImportNotification.vue` component for displaying:
- [x] Success messages with workflow summary (node/edge count)
- [x] Error messages with actionable details
- [x] Validation warnings (non-blocking)
- [x] Auto-dismiss after configurable delay

**Validation**: Component renders success, error, and warning states correctly ✓

## 3. Enhance JSON import in BpmnEditor
- [x] Update `BpmnEditor.vue` `onLoadJson` handler:
- [x] Add JSON schema validation
- [x] Update process info from imported JSON
- [x] Use new notification component for feedback
- [x] Handle malformed JSON gracefully

**Validation**: Loading valid JSON updates nodes, edges, and process info; invalid JSON shows error ✓

## 4. Add BPMN XML import to BpmnEditor
- [x] Add "Load BPMN" button to toolbar:
- [x] File input accepting .bpmn and .xml files
- [x] Call `importBpmnXml` from `bpmn-importer.ts`
- [x] Update nodes, edges, and process info from result
- [x] Display validation warnings if present

**Validation**: Loading valid BPMN XML updates editor state; invalid files show error ✓

## 5. Test import functionality
- [x] Create test cases for:
- [x] Valid JSON import (various node/edge configurations)
- [x] Invalid JSON import (malformed, wrong schema)
- [x] Valid BPMN XML import (simple, with gateways, with extensions)
- [x] Invalid BPMN XML import (malformed, unsupported elements)
- [x] Process info update from both formats

**Validation**: All test cases pass; error messages are clear and actionable ✓

