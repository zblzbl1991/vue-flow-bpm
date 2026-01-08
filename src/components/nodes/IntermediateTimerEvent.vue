<template>
  <div class="bpmn-node intermediate-timer-event" :class="{ selected }">
    <svg
      :width="data.width || 50"
      :height="data.height || 50"
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Outer circle (hollow for catch event) -->
      <circle
        cx="25"
        cy="25"
        r="22"
        :class="['bpmn-shape', { selected }]"
        stroke="#f39c12"
        stroke-width="2"
        fill="#fff"
      />
      <!-- Inner circle -->
      <circle
        cx="25"
        cy="25"
        r="18"
        stroke="#f39c12"
        stroke-width="1"
        fill="none"
      />
      <!-- Timer icon -->
      <circle cx="25" cy="25" r="8" stroke="#f39c12" stroke-width="1.5" fill="none" />
      <line x1="25" y1="25" x2="25" y2="19" stroke="#f39c12" stroke-width="1.5" />
      <line x1="25" y1="25" x2="29" y2="25" stroke="#f39c12" stroke-width="1.5" />
    </svg>
    <Handle
      id="input"
      type="target"
      :position="Position.Left"
      class="handle target-handle"
    />
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

.target-handle {
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  position: absolute;
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
