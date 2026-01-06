/**
 * BPMN.js Test Helpers
 * Utilities for mocking bpmn-js and loading test fixtures
 */

import type { BpmnNode, BpmnEdge, BpmnElementType, BpmnWorkflow } from '@/types/bpmn'

/**
 * Mock bpmn-js viewer for unit tests
 */
export class MockBpmnViewer {
  private container: HTMLElement | null = null
  private importedXml: string | null = null
  private destroyed = false

  constructor(config?: any) {
    // Store config if needed
  }

  async importXML(xml: string): Promise<{ warnings: string[] }> {
    if (this.destroyed) {
      throw new Error('Viewer is destroyed')
    }
    this.importedXml = xml
    return { warnings: [] }
  }

  saveSVG(): Promise<{ svg: string }> {
    return Promise.resolve({ svg: '<svg></svg>' })
  }

  saveXML(): Promise<{ xml: string }> {
    return Promise.resolve({ xml: this.importedXml || '' })
  }

  get(name: string): any {
    switch (name) {
      case 'canvas':
        return {
          getRootElement: () => ({ id: 'mock-process' }),
          addMarker: () => {},
          removeMarker: () => {}
        }
      case 'elementRegistry':
        return {
          get: (id: string) => ({ id, type: 'bpmn:Task' }),
          getAll: () => []
        }
      default:
        return null
    }
  }

  attachTo(container: HTMLElement): void {
    this.container = container
  }

  detach(): void {
    this.container = null
  }

  destroy(): void {
    this.destroyed = true
    this.container = null
    this.importedXml = null
  }

  on(event: string, callback: (...args: any[]) => void): void {
    // Mock event registration
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    // Mock event deregistration
  }
}

/**
 * Create a mock bpmn-js viewer instance
 */
export function mockBpmnViewer(config?: any): MockBpmnViewer {
  return new MockBpmnViewer(config)
}

/**
 * Load a test fixture file
 */
export async function loadFixture(path: string): Promise<any> {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  try {
    // Use Vite's import.meta.glob to load fixtures
    const modules = import.meta.glob('/tests/fixtures/**/*.{json,bpmn.xml}', {
      query: '?raw',
      import: 'default'
    })

    const fixturePath = `/${cleanPath}`
    const loader = modules[fixturePath]

    if (!loader) {
      throw new Error(`Fixture not found: ${fixturePath}`)
    }

    const content = await loader()

    // Parse based on extension
    if (fixturePath.endsWith('.json')) {
      return JSON.parse(content as string)
    } else if (fixturePath.endsWith('.xml') || fixturePath.endsWith('.bpmn.xml')) {
      return content as string
    }

    return content
  } catch (error) {
    throw new Error(`Failed to load fixture ${path}: ${error instanceof Error ? error.message : error}`)
  }
}

/**
 * Load JSON fixture
 */
export async function loadJsonFixture(path: string): Promise<BpmnWorkflow> {
  const data = await loadFixture(path)
  return data as BpmnWorkflow
}

/**
 * Load BPMN XML fixture
 */
export async function loadBpmnFixture(path: string): Promise<string> {
  const xml = await loadFixture(path)
  return xml as string
}

/**
 * Create a mock BPMN element
 */
export function createMockBpmnElement(
  type: BpmnElementType,
  props: Partial<BpmnNode> = {}
): BpmnNode {
  const defaults: Record<BpmnElementType, Partial<BpmnNode>> = {
    startEvent: {
      data: { label: 'Start', width: 50, height: 50 }
    },
    endEvent: {
      data: { label: 'End', width: 50, height: 50 }
    },
    userTask: {
      data: { label: 'User Task', width: 120, height: 80 }
    },
    serviceTask: {
      data: { label: 'Service Task', width: 120, height: 80 }
    },
    exclusiveGateway: {
      data: { label: 'Gateway', width: 60, height: 60 }
    },
    parallelGateway: {
      data: { label: 'Parallel', width: 60, height: 60 }
    }
  }

  return {
    id: props.id || `${type}-${Date.now()}`,
    type,
    position: props.position || { x: 100, y: 100 },
    data: { ...defaults[type].data, ...props.data },
    ...props
  }
}

/**
 * Create a mock workflow
 */
export function createMockWorkflow(
  nodes: BpmnNode[] = [],
  edges: BpmnEdge[] = []
): BpmnWorkflow {
  return {
    process: {
      id: 'test-process',
      name: 'Test Process',
      version: 1,
      executable: true
    },
    nodes,
    edges
  }
}

/**
 * Create a simple linear workflow for testing
 */
export function createLinearWorkflow(): BpmnWorkflow {
  const nodes = [
    createMockBpmnElement('startEvent', { id: 'start-1', position: { x: 100, y: 100 } }),
    createMockBpmnElement('userTask', { id: 'task-1', position: { x: 300, y: 100 } }),
    createMockBpmnElement('endEvent', { id: 'end-1', position: { x: 500, y: 100 } })
  ]

  const edges = [
    { id: 'flow-1', source: 'start-1', target: 'task-1', data: {}, type: 'default' },
    { id: 'flow-2', source: 'task-1', target: 'end-1', data: {}, type: 'default' }
  ]

  return createMockWorkflow(nodes, edges as BpmnEdge[])
}

/**
 * Create a workflow with a gateway for testing
 */
export function createGatewayWorkflow(): BpmnWorkflow {
  const nodes = [
    createMockBpmnElement('startEvent', { id: 'start-1', position: { x: 100, y: 100 } }),
    createMockBpmnElement('exclusiveGateway', { id: 'gateway-1', position: { x: 300, y: 100 } }),
    createMockBpmnElement('userTask', { id: 'task-1', position: { x: 500, y: 50 } }),
    createMockBpmnElement('userTask', { id: 'task-2', position: { x: 500, y: 150 } }),
    createMockBpmnElement('endEvent', { id: 'end-1', position: { x: 700, y: 100 } })
  ]

  const edges = [
    { id: 'flow-1', source: 'start-1', target: 'gateway-1', data: {}, type: 'default' },
    { id: 'flow-2', source: 'gateway-1', target: 'task-1', data: { condition: '${approved}' }, type: 'default' },
    { id: 'flow-3', source: 'gateway-1', target: 'task-2', data: { condition: '${!approved}' }, type: 'default' },
    { id: 'flow-4', source: 'task-1', target: 'end-1', data: {}, type: 'default' },
    { id: 'flow-5', source: 'task-2', target: 'end-1', data: {}, type: 'default' }
  ]

  return createMockWorkflow(nodes, edges as BpmnEdge[])
}

/**
 * Validate BPMN XML structure
 */
export async function validateBpmnXml(xml: string): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []

  try {
    const { importBpmnXml } = await import('@/utils/bpmn-importer')
    const result = await importBpmnXml(xml)

    if (!result.success) {
      errors.push(...(result.errors?.map(e => e.message) || []))
    }

    return {
      valid: errors.length === 0,
      errors
    }
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Unknown validation error']
    }
  }
}

/**
 * Get all fixture file paths
 */
export function listFixtures(): string[] {
  return [
    '/tests/fixtures/simple/linear-flow.json',
    '/tests/fixtures/simple/linear-flow.bpmn.xml',
    '/tests/fixtures/simple/single-branch.json',
    '/tests/fixtures/simple/single-branch.bpmn.xml',
    '/tests/fixtures/simple/single-loop.json',
    '/tests/fixtures/simple/single-loop.bpmn.xml'
  ]
}
