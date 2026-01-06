<template>
  <div class="bpmn-node service-task" :class="{ selected }">
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
          stroke="#9b59b6"
          stroke-width="2"
          fill="#f4ecf7"
        />
        <!-- Gear icon -->
        <g transform="translate(18, 18)">
          <circle cx="8" cy="8" r="6" fill="none" stroke="#9b59b6" stroke-width="2" />
          <path
            d="M 8 0 L 8 3 M 8 13 L 8 16 M 0 8 L 3 8 M 13 8 L 16 8 M 2.3 2.3 L 4.5 4.5 M 11.5 11.5 L 13.7 13.7 M 2.3 13.7 L 4.5 11.5 M 11.5 4.5 L 13.7 2.3"
            stroke="#9b59b6"
            stroke-width="2"
            fill="none"
          />
        </g>
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
      <div v-if="data.async" class="node-async">⚡ async</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface Props {
  id: string
  data: { label?: string; async?: boolean; width?: number; height?: number }
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

.node-async {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  background: #9b59b6;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  white-space: nowrap;
}
</style>
