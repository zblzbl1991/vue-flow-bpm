/**
 * BPMN Importer - Converts BPMN 2.0 XML to vue-flow JSON format
 * Uses bpmn-js moddle for XML parsing and element mapping
 */

import type {
  BpmnWorkflow,
  BpmnNode,
  BpmnEdge,
  BpmnElementType,
  BpmnNodeData,
  BpmnEdgeData,
  Listener,
  MultiInstanceConfig,
  FormProperty,
  Parameter
} from '@/types/bpmn'

// BPMN 2.0 element type to vue-flow type mapping
// Note: bpmn-moddle uses PascalCase for types (e.g., bpmn:StartEvent)
const BPMN_TYPE_MAPPING: Record<string, BpmnElementType> = {
  'bpmn:StartEvent': 'startEvent',
  'bpmn:EndEvent': 'endEvent',
  'bpmn:UserTask': 'userTask',
  'bpmn:ServiceTask': 'serviceTask',
  'bpmn:ExclusiveGateway': 'exclusiveGateway',
  'bpmn:ParallelGateway': 'parallelGateway'
}

// Supported BPMN element types
const SUPPORTED_ELEMENT_TYPES = new Set(Object.keys(BPMN_TYPE_MAPPING))

/**
 * Import error with details for better error messages
 */
export interface BpmnImportError {
  message: string
  elementId?: string
  elementType?: string
  cause?: unknown
}

/**
 * Import result containing the workflow or error details
 */
export interface BpmnImportResult {
  success: boolean
  workflow?: BpmnWorkflow
  errors?: BpmnImportError[]
  warnings?: string[]
}

/**
 * BPMN DI information for node positioning
 */
interface DiInfo {
  id: string
  bpmnElement: string
  bounds?: { x: number; y: number; width: number; height: number }
}

/**
 * Parse BPMN XML string to vue-flow workflow
 * @param xml - BPMN XML string
 * @returns Import result with workflow or errors
 */
export async function importBpmnXml(xml: string): Promise<BpmnImportResult> {
  const errors: BpmnImportError[] = []
  const warnings: string[] = []

  try {
    // Import bpmn-moddle from bpmn-js package
    const { default: BpmnModdle } = await import('bpmn-moddle')

    // Use default bpmn-moddle with built-in BPMN 2.0 schema support
    // The built-in schema handles all standard BPMN 2.0 elements
    const moddle = new BpmnModdle()

    // Parse XML string - this validates against BPMN 2.0 schema
    const { rootElement: definitions } = await moddle.fromXML(xml)

    if (!definitions) {
      return {
        success: false,
        errors: [{ message: 'Invalid BPMN XML: missing definitions element' }]
      }
    }

    // Extract process from definitions
    const rootElements = definitions.rootElements || []
    const processes = rootElements.filter((e: any) => e.$type === 'bpmn:Process')

    if (processes.length === 0) {
      return {
        success: false,
        errors: [{ message: 'No process found in BPMN XML' }]
      }
    }

    // Use first process (could be enhanced to support multiple processes)
    const process = processes[0]
    const processId = process.id || `process-${Date.now()}`
    const processName = process.name || 'Imported Process'

    // Extract DI information for node positioning
    const diInfos = extractDiInfo(definitions)

    // Extract BPMN elements (flow nodes)
    const flowElements = process.flowElements || []

    // Separate nodes and sequence flows
    const flowNodes: any[] = []
    const sequenceFlows: any[] = []

    flowElements.forEach((element: any) => {
      if (element.$type === 'bpmn:SequenceFlow') {
        sequenceFlows.push(element)
      } else if (SUPPORTED_ELEMENT_TYPES.has(element.$type)) {
        flowNodes.push(element)
      } else if (element.$type && element.$type.startsWith('bpmn:')) {
        warnings.push(`Unsupported element type: ${element.$type} (id: ${element.id})`)
      }
    })

    // Convert flow nodes to vue-flow nodes
    const nodes = convertFlowNodesToNodes(flowNodes, diInfos)

    // Convert sequence flows to vue-flow edges
    const edges = convertSequenceFlowsToEdges(sequenceFlows)

    // Build workflow
    const workflow: BpmnWorkflow = {
      process: {
        id: processId,
        name: processName,
        version: parseInt(process.version || '1', 10),
        executable: process.isExecutable !== undefined ? process.isExecutable : true,
        documentation: process.documentation,
        candidateStarterGroups: parseCandidateStarterGroups(process)
      },
      nodes,
      edges
    }

    // Validate imported workflow
    const validationResult = validateImportedWorkflow(nodes, edges)
    if (!validationResult.valid) {
      warnings.push(...validationResult.warnings)
    }

    return {
      success: true,
      workflow,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  } catch (error) {
    return {
      success: false,
      errors: [{
        message: error instanceof Error ? error.message : 'Unknown import error',
        cause: error
      }]
    }
  }
}

/**
 * Extract BPMN DI information from definitions
 */
function extractDiInfo(definitions: any): Map<string, DiInfo> {
  const diMap = new Map<string, DiInfo>()

  const diagrams = definitions.diagrams || []
  diagrams.forEach((diagram: any) => {
    const plane = diagram.plane
    if (!plane) return

    const shapes = plane.shapes || []
    shapes.forEach((shape: any) => {
      const bounds = shape.bounds
      diMap.set(shape.bpmnElement?.id, {
        id: shape.id,
        bpmnElement: shape.bpmnElement?.id,
        bounds: bounds ? {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height
        } : undefined
      })
    })

    const edges = plane.edges || []
    edges.forEach((edge: any) => {
      // Could store edge DI info if needed for waypoints
      diMap.set(edge.bpmnElement?.id, {
        id: edge.id,
        bpmnElement: edge.bpmnElement?.id
      })
    })
  })

  return diMap
}

/**
 * Convert BPMN flow nodes to vue-flow nodes
 */
function convertFlowNodesToNodes(flowNodes: any[], diInfos: Map<string, DiInfo>): BpmnNode[] {
  return flowNodes.map((element, index) => {
    const elementType = element.$type
    const vueFlowType = BPMN_TYPE_MAPPING[elementType]

    if (!vueFlowType) {
      throw new Error(`Unsupported element type: ${elementType}`)
    }

    // Get DI information for positioning
    const diInfo = diInfos.get(element.id)

    // Determine position (use DI or auto-layout)
    let position: { x: number; y: number }
    let width: number
    let height: number

    if (diInfo?.bounds) {
      position = { x: diInfo.bounds.x, y: diInfo.bounds.y }
      width = diInfo.bounds.width
      height = diInfo.bounds.height
    } else {
      // Simple auto-layout - grid arrangement
      const col = index % 5
      const row = Math.floor(index / 5)
      position = { x: col * 200, y: row * 150 }
      width = getDefaultWidth(vueFlowType)
      height = getDefaultHeight(vueFlowType)
    }

    // Build node data
    const data: BpmnNodeData = {
      label: element.name || vueFlowType,
      width,
      height,
      documentation: element.documentation
    }

    // Extract type-specific properties
    extractNodeProperties(element, data, vueFlowType)

    // Store original BPMN ID for round-trip
    ;(data as any).bpmnId = element.id

    return {
      id: element.id,
      type: vueFlowType,
      position,
      data
    }
  })
}

/**
 * Extract node properties from BPMN element
 */
function extractNodeProperties(element: any, data: BpmnNodeData, nodeType: BpmnElementType): void {
  // Extract extension elements
  const extensionElements = element.extensionElements

  // Common async properties
  if (element.asyncBefore !== undefined) {
    data.asyncBefore = element.asyncBefore
  }
  if (element.asyncAfter !== undefined) {
    data.asyncAfter = element.asyncAfter
  }
  if (element.async !== undefined) {
    data.async = element.async
  }

  switch (nodeType) {
    case 'userTask':
      // User task properties (Flowable/Camunda namespace)
      data.assignee = element.assignee
      if (element.candidateUsers) {
        data.candidateUsers = typeof element.candidateUsers === 'string'
          ? element.candidateUsers.split(',').map((s: string) => s.trim())
          : element.candidateUsers
      }
      if (element.candidateGroups) {
        data.candidateGroups = typeof element.candidateGroups === 'string'
          ? element.candidateGroups.split(',').map((s: string) => s.trim())
          : element.candidateGroups
      }
      data.priority = element.priority
      data.dueDate = element.dueDate
      data.formKey = element.formKey
      data.skipExpression = element.skipExpression

      // Extract from extension elements
      if (extensionElements) {
        data.listeners = extractListeners(extensionElements, true)
        data.formProperties = extractFormProperties(extensionElements)
        data.multiInstance = extractMultiInstance(extensionElements)
      }
      break

    case 'serviceTask':
      // Service task properties
      data.expression = element.expression
      data.delegateExpression = element.delegateExpression
      data.class = element.class
      data.triggerable = element.triggerable

      // Extract from extension elements
      if (extensionElements) {
        data.listeners = extractListeners(extensionElements, false)
        data.inputParameters = extractParameters(extensionElements, 'input')
        data.outputParameters = extractParameters(extensionElements, 'output')
        data.multiInstance = extractMultiInstance(extensionElements)
      }
      break

    case 'exclusiveGateway':
    case 'parallelGateway':
      // Gateway default flow
      data.default = element.default?.id || element.default
      break

    case 'startEvent':
    case 'endEvent':
      // Event properties (timer, message, signal, error)
      if (extensionElements) {
        extractEventProperties(extensionElements, data)
      }
      break
  }
}

/**
 * Extract listeners from extension elements
 */
function extractListeners(extensionElements: any, isTaskListener: boolean): Listener[] {
  const listeners: Listener[] = []

  const values = extensionElements.values || extensionElements.get?.('values') || []
  const listenerKey = isTaskListener ? 'taskListener' : 'executionListener'

  values.forEach((value: any) => {
    const type = value.$type?.toLowerCase()
    if (type.includes(`flowable:${listenerKey}`) || type.includes(`camunda:${listenerKey}`)) {
      const listener: Listener = {
        id: value.id || `listener-${Date.now()}-${Math.random()}`,
        event: value.event,
        type: value.class ? 'class' : value.expression ? 'expression' : value.delegateExpression ? 'delegateExpression' : 'expression',
        value: value.class || value.expression || value.delegateExpression || ''
      }

      // Extract fields
      if (value.fields && Array.isArray(value.fields)) {
        listener.fields = value.fields.map((field: any) => ({
          name: field.name,
          stringValue: field.stringValue || field.string,
          expression: field.expression
        }))
      }

      listeners.push(listener)
    }
  })

  return listeners
}

/**
 * Extract form properties from extension elements
 */
function extractFormProperties(extensionElements: any): FormProperty[] {
  const formProps: FormProperty[] = []

  const values = extensionElements.values || extensionElements.get?.('values') || []
  values.forEach((value: any) => {
    const type = value.$type?.toLowerCase()
    if (type.includes('flowable:formproperty') || type.includes('camunda:formproperty')) {
      const formProp: FormProperty = {
        id: value.id,
        name: value.name,
        type: value.type || 'string',
        required: value.required === 'true' || value.required === true,
        readable: value.readable !== 'false' && value.readable !== false,
        writable: value.writable !== 'false' && value.writable !== false,
        defaultValue: value.default
      }

      if (value.values && Array.isArray(value.values)) {
        formProp.values = value.values.map((v: any) => ({
          id: v.id,
          name: v.name
        }))
      }

      formProps.push(formProp)
    }
  })

  return formProps
}

/**
 * Extract multi-instance configuration from extension elements
 */
function extractMultiInstance(extensionElements: any): MultiInstanceConfig | undefined {
  let multiInstance: MultiInstanceConfig | undefined

  const values = extensionElements.values || extensionElements.get?.('values') || []
  values.forEach((value: any) => {
    const type = value.$type?.toLowerCase()
    if (type.includes('multiinstanceloopcharacteristics') || type.includes('multiinstance')) {
      multiInstance = {
        isSequential: value.isSequential === 'true' || value.isSequential === true,
        collection: value.collection || value.flowable?.collection,
        elementVariable: value.elementVariable || value.flowable?.elementVariable,
        completionCondition: value.completionCondition?.body || value.completionExpression,
        cardinality: value.cardinality || value.flowable?.cardinality
      }
    }
  })

  return multiInstance
}

/**
 * Extract input/output parameters from extension elements
 */
function extractParameters(extensionElements: any, type: 'input' | 'output'): Parameter[] {
  const parameters: Parameter[] = []
  const paramType = type === 'input' ? 'inputparameter' : 'outputparameter'

  const values = extensionElements.values || extensionElements.get?.('values') || []
  values.forEach((value: any) => {
    const valueType = value.$type?.toLowerCase()
    if (valueType.includes(`flowable:${paramType}`) || valueType.includes(`camunda:${paramType}`)) {
      parameters.push({
        name: value.name,
        value: value.body || value.value || value.text || ''
      })
    }
  })

  return parameters
}

/**
 * Extract event properties (timer, message, signal, error)
 */
function extractEventProperties(extensionElements: any, data: BpmnNodeData): void {
  const values = extensionElements.values || extensionElements.get?.('values') || []
  values.forEach((value: any) => {
    const type = value.$type?.toLowerCase()
    if (type.includes('timereventdefinition')) {
      if (value.timeDate) {
        data.timerType = 'date'
        data.timerExpression = value.timeDate.body || value.timeDate.text
      } else if (value.timeDuration) {
        data.timerType = 'duration'
        data.timerExpression = value.timeDuration.body || value.timeDuration.text
      } else if (value.timeCycle) {
        data.timerType = 'cycle'
        data.timerExpression = value.timeCycle.body || value.timeCycle.text
      }
    } else if (type.includes('messageeventdefinition')) {
      data.messageRef = value.messageRef?.id
    } else if (type.includes('signaleventdefinition')) {
      data.signalRef = value.signalRef?.id
    } else if (type.includes('erroreventdefinition')) {
      data.errorCode = value.errorRef?.id || value.errorCode
    }
  })
}

/**
 * Extract candidate starter groups from process
 */
function parseCandidateStarterGroups(process: any): string[] | undefined {
  const candidateStarterGroups = process.candidateStarterGroups
  if (candidateStarterGroups) {
    return typeof candidateStarterGroups === 'string'
      ? candidateStarterGroups.split(',').map((s: string) => s.trim())
      : candidateStarterGroups
  }
  return undefined
}

/**
 * Convert BPMN sequence flows to vue-flow edges
 */
function convertSequenceFlowsToEdges(sequenceFlows: any[]): BpmnEdge[] {
  return sequenceFlows.map(flow => {
    const sourceId = flow.sourceRef?.id
    const targetId = flow.targetRef?.id

    if (!sourceId || !targetId) {
      throw new Error(`Invalid sequence flow: ${flow.id} missing source or target`)
    }

    const data: BpmnEdgeData = {
      label: flow.name || '',
      name: flow.name || '',
      documentation: flow.documentation
    }

    // Extract condition expression
    if (flow.conditionExpression) {
      data.condition = flow.conditionExpression.body || flow.conditionExpression.text || ''
    }

    return {
      id: flow.id,
      source: sourceId,
      target: targetId,
      data,
      type: 'default',
      animated: false
    }
  })
}

/**
 * Validate imported workflow for structural issues
 */
function validateImportedWorkflow(nodes: BpmnNode[], edges: BpmnEdge[]): { valid: boolean; warnings: string[] } {
  const warnings: string[] = []

  // Check for start event
  const hasStartEvent = nodes.some(n => n.type === 'startEvent')
  if (!hasStartEvent) {
    warnings.push('Imported workflow has no start event')
  }

  // Check for end event
  const hasEndEvent = nodes.some(n => n.type === 'endEvent')
  if (!hasEndEvent) {
    warnings.push('Imported workflow has no end event')
  }

  // Check for isolated nodes
  const connectedNodeIds = new Set<string>()
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source)
    connectedNodeIds.add(edge.target)
  })

  const isolatedNodes = nodes.filter(n => !connectedNodeIds.has(n.id))
  if (isolatedNodes.length > 0) {
    warnings.push(`Isolated nodes found: ${isolatedNodes.map(n => n.data.label || n.id).join(', ')}`)
  }

  // Check for self-loops
  const selfLoops = edges.filter(e => e.source === e.target)
  if (selfLoops.length > 0) {
    warnings.push(`Self-loops detected: ${selfLoops.map(e => e.id).join(', ')}`)
  }

  return {
    valid: warnings.length === 0,
    warnings
  }
}

/**
 * Get default width for element type
 */
function getDefaultWidth(type: BpmnElementType): number {
  const widths: Record<BpmnElementType, number> = {
    startEvent: 50,
    endEvent: 50,
    userTask: 120,
    serviceTask: 120,
    exclusiveGateway: 60,
    parallelGateway: 60
  }
  return widths[type] || 100
}

/**
 * Get default height for element type
 */
function getDefaultHeight(type: BpmnElementType): number {
  const heights: Record<BpmnElementType, number> = {
    startEvent: 50,
    endEvent: 50,
    userTask: 80,
    serviceTask: 80,
    exclusiveGateway: 60,
    parallelGateway: 60
  }
  return heights[type] || 80
}
