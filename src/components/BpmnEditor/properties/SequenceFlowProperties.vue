<template>
  <div class="property-group">
    <h4>Sequence Flow Properties</h4>

    <div class="property-row">
      <label>Name</label>
      <input
        type="text"
        :value="data.name || data.label || ''"
        @input="updateProperty('name', $event)"
        placeholder="Flow name"
      />
    </div>

    <div class="property-row">
      <label>Condition Expression</label>
      <textarea
        :value="data.condition || ''"
        @input="updateProperty('condition', $event)"
        placeholder="${approved == true}"
        rows="3"
      />
      <small>Condition expression for gateway flows</small>
    </div>

    <div class="property-row">
      <label>Documentation</label>
      <textarea
        :value="data.documentation || ''"
        @input="updateProperty('documentation', $event)"
        placeholder="Flow documentation..."
        rows="3"
      />
    </div>

    <div v-if="isGatewayFlow" class="property-row">
      <button class="btn-set-default" @click="setAsDefault">
        <span>★</span> Set as Default Flow
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BpmnEdgeData } from '@/types/bpmn'

const props = defineProps<{
  data: BpmnEdgeData
  isGatewayFlow?: boolean
}>()

const emit = defineEmits<{
  (e: 'update', key: string, value: any): void
  (e: 'set-default'): void
}>()

const updateProperty = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit('update', key, target.value)
}

const setAsDefault = () => {
  emit('set-default')
}
</script>

<style scoped>
.property-group {
  padding: 12px 0;
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

.property-row input[type="text"],
.property-row textarea {
  padding: 8px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
  transition: border-color 0.2s;
  font-family: inherit;
}

.property-row input:focus,
.property-row textarea:focus {
  outline: none;
  border-color: #3498db;
}

.property-row small {
  font-size: 11px;
  color: #868e96;
}

.btn-set-default {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f39c12;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-set-default:hover {
  background: #e67e22;
}

.btn-set-default span:first-child {
  font-size: 14px;
}
</style>
