<template>
  <div class="bpmn-node event-sub-process" :class="{ selected }">
    <div class="subprocess-container">
      <svg
        :width="data.width || 400"
        :height="data.height || 300"
        viewBox="0 0 400 300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Dashed border rectangle for event sub-process -->
        <rect
          x="5"
          y="5"
          width="390"
          height="290"
          rx="10"
          ry="10"
          :class="['subprocess-shape', { selected }]"
          stroke="#9b59b6"
          stroke-width="2"
          stroke-dasharray="5,5"
          fill="#f4ecf7"
        />
        <!-- Small circle indicator in top-left -->
        <circle cx="20" cy="20" r="8" stroke="#9b59b6" stroke-width="1.5" fill="#fff" />
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

.bpmn-node.selected .subprocess-shape {
  stroke: #3498db !important;
  stroke-width: 3 !important;
}

.subprocess-container {
  position: relative;
}

.handle {
  width: 10px;
  height: 10px;
  background: #fff;
  border: 2px solid #9b59b6;
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
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
}
</style>
