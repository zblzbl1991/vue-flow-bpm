<template>
  <div class="process-properties">
    <h4>Process Properties</h4>

    <div class="property-group">
      <div class="property-row">
        <label for="process-id">Process ID</label>
        <input
          id="process-id"
          type="text"
          :value="processInfo.id"
          @input="onUpdate('id', $event.target.value)"
          placeholder="e.g., myProcess"
          class="input-field"
        />
        <span class="property-hint">Unique identifier for this process</span>
      </div>

      <div class="property-row">
        <label for="process-name">Process Name</label>
        <input
          id="process-name"
          type="text"
          :value="processInfo.name"
          @input="onUpdate('name', $event.target.value)"
          placeholder="e.g., My Business Process"
          class="input-field"
        />
        <span class="property-hint">Display name for the process</span>
      </div>

      <div class="property-row">
        <label for="process-version">Version</label>
        <input
          id="process-version"
          type="number"
          :value="processInfo.version"
          @input="onUpdate('version', parseInt($event.target.value) || 1)"
          min="1"
          class="input-field"
        />
        <span class="property-hint">Process version number</span>
      </div>

      <div class="property-row">
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="processInfo.executable !== false"
            @change="onUpdate('executable', $event.target.checked)"
          />
          <span>Executable</span>
        </label>
        <span class="property-hint">Whether this process can be executed</span>
      </div>

      <div class="property-row">
        <label for="process-documentation">Documentation</label>
        <textarea
          id="process-documentation"
          :value="processInfo.documentation"
          @input="onUpdate('documentation', $event.target.value)"
          placeholder="Describe the purpose of this process..."
          rows="4"
          class="input-field"
        ></textarea>
      </div>

      <div class="property-row">
        <label for="candidate-starter">Candidate Starter Groups</label>
        <input
          id="candidate-starter"
          type="text"
          :value="formatGroups(processInfo.candidateStarterGroups)"
          @input="onUpdateGroups($event.target.value)"
          placeholder="e.g., managers, admins"
          class="input-field"
        />
        <span class="property-hint">Comma-separated list of groups who can start this process</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BpmnProcess } from '@/types/bpmn'

const props = defineProps<{
  processInfo: BpmnProcess
}>()

const emit = defineEmits<{
  (e: 'update', key: string, value: any): void
}>()

const onUpdate = (key: string, value: any) => {
  emit('update', key, value)
}

const onUpdateGroups = (value: string) => {
  const groups = value
    .split(',')
    .map(g => g.trim())
    .filter(g => g.length > 0)
  emit('update', 'candidateStarterGroups', groups)
}

const formatGroups = (groups?: string[]) => {
  return groups?.join(', ') || ''
}
</script>

<style scoped>
.process-properties {
  padding: 12px 0;
  border-bottom: 1px solid #dee2e6;
}

.process-properties h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.property-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.property-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.property-row label {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-label span {
  font-size: 13px;
  font-weight: 500;
  color: #495057;
}

.input-field {
  padding: 8px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #3498db;
}

.input-field::placeholder {
  color: #adb5bd;
}

.property-hint {
  font-size: 11px;
  color: #868e96;
  font-style: italic;
}

textarea.input-field {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  line-height: 1.4;
}
</style>
