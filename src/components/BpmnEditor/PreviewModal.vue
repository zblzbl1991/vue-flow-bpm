<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-container">
          <div class="modal-header">
            <h2>BPMN Preview</h2>
            <button class="btn-close" @click="close">&times;</button>
          </div>
          <div class="modal-body">
            <div v-if="isValidating" class="loading-state">
              <div class="spinner"></div>
              <p>Validating BPMN XML...</p>
            </div>
            <div v-else-if="isValid === null" class="empty-state">
              <p>Click "Validate" to preview your workflow</p>
            </div>
            <div v-else-if="isValid" class="success-state">
              <div class="success-message">
                <span class="success-icon">✓</span>
                <span>Validation successful</span>
              </div>
              <div ref="containerRef" class="bpmn-viewer"></div>
            </div>
            <div v-else class="error-state">
              <div class="error-message">
                <span class="error-icon">✕</span>
                <span>Validation failed</span>
              </div>
              <ul class="error-list">
                <li v-for="(error, index) in validationErrors" :key="index" class="error-item">
                  {{ error.message }}
                </li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="close">Close</button>
            <button
              v-if="isValid"
              class="btn-primary"
              @click="exportXml"
            >
              Export XML
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { useBpmnValidator } from '@/composables/useBpmnValidator'

const props = defineProps<{
  isOpen: boolean
  bpmnXml: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'export-xml'): void
}>()

const {
  isValidating,
  isValid,
  validationErrors,
  containerRef,
  validateBpmnXml,
  fitViewport,
  destroyViewer
} = useBpmnValidator()

const close = () => {
  emit('close')
}

const exportXml = () => {
  emit('export-xml')
}

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && props.bpmnXml) {
    await validateBpmnXml(props.bpmnXml)
    // Fit the viewport after a short delay to ensure rendering
    setTimeout(() => {
      fitViewport()
    }, 100)
  }
})

onBeforeUnmount(() => {
  destroyViewer()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #495057;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #f1f3f5;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 300px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  color: #6c757d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success-state {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #d4edda;
  color: #155724;
  border-radius: 6px;
}

.success-icon {
  font-size: 18px;
  font-weight: bold;
}

.bpmn-viewer {
  width: 100%;
  height: 400px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: #f8f9fa;
}

.error-state {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8d7da;
  color: #721c24;
  border-radius: 6px;
}

.error-icon {
  font-size: 18px;
  font-weight: bold;
}

.error-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.error-item {
  padding: 10px 14px;
  background: #fff5f5;
  border-left: 3px solid #fc8181;
  margin-bottom: 8px;
  font-size: 13px;
  color: #742a2a;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #dee2e6;
}

.btn-secondary,
.btn-primary {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-primary {
  background: #28a745;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #218838;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>
