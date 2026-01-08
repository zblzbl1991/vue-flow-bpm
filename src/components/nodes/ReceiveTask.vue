<template>
  <div class="bpmn-node receive-task" :class="{ selected }">
    <div class="task-container">
      <svg
        :width="data.width || 120"
        :height="data.height || 80"
        viewBox="0 0 120 80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="5"
          y="5"
          width="110"
          height="70"
          rx="10"
          ry="10"
          :class="['task-shape', { selected }]"
          stroke="#3498db"
          stroke-width="2"
          fill="#ebf5fb"
        />
        <!-- Receive icon (inbox arrow) -->
        <path
          d="M 15 35 L 30 35 L 30 25 L 40 25 L 40 35 L 55 35 L 35 50 Z"
          stroke="#3498db"
          stroke-width="1.5"
          fill="#3498db"
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

.bpmn-node.selected .task-shape {
  stroke: #3498db !important;
  stroke-width: 3 !important;
}

.task-container {
  position: relative;
}

.handle {
  width: 10px;
  height: 10px;
  background: #fff;
  border: 2px solid #3498db;
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
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  text-align: center;
  width: 140px;
  background: white;
  padding: 2px 4px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
