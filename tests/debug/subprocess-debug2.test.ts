/**
 * Debug test for subProcess import with actual XML
 */

import { describe, it, expect } from 'vitest'
import { importBpmnXml } from '@/utils/bpmn-importer'

describe('SubProcess Debug 2', () => {
  it('debug actual collapsed-subprocess file', async () => {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const filePath = path.resolve(process.cwd(), 'process/collapsed-subprocess.bpmn20.xml')
    const xml = await fs.readFile(filePath, 'utf-8')

    const result = await importBpmnXml(xml)

    console.log('Success:', result.success)
    console.log('Errors:', result.errors)
    console.log('Warnings:', result.warnings)
    console.log('Nodes:', result.workflow?.nodes?.length)
    console.log('Edges:', result.workflow?.edges?.length)

    if (!result.success) {
      console.log('Full error:', JSON.stringify(result, null, 2))
    }

    expect(result.success).toBe(true)
  })
})
