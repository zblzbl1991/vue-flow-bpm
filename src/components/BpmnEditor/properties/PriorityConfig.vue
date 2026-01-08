<template>
  <div class="property-group">
    <div class="property-group-title">Priority & Due Date</div>
    <div class="property-row">
      <label>Priority</label>
      <input
        type="number"
        :value="data.priority || ''"
        @input="updatePriority"
        placeholder="50"
        min="0"
        max="100"
      />
      <small>Task priority (0-100, higher = more important)</small>
    </div>

    <div class="property-row">
      <label>Due Date</label>
      <input
        type="text"
        :value="data.dueDate || ''"
        @input="updateDueDate"
        placeholder="${dueDate}"
      />
      <small>Date expression or variable name</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BpmnNodeData } from '@/types/bpmn'

const props = defineProps<{
  data: BpmnNodeData
}>()

const emit = defineEmits<{
  (e: 'update', key: string, value: any): void
}>()

const updatePriority = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update', 'priority', value ? parseInt(value) : undefined)
}

const updateDueDate = (event: Event) => {
  emit('update', 'dueDate', (event.target as HTMLInputElement).value)
}
</script>

<style scoped>
.property-group {
  padding: 12px 0;
  border-bottom: 1px solid #dee2e6;
}

.property-group-title {
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #dee2e6;
}

.property-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.property-row label {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
}

.property-row input[type="text"],
.property-row input[type="number"] {
  padding: 8px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
  transition: border-color 0.2s;
  font-family: inherit;
}

.property-row input[type="text"]:focus,
.property-row input[type="number"]:focus {
  outline: none;
  border-color: #3498db;
}

.property-row small {
  font-size: 11px;
  color: #868e96;
}
</style>
