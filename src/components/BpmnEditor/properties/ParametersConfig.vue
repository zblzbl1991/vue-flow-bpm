<template>
  <div class="parameters-config">
    <!-- Input Parameters -->
    <div class="parameter-section">
      <div class="section-header">
        <h4>Input Parameters</h4>
        <button class="btn-add" @click="addInputParameter">+ Add</button>
      </div>

      <div v-if="!inputParameters || inputParameters.length === 0" class="empty-state">
        <p>No input parameters defined.</p>
        <p class="hint">Variables to set before task execution.</p>
      </div>

      <div v-else class="parameters-list">
        <div
          v-for="(param, index) in inputParameters"
          :key="`input-${index}`"
          class="parameter-item"
        >
          <div class="parameter-row">
            <input
              type="text"
              :value="param.name"
              @input="updateInputParameter(index, 'name', $event.target.value)"
              placeholder="Variable name"
              class="input-field input-name"
            />
            <input
              type="text"
              :value="param.value"
              @input="updateInputParameter(index, 'value', $event.target.value)"
              placeholder="Value or expression (e.g., ${variable})"
              class="input-field input-value"
            />
            <button class="btn-remove" @click="removeInputParameter(index)" title="Remove">×</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Output Parameters -->
    <div class="parameter-section">
      <div class="section-header">
        <h4>Output Parameters</h4>
        <button class="btn-add" @click="addOutputParameter">+ Add</button>
      </div>

      <div v-if="!outputParameters || outputParameters.length === 0" class="empty-state">
        <p>No output parameters defined.</p>
        <p class="hint">Variables to set after task execution.</p>
      </div>

      <div v-else class="parameters-list">
        <div
          v-for="(param, index) in outputParameters"
          :key="`output-${index}`"
          class="parameter-item"
        >
          <div class="parameter-row">
            <input
              type="text"
              :value="param.name"
              @input="updateOutputParameter(index, 'name', $event.target.value)"
              placeholder="Variable name"
              class="input-field input-name"
            />
            <input
              type="text"
              :value="param.value"
              @input="updateOutputParameter(index, 'value', $event.target.value)"
              placeholder="Value or expression (e.g., ${result})"
              class="input-field input-value"
            />
            <button class="btn-remove" @click="removeOutputParameter(index)" title="Remove">×</button>
          </div>
        </div>
      </div>
    </div>

    <div class="help-text">
      <p><strong>Input Parameters:</strong> Set process variables before the task executes.</p>
      <p><strong>Output Parameters:</strong> Copy values back to process variables after execution.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Parameter } from '@/types/bpmn'

const props = defineProps<{
  inputParameters?: Parameter[]
  outputParameters?: Parameter[]
}>()

const emit = defineEmits<{
  (e: 'update-input', parameters: Parameter[]): void
  (e: 'update-output', parameters: Parameter[]): void
}>()

const addInputParameter = () => {
  const newParam: Parameter = {
    name: '',
    value: ''
  }
  emit('update-input', [...(props.inputParameters || []), newParam])
}

const removeInputParameter = (index: number) => {
  const updated = [...(props.inputParameters || [])]
  updated.splice(index, 1)
  emit('update-input', updated)
}

const updateInputParameter = (index: number, key: keyof Parameter, value: string) => {
  const updated = [...(props.inputParameters || [])]
  updated[index] = { ...updated[index], [key]: value }
  emit('update-input', updated)
}

const addOutputParameter = () => {
  const newParam: Parameter = {
    name: '',
    value: ''
  }
  emit('update-output', [...(props.outputParameters || []), newParam])
}

const removeOutputParameter = (index: number) => {
  const updated = [...(props.outputParameters || [])]
  updated.splice(index, 1)
  emit('update-output', updated)
}

const updateOutputParameter = (index: number, key: keyof Parameter, value: string) => {
  const updated = [...(props.outputParameters || [])]
  updated[index] = { ...updated[index], [key]: value }
  emit('update-output', updated)
}
</script>

<style scoped>
.parameters-config {
  padding: 12px 0;
  border-bottom: 1px solid #dee2e6;
}

.parameter-section {
  margin-bottom: 16px;
}

.parameter-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-header h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #495057;
}

.btn-add {
  padding: 3px 8px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #138496;
}

.empty-state {
  padding: 12px;
  text-align: center;
  color: #868e96;
  font-size: 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.empty-state p {
  margin: 0;
}

.empty-state .hint {
  margin-top: 4px;
  font-size: 11px;
  font-style: italic;
}

.parameters-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.parameter-item {
  display: flex;
  flex-direction: column;
}

.parameter-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.input-field {
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 12px;
}

.input-field:focus {
  outline: none;
  border-color: #3498db;
}

.input-name {
  flex: 0 0 120px;
}

.input-value {
  flex: 1;
}

.btn-remove {
  background: transparent;
  border: none;
  color: #dc3545;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
  flex-shrink: 0;
}

.btn-remove:hover {
  background: #ffe6e6;
}

.help-text {
  margin-top: 12px;
  padding: 8px;
  background: #e7f5ff;
  border-left: 3px solid #17a2b8;
  border-radius: 4px;
}

.help-text p {
  margin: 0;
  font-size: 11px;
  color: #495057;
  line-height: 1.5;
}

.help-text p:first-child {
  margin-bottom: 4px;
}
</style>
