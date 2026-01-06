# BPMN Editor User Guide

This guide explains how to use the BPMN Workflow Editor to create, validate, and export BPMN 2.0 workflows.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Nodes](#creating-nodes)
3. [Connecting Nodes](#connecting-nodes)
4. [Editing Properties](#editing-properties)
5. [Validating Workflows](#validating-workflows)
6. [Exporting Workflows](#exporting-workflows)
7. [Saving and Loading](#saving-and-loading)

## Getting Started

Open the BPMN Editor in your web browser. You'll see three main areas:

- **Left Panel**: Element palette with available BPMN elements
- **Center**: Canvas for designing your workflow
- **Right Panel**: Property editor for selected elements

## Creating Nodes

### Step 1: Select an Element Type

From the left panel, choose one of the available BPMN elements:

- **Start Event** (green circle): The starting point of your workflow
- **End Event** (red circle): The ending point of your workflow
- **User Task** (rounded rectangle with user icon): A task performed by a person
- **Service Task** (rounded rectangle with gear icon): An automated task
- **Exclusive Gateway** (diamond with X): A decision point with exclusive paths
- **Parallel Gateway** (diamond with +): A split/join for parallel paths

### Step 2: Drag to Canvas

Click and drag an element from the palette and drop it onto the canvas. The element will be created at the drop location.

### Step 3: Position Elements

You can drag elements around the canvas to arrange them in your desired layout.

## Connecting Nodes

### Creating a Connection

1. Hover over a node to reveal its connection handles (small circles on the edges)
2. Click and drag from a source handle to a target node
3. Release the mouse button to create the connection

**Tip:** Start events only have output handles, and end events only have input handles.

### Deleting a Connection

1. Click on the connection line to select it
2. Press the `Delete` or `Backspace` key
3. Or right-click and select "Delete" from the context menu

## Editing Properties

### Node Properties

Click on any node to view and edit its properties in the right panel.

#### Common Properties (All Nodes)

| Property | Description | Example |
|----------|-------------|---------|
| Label | Display name for the node | "Review Request" |
| Documentation | Additional description | "Initial review step" |
| BPMN ID | Custom BPMN element ID | "user-task-1" |

#### User Task Properties

| Property | Description | Example |
|----------|-------------|---------|
| Assignee | Who should perform the task | `${initiator}` |
| Candidate Users | List of eligible users | `user1, user2` |
| Candidate Groups | List of eligible groups | `managers, reviewers` |
| Priority | Task priority (1-10) | `5` |
| Due Date | When the task is due | `${dueDate}` |
| Form Key | Form reference | `review-form` |
| Skip Expression | Condition to skip task | `${skip}` |

#### Service Task Properties

| Property | Description | Example |
|----------|-------------|---------|
| Expression | Service task expression | `${sendEmail}` |
| Delegate Expression | Spring bean name | `${emailService}` |
| Class | Java class name | `com.example.EmailTask` |
| Async Before | Execute async before | `true` |
| Async After | Execute async after | `false` |

#### Gateway Properties

| Property | Description | Example |
|----------|-------------|---------|
| Default Flow | ID of default outgoing flow | `flow-3` |

### Connection Properties

Click on any connection line to edit its properties.

| Property | Description | Example |
|----------|-------------|---------|
| Name | Label for the connection | "Approved" |
| Condition | Condition expression (for gateways) | `${approved == true}` |
| Documentation | Additional description | "Path taken when approved" |

### Conditional Flows

For exclusive gateways, you can define conditions on outgoing connections:

1. Select a connection from the gateway
2. In the property panel, enter a condition expression
3. The workflow engine will evaluate this expression to determine which path to take

Example conditions:
- `${amount > 1000}` - Numeric comparison
- `${approved == true}` - Boolean check
- `${status == 'urgent'}` - String comparison

## Validating Workflows

### Running Validation

Click the "Validate" button in the toolbar to check your workflow for errors.

### Validation Rules

The editor checks for:

1. **Start Event**: At least one start event must exist
2. **End Event**: At least one end event must exist
3. **Isolated Nodes**: All intermediate nodes should be connected
4. **Self-Loops**: Nodes cannot connect to themselves

### Viewing Validation Results

- **Success**: A preview modal will show your workflow rendered by bpmn-js
- **Errors**: A list of validation errors will be displayed

### Fixing Errors

1. Read the error message
2. Locate the problematic node or connection
3. Make the necessary corrections
4. Validate again

## Exporting Workflows

### Exporting BPMN XML

After validation succeeds:

1. Click "Export XML" in the preview modal
2. The BPMN 2.0 XML file will be downloaded
3. Use this file with your workflow engine (e.g., Flowable)

### Export Format

The exported file is in BPMN 2.0 XML format with Flowable extensions. It includes:

- BPMN process definition
- Flowable-specific attributes (assignee, expressions, etc.)
- Diagram information for visual representation

### Importing to Flowable

1. Log in to your Flowable application
2. Navigate to the Process Definitions section
3. Click "Import" or "Deploy"
4. Select the downloaded `.bpmn` file
5. The process will be parsed and deployed

## Saving and Loading

### Saving a Workflow

1. Click the "Save" button in the toolbar
2. A JSON file will be downloaded with your workflow data
3. Keep this file for later editing

### Loading a Workflow

1. Click the "Load" button in the toolbar
2. Select a previously saved JSON file
3. The canvas will be updated with the saved workflow

**Note:** Loading replaces the current workflow. Save your work first if needed.

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Delete selected element | `Delete` or `Backspace` |
| Clear selection | `Escape` |
| Pan canvas | `Space` + Drag or Middle mouse button |
| Zoom in | `+` or `Ctrl` + `Scroll Up` |
| Zoom out | `-` or `Ctrl` + `Scroll Down` |
| Reset zoom | `0` |
| Fit to screen | `f` |

## Tips and Best Practices

### Workflow Design

1. **Start Simple**: Begin with a basic linear flow, then add complexity
2. **Use Meaningful Labels**: Clear labels help understand the workflow
3. **Test Gateways**: Ensure all gateway paths are properly conditioned
4. **Check Connections**: Verify all nodes are connected appropriately

### Property Configuration

1. **Use Expressions**: Flowable expressions like `${variable}` provide flexibility
2. **Set Assignees**: Always specify assignees for user tasks
3. **Add Documentation**: Document complex business rules for future reference
4. **Configure Async**: Use async settings for long-running service tasks

### Validation

1. **Validate Often**: Check your work frequently to catch issues early
2. **Review Warnings**: Even if validation passes, review for potential issues
3. **Test in Engine**: Deploy to Flowable to verify runtime behavior

## Troubleshooting

### Validation Fails

**Problem**: "Workflow must have at least one start event"
**Solution**: Add a start event from the palette

**Problem**: "Isolated nodes found"
**Solution**: Connect all intermediate nodes to the flow

### Export Issues

**Problem**: Cannot export XML
**Solution**: Ensure validation passes first

**Problem**: Import to Flowable fails
**Solution**: Check that all expressions are valid and referenced variables exist

### Performance

**Problem**: Editor is slow with large workflows
**Solution**: Consider breaking complex workflows into sub-processes

## Getting Help

For issues, questions, or contributions:
- Check the main [README.md](../README.md)
- Review the [BPMN Element Mapping](./ELEMENT_MAPPING.md)
- See [Development Guide](./DEVELOPMENT.md) for extension info
