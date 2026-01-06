<template>
  <div class="property-group">
    <h4>User Task Properties</h4>

    <div class="property-row">
      <label>Assignee</label>
      <input
        type="text"
        :value="data.assignee || ''"
        @input="updateProperty('assignee', $event)"
        placeholder="${userId} or username"
      />
      <small>The user assigned to this task</small>
    </div>

    <div class="property-row">
      <label>Candidate Users</label>
      <textarea
        :value="candidateUsersText"
        @input="updateCandidateUsers"
        placeholder="user1, user2, ${usersList}"
        rows="2"
      />
      <small>Comma-separated list of candidate users</small>
    </div>

    <div class="property-row">
      <label>Candidate Groups</label>
      <textarea
        :value="candidateGroupsText"
        @input="updateCandidateGroups"
        placeholder="management, ${userGroups}"
        rows="2"
      />
      <small>Comma-separated list of candidate groups</small>
    </div>

    <div class="property-row">
      <label>Priority</label>
      <input
        type="number"
        :value="data.priority || ''"
        @input="updateProperty('priority', $event)"
        placeholder="50"
      />
    </div>

    <div class="property-row">
      <label>Due Date</label>
      <input
        type="text"
        :value="data.dueDate || ''"
        @input="updateProperty('dueDate', $event)"
        placeholder="${dueDate} or 2023-12-31"
      />
    </div>

    <div class="property-row">
      <label>Form Key</label>
      <input
        type="text"
        :value="data.formKey || ''"
        @input="updateProperty('formKey', $event)"
        placeholder="formKey"
      />
      <small>Form key for external form rendering</small>
    </div>

    <div class="property-row">
      <label>Skip Expression</label>
      <input
        type="text"
        :value="data.skipExpression || ''"
        @input="updateProperty('skipExpression', $event)"
        placeholder="${skipCondition}"
      />
      <small>Expression to skip this task</small>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BpmnNodeData } from '@/types/bpmn'

const props = defineProps<{
  data: BpmnNodeData
}>()

const emit = defineEmits<{
  (e: 'update', key: string, value: any): void
}>()

const candidateUsersText = computed(() => {
  return props.data.candidateUsers?.join(', ') || ''
})

const candidateGroupsText = computed(() => {
  return props.data.candidateGroups?.join(', ') || ''
})

const updateProperty = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  if (target.type === 'checkbox') {
    emit('update', key, (target as HTMLInputElement).checked)
  } else {
    emit('update', key, target.value)
  }
}

const updateCandidateUsers = (event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value
  const users = value.split(',').map(s => s.trim()).filter(s => s)
  emit('update', 'candidateUsers', users)
}

const updateCandidateGroups = (event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value
  const groups = value.split(',').map(s => s.trim()).filter(s => s)
  emit('update', 'candidateGroups', groups)
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

.property-row input[type="text"],
.property-row input[type="number"],
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
