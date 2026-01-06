<template>
  <div class="form-properties-config">
    <div class="section-header">
      <h4>Form Properties</h4>
      <button class="btn-add" @click="addFormProperty">+ Add Property</button>
    </div>

    <div v-if="!formProperties || formProperties.length === 0" class="empty-state">
      <p>No form properties defined.</p>
      <p class="hint">Click "Add Property" to create form fields for this task.</p>
    </div>

    <div v-else class="properties-list">
      <div
        v-for="(prop, index) in formProperties"
        :key="prop.id || index"
        class="property-item"
      >
        <div class="property-item-header">
          <span class="property-index">{{ index + 1 }}</span>
          <button class="btn-remove" @click="removeFormProperty(index)" title="Remove property">×</button>
        </div>

        <div class="property-item-body">
          <div class="form-row">
            <label>ID *</label>
            <input
              type="text"
              :value="prop.id"
              @input="updateProperty(index, 'id', $event.target.value)"
              placeholder="e.g., requestReason"
              class="input-field"
            />
          </div>

          <div class="form-row">
            <label>Name *</label>
            <input
              type="text"
              :value="prop.name"
              @input="updateProperty(index, 'name', $event.target.value)"
              placeholder="e.g., Request Reason"
              class="input-field"
            />
          </div>

          <div class="form-row">
            <label>Type</label>
            <select
              :value="prop.type"
              @change="updateProperty(index, 'type', $event.target.value)"
              class="input-field"
            >
              <option value="string">String</option>
              <option value="long">Long (Number)</option>
              <option value="double">Double (Decimal)</option>
              <option value="boolean">Boolean</option>
              <option value="date">Date</option>
              <option value="enum">Enum (Dropdown)</option>
            </select>
          </div>

          <div class="form-row-checkboxes">
            <label class="checkbox-label">
              <input
                type="checkbox"
                :checked="prop.required"
                @change="updateProperty(index, 'required', $event.target.checked)"
              />
              <span>Required</span>
            </label>

            <label class="checkbox-label">
              <input
                type="checkbox"
                :checked="prop.readable"
                @change="updateProperty(index, 'readable', $event.target.checked)"
              />
              <span>Readable</span>
            </label>

            <label class="checkbox-label">
              <input
                type="checkbox"
                :checked="prop.writable"
                @change="updateProperty(index, 'writable', $event.target.checked)"
              />
              <span>Writable</span>
            </label>
          </div>

          <div class="form-row">
            <label>Default Value</label>
            <input
              type="text"
              :value="prop.defaultValue || ''"
              @input="updateProperty(index, 'defaultValue', $event.target.value)"
              placeholder="e.g., ${defaultValue}"
              class="input-field"
            />
          </div>

          <!-- Enum Values (only shown when type is 'enum') -->
          <template v-if="prop.type === 'enum'">
            <div class="enum-section">
              <div class="enum-header">
                <label>Enum Values</label>
                <button class="btn-small" @click="addEnumValue(index)">+ Add Value</button>
              </div>
              <div v-if="!prop.values || prop.values.length === 0" class="empty-enum">
                <p class="hint">No enum values defined.</p>
              </div>
              <div v-else class="enum-values-list">
                <div
                  v-for="(value, vIndex) in prop.values"
                  :key="vIndex"
                  class="enum-value-item"
                >
                  <input
                    type="text"
                    :value="value.id"
                    @input="updateEnumValue(index, vIndex, 'id', $event.target.value)"
                    placeholder="ID"
                    class="input-field input-small"
                  />
                  <input
                    type="text"
                    :value="value.name"
                    @input="updateEnumValue(index, vIndex, 'name', $event.target.value)"
                    placeholder="Name"
                    class="input-field input-small"
                  />
                  <button class="btn-remove" @click="removeEnumValue(index, vIndex)" title="Remove value">×</button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type FormProperty } from '@/types/bpmn'

const props = defineProps<{
  formProperties?: FormProperty[]
}>()

const emit = defineEmits<{
  (e: 'update', formProperties: FormProperty[]): void
}>()

const addFormProperty = () => {
  const newProp: FormProperty = {
    id: `prop_${Date.now()}`,
    name: '',
    type: 'string',
    required: false,
    readable: true,
    writable: true,
    values: []
  }
  emit('update', [...(props.formProperties || []), newProp])
}

const removeFormProperty = (index: number) => {
  const updated = [...(props.formProperties || [])]
  updated.splice(index, 1)
  emit('update', updated)
}

const updateProperty = (index: number, key: keyof FormProperty, value: any) => {
  const updated = [...(props.formProperties || [])]
  updated[index] = { ...updated[index], [key]: value }
  emit('update', updated)
}

const addEnumValue = (index: number) => {
  const updated = [...(props.formProperties || [])]
  if (!updated[index].values) {
    updated[index].values = []
  }
  updated[index].values!.push({ id: '', name: '' })
  emit('update', updated)
}

const removeEnumValue = (index: number, vIndex: number) => {
  const updated = [...(props.formProperties || [])]
  updated[index].values = updated[index].values?.filter((_, i) => i !== vIndex) || []
  emit('update', updated)
}

const updateEnumValue = (index: number, vIndex: number, key: 'id' | 'name', value: string) => {
  const updated = [...(props.formProperties || [])]
  if (!updated[index].values) {
    updated[index].values = []
  }
  updated[index].values![vIndex] = { ...updated[index].values![vIndex], [key]: value }
  emit('update', updated)
}
</script>

<style scoped>
.form-properties-config {
  padding: 12px 0;
  border-bottom: 1px solid #dee2e6;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  font-size: 14px;
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
  transition: background 0.2s;
}

.btn-add:hover {
  background: #218838;
}

.btn-small {
  padding: 2px 8px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
}

.btn-small:hover {
  background: #138496;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #868e96;
  font-size: 13px;
}

.empty-state p {
  margin: 0;
}

.empty-state .hint {
  margin-top: 8px;
  font-size: 12px;
  font-style: italic;
}

.properties-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.property-item {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
}

.property-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.property-index {
  font-weight: 600;
  color: #495057;
  font-size: 13px;
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
}

.btn-remove:hover {
  background: #ffe6e6;
}

.property-item-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-row label {
  font-size: 11px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
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

.input-small {
  padding: 4px 6px;
  font-size: 11px;
}

.form-row-checkboxes {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 12px;
}

.checkbox-label input[type="checkbox"] {
  width: 14px;
  height: 14px;
  cursor: pointer;
}

.enum-section {
  margin-top: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.enum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.enum-header label {
  font-size: 11px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
}

.empty-enum {
  padding: 8px;
  text-align: center;
}

.empty-enum .hint {
  margin: 0;
  font-size: 11px;
  color: #868e96;
  font-style: italic;
}

.enum-values-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.enum-value-item {
  display: flex;
  gap: 6px;
  align-items: center;
}

.enum-value-item .input-field {
  flex: 1;
}
</style>
