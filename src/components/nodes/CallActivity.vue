<template>
  <div class="bpmn-node call-activity" :class="{ selected }">
    <div class="task-container">
      <svg
        :width="data.width || 120"
        :height="data.height || 80"
        viewBox="0 0 120 80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Bold border for call activity -->
        <rect
          x="5"
          y="5"
          width="110"
          height="70"
          rx="10"
          ry="10"
          :class="['task-shape', { selected }]"
          stroke="#8e44ad"
          stroke-width="4"
          fill="#f4ecf7"
        />
        <!-- Refresh/call icon -->
        <path
          d="M 25 40 A 10 10 0 1 1 35 30"
          stroke="#8e44ad"
          stroke-width="2"
          fill="none"
        />
        <path d="M 35 30 L 38 27 L 38 33 Z" fill="#8e44ad" />
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
      <div v-if="data.calledElement" class="node-called-element">{{ data.calledElement }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface Props {
  id: string
  data: { label?: string; calledElement?: string; width?: number; height?: number }
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
  stroke-width: 4 !important;
}

.task-container {
  position: relative;
}

.handle {
  width: 10px;
  height: 10px;
  background: #fff;
  border: 2px solid #8e44ad;
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

.node-called-element {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  background: #8e44ad;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  white-space: nowrap;
}
</style>
