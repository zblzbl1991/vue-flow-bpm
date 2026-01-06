<template>
  <Teleport to="body">
    <Transition name="notification">
      <div
        v-if="visible"
        class="import-notification"
        :class="[`notification-${type}`]"
      >
        <div class="notification-content">
          <div class="notification-icon">
            <span v-if="type === 'success'">✓</span>
            <span v-else-if="type === 'error'">✗</span>
            <span v-else-if="type === 'warning'">⚠</span>
          </div>
          <div class="notification-body">
            <div class="notification-title">{{ title }}</div>
            <div v-if="message" class="notification-message">{{ message }}</div>
            <div v-if="warnings.length > 0" class="notification-warnings">
              <div class="warnings-title">Warnings:</div>
              <ul class="warnings-list">
                <li v-for="(warning, index) in warnings" :key="index">{{ warning }}</li>
              </ul>
            </div>
          </div>
          <button
            v-if="persistent || type === 'error'"
            class="notification-close"
            @click="dismiss"
          >
            ×
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

export type NotificationType = 'success' | 'error' | 'warning'

interface Props {
  type?: NotificationType
  title?: string
  message?: string
  warnings?: string[]
  duration?: number
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  title: 'Notification',
  message: '',
  warnings: () => [],
  duration: 3000,
  persistent: false
})

const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const show = () => {
  visible.value = true

  if (!props.persistent && props.type !== 'error') {
    timer = setTimeout(() => {
      dismiss()
    }, props.duration)
  }
}

const dismiss = () => {
  visible.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

// Auto-show on mount if props are provided
onMounted(() => {
  if (props.title || props.message) {
    show()
  }
})

// Reset timer if duration changes
watch(() => props.duration, () => {
  if (timer) {
    clearTimeout(timer)
    if (!props.persistent && props.type !== 'error') {
      timer = setTimeout(() => {
        dismiss()
      }, props.duration)
    }
  }
})

defineExpose({
  show,
  dismiss
})
</script>

<style scoped>
.import-notification {
  position: fixed;
  top: 80px;
  right: 20px;
  min-width: 320px;
  max-width: 480px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
}

.notification-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.notification-success .notification-icon {
  background: #d4edda;
  color: #155724;
}

.notification-error .notification-icon {
  background: #f8d7da;
  color: #721c24;
}

.notification-warning .notification-icon {
  background: #fff3cd;
  color: #856404;
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  color: #495057;
}

.notification-success .notification-title {
  color: #155724;
}

.notification-error .notification-title {
  color: #721c24;
}

.notification-warning .notification-title {
  color: #856404;
}

.notification-message {
  font-size: 13px;
  color: #6c757d;
  line-height: 1.4;
}

.notification-warnings {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fff3cd;
  border-radius: 4px;
  border: 1px solid #ffeaa7;
}

.warnings-title {
  font-size: 12px;
  font-weight: 600;
  color: #856404;
  margin-bottom: 4px;
}

.warnings-list {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: #856404;
}

.warnings-list li {
  margin-bottom: 2px;
}

.notification-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  color: #6c757d;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-close:hover {
  background: #f8f9fa;
  color: #495057;
}

/* Transition */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
