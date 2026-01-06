/**
 * Generate large flow fixture for performance testing
 * Creates a workflow with 100+ nodes arranged in a grid pattern
 */

const NODES_PER_ROW = 15
const TOTAL_ROWS = 8
const TOTAL_NODES = NODES_PER_ROW * TOTAL_ROWS // 120 nodes

const nodes = []
const edges = []

// Generate nodes
let nodeIdCounter = 1
for (let row = 0; row < TOTAL_ROWS; row++) {
  for (let col = 0; col < NODES_PER_ROW; col++) {
    const id = `node-${nodeIdCounter++}`
    const x = 100 + col * 150
    const y = 100 + row * 120

    let type = 'userTask'
    let label = `Task ${nodeIdCounter}`

    if (nodeIdCounter === 1) {
      type = 'startEvent'
      label = 'Start'
    } else if (nodeIdCounter === TOTAL_NODES) {
      type = 'endEvent'
      label = 'End'
    } else if (nodeIdCounter % 10 === 0) {
      type = 'exclusiveGateway'
      label = `Gateway ${Math.floor(nodeIdCounter / 10)}`
    } else if (nodeIdCounter % 7 === 0) {
      type = 'serviceTask'
      label = `Service ${nodeIdCounter}`
    }

    const width = type === 'startEvent' || type === 'endEvent' ? 50 :
                  type === 'exclusiveGateway' || type === 'parallelGateway' ? 60 : 120
    const height = type === 'startEvent' || type === 'endEvent' ? 50 :
                   type === 'exclusiveGateway' || type === 'parallelGateway' ? 60 : 80

    nodes.push({
      id,
      type,
      position: { x, y },
      data: {
        label,
        width,
        height,
        ...(type === 'userTask' && { assignee: `${`user${nodeIdCounter}`}` }),
        ...(type === 'serviceTask' && { class: `com.example.Task${nodeIdCounter}`, async: true })
      }
    })
  }
}

// Generate edges - horizontal connections within rows
let edgeIdCounter = 1
for (let row = 0; row < TOTAL_ROWS; row++) {
  for (let col = 0; col < NODES_PER_ROW - 1; col++) {
    const sourceIndex = row * NODES_PER_ROW + col
    const targetIndex = row * NODES_PER_ROW + col + 1

    if (targetIndex < nodes.length) {
      edges.push({
        id: `edge-${edgeIdCounter++}`,
        source: nodes[sourceIndex].id,
        target: nodes[targetIndex].id,
        data: {},
        type: 'default'
      })
    }
  }
}

// Generate vertical connections between rows (create some complexity)
for (let row = 0; row < TOTAL_ROWS - 1; row++) {
  for (let col = 0; col < NODES_PER_ROW; col += 3) {
    const sourceIndex = row * NODES_PER_ROW + col
    const targetIndex = (row + 1) * NODES_PER_ROW + col

    if (targetIndex < nodes.length) {
      edges.push({
        id: `edge-${edgeIdCounter++}`,
        source: nodes[sourceIndex].id,
        target: nodes[targetIndex].id,
        data: {
          label: `Vertical ${row + 1}`,
          condition: `${row + 1} === ${col + 1}`
        },
        type: 'default'
      })
    }
  }
}

// Create the workflow
const workflow = {
  process: {
    id: 'large-flow-process',
    name: 'Large Flow Performance Test',
    version: 1,
    executable: true
  },
  nodes,
  edges
}

console.log(JSON.stringify(workflow, null, 2))
console.error(`Generated ${nodes.length} nodes and ${edges.length} edges`)
