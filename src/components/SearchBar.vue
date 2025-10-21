<template>
  <div class="search-container">
    <!-- 搜索输入框 -->
    <div class="search-wrapper">
      <div class="search-input-group">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索充电站名称或地址"
          class="search-input"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        <button
          v-if="keyword"
          @click="handleClear"
          class="clear-button"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <!-- 取消按钮（仅搜索时显示） -->
      <button
        v-if="isFocused"
        @click="handleCancel"
        class="cancel-button"
      >
        取消
      </button>
    </div>
    
    <!-- 搜索结果面板 -->
    <transition name="slide-down">
      <div v-if="isFocused && (searchResults.length > 0 || isSearching)" class="search-results-panel">
        <!-- 加载状态 -->
        <div v-if="isSearching" class="p-8 text-center">
          <div class="loading-spinner mx-auto mb-4"></div>
          <p class="text-gray-500 dark:text-gray-400">搜索中...</p>
        </div>
        
        <!-- 搜索结果 -->
        <div v-else-if="searchResults.length > 0" class="results-list">
          <div
            v-for="station in searchResults"
            :key="station.stationId"
            class="result-item"
            @click="handleResultClick(station)"
          >
            <div class="flex-1 min-w-0">
              <h4 class="result-name">
                <span v-html="highlightKeyword(station.stationName)"></span>
              </h4>
              <p class="result-address">
                <span v-html="highlightKeyword(station.address)"></span>
              </p>
              <div class="result-info">
                <span class="text-xs text-gray-500">
                  快充 {{ station.quickAvailableNum }}/{{ station.quickChargeNum }}
                </span>
                <span class="text-xs text-gray-500 ml-3">
                  慢充 {{ station.slowAvailableNum }}/{{ station.slowChargeNum }}
                </span>
              </div>
            </div>
            <div class="result-price">
              ¥{{ station.totalCostPrice.toFixed(2) }}
              <span class="text-xs">/度</span>
            </div>
          </div>
        </div>
        
        <!-- 无结果 -->
        <div v-else-if="keyword" class="p-8 text-center">
          <svg class="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <p class="text-gray-500 dark:text-gray-400">未找到相关充电站</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">请尝试其他关键词</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { StationListItem } from '@/types'

defineProps<{
  searchResults: StationListItem[]
  isSearching?: boolean
}>()

const emit = defineEmits<{
  (e: 'search', keyword: string): void
  (e: 'result-click', station: StationListItem): void
  (e: 'cancel'): void
}>()

const keyword = ref('')
const isFocused = ref(false)

let searchTimer: number | null = null

// 处理输入
function handleInput() {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  searchTimer = window.setTimeout(() => {
    emit('search', keyword.value)
  }, 300)
}

// 处理聚焦
function handleFocus() {
  isFocused.value = true
}

// 处理失焦
function handleBlur() {
  // 延迟失焦，以便点击结果项
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}

// 处理清空
function handleClear() {
  keyword.value = ''
  emit('search', '')
}

// 处理取消
function handleCancel() {
  keyword.value = ''
  isFocused.value = false
  emit('cancel')
}

// 处理结果点击
function handleResultClick(station: StationListItem) {
  isFocused.value = false
  emit('result-click', station)
}

// 高亮关键词
function highlightKeyword(text: string): string {
  if (!keyword.value) return text
  
  const regex = new RegExp(`(${keyword.value})`, 'gi')
  return text.replace(regex, '<span class="text-primary-600 dark:text-primary-400 font-semibold">$1</span>')
}
</script>

<style scoped>
.search-container {
  @apply fixed top-0 left-0 right-0;
  z-index: 200;
  pointer-events: none;
}

.search-wrapper {
  @apply flex items-center gap-3 px-4 py-3;
  @apply bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm;
  @apply border-b border-gray-200 dark:border-gray-700;
  @apply safe-area-top;
  pointer-events: auto;
}

.search-input-group {
  @apply flex-1 flex items-center gap-2;
  @apply bg-gray-100 dark:bg-gray-700;
  @apply rounded-full px-4 py-2;
  @apply transition-all;
  @apply focus-within:ring-2 focus-within:ring-primary-500;
}

.search-icon {
  @apply w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0;
}

.search-input {
  @apply flex-1 bg-transparent border-none outline-none;
  @apply text-gray-900 dark:text-white;
  @apply placeholder-gray-400 dark:placeholder-gray-500;
  @apply text-base;
}

.clear-button {
  @apply p-1 rounded-full;
  @apply text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300;
  @apply hover:bg-gray-200 dark:hover:bg-gray-600;
  @apply transition-colors;
  @apply flex-shrink-0;
}

.cancel-button {
  @apply text-primary-600 dark:text-primary-400;
  @apply font-medium text-base;
  @apply hover:opacity-80;
  @apply transition-opacity;
  @apply flex-shrink-0;
}

/* 搜索结果面板 */
.search-results-panel {
  @apply absolute top-full left-0 right-0;
  @apply bg-white dark:bg-gray-800;
  @apply border-b border-gray-200 dark:border-gray-700;
  @apply shadow-lg;
  @apply max-h-[60vh] overflow-y-auto;
  pointer-events: auto;
}

.results-list {
  @apply divide-y divide-gray-100 dark:divide-gray-700;
}

.result-item {
  @apply flex items-start gap-4 p-4;
  @apply hover:bg-gray-50 dark:hover:bg-gray-700/50;
  @apply cursor-pointer transition-colors;
  @apply active:bg-gray-100 dark:active:bg-gray-700;
}

.result-name {
  @apply text-base font-semibold text-gray-900 dark:text-white;
  @apply truncate;
}

.result-address {
  @apply text-sm text-gray-500 dark:text-gray-400 mt-1;
  @apply line-clamp-1;
}

.result-info {
  @apply flex items-center mt-2;
}

.result-price {
  @apply text-lg font-bold text-primary-600 dark:text-primary-400;
  @apply whitespace-nowrap;
}

/* 过渡动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  @apply transition-all duration-200;
}

.slide-down-enter-from,
.slide-down-leave-to {
  @apply opacity-0 -translate-y-2;
}

/* 行数限制 */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

