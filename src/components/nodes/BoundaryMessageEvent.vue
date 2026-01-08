<template>
  <div class="bpmn-node boundary-message-event" :class="{ selected }">
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
        stroke="#9b59b6"
        stroke-width="2"
        fill="#fff"
      />
      <!-- Message icon (envelope) -->
      <rect x="10" y="13" width="20" height="14" stroke="#9b59b6" stroke-width="1.5" fill="none" />
      <polyline points="10,13 20,21 30,13" stroke="#9b59b6" stroke-width="1.5" fill="none" />
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
  border: 2px solid #9b59b6;
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
