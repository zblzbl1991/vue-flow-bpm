# BPMN Testing Guide

This guide explains how to use the BPMN testing features in vue-flow-bpm to validate BPMN 2.0 conversions.

## Overview

The vue-flow-bpm editor provides comprehensive BPMN testing capabilities:

1. **Standalone Testing Page** - A dedicated page for testing conversions
2. **Integrated Preview Panel** - Real-time BPMN.js preview in the editor
3. **Test Fixtures** - Pre-built workflow examples for validation

## Testing Page

### Accessing the Testing Page

Click the **Testing** button in the header navigation to access the BPMN Testing Page.

### Features

The Testing Page provides two modes:

#### 1. JSON → BPMN XML

Test exporting vue-flow JSON to BPMN XML:

1. Click the **JSON → BPMN XML** tab
2. Click **Choose JSON File** to upload a vue-flow JSON file
3. View the conversion results including:
   - Number of nodes and edges
   - Conversion time
   - Preview of the workflow
4. Download the generated BPMN XML file
5. Download the workflow back as JSON

#### 2. BPMN XML → JSON

Test importing BPMN XML to vue-flow JSON:

1. Click the **BPMN XML → JSON** tab
2. Click **Choose BPMN File** to upload a `.bpmn` or `.xml` file
3. View the imported workflow
4. Review any warnings or errors
5. Export back to BPMN or JSON format

### Understanding Results

#### Success Indicators

- **Green stats bar** - Conversion completed successfully
- **Node/Edge counts** - Number of elements processed
- **Conversion time** - Performance metric in milliseconds

#### Warnings

Yellow warning messages indicate:
- Unsupported element types (converted with limited functionality)
- Missing optional properties
- Non-standard BPMN extensions

#### Errors

Red error messages indicate:
- Invalid XML or JSON format
- Missing required elements
- Critical parsing failures

## Integrated Preview Panel

### Enabling the Preview

In the main Editor:

1. Create your workflow using vue-flow
2. Click the **✓ Validate** button in the toolbar
3. The BPMN.js preview panel opens at the bottom right

### Preview Features

- **Real-time preview** - See BPMN.js rendering as you edit
- **Collapse/Expand** - Toggle panel size with the ▲/▼ button
- **Resize** - Drag the top edge to adjust height
- **Export** - Download BPMN XML or SVG directly
- **Refresh** - Reload the preview (↻ button)

### Panel Actions

| Button | Action |
|--------|--------|
| ✓ | Validate and show preview |
| ▲/▼ | Expand/Collapse panel |
| ↻ | Refresh preview |
| × | Close panel |
| Download BPMN | Export as .bpmn file |
| Export SVG | Export as SVG image |

## Test Fixtures

### Available Fixtures

The project includes test fixtures in `tests/fixtures/`:

#### Simple Workflows (`tests/fixtures/simple/`)

- `linear-flow.{json,bpmn.xml}` - Basic Start → Task → End flow
- `single-branch.{json,bpmn.xml}` - Gateway with two branches
- `single-loop.{json,bpmn.xml}` - Workflow with a loop back

#### Complex Workflows (`tests/fixtures/complex/`)

- `nested-gateways.{json,bpmn.xml}` - Gateways within gateways (2 levels deep)
- `parallel-merge.{json,bpmn.xml}` - Parallel fork and merge pattern
- `complex-conditions.{json,bpmn.xml}` - Multiple condition expressions

#### Edge Cases (`tests/fixtures/edge-cases/`)

- `large-flow.{json,bpmn.xml}` - 120+ nodes for performance testing
- `special-chars.{json,bpmn.xml}` - Unicode, emojis, quotes
- `boundary-values.{json,bpmn.xml}` - Maximum string lengths, deep nesting

### Using Fixtures

1. Navigate to the Testing Page
2. Choose the appropriate conversion direction
3. Upload a fixture file (either `.json` or `.bpmn.xml`)
4. Review the conversion results
5. Compare with the corresponding file in the same directory

## Validation Tips

### Before Exporting

1. **Check connections** - Ensure all nodes are properly connected
2. **Verify gateways** - Gateways should have at least 2 outgoing flows
3. **Add labels** - Provide meaningful names for nodes and flows
4. **Set properties** - Configure assignees, conditions, etc.

### After Importing

1. **Review warnings** - Check for unsupported elements
2. **Verify structure** - Ensure the flow logic is preserved
3. **Test export** - Re-export to verify round-trip conversion
4. **Check in BPMN tool** - Load the BPMN file in Camunda Modeler or similar

## Troubleshooting

### Common Issues

#### Import Fails

**Problem:** BPMN XML import shows errors

**Solutions:**
- Ensure the XML is valid BPMN 2.0 format
- Check for missing namespace declarations
- Verify all sequence flows reference valid nodes
- Review unsupported element types in warnings

#### Export Shows Warnings

**Problem:** Export generates warnings

**Solutions:**
- Unsupported elements are skipped with warnings
- Check the warning message for specific issues
- Verify gateway default flows are set correctly

#### Preview Panel Not Loading

**Problem:** BPMN.js preview doesn't display

**Solutions:**
- Check browser console for JavaScript errors
- Ensure bpmn-js library is loaded
- Try refreshing the preview (↻ button)
- Close and reopen the panel

#### Performance Issues

**Problem:** Large workflows are slow to convert

**Solutions:**
- Large workflows (100+ nodes) may take several seconds
- Consider breaking into smaller subprocesses
- Performance tests show expected times:
  - Small (< 10 nodes): < 50ms
  - Medium (10-50 nodes): < 100ms
  - Large (50-100 nodes): < 500ms
  - Very large (100+ nodes): < 2000ms

## Best Practices

### Workflow Design

1. **Start simple** - Begin with linear flows, then add complexity
2. **Use gateways properly** - Exclusive for conditions, Parallel for concurrent tasks
3. **Label clearly** - Descriptive names help with validation
4. **Test frequently** - Validate after significant changes

### Conversion Testing

1. **Round-trip test** - Export → Import → Export and compare
2. **Use fixtures** - Test with provided examples first
3. **Check in external tools** - Verify with Camunda Modeler or Flowable Designer
4. **Automate tests** - Use the provided test utilities for CI/CD

### Performance

1. **Monitor conversion time** - Large diagrams should still be reasonably fast
2. **Limit complexity** - Very nested gateways can be hard to maintain
3. **Profile if needed** - Use performance tests to identify bottlenecks

## Additional Resources

- [BPMN 2.0 Specification](https://www.omg.org/spec/BPMN/2.0/)
- [Camunda BPMN Reference](https://docs.camunda.org/manual/latest/reference/bpmn20/)
- [Flowable BPMN Reference](https://flowable.com/open-source/docs/bpmn2/ch07-BPMN-Concise-Reference/)
- [vue-flow Documentation](https://vueflow.dev/)
