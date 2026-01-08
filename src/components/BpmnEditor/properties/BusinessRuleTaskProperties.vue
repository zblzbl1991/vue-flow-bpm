<template>
  <div class="property-group">
    <div class="property-group-title">Business Rule Task Configuration</div>
    <div class="property-row">
      <label>Rules</label>
      <input
        type="text"
        :value="data.rules || ''"
        @input="updateRules"
        placeholder="rules"
      />
      <small>Rule definition reference</small>
    </div>

    <div class="property-row">
      <label>Rule Variables Input</label>
      <input
        type="text"
        :value="data.ruleVariablesInput || ''"
        @input="updateRuleVariablesInput"
        placeholder="inputVariable"
      />
      <small>Variables to pass to rules</small>
    </div>

    <div class="property-row">
      <label>Result Variable</label>
      <input
        type="text"
        :value="data.resultVariable || ''"
        @input="updateResultVariable"
        placeholder="outputVariable"
      />
      <small>Variable to store rule execution result</small>
    </div>

    <div class="property-row">
      <label>Exclude</label>
      <input
        type="checkbox"
        :checked="data.exclude"
        @change="updateExclude"
      />
      <small>Exclude this task from execution</small>
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

const updateRules = (event: Event) => {
  emit('update', 'rules', (event.target as HTMLInputElement).value)
}

const updateRuleVariablesInput = (event: Event) => {
  emit('update', 'ruleVariablesInput', (event.target as HTMLInputElement).value)
}

const updateResultVariable = (event: Event) => {
  emit('update', 'resultVariable', (event.target as HTMLInputElement).value)
}

const updateExclude = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  emit('update', 'exclude', checked)
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
