# Proposal: add-json-bpmn-import

## Summary
Add JSON and BPMN XML import functionality to the main BPMN Editor, enabling users to load workflows from exported JSON files or BPMN 2.0 XML files.

## Motivation
Currently, users can export workflows as JSON and BPMN XML, but importing is limited:
- JSON import exists in the editor toolbar but has minimal error handling
- BPMN XML import is fully implemented (`bpmn-importer.ts`) but not exposed in the main editor
- Upload UI components exist (`JsonUploader.vue`, `BpmnUploader.vue`) but are only used on the testing page

This change will:
1. Enhance JSON import with proper validation and error feedback
2. Expose BPMN XML import in the main editor
3. Provide clear user feedback for both import types

## Goals
- Enable importing JSON workflow files with validation and error messages
- Enable importing BPMN 2.0 XML files with parsing and conversion
- Provide clear feedback for import success/failure
- Update editor state (nodes, edges, process info) after successful import

## Non-Goals
- Modifying the BPMN XML importer logic (already implemented in `bpmn-importer.ts`)
- Supporting additional file formats (e.g., YAML, proprietary formats)
- Editing imported BPMN files in external tools

## Proposed Solution
1. **JSON Import Enhancement**
   - Validate imported JSON structure matches expected workflow format
   - Display clear error messages for invalid files
   - Update editor state (nodes, edges, process info) on success

2. **BPMN XML Import**
   - Add "Load BPMN" button to toolbar
   - Use existing `importBpmnXml` from `bpmn-importer.ts`
   - Display validation warnings if present
   - Update editor state on success

3. **User Feedback**
   - Toast/notification for import status
   - Validation warnings displayed to user
   - Clear error messages with actionable guidance

## Dependencies
- Existing `bpmn-importer.ts` (BPMN XML parsing)
- Existing `useBpmnEditor` composable (state management)
- Existing `useBpmnConverter` composable (validation)

## Impact
- **User-Facing**: New "Load BPMN" button in toolbar; improved "Load JSON" behavior
- **Code**: New composable/use case for import handling; minimal changes to existing files
- **Backwards Compatible**: Yes - existing functionality unchanged

## Alternatives Considered
1. **Reuse existing upload components** - The `JsonUploader.vue` and `BpmnUploader.vue` are designed for the testing page (drag-and-drop with preview). Reusing them in the editor toolbar would require significant refactoring. A simpler toolbar button + file input approach is more appropriate for the main editor.

2. **Create a unified import modal** - Could combine JSON and BPMN import in a single modal, but separate buttons are clearer and match the existing export pattern (separate Save JSON / Export XML buttons).

## Success Metrics
- JSON import loads valid workflows without errors
- BPMN XML import successfully converts to vue-flow format
- Clear error messages shown for invalid files
- Process info (id, name, version) correctly updated from imports
