<template>
  <div :class="['subprocess-node', { selected }]" :style="nodeStyle">
    <div class="subprocess-header">
      <span class="subprocess-icon">▱</span>
      <span class="subprocess-label">{{ label }}</span>
    </div>
    <!-- Expand/Collapse button for subprocesses with internal elements -->
    <button
      v-if="hasInternalElements"
      class="expand-collapse-btn"
      :title="isExpanded ? 'Collapse' : 'Expand'"
      @click.stop="onToggleExpand"
    >
      {{ isExpanded ? '−' : '+' }}
    </button>
    <div v-if="triggeredByEvent" class="event-indicator" title="Event Sub Process">⚡</div>
    <Handle
      type="target"
      :position="Position.Left"
      :id="handleId('target')"
      class="handle handle-target"
    />
    <Handle
      type="source"
      :position="Position.Right"
      :id="handleId('source')"
      class="handle handle-source"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'

interface SubProcessNodeData {
  label: string
  triggeredByEvent?: boolean
  isExpanded?: boolean
  internalNodes?: any[]
  internalEdges?: any[]
}

const props = defineProps<NodeProps<SubProcessNodeData>>()

// Inject the toggleExpand function from BpmnEditor
const toggleExpand = inject<(nodeId: string) => void>('toggleExpand', () => {
  console.warn('toggleExpand function not provided')
})

const label = computed(() => props.data?.label || 'Sub Process')

const triggeredByEvent = computed(() => props.data?.triggeredByEvent === true)

const isExpanded = computed(() => props.data?.isExpanded === true)

const hasInternalElements = computed(() =>
  props.data?.internalNodes && props.data.internalNodes.length > 0
)

const nodeStyle = computed(() => ({
  width: `${props.data?.width || 100}px`,
  height: `${props.data?.height || 80}px`
}))

const handleId = (type: string) => `${props.id}-${type}`

// For selected state
const selected = computed(() => props.selected)

const onToggleExpand = () => {
  toggleExpand(props.id)
}
</script>

<style scoped>
.subprocess-node {
  background: white;
  border: 2px solid #3498db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subprocess-node:hover {
  border-color: #2980b9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.subprocess-node.selected {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
}

.subprocess-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
}

.subprocess-icon {
  font-size: 16px;
  color: #3498db;
}

.subprocess-label {
  font-size: 12px;
  font-weight: 500;
  color: #2c3e50;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expand-collapse-btn {
  position: absolute;
  top: -8px;
  left: -8px;
  width: 20px;
  height: 20px;
  background: #27ae60;
  color: white;
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.expand-collapse-btn:hover {
  background: #229954;
  transform: scale(1.1);
}

.event-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background: #f39c12;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.handle {
  width: 10px;
  height: 10px;
  background: white;
  border: 2px solid #3498db;
  border-radius: 50%;
}

.handle-target {
  left: -6px;
}

.handle-source {
  right: -6px;
}

.handle:hover {
  background: #3498db;
}
</style>
