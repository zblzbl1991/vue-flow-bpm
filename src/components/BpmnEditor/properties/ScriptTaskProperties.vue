<template>
  <div class="property-group">
    <div class="property-group-title">Script Task Configuration</div>
    <div class="property-row">
      <label>Script Format</label>
      <select
        :value="data.scriptFormat || ''"
        @change="updateScriptFormat"
      >
        <option value="">Select script language...</option>
        <option value="groovy">Groovy</option>
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="juel">JUEL</option>
        <option value="camunda">Camunda Expression</option>
      </select>
      <small>Script language to use</small>
    </div>

    <div class="property-row">
      <label>Script</label>
      <textarea
        :value="data.script || ''"
        @input="updateScript"
        placeholder="// Enter script here..."
        rows="8"
        class="script-editor"
      />
      <small>Script code to execute</small>
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

const updateScriptFormat = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  emit('update', 'scriptFormat', value || undefined)
}

const updateScript = (event: Event) => {
  emit('update', 'script', (event.target as HTMLTextAreaElement).value)
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

.script-editor {
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  line-height: 1.4;
  resize: vertical;
  min-height: 100px;
}

.property-row small {
  font-size: 11px;
  color: #868e96;
}
</style>
