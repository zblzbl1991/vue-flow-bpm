<template>
  <div class="property-group">
    <div class="property-group-title">Async Configuration</div>
    <div class="property-row">
      <label>Async</label>
      <input
        type="checkbox"
        :checked="data.async || data.asyncBefore || data.asyncAfter"
        @change="updateAsync"
      />
      <small>Enable async execution for this task</small>
    </div>

    <div class="property-row">
      <label>Async Before</label>
      <input
        type="checkbox"
        :checked="data.asyncBefore"
        @change="updateAsyncBefore"
      />
      <small>Execute async before task</small>
    </div>

    <div class="property-row">
      <label>Async After</label>
      <input
        type="checkbox"
        :checked="data.asyncAfter"
        @change="updateAsyncAfter"
      />
      <small>Execute async after task</small>
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

const updateAsync = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  emit('update', 'async', checked)
}

const updateAsyncBefore = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  emit('update', 'asyncBefore', checked)
}

const updateAsyncAfter = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  emit('update', 'asyncAfter', checked)
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
