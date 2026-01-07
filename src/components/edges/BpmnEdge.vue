<template>
  <BaseEdge
    :path="edgePath"
    :marker-end="markerEnd"
    :style="edgeStyle"
  />
</template>

<script setup lang="ts">
import { BaseEdge, getBezierPath } from '@vue-flow/core'
import { computed } from 'vue'
import type { EdgeProps } from '@vue-flow/core'

const props = defineProps<EdgeProps>()

/**
 * Edge path computed from BPMN waypoints or default bezier curve
 * - If edge has stored path from BPMN waypoints (from import), use it
 * - Otherwise, use default bezier curve calculation for user-created edges
 */
const edgePath = computed(() => {
  // If edge has stored path from BPMN waypoints, use it
  if (props.data.path) {
    return props.data.path
  }

  // Otherwise, use default bezier curve calculation
  const [path] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  })

  return path
})

/**
 * Edge styling matching BPMN standards
 */
const edgeStyle = computed(() => ({
  strokeWidth: 2,
  stroke: '#bdc3c7',
}))
</script>

<style scoped>
/* Additional styling if needed */
</style>
