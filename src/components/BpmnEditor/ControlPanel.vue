<template>
  <div class="control-panel">
    <h3>Elements</h3>
    <div class="element-list">
      <div v-for="(group, groupName) in groupedConfigs" :key="groupName" class="element-group">
        <div class="group-header" @click="toggleGroup(groupName)">
          <span class="group-icon">{{ isGroupExpanded(groupName) ? '▼' : '▶' }}</span>
          <span class="group-name">{{ groupName }}</span>
        </div>
        <div v-show="isGroupExpanded(groupName)" class="group-items">
          <div
            v-for="config in group"
            :key="config.type"
            class="element-item"
            :draggable="true"
            @dragstart="onDragStart($event, config.type)"
            @click="onAddElement(config.type)"
          >
            <span class="element-icon">{{ config.icon }}</span>
            <span class="element-label">{{ config.label }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="actions">
      <button class="btn-clear" @click="onClear">Clear All</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { BPMN_ELEMENT_CONFIGS, type BpmnElementType } from '@/types/bpmn'

const emit = defineEmits<{
  (e: 'add-element', type: BpmnElementType): void
  (e: 'clear'): void
}>()

const expandedGroups = ref<Set<string>>(new Set(['Events', 'Tasks', 'Gateways']))

const elementConfigs = Object.values(BPMN_ELEMENT_CONFIGS)

const groupedConfigs = computed(() => {
  const groups: Record<string, typeof elementConfigs> = {
    'Events': [],
    'Tasks': [],
    'Gateways': [],
    'Sub-processes': [],
    'Other': []
  }

  elementConfigs.forEach(config => {
    const type = config.type
    if (type.includes('Event') || type === 'startEvent' || type === 'endEvent') {
      groups['Events'].push(config)
    } else if (type.includes('Task') || type === 'userTask' || type === 'serviceTask') {
      groups['Tasks'].push(config)
    } else if (type.includes('Gateway')) {
      groups['Gateways'].push(config)
    } else if (type.includes('SubProcess')) {
      groups['Sub-processes'].push(config)
    } else {
      groups['Other'].push(config)
    }
  })

  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key]
    }
  })

  return groups
})

const isGroupExpanded = (groupName: string) => {
  return expandedGroups.value.has(groupName)
}

const toggleGroup = (groupName: string) => {
  if (expandedGroups.value.has(groupName)) {
    expandedGroups.value.delete(groupName)
  } else {
    expandedGroups.value.add(groupName)
  }
}

const onDragStart = (event: DragEvent, type: BpmnElementType) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vue-flow', type)
    event.dataTransfer.effectAllowed = 'move'
  }
}

const onAddElement = (type: BpmnElementType) => {
  emit('add-element', type)
}

const onClear = () => {
  if (confirm('Are you sure you want to clear the entire workflow?')) {
    emit('clear')
  }
}
</script>

<style scoped>
.control-panel {
  width: 200px;
  background: #f8f9fa;
  border-right: 1px solid #dee2e6;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.control-panel h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #495057;
}

.element-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.element-group {
  margin-bottom: 4px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #e9ecef;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.group-header:hover {
  background: #dee2e6;
}

.group-icon {
  font-size: 10px;
  color: #6c757d;
  transition: transform 0.2s;
}

.group-name {
  font-size: 12px;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.group-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 12px;
  margin-top: 4px;
}

.element-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
  user-select: none;
}

.element-item:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  transform: translateX(2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.element-item:active {
  cursor: grabbing;
}

.element-icon {
  font-size: 18px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f3f5;
  border-radius: 4px;
}

.element-label {
  font-size: 12px;
  color: #495057;
}

.actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #dee2e6;
}

.btn-clear {
  width: 100%;
  padding: 8px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-clear:hover {
  background: #c82333;
}
</style>
