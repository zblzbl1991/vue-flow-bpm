/**
 * Fixture Generator Script
 * Generates BPMN XML from JSON fixtures for testing
 *
 * Usage:
 *   npx tsx scripts/generate-bpmn-fixture.ts <json-file> [output-file]
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// Import converter
async function convertFile(jsonPath: string, outputPath?: string) {
  try {
    // Read JSON file
    const fullPath = join(process.cwd(), jsonPath)
    const jsonContent = readFileSync(fullPath, 'utf-8')
    const workflow = JSON.parse(jsonContent)

    // Dynamically import converter (ESM)
    const converterModule = await import('../src/composables/useBpmnConverter.ts')
    const { convertToBpmnXml } = converterModule.useBpmnConverter()

    // Convert to BPMN XML
    const bpmnXml = convertToBpmnXml(
      workflow.nodes,
      workflow.edges,
      workflow.process.id,
      workflow.process.name
    )

    // Determine output path
    let outputFullPath: string
    if (outputPath) {
      outputFullPath = join(process.cwd(), outputPath)
    } else {
      // Replace .json with .bpmn.xml
      outputFullPath = fullPath.replace(/\.json$/, '.bpmn.xml')
    }

    // Write BPMN XML
    writeFileSync(outputFullPath, bpmnXml, 'utf-8')

    console.log(`✓ Generated: ${outputFullPath}`)
    console.log(`  Nodes: ${workflow.nodes.length}`)
    console.log(`  Edges: ${workflow.edges.length}`)
    console.log(`  Size: ${(bpmnXml.length / 1024).toFixed(2)} KB`)

  } catch (error) {
    console.error(`✗ Error: ${error instanceof Error ? error.message : error}`)
    process.exit(1)
  }
}

// CLI interface
const args = process.argv.slice(2)

if (args.length === 0) {
  console.log('Fixture Generator')
  console.log('')
  console.log('Usage:')
  console.log('  npx tsx scripts/generate-bpmn-fixture.ts <json-file> [output-file]')
  console.log('')
  console.log('Examples:')
  console.log('  npx tsx scripts/generate-bpmn-fixture.ts tests/fixtures/simple/linear-flow.json')
  console.log('  npx tsx scripts/generate-bpmn-fixture.ts my-workflow.json output.bpmn.xml')
  process.exit(1)
}

convertFile(args[0], args[1])
