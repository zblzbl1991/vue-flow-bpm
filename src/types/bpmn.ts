// Extend vue-flow types for BPMN support

// Listener configuration
export interface ListenerField {
  name: string
  stringValue?: string
  expression?: string
}

export interface Listener {
  id: string
  event: 'start' | 'end' | 'take' | 'create' | 'assignment' | 'complete' | 'delete'
  type: 'class' | 'expression' | 'delegateExpression'
  value: string
  fields?: ListenerField[]
}

// Form property configuration
export interface FormPropertyValue {
  id: string
  name: string
}

export interface FormProperty {
  id: string
  name: string
  type: 'string' | 'long' | 'double' | 'boolean' | 'date' | 'enum'
  required: boolean
  readable: boolean
  writable: boolean
  defaultValue?: string
  values?: FormPropertyValue[]
}

// Multi-instance configuration
export interface MultiInstanceConfig {
  isSequential: boolean
  collection?: string
  elementVariable?: string
  completionCondition?: string
  cardinality?: string
}

// Input/Output parameters
export interface Parameter {
  name: string
  value: string
}

// Node data interface
export interface BpmnNodeData {
  // Common properties
  label: string
  width?: number
  height?: number
  documentation?: string

  // BPMN ID for round-trip conversion (stores original BPMN element ID)
  bpmnId?: string

  // SubProcess boundary flag
  isSubProcessBoundary?: boolean
  subProcessId?: string

  // Process properties (for process definition only)
  processName?: string
  processVersion?: string
  executable?: boolean
  candidateStarterGroups?: string[]

  // Task properties
  assignee?: string
  candidateUsers?: string[]
  candidateGroups?: string[]
  priority?: string
  dueDate?: string
  formKey?: string
  skipExpression?: string

  // Async configuration
  asyncBefore?: boolean
  asyncAfter?: boolean
  async?: boolean

  // Service task properties
  expression?: string
  delegateExpression?: string
  class?: string
  triggerable?: boolean

  // Gateway properties
  default?: string

  // Event properties
  timerType?: 'duration' | 'date' | 'cycle'
  timerExpression?: string
  timerInfinite?: boolean
  messageRef?: string
  signalRef?: string
  errorCode?: string
  escalationCode?: string
  eventSubProcess?: boolean

  // Script task properties
  scriptFormat?: string
  script?: string

  // Business rule task properties
  ruleVariablesInput?: string
  rules?: string
  resultVariable?: string

  // Call activity properties
  calledElement?: string
  inheritVariables?: boolean
  variableMapping?: Parameter[]

  // Boundary event properties
  attachedToRef?: string
  cancelActivity?: boolean

  // Extended configurations
  listeners?: Listener[]
  formProperties?: FormProperty[]
  multiInstance?: MultiInstanceConfig
  inputParameters?: Parameter[]
  outputParameters?: Parameter[]
}

/**
 * Edge data interface for BPMN sequence flows
 *
 * **BPMN DI Layout Properties:**
 * - `waypoints`: Array of {x, y} coordinates representing the edge's multi-segment path
 *   as defined in the BPMN DI (Diagram Interchange) specification. These are extracted
 *   from `<di:waypoint>` elements in BPMN XML during import and preserved during export.
 *
 * - `path`: SVG path 'd' attribute computed from waypoints. Used by the custom edge
 *   component to render the exact multi-segment path instead of a simple bezier curve.
 *   Format: "M x1 y1 L x2 y2 L x3 y3 ..." (Move to first point, Line to each subsequent point)
 *
 * **Round-trip Conversion:**
 * - `bpmnId`: Stores the original BPMN element ID to preserve identity during
 *   import → export → import cycles. This ensures that re-importing an exported file
 *   maintains element references correctly.
 */
export interface BpmnEdgeData {
  condition?: string
  label?: string
  name?: string
  documentation?: string
  // BPMN ID for round-trip conversion (stores original BPMN sequence flow ID)
  bpmnId?: string
  // BPMN DI path information for preserving edge layout
  // Waypoints are extracted from <di:waypoint> or <omgdi:waypoint> elements
  waypoints?: Array<{ x: number; y: number }>
  // SVG path d attribute (computed from waypoints for rendering)
  path?: string
  // Condition type (expression or script)
  conditionType?: 'expression' | 'script'
  conditionScriptFormat?: string
  conditionScript?: string
  // Skip expression for sequence flow
  skipExpression?: string
}

export interface BpmnNode {
  id: string
  type: string
  position?: { x: number; y: number }
  data: BpmnNodeData
}

export interface BpmnEdge {
  id: string
  source: string
  target: string
  type?: string
  data: BpmnEdgeData
  markerEnd?: string
  animated?: boolean
}

export type BpmnElementType =
  | 'startEvent'
  | 'endEvent'
  | 'userTask'
  | 'serviceTask'
  | 'exclusiveGateway'
  | 'parallelGateway'
  | 'subProcess'
  | 'subProcessBoundary'
  // Intermediate events
  | 'intermediateTimerEvent'
  | 'intermediateMessageEvent'
  | 'intermediateSignalEvent'
  // Boundary events
  | 'boundaryErrorEvent'
  | 'boundaryTimerEvent'
  | 'boundaryMessageEvent'
  | 'boundarySignalEvent'
  // Additional task types
  | 'scriptTask'
  | 'businessRuleTask'
  | 'manualTask'
  | 'receiveTask'
  | 'sendTask'
  // Additional gateway types
  | 'inclusiveGateway'
  | 'eventGateway'
  // Other elements
  | 'callActivity'
  | 'eventSubProcess'

export interface BpmnProcess {
  id: string
  name: string
  version: number
  executable?: boolean
  documentation?: string
  candidateStarterGroups?: string[]
}

export interface BpmnWorkflow {
  process: BpmnProcess
  nodes: BpmnNode[]
  edges: BpmnEdge[]
}

export interface BpmnElementConfig {
  type: BpmnElementType
  label: string
  icon: string
  description: string
  defaultSize: { width: number; height: number }
}

export const BPMN_ELEMENT_CONFIGS: Record<BpmnElementType, BpmnElementConfig> = {
  startEvent: {
    type: 'startEvent',
    label: 'Start Event',
    icon: '●',
    description: 'Start of the process',
    defaultSize: { width: 50, height: 50 }
  },
  endEvent: {
    type: 'endEvent',
    label: 'End Event',
    icon: '◉',
    description: 'End of the process',
    defaultSize: { width: 50, height: 50 }
  },
  userTask: {
    type: 'userTask',
    label: 'User Task',
    icon: '👤',
    description: 'Task performed by a user',
    defaultSize: { width: 120, height: 80 }
  },
  serviceTask: {
    type: 'serviceTask',
    label: 'Service Task',
    icon: '⚙',
    description: 'Automated service task',
    defaultSize: { width: 120, height: 80 }
  },
  exclusiveGateway: {
    type: 'exclusiveGateway',
    label: 'Exclusive Gateway',
    icon: '◇',
    description: 'Exclusive decision gateway',
    defaultSize: { width: 60, height: 60 }
  },
  parallelGateway: {
    type: 'parallelGateway',
    label: 'Parallel Gateway',
    icon: '◈',
    description: 'Parallel split gateway',
    defaultSize: { width: 60, height: 60 }
  },
  subProcess: {
    type: 'subProcess',
    label: 'Sub Process',
    icon: '▱',
    description: 'Collapsed sub-process',
    defaultSize: { width: 100, height: 80 }
  },
  subProcessBoundary: {
    type: 'subProcessBoundary',
    label: 'Sub Process Boundary',
    icon: '▭',
    description: 'Expanded sub-process boundary',
    defaultSize: { width: 400, height: 300 }
  },
  // Intermediate events
  intermediateTimerEvent: {
    type: 'intermediateTimerEvent',
    label: 'Intermediate Timer Event',
    icon: '⏱',
    description: 'Timer-based intermediate catch event',
    defaultSize: { width: 50, height: 50 }
  },
  intermediateMessageEvent: {
    type: 'intermediateMessageEvent',
    label: 'Intermediate Message Event',
    icon: '✉',
    description: 'Message-based intermediate event',
    defaultSize: { width: 50, height: 50 }
  },
  intermediateSignalEvent: {
    type: 'intermediateSignalEvent',
    label: 'Intermediate Signal Event',
    icon: '📡',
    description: 'Signal-based intermediate event',
    defaultSize: { width: 50, height: 50 }
  },
  // Boundary events
  boundaryErrorEvent: {
    type: 'boundaryErrorEvent',
    label: 'Boundary Error Event',
    icon: '⚠',
    description: 'Error boundary event',
    defaultSize: { width: 50, height: 50 }
  },
  boundaryTimerEvent: {
    type: 'boundaryTimerEvent',
    label: 'Boundary Timer Event',
    icon: '⏲',
    description: 'Timer boundary event',
    defaultSize: { width: 50, height: 50 }
  },
  boundaryMessageEvent: {
    type: 'boundaryMessageEvent',
    label: 'Boundary Message Event',
    icon: '✉',
    description: 'Message boundary event',
    defaultSize: { width: 50, height: 50 }
  },
  boundarySignalEvent: {
    type: 'boundarySignalEvent',
    label: 'Boundary Signal Event',
    icon: '📡',
    description: 'Signal boundary event',
    defaultSize: { width: 50, height: 50 }
  },
  // Additional task types
  scriptTask: {
    type: 'scriptTask',
    label: 'Script Task',
    icon: '📜',
    description: 'Task that executes a script',
    defaultSize: { width: 120, height: 80 }
  },
  businessRuleTask: {
    type: 'businessRuleTask',
    label: 'Business Rule Task',
    icon: '📋',
    description: 'Task that evaluates business rules',
    defaultSize: { width: 120, height: 80 }
  },
  manualTask: {
    type: 'manualTask',
    label: 'Manual Task',
    icon: '✋',
    description: 'Task performed manually without system execution',
    defaultSize: { width: 120, height: 80 }
  },
  receiveTask: {
    type: 'receiveTask',
    label: 'Receive Task',
    icon: '📥',
    description: 'Task that waits for a message',
    defaultSize: { width: 120, height: 80 }
  },
  sendTask: {
    type: 'sendTask',
    label: 'Send Task',
    icon: '📤',
    description: 'Task that sends a message',
    defaultSize: { width: 120, height: 80 }
  },
  // Additional gateway types
  inclusiveGateway: {
    type: 'inclusiveGateway',
    label: 'Inclusive Gateway',
    icon: '◑',
    description: 'Inclusive decision gateway',
    defaultSize: { width: 60, height: 60 }
  },
  eventGateway: {
    type: 'eventGateway',
    label: 'Event Gateway',
    icon: '⬡',
    description: 'Event-based gateway',
    defaultSize: { width: 60, height: 60 }
  },
  // Other elements
  callActivity: {
    type: 'callActivity',
    label: 'Call Activity',
    icon: '🔄',
    description: 'Calls another process',
    defaultSize: { width: 120, height: 80 }
  },
  eventSubProcess: {
    type: 'eventSubProcess',
    label: 'Event Sub-process',
    icon: '📦',
    description: 'Event-triggered sub-process',
    defaultSize: { width: 400, height: 300 }
  }
}

export interface ValidationError {
  elementId?: string
  message: string
  type: 'error' | 'warning'
}
