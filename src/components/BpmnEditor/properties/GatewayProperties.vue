<template>
  <div class="property-group">
    <h4>Gateway Properties</h4>

    <div class="property-row">
      <label>Default Flow</label>
      <select
        :value="data.default || ''"
        @change="updateProperty('default', $event)"
      >
        <option value="">None</option>
        <option v-for="flow in outgoingFlows" :key="flow.id" :value="flow.id">
          {{ flow.label || flow.id }}
        </option>
      </select>
      <small>The default sequence flow to take if no conditions match</small>
    </div>

    <div class="property-row">
      <label>Documentation</label>
      <textarea
        :value="data.documentation || ''"
        @input="updateProperty('documentation', $event)"
        placeholder="Gateway documentation..."
        rows="3"
      />
    </div>

    <div v-if="outgoingFlows.length > 0" class="outgoing-flows">
      <label>Outgoing Flows</label>
      <div class="flow-list">
        <div v-for="flow in outgoingFlows" :key="flow.id" class="flow-item">
          <span class="flow-label">{{ flow.label || flow.id }}</span>
          <span v-if="flow.condition" class="flow-condition">{{ flow.condition }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BpmnNodeData, BpmnEdge } from '@/types/bpmn'

const props = defineProps<{
  data: BpmnNodeData
  outgoingFlows: BpmnEdge[]
}>()

const emit = defineEmits<{
  (e: 'update', key: string, value: any): void
}>()

const updateProperty = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  emit('update', key, target.value)
}
</script>

<style scoped>
.property-group {
  padding: 12px 0;
  border-bottom: 1px solid #dee2e6;
}

.property-group h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #495057;
}

.property-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.property-row label {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
}

.property-row select,
.property-row textarea {
  padding: 8px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
  transition: border-color 0.2s;
  font-family: inherit;
}

.property-row select:focus,
.property-row textarea:focus {
  outline: none;
  border-color: #3498db;
}

.property-row small {
  font-size: 11px;
  color: #868e96;
}

.outgoing-flows {
  margin-top: 16px;
}

.outgoing-flows > label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.flow-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.flow-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 12px;
}

.flow-label {
  color: #495057;
  font-weight: 500;
}

.flow-condition {
  color: #868e96;
  font-family: monospace;
  font-size: 11px;
}
</style>
