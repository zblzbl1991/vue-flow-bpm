<template>
  <div class="control-panel">
    <h3>Elements</h3>
    <div class="element-list">
      <div
        v-for="config in elementConfigs"
        :key="config.type"
        class="element-item"
        :draggable="true"
        @dragstart="onDragStart($event, config.type)"
        @click="onAddElement(config.type)"
      >
        <span class="element-icon">{{ config.icon }}</span>
        <span class="element-label">{{ config.label }}</span>
      </div>
    </div>
    <div class="actions">
      <button class="btn-clear" @click="onClear">Clear All</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BPMN_ELEMENT_CONFIGS, type BpmnElementType } from '@/types/bpmn'

const emit = defineEmits<{
  (e: 'add-element', type: BpmnElementType): void
  (e: 'clear'): void
}>()

const elementConfigs = Object.values(BPMN_ELEMENT_CONFIGS)

const onDragStart = (event: DragEvent, type: BpmnElementType) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vue-flow', type)
    event.dataTransfer.effectAllowed = 'move'
  }
}

const onAddElement = (type: BpmnElementType) => {
  emit('add-element', type)
}

const onClear = () => {
  if (confirm('Are you sure you want to clear the entire workflow?')) {
    emit('clear')
  }
}
</script>

<style scoped>
.control-panel {
  width: 200px;
  background: #f8f9fa;
  border-right: 1px solid #dee2e6;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.control-panel h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #495057;
}

.element-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.element-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
  user-select: none;
}

.element-item:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.element-item:active {
  cursor: grabbing;
}

.element-icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f3f5;
  border-radius: 4px;
}

.element-label {
  font-size: 13px;
  color: #495057;
}

.actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #dee2e6;
}

.btn-clear {
  width: 100%;
  padding: 8px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-clear:hover {
  background: #c82333;
}
</style>
