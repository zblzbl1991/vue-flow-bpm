<template>
  <div class="bpmn-node intermediate-signal-event" :class="{ selected }">
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
        stroke="#27ae60"
        stroke-width="2"
        fill="#fff"
      />
      <!-- Inner circle -->
      <circle
        cx="25"
        cy="25"
        r="18"
        stroke="#27ae60"
        stroke-width="1"
        fill="none"
      />
      <!-- Signal icon (triangle with arc) -->
      <path
        d="M 25 10 L 35 30 L 15 30 Z"
        stroke="#27ae60"
        stroke-width="1.5"
        fill="none"
      />
      <path
        d="M 18 35 Q 25 40 32 35"
        stroke="#27ae60"
        stroke-width="1.5"
        fill="none"
      />
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
  border: 2px solid #27ae60;
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
