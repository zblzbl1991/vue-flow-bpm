<template>
  <div class="property-group">
    <div class="property-header">
      <h4>Multi-instance</h4>
      <label class="toggle-switch">
        <input
          type="checkbox"
          :checked="!!config"
          @change="toggleMultiInstance"
        />
        <span></span>
      </label>
    </div>

    <div v-if="!config" class="empty-state">
      <p>Multi-instance is disabled</p>
    </div>

    <div v-else class="multi-instance-config">
      <div class="property-row">
        <label>Type</label>
        <div class="radio-group">
          <label class="radio-label">
            <input
              type="radio"
              :checked="!config.isSequential"
              @change="updateConfig('isSequential', false)"
            />
            <span>Parallel</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              :checked="config.isSequential"
              @change="updateConfig('isSequential', true)"
            />
            <span>Sequential</span>
          </label>
        </div>
      </div>

      <div class="property-row">
        <label>Collection</label>
        <input
          type="text"
          :value="config.collection || ''"
          @input="updateConfig('collection', $event)"
          placeholder="${assigneeList}"
        />
        <small>Variable containing the collection</small>
      </div>

      <div class="property-row">
        <label>Element Variable</label>
        <input
          type="text"
          :value="config.elementVariable || ''"
          @input="updateConfig('elementVariable', $event)"
          placeholder="assignee"
        />
        <small>Variable name for each element</small>
      </div>

      <div class="property-row">
        <label>Completion Condition</label>
        <textarea
          :value="config.completionCondition || ''"
          @input="updateConfig('completionCondition', $event)"
          placeholder="${nrOfCompletedInstances >= nrOfInstances}"
          rows="2"
        />
        <small>Expression to determine completion</small>
      </div>

      <div class="property-row">
        <label>Cardinality</label>
        <input
          type="text"
          :value="config.cardinality || ''"
          @input="updateConfig('cardinality', $event)"
          placeholder="${collectionSize()}"
        />
        <small>Number of instances (optional)</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MultiInstanceConfig } from '@/types/bpmn'

const props = defineProps<{
  config?: MultiInstanceConfig
}>()

const emit = defineEmits<{
  (e: 'update', config: MultiInstanceConfig | undefined): void
}>()

const toggleMultiInstance = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  if (checked) {
    emit('update', {
      isSequential: false,
      collection: '',
      elementVariable: '',
      completionCondition: ''
    })
  } else {
    emit('update', undefined)
  }
}

const updateConfig = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  const value = target.type === 'radio' ? target.checked : target.value
  emit('update', {
    ...props.config,
    [key]: value
  } as MultiInstanceConfig)
}
</script>

<style scoped>
.property-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.property-header h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #495057;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch span {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-switch span:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + span {
  background-color: #28a745;
}

.toggle-switch input:checked + span:before {
  transform: translateX(20px);
}

.empty-state {
  padding: 16px;
  text-align: center;
  color: #868e96;
  font-size: 12px;
}

.multi-instance-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.property-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #495057;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  cursor: pointer;
}
</style>
