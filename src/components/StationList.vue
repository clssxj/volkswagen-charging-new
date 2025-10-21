<template>
  <div class="station-list-container">
    <!-- 头部 -->
    <div class="list-header">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        附近充电站
        <span v-if="stations.length > 0" class="text-sm font-normal text-gray-500 ml-2">
          ({{ stations.length }})
        </span>
      </h3>
      <button @click="handleRefresh" class="text-primary-600 dark:text-primary-400 hover:opacity-80">
        <svg 
          class="w-5 h-5" 
          :class="{ 'animate-spin': isRefreshing }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
      </button>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="p-8 text-center">
      <div class="loading-spinner mx-auto mb-4"></div>
      <p class="text-gray-500 dark:text-gray-400">加载中...</p>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="stations.length === 0" class="p-8 text-center">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 21a9 9 0 100-18 9 9 0 000 18z"/>
      </svg>
      <p class="text-gray-500 dark:text-gray-400">附近暂无充电站</p>
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">请尝试缩小地图或移动到其他区域</p>
    </div>
    
    <!-- 列表 -->
    <div v-else class="station-list">
      <div 
        v-for="station in stations" 
        :key="station.stationId"
        class="station-item"
        @click="handleStationClick(station)"
      >
        <!-- 站点信息 -->
        <div class="flex-1 min-w-0">
          <h4 class="station-name">{{ station.stationName }}</h4>
          <div class="station-address">
            <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            </svg>
            <span class="truncate">{{ station.address }}</span>
          </div>
          
          <!-- 充电桩信息 -->
          <div class="flex items-center gap-4 mt-2">
            <div class="flex items-center gap-1 text-xs">
              <span class="font-medium text-gray-700 dark:text-gray-300">快充</span>
              <span :class="getAvailableClass(station.quickAvailableNum, station.quickChargeNum)">
                {{ station.quickAvailableNum }}/{{ station.quickChargeNum }}
              </span>
            </div>
            <div class="flex items-center gap-1 text-xs">
              <span class="font-medium text-gray-700 dark:text-gray-300">慢充</span>
              <span :class="getAvailableClass(station.slowAvailableNum, station.slowChargeNum)">
                {{ station.slowAvailableNum }}/{{ station.slowChargeNum }}
              </span>
            </div>
            <div v-if="station.distance !== undefined" class="text-xs text-gray-500 ml-auto">
              {{ formatDistance(station.distance) }}
            </div>
          </div>
        </div>
        
        <!-- 价格和状态 -->
        <div class="flex flex-col items-end gap-2 flex-shrink-0">
          <div class="price-badge">
            ¥{{ station.totalCostPrice.toFixed(2) }}
            <span class="text-xs">/度</span>
          </div>
          <div class="status-badge" :class="getStatusClass(station)">
            {{ getStatusText(station) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { StationListItem } from '@/types'
import { formatDistance } from '@/utils/map'

defineProps<{
  stations: StationListItem[]
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'station-click', station: StationListItem): void
  (e: 'refresh'): void
}>()

const isRefreshing = ref(false)

// 处理站点点击
function handleStationClick(station: StationListItem) {
  emit('station-click', station)
}

// 处理刷新
async function handleRefresh() {
  isRefreshing.value = true
  emit('refresh')
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}

// 获取可用数量的颜色类
function getAvailableClass(available: number, total: number): string {
  if (total === 0) return 'text-gray-400'
  const ratio = available / total
  if (ratio >= 0.5) return 'text-green-600 dark:text-green-400'
  if (ratio >= 0.2) return 'text-yellow-600 dark:text-yellow-400'
  if (ratio > 0) return 'text-red-600 dark:text-red-400'
  return 'text-gray-400'
}

// 获取状态类
function getStatusClass(station: StationListItem): string {
  const total = station.quickChargeNum + station.slowChargeNum
  const available = station.quickAvailableNum + station.slowAvailableNum
  const ratio = total > 0 ? available / total : 0
  
  if (ratio >= 0.5) return 'status-available'
  if (ratio >= 0.2) return 'status-warning'
  if (ratio > 0) return 'status-busy'
  return 'status-offline'
}

// 获取状态文本
function getStatusText(station: StationListItem): string {
  const total = station.quickChargeNum + station.slowChargeNum
  const available = station.quickAvailableNum + station.slowAvailableNum
  const ratio = total > 0 ? available / total : 0
  
  if (ratio >= 0.5) return '充足'
  if (ratio >= 0.2) return '紧张'
  if (ratio > 0) return '紧缺'
  return '暂满'
}
</script>

<style scoped>
.station-list-container {
  @apply flex flex-col;
  height: 100%;
  max-height: 70vh;
}

.list-header {
  @apply flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700;
  @apply bg-white dark:bg-gray-800;
  flex-shrink: 0;
}

.station-list {
  @apply flex-1;
  @apply divide-y divide-gray-100 dark:divide-gray-700;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.station-item {
  @apply flex items-start gap-4 p-4;
  @apply bg-white dark:bg-gray-800;
  @apply hover:bg-gray-50 dark:hover:bg-gray-700/50;
  @apply cursor-pointer transition-colors;
  @apply active:bg-gray-100 dark:active:bg-gray-700;
}

.station-name {
  @apply text-base font-semibold text-gray-900 dark:text-white;
  @apply truncate;
}

.station-address {
  @apply flex items-center gap-1 mt-1;
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.price-badge {
  @apply text-lg font-bold text-primary-600 dark:text-primary-400;
  @apply whitespace-nowrap;
}

.status-badge {
  @apply px-2 py-0.5 rounded-full text-xs font-medium;
  @apply whitespace-nowrap;
}

.status-available {
  @apply bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400;
}

.status-warning {
  @apply bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400;
}

.status-busy {
  @apply bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400;
}

.status-offline {
  @apply bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400;
}
</style>






