<template>
  <div class="property-group">
    <h4>Event Properties</h4>

    <div class="property-row">
      <label>Name / Label</label>
      <input
        type="text"
        :value="data.label || ''"
        @input="updateProperty('label', $event)"
        placeholder="Event name"
      />
    </div>

    <div class="property-row">
      <label>Documentation</label>
      <textarea
        :value="data.documentation || ''"
        @input="updateProperty('documentation', $event)"
        placeholder="Event documentation..."
        rows="3"
      />
    </div>

    <!-- Timer Event Properties -->
    <div v-if="isTimerEvent" class="timer-section">
      <h5>Timer Configuration</h5>

      <div class="property-row">
        <label>Timer Type</label>
        <select
          :value="data.timerType || 'duration'"
          @change="updateProperty('timerType', $event)"
          class="select-field"
        >
          <option value="duration">Duration (e.g., PT5M)</option>
          <option value="date">Specific Date (e.g., 2024-12-31T23:59:59)</option>
          <option value="cycle">Cycle (e.g., R3/PT10M)</option>
        </select>
        <small class="hint">Type of timer definition</small>
      </div>

      <div class="property-row">
        <label>Timer Expression</label>
        <input
          type="text"
          :value="data.timerExpression || ''"
          @input="updateProperty('timerExpression', $event)"
          :placeholder="getTimerPlaceholder()"
          class="input-field"
        />
        <small class="hint">{{ getTimerHint() }}</small>
      </div>

      <div v-if="data.timerType === 'cycle'" class="property-row">
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="data.timerInfinite !== false"
            @change="updateProperty('timerInfinite', $event.target.checked)"
          />
          <span>Infinite Loop</span>
        </label>
        <small class="hint">If checked, timer repeats indefinitely</small>
      </div>
    </div>

    <!-- Message Event Properties -->
    <div v-if="isMessageEvent" class="property-row">
      <label>Message Reference</label>
      <input
        type="text"
        :value="data.messageRef || ''"
        @input="updateProperty('messageRef', $event)"
        placeholder="${messageName}"
        class="input-field"
      />
      <small class="hint">Name of the message to catch/throw</small>
    </div>

    <!-- Signal Event Properties -->
    <div v-if="isSignalEvent" class="property-row">
      <label>Signal Reference</label>
      <input
        type="text"
        :value="data.signalRef || ''"
        @input="updateProperty('signalRef', $event)"
        placeholder="${signalName}"
        class="input-field"
      />
      <small class="hint">Name of the signal to catch/throw</small>
    </div>

    <!-- Error Event Properties -->
    <div v-if="isErrorEvent" class="property-row">
      <label>Error Code</label>
      <input
        type="text"
        :value="data.errorCode || ''"
        @input="updateProperty('errorCode', $event)"
        placeholder="MY_ERROR_CODE"
        class="input-field"
      />
      <small class="hint">Error code to catch</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BpmnNodeData } from '@/types/bpmn'

const props = defineProps<{
  data: BpmnNodeData
  isTimerEvent?: boolean
  isMessageEvent?: boolean
  isSignalEvent?: boolean
  isErrorEvent?: boolean
}>()

const emit = defineEmits<{
  (e: 'update', key: string, value: any): void
}>()

const updateProperty = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  emit('update', key, target.value)
}

const getTimerPlaceholder = () => {
  const timerType = props.data.timerType || 'duration'
  switch (timerType) {
    case 'duration':
      return 'PT5M (ISO 8601 duration)'
    case 'date':
      return '2024-12-31T23:59:59'
    case 'cycle':
      return 'R3/PT10M (3 times, every 10 min)'
    default:
      return '${timerExpression}'
  }
}

const getTimerHint = () => {
  const timerType = props.data.timerType || 'duration'
  switch (timerType) {
    case 'duration':
      return 'ISO 8601 duration format: PT5M = 5 minutes, PT1H = 1 hour'
    case 'date':
      return 'ISO 8601 date/time format when the timer should execute'
    case 'cycle':
      return 'ISO 8601 repeating interval format: R[n]/PT[n]M'
    default:
      return 'Timer expression in ISO 8601 format'
  }
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

.property-group h5 {
  margin: 16px 0 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timer-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #dee2e6;
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

.property-row input[type="text"],
.property-row textarea,
.property-row select {
  padding: 8px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
  transition: border-color 0.2s;
  font-family: inherit;
  background: white;
}

.property-row input:focus,
.property-row textarea:focus,
.property-row select:focus {
  outline: none;
  border-color: #3498db;
}

.property-row small,
.property-row .hint {
  font-size: 11px;
  color: #868e96;
  font-style: italic;
}
</style>
