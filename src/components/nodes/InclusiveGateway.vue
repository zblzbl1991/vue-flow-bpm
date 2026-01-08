<template>
  <div class="bpmn-node inclusive-gateway" :class="{ selected }">
    <svg
      :width="data.width || 60"
      :height="data.height || 60"
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Diamond shape with circle (inclusive gateway) -->
      <polygon
        points="30,5 55,30 30,55 5,30"
        :class="['gateway-shape', { selected }]"
        stroke="#e67e22"
        stroke-width="2"
        fill="#fef5e7"
      />
      <circle
        cx="30"
        cy="30"
        r="10"
        stroke="#e67e22"
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

.bpmn-node.selected .gateway-shape {
  stroke: #3498db !important;
  stroke-width: 3 !important;
}

.handle {
  width: 10px;
  height: 10px;
  background: #fff;
  border: 2px solid #e67e22;
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
