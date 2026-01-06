<template>
  <div
    class="subprocess-boundary"
    :class="{ selected }"
    :style="boundaryStyle"
  >
    <div class="boundary-header">
      <span class="boundary-icon">▭</span>
      <span class="boundary-label">{{ label }}</span>
    </div>
    <!-- No handles - boundary is just a visual container -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NodeProps } from '@vue-flow/core'

interface SubProcessBoundaryData {
  label: string
  width?: number
  height?: number
}

const props = defineProps<NodeProps<SubProcessBoundaryData>>()

const label = computed(() => props.data?.label || 'Sub Process')

const boundaryStyle = computed(() => ({
  width: `${props.data?.width || 400}px`,
  height: `${props.data?.height || 300}px`
}))

// For selected state
const selected = computed(() => props.selected)
</script>

<style scoped>
.subprocess-boundary {
  background: #fff;
  border: 2px dashed #3498db;
  border-radius: 8px;
  position: absolute;
  pointer-events: none; /* Let clicks pass through to nodes inside */
  box-sizing: border-box;
  z-index: 0; /* Render behind other nodes */
  transition: all 0.2s ease;
}

.subprocess-boundary.selected {
  border-color: #e74c3c;
  border-style: solid;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
}

.boundary-header {
  position: absolute;
  top: -12px;
  left: 10px;
  background: #fff;
  border: 1px solid #3498db;
  border-radius: 4px;
  padding: 2px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 1;
}

.subprocess-boundary.selected .boundary-header {
  border-color: #e74c3c;
  background: #ffebee;
}

.boundary-icon {
  font-size: 12px;
  color: #3498db;
}

.subprocess-boundary.selected .boundary-icon {
  color: #e74c3c;
}

.boundary-label {
  font-size: 11px;
  font-weight: 600;
  color: #3498db;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.subprocess-boundary.selected .boundary-label {
  color: #e74c3c;
}
</style>
