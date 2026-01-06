import { create } from 'xmlbuilder2'
import type { BpmnNode, BpmnEdge, BpmnWorkflow, BpmnElementType, Listener, MultiInstanceConfig, FormProperty, Parameter } from '@/types/bpmn'

const BPMN_NAMESPACES = {
  bpmn: 'http://www.omg.org/spec/BPMN/20100524/MODEL',
  bpmndi: 'http://www.omg.org/spec/BPMN/20100524/DI',
  dc: 'http://www.omg.org/spec/DD/20100524/DC',
  di: 'http://www.omg.org/spec/DD/20100524/DI',
  flowable: 'http://flowable.org/bpmn',
  xsi: 'http://www.w3.org/2001/XMLSchema-instance'
}

const NODE_TYPE_MAPPING: Record<BpmnElementType, string> = {
  startEvent: 'bpmn:startEvent',
  endEvent: 'bpmn:endEvent',
  userTask: 'bpmn:userTask',
  serviceTask: 'bpmn:serviceTask',
  exclusiveGateway: 'bpmn:exclusiveGateway',
  parallelGateway: 'bpmn:parallelGateway'
}

function generateBpmnId(originalId: string, prefix: string = 'bpmn'): string {
  return `${prefix}-${originalId}`
}

function generateFlowId(originalId: string): string {
  return `flow-${originalId}`
}

// Convert listeners to XML
function convertListenersToListeners(listeners: Listener[], isTask: boolean): any {
  if (!listeners || listeners.length === 0) return undefined

  const listenerTag = isTask ? 'flowable:taskListener' : 'flowable:executionListener'

  return listeners.map(listener => {
    const listenerObj: any = {
      '@event': listener.event,
      [`@${listener.type}`]: listener.value
    }

    if (listener.fields && listener.fields.length > 0) {
      listenerObj['flowable:field'] = listener.fields.map(field => {
        const fieldObj: any = {
          '@name': field.name
        }
        if (field.stringValue) {
          fieldObj['flowable:string'] = field.stringValue
        }
        if (field.expression) {
          fieldObj['flowable:expression'] = field.expression
        }
        return { 'flowable:field': fieldObj }
      })
    }

    return { [listenerTag]: listenerObj }
  })
}

// Convert multi-instance config to XML
function convertMultiInstanceToXml(config: MultiInstanceConfig): any {
  const multiInstanceObj: any = {
    '@isSequential': config.isSequential.toString()
  }

  if (config.collection) {
    multiInstanceObj['flowable:collection'] = config.collection
  }

  if (config.elementVariable) {
    multiInstanceObj['flowable:elementVariable'] = config.elementVariable
  }

  if (config.completionCondition) {
    multiInstanceObj['bpmn:completionCondition'] = {
      '@xsi:type': 'bpmn:tFormalExpression',
      '#': config.completionCondition
    }
  }

  if (config.cardinality) {
    multiInstanceObj['flowable:cardinality'] = config.cardinality
  }

  return { 'bpmn:multiInstanceLoopCharacteristics': multiInstanceObj }
}

// Convert form properties to XML
function convertFormPropertiesToXml(props: FormProperty[]): any {
  if (!props || props.length === 0) return undefined

  return props.map(prop => {
    const formPropObj: any = {
      '@id': prop.id,
      '@name': prop.name,
      '@type': prop.type,
      '@required': prop.required.toString(),
      '@readable': prop.readable.toString(),
      '@writable': prop.writable.toString()
    }

    if (prop.defaultValue) {
      formPropObj['@default'] = prop.defaultValue
    }

    if (prop.values && prop.values.length > 0) {
      formPropObj['flowable:value'] = prop.values.map(v => ({
        '@id': v.id,
        '@name': v.name
      }))
    }

    return { 'flowable:formProperty': formPropObj }
  })
}

// Convert input/output parameters to XML
function convertParametersToXml(parameters: Parameter[], type: 'input' | 'output'): any {
  if (!parameters || parameters.length === 0) return undefined

  const paramTag = type === 'input' ? 'flowable:inputParameter' : 'flowable:outputParameter'

  return parameters.map(param => ({
    [paramTag]: {
      '@name': param.name,
      '#': param.value
    }
  }))
}

function convertNodeToBpmnElement(node: BpmnNode): any {
  const elementType = NODE_TYPE_MAPPING[node.type as BpmnElementType]
  const bpmnId = node.data.bpmnId || generateBpmnId(node.id)

  const element: any = {
    '@id': bpmnId,
    '@name': node.data.label || node.type
  }

  // Build extension elements for Flowable-specific attributes
  const extensionElements: any[] = []

  // Documentation
  if (node.data.documentation) {
    element['bpmn:documentation'] = node.data.documentation
  }

  // User Task attributes - add as Flowable extension elements
  if (node.type === 'userTask') {
    if (node.data.assignee) {
      extensionElements.push({ 'flowable:assignee': node.data.assignee })
    }
    if (node.data.candidateUsers?.length) {
      extensionElements.push({ 'flowable:candidateUsers': node.data.candidateUsers.join(',') })
    }
    if (node.data.candidateGroups?.length) {
      extensionElements.push({ 'flowable:candidateGroups': node.data.candidateGroups.join(',') })
    }
    if (node.data.priority) {
      extensionElements.push({ 'flowable:priority': node.data.priority })
    }
    if (node.data.dueDate) {
      extensionElements.push({ 'flowable:dueDate': node.data.dueDate })
    }
    if (node.data.formKey) {
      extensionElements.push({ 'flowable:formKey': node.data.formKey })
    }
    if (node.data.skipExpression) {
      extensionElements.push({ 'flowable:skipExpression': node.data.skipExpression })
    }

    // Task listeners
    const taskListeners = convertListenersToListeners(node.data.listeners, true)
    if (taskListeners) {
      extensionElements.push(...taskListeners)
    }

    // Form properties
    const formProps = convertFormPropertiesToXml(node.data.formProperties || [])
    if (formProps) {
      extensionElements.push(...formProps)
    }
  }

  // Service Task attributes - add as Flowable extension elements
  if (node.type === 'serviceTask') {
    if (node.data.expression) {
      extensionElements.push({ 'flowable:expression': node.data.expression })
    }
    if (node.data.delegateExpression) {
      extensionElements.push({ 'flowable:delegateExpression': node.data.delegateExpression })
    }
    if (node.data.class) {
      extensionElements.push({ 'flowable:class': node.data.class })
    }
    if (node.data.triggerable !== undefined) {
      extensionElements.push({ 'flowable:triggerable': node.data.triggerable.toString() })
    }

    // Execution listeners
    const execListeners = convertListenersToListeners(node.data.listeners, false)
    if (execListeners) {
      extensionElements.push(...execListeners)
    }

    // Input parameters
    const inputParams = convertParametersToXml(node.data.inputParameters || [], 'input')
    if (inputParams) {
      extensionElements.push(...inputParams)
    }

    // Output parameters
    const outputParams = convertParametersToXml(node.data.outputParameters || [], 'output')
    if (outputParams) {
      extensionElements.push(...outputParams)
    }
  }

  // Gateway default flow
  if ((node.type === 'exclusiveGateway' || node.type === 'parallelGateway') && node.data.default) {
    element['@default'] = generateFlowId(node.data.default)
  }

  // Async attributes - add as Flowable extension elements
  if (node.data.asyncBefore !== undefined) {
    extensionElements.push({ 'flowable:asyncBefore': node.data.asyncBefore.toString() })
  }
  if (node.data.asyncAfter !== undefined) {
    extensionElements.push({ 'flowable:asyncAfter': node.data.asyncAfter.toString() })
  }
  if (node.data.async !== undefined) {
    extensionElements.push({ 'flowable:async': node.data.async.toString() })
  }

  // Multi-instance
  if (node.data.multiInstance) {
    const multiInstanceXml = convertMultiInstanceToXml(node.data.multiInstance)
    extensionElements.push(multiInstanceXml)
  }

  // Add extension elements if any
  if (extensionElements.length > 0) {
    // Merge all extension element objects into one object
    // This ensures we get a single <bpmn:extensionElements> with multiple children
    // rather than multiple <bpmn:extensionElements> elements
    const mergedExtensions: any = {}
    for (const ext of extensionElements) {
      Object.assign(mergedExtensions, ext)
    }
    element['bpmn:extensionElements'] = mergedExtensions
  }

  return { [elementType]: element }
}

function convertEdgeToSequenceFlow(edge: BpmnEdge, nodes: BpmnNode[]): any {
  const sourceNode = nodes.find(n => n.id === edge.source)
  const targetNode = nodes.find(n => n.id === edge.target)

  if (!sourceNode || !targetNode) {
    throw new Error(`Invalid edge: source ${edge.source} or target ${edge.target} not found`)
  }

  const flowId = generateFlowId(edge.id)
  const flow: any = {
    '@id': flowId,
    '@sourceRef': sourceNode.data.bpmnId || generateBpmnId(edge.source),
    '@targetRef': targetNode.data.bpmnId || generateBpmnId(edge.target)
  }

  // Add name if present
  if (edge.data.name || edge.data.label) {
    flow['@name'] = edge.data.name || edge.data.label
  }

  // Add condition expression if present (for gateways)
  if (edge.data.condition) {
    flow['bpmn:conditionExpression'] = {
      '@xsi:type': 'bpmn:tFormalExpression',
      '#': edge.data.condition
    }
  }

  // Add documentation if present
  if (edge.data.documentation) {
    flow['bpmn:documentation'] = edge.data.documentation
  }

  return { 'bpmn:sequenceFlow': flow }
}

export function generateBpmnXml(workflow: BpmnWorkflow): string {
  const { process, nodes, edges } = workflow
  const processId = process.id || `process-${Date.now()}`

  // Group elements by type to handle multiple elements of the same type
  const elementGroups: Record<string, any[]> = {}

  // Convert nodes to BPMN elements
  nodes.forEach(node => {
    const element = convertNodeToBpmnElement(node)
    const key = Object.keys(element)[0]
    if (!elementGroups[key]) {
      elementGroups[key] = []
    }
    elementGroups[key].push(element[key])
  })

  // Convert edges to sequence flows
  edges.forEach(edge => {
    const element = convertEdgeToSequenceFlow(edge, nodes)
    const key = Object.keys(element)[0]
    if (!elementGroups[key]) {
      elementGroups[key] = []
    }
    elementGroups[key].push(element[key])
  })

  // Build process object with grouped elements
  const processObj: any = {
    '@id': processId,
    '@name': process.name || 'Process',
    '@version': process.version || 1,
    '@isExecutable': process.executable !== undefined ? process.executable.toString() : 'true'
  }

  // Add process documentation
  if (process.documentation) {
    processObj['bpmn:documentation'] = process.documentation
  }

  // Add candidate starter groups
  if (process.candidateStarterGroups && process.candidateStarterGroups.length > 0) {
    processObj['flowable:candidateStarterGroups'] = process.candidateStarterGroups.join(',')
  }

  // Add all elements to process
  Object.entries(elementGroups).forEach(([key, elements]) => {
    if (elements.length === 1) {
      processObj[key] = elements[0]
    } else {
      processObj[key] = elements
    }
  })

  // Build the XML document
  const doc = {
    'bpmn:definitions': {
      '@id': `definitions-${Date.now()}`,
      '@targetNamespace': 'http://bpmn.io/schema/bpmn',
      '@xmlns:bpmn': BPMN_NAMESPACES.bpmn,
      '@xmlns:bpmndi': BPMN_NAMESPACES.bpmndi,
      '@xmlns:dc': BPMN_NAMESPACES.dc,
      '@xmlns:di': BPMN_NAMESPACES.di,
      '@xmlns:flowable': BPMN_NAMESPACES.flowable,
      '@xmlns:xsi': BPMN_NAMESPACES.xsi,
      'bpmn:process': processObj,
      'bpmndi:BPMNDiagram': {
        '@id': `bpmn-diagram-${Date.now()}`,
        'bpmndi:BPMNPlane': {
          '@id': `bpmn-plane-${Date.now()}`,
          '@bpmnElement': processId,
          'bpmndi:BPMNShape': nodes.map(node => {
            const bounds = {
              '@x': node.position?.x || 0,
              '@y': node.position?.y || 0,
              '@width': node.data?.width || 120,
              '@height': node.data?.height || 80
            }
            return {
              '@id': `shape-${node.id}`,
              '@bpmnElement': node.data.bpmnId || generateBpmnId(node.id),
              'dc:Bounds': bounds
            }
          }),
          'bpmndi:BPMNEdge': edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source)
            const targetNode = nodes.find(n => n.id === edge.target)

            const sourceX = (sourceNode?.position?.x || 0) + (sourceNode?.data?.width || 120)
            const sourceY = (sourceNode?.position?.y || 0) + ((sourceNode?.data?.height || 80) / 2)
            const targetX = targetNode?.position?.x || 0
            const targetY = (targetNode?.position?.y || 0) + ((targetNode?.data?.height || 80) / 2)

            return {
              '@id': `edge-${edge.id}`,
              '@bpmnElement': generateFlowId(edge.id),
              'di:waypoint': [
                { '@x': sourceX, '@y': sourceY },
                { '@x': targetX, '@y': targetY }
              ]
            }
          })
        }
      }
    }
  }

  const xml = create(doc).end({ prettyPrint: true, indent: '  ' })
  return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`
}

export function validateWorkflow(nodes: BpmnNode[], edges: BpmnEdge[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check for start event
  const hasStartEvent = nodes.some(n => n.type === 'startEvent')
  if (!hasStartEvent) {
    errors.push('Workflow must have at least one start event')
  }

  // Check for end event
  const hasEndEvent = nodes.some(n => n.type === 'endEvent')
  if (!hasEndEvent) {
    errors.push('Workflow must have at least one end event')
  }

  // Check for isolated nodes (nodes without connections)
  const connectedNodeIds = new Set<string>()
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source)
    connectedNodeIds.add(edge.target)
  })

  const isolatedNodes = nodes.filter(n => !connectedNodeIds.has(n.id))
  if (isolatedNodes.length > 0) {
    errors.push(`Isolated nodes found: ${isolatedNodes.map(n => n.data.label || n.id).join(', ')}`)
  }

  // Check for self-loops
  edges.forEach(edge => {
    if (edge.source === edge.target) {
      errors.push(`Self-loop detected on node ${edge.source}`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}
