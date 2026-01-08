<template>
  <div class="bpmn-node boundary-error-event" :class="{ selected }">
    <svg
      :width="data.width || 40"
      :height="data.height || 40"
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Outer circle with solid border (interrupting) -->
      <circle
        cx="20"
        cy="20"
        r="18"
        :class="['bpmn-shape', { selected }]"
        stroke="#e74c3c"
        stroke-width="2"
        fill="#fff"
      />
      <!-- Error icon (lightning bolt) -->
      <path
        d="M 18 10 L 22 10 L 20 18 L 24 18 L 16 30 L 18 20 L 14 20 Z"
        stroke="#e74c3c"
        stroke-width="1.5"
        fill="#e74c3c"
      />
    </svg>
    <Handle
      id="output"
      type="source"
      :position="Position.Right"
      class="handle source-handle"
    />
    <div v-if="data.label" class="node-label">{{ data.label }}</div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface Props {
  id: string
  data: { label?: string; width?: number; height?: number }
  selected?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.bpmn-node {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bpmn-node.selected .bpmn-shape {
  stroke: #3498db !important;
  stroke-width: 3 !important;
}

.handle {
  width: 10px;
  height: 10px;
  background: #fff;
  border: 2px solid #e74c3c;
  border-radius: 50%;
}

.source-handle {
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  position: absolute;
}

.node-label {
  position: absolute;
  bottom: -25px;
  font-size: 12px;
  text-align: center;
  width: 120px;
  background: white;
  padding: 2px 4px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
