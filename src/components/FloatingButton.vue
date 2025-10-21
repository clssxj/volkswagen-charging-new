<template>
  <div class="floating-buttons safe-area-bottom">
    <!-- 列表按钮 -->
    <button
      @click="handleListClick"
      class="floating-button"
      :class="{ 'active': showList }"
      title="充电站列表"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
      </svg>
      <span class="button-label">列表</span>
    </button>
    
    <!-- 筛选按钮（可选） -->
    <button
      @click="handleFilterClick"
      class="floating-button"
      title="筛选条件"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
      </svg>
      <span class="button-label">筛选</span>
    </button>
  </div>
  
  <!-- 列表抽屉 -->
  <transition name="slide-up">
    <div v-if="showList" class="list-drawer">
      <!-- 遮罩 -->
      <div class="drawer-overlay" @click="handleListClose"></div>
      
      <!-- 内容 -->
      <div class="drawer-content">
        <slot name="list">
          <!-- 默认内容（由父组件提供） -->
        </slot>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'list-click'): void
  (e: 'list-close'): void
  (e: 'filter-click'): void
}>()

const showList = ref(false)

function handleListClick() {
  showList.value = !showList.value
  if (showList.value) {
    emit('list-click')
  } else {
    emit('list-close')
  }
}

function handleListClose() {
  showList.value = false
  emit('list-close')
}

function handleFilterClick() {
  emit('filter-click')
}

// 暴露方法供父组件调用
defineExpose({
  openList: () => { showList.value = true },
  closeList: () => { showList.value = false },
})
</script>

<style scoped>
.floating-buttons {
  @apply fixed right-4;
  @apply flex flex-col gap-3;
  bottom: calc(1rem + env(safe-area-inset-bottom));
  z-index: 30;
}

.floating-button {
  @apply w-14 h-14 rounded-full shadow-lg;
  @apply bg-white dark:bg-gray-800;
  @apply text-gray-700 dark:text-gray-300;
  @apply border-2 border-gray-200 dark:border-gray-700;
  @apply flex flex-col items-center justify-center;
  @apply hover:bg-gray-50 dark:hover:bg-gray-700;
  @apply active:scale-95;
  @apply transition-all duration-200;
}

.floating-button.active {
  @apply bg-primary-600 dark:bg-primary-500;
  @apply text-white;
  @apply border-primary-600 dark:border-primary-500;
}

.button-label {
  @apply text-xs mt-1;
}

/* 列表抽屉 */
.list-drawer {
  @apply fixed inset-0;
  z-index: 300;
}

.drawer-overlay {
  @apply absolute inset-0 bg-black/30;
}

.drawer-content {
  @apply absolute bottom-0 left-0 right-0;
  @apply bg-white dark:bg-gray-800;
  @apply rounded-t-2xl shadow-2xl;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 过渡动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  @apply transition-all duration-300;
}

.slide-up-enter-from .drawer-overlay,
.slide-up-leave-to .drawer-overlay {
  @apply opacity-0;
}

.slide-up-enter-from .drawer-content,
.slide-up-leave-to .drawer-content {
  @apply translate-y-full;
}
</style>


