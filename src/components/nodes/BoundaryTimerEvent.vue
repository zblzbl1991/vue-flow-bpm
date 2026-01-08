<template>
  <div class="bpmn-node boundary-timer-event" :class="{ selected }">
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
        stroke="#f39c12"
        stroke-width="2"
        fill="#fff"
      />
      <!-- Timer icon -->
      <circle cx="20" cy="20" r="6" stroke="#f39c12" stroke-width="1.5" fill="none" />
      <line x1="20" y1="20" x2="20" y2="15" stroke="#f39c12" stroke-width="1.5" />
      <line x1="20" y1="20" x2="23" y2="20" stroke="#f39c12" stroke-width="1.5" />
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
  border: 2px solid #f39c12;
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
