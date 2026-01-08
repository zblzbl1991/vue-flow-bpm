<template>
  <div class="property-group">
    <div class="property-group-title">Skip Expression</div>
    <div class="property-row">
      <label>Skip Expression</label>
      <input
        type="text"
        :value="data.skipExpression || ''"
        @input="updateSkipExpression"
        placeholder="${skipThisTask}"
      />
      <small>Boolean expression to skip task execution</small>
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

const updateSkipExpression = (event: Event) => {
  emit('update', 'skipExpression', (event.target as HTMLInputElement).value)
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

.property-row small {
  font-size: 11px;
  color: #868e96;
}
</style>
