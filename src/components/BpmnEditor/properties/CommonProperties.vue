<template>
  <div class="property-group">
    <div class="property-row">
      <label>ID</label>
      <input
        type="text"
        :value="data.bpmnId || nodeId"
        @input="updateBpmnId"
        placeholder="Element ID"
        :class="{ 'input-error': idError }"
      />
      <span v-if="idError" class="error-text">{{ idError }}</span>
      <small>Must start with letter or underscore, contain only letters, numbers, underscore, hyphen</small>
    </div>

    <div class="property-row">
      <label>Name / Label</label>
      <input
        type="text"
        :value="data.label"
        @input="updateLabel"
        placeholder="Element label"
      />
    </div>

    <div class="property-row">
      <label>Documentation</label>
      <textarea
        :value="data.documentation || ''"
        @input="updateDocumentation"
        placeholder="Documentation for this element..."
        rows="3"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { BpmnNodeData } from '@/types/bpmn'

const props = defineProps<{
  data: BpmnNodeData
  nodeId: string
}>()

const emit = defineEmits<{
  (e: 'update', key: string, value: any): void
}>()

const idError = ref('')

const validateId = (id: string): boolean => {
  if (!id) return true // Empty is OK (will use generated ID)
  return /^[a-zA-Z_][a-zA-Z0-9_.-]*$/.test(id)
}

const updateLabel = (event: Event) => {
  emit('update', 'label', (event.target as HTMLInputElement).value)
}

const updateDocumentation = (event: Event) => {
  emit('update', 'documentation', (event.target as HTMLTextAreaElement).value)
}

const updateBpmnId = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).value
  if (validateId(newValue)) {
    idError.value = ''
    emit('update', 'bpmnId', newValue)
  } else {
    idError.value = 'Invalid ID format'
  }
}
</script>

<style scoped>
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

.property-row input[type="text"]:focus,
.property-row textarea:focus {
  outline: none;
  border-color: #3498db;
}

.property-row input.input-error {
  border-color: #dc3545;
}

.property-row small {
  font-size: 11px;
  color: #868e96;
}

.error-text {
  font-size: 11px;
  color: #dc3545;
}

.property-row textarea {
  resize: vertical;
  min-height: 60px;
}
</style>
