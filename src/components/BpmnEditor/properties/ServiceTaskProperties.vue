<template>
  <div class="property-group">
    <h4>Service Task Properties</h4>

    <div class="property-row">
      <label>Expression</label>
      <input
        type="text"
        :value="data.expression || ''"
        @input="updateProperty('expression', $event)"
        placeholder="${myService.doSomething()}"
      />
      <small>Expression to execute</small>
    </div>

    <div class="property-row">
      <label>Delegate Expression</label>
      <input
        type="text"
        :value="data.delegateExpression || ''"
        @input="updateProperty('delegateExpression', $event)"
        placeholder="${myDelegate}"
      />
      <small>Delegate expression bean name</small>
    </div>

    <div class="property-row">
      <label>Class</label>
      <input
        type="text"
        :value="data.class || ''"
        @input="updateProperty('class', $event)"
        placeholder="com.example.MyDelegate"
      />
      <small>Full Java class name</small>
    </div>

    <div class="property-row checkbox-row">
      <label class="checkbox-label">
        <input
          type="checkbox"
          :checked="data.async || false"
          @change="updateProperty('async', $event)"
        />
        <span>Async</span>
      </label>
      <small>Execute this task asynchronously</small>
    </div>

    <div class="property-row checkbox-row">
      <label class="checkbox-label">
        <input
          type="checkbox"
          :checked="data.asyncBefore || false"
          @change="updateProperty('asyncBefore', $event)"
        />
        <span>Async Before</span>
      </label>
      <small>Execute this task asynchronously before</small>
    </div>

    <div class="property-row checkbox-row">
      <label class="checkbox-label">
        <input
          type="checkbox"
          :checked="data.asyncAfter || false"
          @change="updateProperty('asyncAfter', $event)"
        />
        <span>Async After</span>
      </label>
      <small>Execute this task asynchronously after</small>
    </div>

    <div class="property-row checkbox-row">
      <label class="checkbox-label">
        <input
          type="checkbox"
          :checked="data.triggerable || false"
          @change="updateProperty('triggerable', $event)"
        />
        <span>Triggerable</span>
      </label>
      <small>Allow triggering during async execution</small>
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

const updateProperty = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.type === 'checkbox') {
    emit('update', key, target.checked)
  } else {
    emit('update', key, target.value)
  }
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

.property-row input[type="text"] {
  padding: 8px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
  transition: border-color 0.2s;
  font-family: inherit;
}

.property-row input:focus {
  outline: none;
  border-color: #3498db;
}

.property-row small {
  font-size: 11px;
  color: #868e96;
}

.checkbox-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #495057;
  font-weight: normal;
  text-transform: none;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
</style>
