<template>
  <div class="property-panel">
    <h3>Properties</h3>

    <!-- Process Properties (shown when no element is selected) -->
    <ProcessProperties
      v-if="!selectedNode && !selectedEdge"
      :process-info="processInfo"
      @update="onUpdateProcess"
    />

    <!-- Node Properties with Tabs -->
    <div v-if="selectedNode" class="property-content">
      <div class="property-tabs">
        <button
          v-for="tab in getAvailableTabs()"
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <!-- Basic Tab -->
        <div v-show="activeTab === 'basic'" class="tab-pane">
          <CommonProperties
            :data="selectedNode.data"
            :node-id="selectedNode.id"
            @update="onUpdateNode"
          />

          <UserTaskProperties
            v-if="selectedNode.type === 'userTask'"
            :data="selectedNode.data"
            @update="onUpdateNode"
          />

          <ServiceTaskProperties
            v-if="selectedNode.type === 'serviceTask'"
            :data="selectedNode.data"
            @update="onUpdateNode"
          />

          <GatewayProperties
            v-if="selectedNode.type === 'exclusiveGateway' || selectedNode.type === 'parallelGateway'"
            :data="selectedNode.data"
            :outgoing-flows="getOutgoingFlows(selectedNode.id)"
            @update="onUpdateNode"
          />

          <EventProperties
            v-if="selectedNode.type === 'startEvent' || selectedNode.type === 'endEvent'"
            :data="selectedNode.data"
            :is-timer-event="false"
            @update="onUpdateNode"
          />
        </div>

        <!-- Advanced Tab -->
        <div v-show="activeTab === 'advanced'" class="tab-pane">
          <MultiInstanceConfig
            v-if="selectedNode.type === 'userTask' || selectedNode.type === 'serviceTask'"
            :config="selectedNode.data.multiInstance"
            @update="onUpdateNodeMultiInstance"
          />

          <div v-if="!(selectedNode.type === 'userTask' || selectedNode.type === 'serviceTask')" class="no-properties">
            <p>No advanced properties available for this element type.</p>
          </div>
        </div>

        <!-- Listeners Tab -->
        <div v-show="activeTab === 'listeners'" class="tab-pane">
          <ListenerConfig
            :listeners="selectedNode.data.listeners"
            :is-task-listener="selectedNode.type === 'userTask'"
            @update="onUpdateListeners"
          />
        </div>

        <!-- Form Tab (for user tasks) -->
        <div v-show="activeTab === 'form'" class="tab-pane">
          <FormPropertiesConfig
            v-if="selectedNode.type === 'userTask'"
            :form-properties="selectedNode.data.formProperties"
            @update="onUpdateFormProperties"
          />
          <div v-else class="no-properties">
            <p>Form properties are only available for user tasks.</p>
          </div>
        </div>

        <!-- Parameters Tab (for service tasks) -->
        <div v-show="activeTab === 'parameters'" class="tab-pane">
          <ParametersConfig
            v-if="selectedNode.type === 'serviceTask'"
            :input-parameters="selectedNode.data.inputParameters"
            :output-parameters="selectedNode.data.outputParameters"
            @update-input="onUpdateInputParameters"
            @update-output="onUpdateOutputParameters"
          />
          <div v-else class="no-properties">
            <p>Input/output parameters are only available for service tasks.</p>
          </div>
        </div>
      </div>

      <div class="property-actions">
        <button class="btn-delete" @click="deleteSelected">Delete Node</button>
      </div>
    </div>

    <!-- Edge Properties -->
    <div v-else-if="selectedEdge" class="property-content">
      <div class="property-group">
        <div class="property-row">
          <label>Source</label>
          <input
            type="text"
            :value="selectedEdge.source"
            disabled
            class="input-disabled"
          />
        </div>

        <div class="property-row">
          <label>Target</label>
          <input
            type="text"
            :value="selectedEdge.target"
            disabled
            class="input-disabled"
          />
        </div>
      </div>

      <SequenceFlowProperties
        :data="selectedEdge.data"
        :is-gateway-flow="isGatewayFlow(selectedEdge)"
        @update="onUpdateEdge"
        @set-default="onSetDefaultFlow"
      />

      <div class="property-actions">
        <button class="btn-delete" @click="deleteSelected">Delete Connection</button>
      </div>
    </div>

    <!-- Empty State (when process info is not being edited and no element selected) -->
    <div v-if="!selectedNode && !selectedEdge && !showProcessProperties" class="property-empty">
      <p>Select a node or connection to edit its properties</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { BpmnNode, BpmnEdge, BpmnProcess } from '@/types/bpmn'
import ProcessProperties from './properties/ProcessProperties.vue'
import CommonProperties from './properties/CommonProperties.vue'
import UserTaskProperties from './properties/UserTaskProperties.vue'
import ServiceTaskProperties from './properties/ServiceTaskProperties.vue'
import GatewayProperties from './properties/GatewayProperties.vue'
import SequenceFlowProperties from './properties/SequenceFlowProperties.vue'
import EventProperties from './properties/EventProperties.vue'
import ListenerConfig from './properties/ListenerConfig.vue'
import MultiInstanceConfig from './properties/MultiInstanceConfig.vue'
import FormPropertiesConfig from './properties/FormPropertiesConfig.vue'
import ParametersConfig from './properties/ParametersConfig.vue'

const props = defineProps<{
  selectedNode: BpmnNode | null
  selectedEdge: BpmnEdge | null
  allNodes: BpmnNode[]
  allEdges: BpmnEdge[]
  processInfo: BpmnProcess
}>()

const emit = defineEmits<{
  (e: 'update-node', nodeId: string, data: any): void
  (e: 'update-edge', edgeId: string, data: any): void
  (e: 'delete-node', nodeId: string): void
  (e: 'delete-edge', edgeId: string): void
  (e: 'set-default-flow', edgeId: string): void
  (e: 'update-process', key: string, value: any): void
}>()

// Tab state
const activeTab = ref('basic')

interface PropertyTab {
  id: string
  label: string
  available: (nodeType: string) => boolean
}

const propertyTabs: PropertyTab[] = [
  { id: 'basic', label: 'Basic', available: () => true },
  { id: 'advanced', label: 'Advanced', available: (type) => ['userTask', 'serviceTask'].includes(type) },
  { id: 'listeners', label: 'Listeners', available: () => true },
  { id: 'form', label: 'Form', available: (type) => type === 'userTask' },
  { id: 'parameters', label: 'Parameters', available: (type) => type === 'serviceTask' }
]

const getAvailableTabs = () => {
  if (!props.selectedNode) return []
  return propertyTabs.filter(tab => tab.available(props.selectedNode?.type || ''))
}

// Reset to basic tab when selection changes
watch(() => props.selectedNode?.id, () => {
  activeTab.value = 'basic'
})

// Show process properties when no element is selected
const showProcessProperties = computed(() => !props.selectedNode && !props.selectedEdge)

const getOutgoingFlows = (nodeId: string) => {
  return props.allEdges.filter(e => e.source === nodeId)
}

const isGatewayFlow = (edge: BpmnEdge) => {
  const sourceNode = props.allNodes.find(n => n.id === edge.source)
  return sourceNode?.type === 'exclusiveGateway' || sourceNode?.type === 'parallelGateway'
}

const onUpdateProcess = (key: string, value: any) => {
  emit('update-process', key, value)
}

const onUpdateNode = (key: string, value: any) => {
  if (props.selectedNode) {
    emit('update-node', props.selectedNode.id, { [key]: value })
  }
}

const onUpdateNodeMultiInstance = (value: any) => {
  if (props.selectedNode) {
    emit('update-node', props.selectedNode.id, { multiInstance: value })
  }
}

const onUpdateListeners = (listeners: any[]) => {
  if (props.selectedNode) {
    emit('update-node', props.selectedNode.id, { listeners })
  }
}

const onUpdateFormProperties = (formProperties: any[]) => {
  if (props.selectedNode) {
    emit('update-node', props.selectedNode.id, { formProperties })
  }
}

const onUpdateInputParameters = (parameters: any[]) => {
  if (props.selectedNode) {
    emit('update-node', props.selectedNode.id, { inputParameters: parameters })
  }
}

const onUpdateOutputParameters = (parameters: any[]) => {
  if (props.selectedNode) {
    emit('update-node', props.selectedNode.id, { outputParameters: parameters })
  }
}

const onUpdateEdge = (key: string, value: any) => {
  if (props.selectedEdge) {
    emit('update-edge', props.selectedEdge.id, { [key]: value })
  }
}

const onSetDefaultFlow = () => {
  if (props.selectedEdge) {
    emit('set-default-flow', props.selectedEdge.id)
  }
}

const deleteSelected = () => {
  if (props.selectedNode) {
    emit('delete-node', props.selectedNode.id)
  } else if (props.selectedEdge) {
    emit('delete-edge', props.selectedEdge.id)
  }
}
</script>

<style scoped>
.property-panel {
  width: 320px;
  background: #f8f9fa;
  border-left: 1px solid #dee2e6;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.property-panel h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #495057;
}

.property-content {
  display: flex;
  flex-direction: column;
}

.property-group {
  padding: 12px 0;
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
}

.property-row input:focus {
  outline: none;
  border-color: #3498db;
}

.property-row .input-disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.property-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #dee2e6;
}

.btn-delete {
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

.btn-delete:hover {
  background: #c82333;
}

.property-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #868e96;
  font-size: 13px;
  text-align: center;
  padding: 0 16px;
}

.property-tabs {
  display: flex;
  gap: 2px;
  margin-bottom: 12px;
  border-bottom: 1px solid #dee2e6;
}

.tab-button {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 12px;
  font-weight: 500;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button:hover {
  color: #495057;
  background: #f8f9fa;
}

.tab-button.active {
  color: #3498db;
  border-bottom-color: #3498db;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
}

.tab-pane {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.no-properties {
  padding: 24px 16px;
  text-align: center;
  color: #868e96;
  font-size: 13px;
}
</style>
