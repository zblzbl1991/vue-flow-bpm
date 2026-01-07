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

  // Extended configurations
  listeners?: Listener[]
  formProperties?: FormProperty[]
  multiInstance?: MultiInstanceConfig
  inputParameters?: Parameter[]
  outputParameters?: Parameter[]
}

// Edge data interface
export interface BpmnEdgeData {
  condition?: string
  label?: string
  name?: string
  documentation?: string
  // BPMN ID for round-trip conversion (stores original BPMN sequence flow ID)
  bpmnId?: string
  // BPMN DI path information for preserving edge layout
  waypoints?: Array<{ x: number; y: number }>
  path?: string  // SVG path d attribute (computed from waypoints)
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
  }
}

export interface ValidationError {
  elementId?: string
  message: string
  type: 'error' | 'warning'
}
