<template>
  <div class="property-group">
    <div class="property-header">
      <h4>{{ isTaskListener ? 'Task Listeners' : 'Execution Listeners' }}</h4>
      <button class="btn-add" @click="addListener">+ Add</button>
    </div>

    <div v-if="(listeners?.length || 0) === 0" class="empty-state">
      <p>No {{ isTaskListener ? 'task' : 'execution' }} listeners configured</p>
    </div>

    <div v-else class="listener-list">
      <div v-for="(listener, index) in listeners" :key="listener.id" class="listener-item">
        <div class="listener-header">
          <span class="listener-event-badge">{{ listener.event }}</span>
          <span class="listener-type-badge">{{ listener.type }}</span>
          <button class="btn-remove" @click="removeListener(index)">×</button>
        </div>
        <div class="listener-value">{{ listener.value }}</div>

        <!-- Fields -->
        <div v-if="listener.fields?.length" class="listener-fields">
          <div v-for="(field, fIndex) in listener.fields" :key="fIndex" class="field-item">
            <span class="field-name">{{ field.name }}</span>
            <span class="field-value">{{ field.stringValue || field.expression }}</span>
          </div>
        </div>

        <div class="listener-actions">
          <button class="btn-small" @click="editListener(index)">Edit</button>
          <button class="btn-small" @click="addField(index)">+ Field</button>
        </div>
      </div>
    </div>

    <!-- Edit Modal (simplified inline edit) -->
    <div v-if="editingListener !== null" class="listener-edit">
      <div class="edit-row">
        <label>Event</label>
        <select v-model="editForm.event" @change="updateEditForm('event', $event)">
          <option value="">Select event...</option>
          <option v-for="event in availableEvents" :key="event" :value="event">
            {{ event }}
          </option>
        </select>
      </div>

      <div class="edit-row">
        <label>Type</label>
        <select v-model="editForm.type" @change="updateEditForm('type', $event)">
          <option value="class">Class</option>
          <option value="expression">Expression</option>
          <option value="delegateExpression">Delegate Expression</option>
        </select>
      </div>

      <div class="edit-row">
        <label>Value</label>
        <input
          type="text"
          v-model="editForm.value"
          :placeholder="getValuePlaceholder(editForm.type)"
        />
        <small class="help-text">{{ getValueHelp(editForm.type) }}</small>
      </div>

      <div class="edit-row help-section">
        <div class="help-title">Expression Syntax:</div>
        <ul class="help-list">
          <li><code>${variableName}</code> - Process variable</li>
          <li><code>${bean.method()}</code> - Call bean method</li>
          <li><code>${bean.property}</code> - Access bean property</li>
        </ul>
      </div>

      <div class="edit-actions">
        <button class="btn-save" @click="saveListener">Save</button>
        <button class="btn-cancel" @click="cancelEdit">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Listener } from '@/types/bpmn'

const props = defineProps<{
  listeners?: Listener[]
  isTaskListener?: boolean
}>()

const emit = defineEmits<{
  (e: 'update', listeners: Listener[]): void
}>()

const editingListener = ref<number | null>(null)
const editForm = ref<Partial<Listener>>({
  event: '',
  type: 'class',
  value: ''
})

const executionEvents = ['start', 'end', 'take']
const taskEvents = ['create', 'assignment', 'complete', 'delete']

const availableEvents = computed(() => {
  return props.isTaskListener ? taskEvents : executionEvents
})

const getValuePlaceholder = (type: string) => {
  switch (type) {
    case 'class': return 'com.example.MyListener'
    case 'expression': return '${myListener.doSomething()}'
    case 'delegateExpression': return '${myListenerBean}'
    default: return ''
  }
}

const getValueHelp = (type: string) => {
  switch (type) {
    case 'class':
      return 'Fully qualified Java class name implementing the listener interface'
    case 'expression':
      return 'Expression to execute when the event fires'
    case 'delegateExpression':
      return 'Bean name from Spring context that implements the listener'
    default:
      return ''
  }
}

const addListener = () => {
  editingListener.value = -1
  editForm.value = {
    id: `listener-${Date.now()}`,
    event: props.isTaskListener ? 'create' : 'start',
    type: 'class',
    value: ''
  }
}

const editListener = (index: number) => {
  editingListener.value = index
  const listener = props.listeners?.[index]
  editForm.value = { ...listener }
}

const removeListener = (index: number) => {
  const newListeners = [...(props.listeners || [])]
  newListeners.splice(index, 1)
  emit('update', newListeners)
}

const updateEditForm = (key: string, event: Event) => {
  const target = event.target as HTMLSelectElement | HTMLInputElement
  editForm.value = { ...editForm.value, [key]: target.value }
}

const saveListener = () => {
  if (!editForm.value.event || !editForm.value.value) return

  const newListeners = [...(props.listeners || [])]
  const listenerData: Listener = {
    id: editForm.value.id || `listener-${Date.now()}`,
    event: editForm.value.event as Listener['event'],
    type: editForm.value.type as Listener['type'],
    value: editForm.value.value,
    fields: editForm.value.fields
  }

  if (editingListener.value === -1) {
    newListeners.push(listenerData)
  } else {
    newListeners[editingListener.value] = listenerData
  }

  emit('update', newListeners)
  cancelEdit()
}

const cancelEdit = () => {
  editingListener.value = null
  editForm.value = {}
}

const addField = (index: number) => {
  // Simplified - could be expanded with a modal
  const newListeners = [...(props.listeners || [])]
  const listener = { ...newListeners[index] }
  const fields = listener.fields ? [...listener.fields] : []

  fields.push({
    name: `field${fields.length + 1}`,
    stringValue: ''
  })

  listener.fields = fields
  newListeners[index] = listener
  emit('update', newListeners)
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

.btn-add {
  padding: 4px 10px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.btn-add:hover {
  background: #218838;
}

.empty-state {
  padding: 16px;
  text-align: center;
  color: #868e96;
  font-size: 12px;
}

.listener-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.listener-item {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
}

.listener-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.listener-event-badge {
  padding: 2px 8px;
  background: #3498db;
  color: white;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

.listener-type-badge {
  padding: 2px 8px;
  background: #6c757d;
  color: white;
  border-radius: 10px;
  font-size: 10px;
}

.btn-remove {
  margin-left: auto;
  width: 20px;
  height: 20px;
  border: none;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.listener-value {
  font-family: monospace;
  font-size: 11px;
  color: #495057;
  margin-bottom: 8px;
}

.listener-fields {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #dee2e6;
}

.field-item {
  display: flex;
  gap: 8px;
  font-size: 11px;
  padding: 4px 0;
}

.field-name {
  color: #6c757d;
  font-weight: 500;
}

.field-value {
  color: #495057;
  font-family: monospace;
}

.listener-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn-small {
  padding: 4px 8px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
}

.btn-small:hover {
  background: #5a6268;
}

.listener-edit {
  background: #e9ecef;
  padding: 12px;
  border-radius: 4px;
  margin-top: 12px;
}

.edit-row {
  margin-bottom: 12px;
}

.edit-row label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 4px;
}

.edit-row select,
.edit-row input[type="text"] {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 12px;
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn-save {
  padding: 6px 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.btn-cancel {
  padding: 6px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.help-text {
  display: block;
  margin-top: 4px;
  font-size: 10px;
  color: #868e96;
  font-style: italic;
}

.help-section {
  background: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.help-title {
  font-size: 11px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 6px;
}

.help-list {
  margin: 0;
  padding-left: 16px;
  font-size: 10px;
  color: #6c757d;
}

.help-list li {
  margin-bottom: 4px;
}

.help-list code {
  background: #e9ecef;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  color: #495057;
}
</style>
