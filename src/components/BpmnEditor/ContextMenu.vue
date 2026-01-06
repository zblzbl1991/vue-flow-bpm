<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="context-menu"
      :style="{ left: x + 'px', top: y + 'px' }"
      @click.stop
    >
      <div class="context-menu-item" @click="handleCopy">
        <span class="menu-icon">📋</span>
        <span>Copy</span>
        <span class="menu-shortcut">Ctrl+C</span>
      </div>

      <div class="context-menu-divider"></div>

      <div class="context-menu-item" @click="handleDelete">
        <span class="menu-icon">🗑️</span>
        <span>Delete</span>
        <span class="menu-shortcut">Del</span>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  x: number
  y: number
}>()

const emit = defineEmits<{
  (e: 'copy'): void
  (e: 'delete'): void
  (e: 'close'): void
}>()

const handleCopy = () => {
  emit('copy')
  emit('close')
}

const handleDelete = () => {
  emit('delete')
  emit('close')
}

// Close menu when clicking outside
const handleClickOutside = () => {
  if (props.visible) {
    emit('close')
  }
}

document.addEventListener('click', handleClickOutside)
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 10000;
  padding: 4px 0;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 13px;
  color: #495057;
  transition: background 0.15s;
}

.context-menu-item:hover {
  background: #f8f9fa;
}

.menu-icon {
  font-size: 14px;
}

.menu-shortcut {
  margin-left: auto;
  font-size: 11px;
  color: #868e96;
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
}

.context-menu-divider {
  height: 1px;
  background: #dee2e6;
  margin: 4px 0;
}
</style>
