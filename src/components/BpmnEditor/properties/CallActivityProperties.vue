<template>
  <div class="property-group">
    <div class="property-group-title">Call Activity Configuration</div>
    <div class="property-row">
      <label>Called Element</label>
      <input
        type="text"
        :value="data.calledElement || ''"
        @input="updateCalledElement"
        placeholder="processId"
      />
      <small>Process ID to call</small>
    </div>

    <div class="property-row">
      <label>Inherit Variables</label>
      <input
        type="checkbox"
        :checked="data.inheritVariables"
        @change="updateInheritVariables"
      />
      <small>Inherit variables from parent process</small>
    </div>

    <div class="property-row">
      <label>Business Key</label>
      <input
        type="text"
        :value="data.businessKey || ''"
        @input="updateBusinessKey"
        placeholder="${parentBusinessKey}"
      />
      <small>Business key expression for called process</small>
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

const updateCalledElement = (event: Event) => {
  emit('update', 'calledElement', (event.target as HTMLInputElement).value)
}

const updateInheritVariables = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  emit('update', 'inheritVariables', checked)
}

const updateBusinessKey = (event: Event) => {
  emit('update', 'businessKey', (event.target as HTMLInputElement).value)
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

.property-row input[type="text"] {
  padding: 8px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
  transition: border-color 0.2s;
  font-family: inherit;
}

.property-row input[type="text"]:focus {
  outline: none;
  border-color: #3498db;
}

.property-row input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.property-row small {
  font-size: 11px;
  color: #868e96;
}
</style>
