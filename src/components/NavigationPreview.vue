<template>
  <div class="navigation-preview-container" v-if="visible">
    <!-- 遮罩层（透明，不阻挡地图操作） -->
    <div 
      class="fixed inset-0"
      style="z-index: 420; pointer-events: none;"
    ></div>
    
    <!-- 导航信息面板 -->
    <div 
      class="navigation-panel"
      style="z-index: 430;"
      :class="visible ? 'slide-in' : 'slide-out'"
    >
      <div class="panel-content">
        <!-- 标题 -->
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">路线预览</h3>
        </div>
        
        <!-- 路线信息 -->
        <div class="route-info">
          <!-- 距离 -->
          <div class="info-card">
            <div class="info-icon bg-blue-100 dark:bg-blue-900/30">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <div class="info-content">
              <div class="info-label">距离</div>
              <div class="info-value">{{ distance }}</div>
            </div>
          </div>
          
          <!-- 时间 -->
          <div class="info-card">
            <div class="info-icon bg-green-100 dark:bg-green-900/30">
              <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="info-content">
              <div class="info-label">预计时间</div>
              <div class="info-value">{{ duration }}</div>
            </div>
          </div>
          
          <!-- 红绿灯 -->
          <div class="info-card">
            <div class="info-icon bg-orange-100 dark:bg-orange-900/30">
              <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
              </svg>
            </div>
            <div class="info-content">
              <div class="info-label">红绿灯</div>
              <div class="info-value">{{ trafficLights }}个</div>
            </div>
          </div>
          
          <!-- 到达时间 -->
          <div class="info-card">
            <div class="info-icon bg-purple-100 dark:bg-purple-900/30">
              <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div class="info-content">
              <div class="info-label">预计到达</div>
              <div class="info-value">{{ arrivalTime }}</div>
            </div>
          </div>
        </div>
        
        <!-- 路线名称 -->
        <div v-if="routeName" class="route-name">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ routeName }}</span>
        </div>
        
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button @click="handleCancel" class="btn-secondary">
            取消
          </button>
          <button @click="handleConfirm" class="btn-primary flex-1">
            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
            开始导航
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface RouteInfo {
  distance: number  // 距离（米）
  duration: number  // 时间（秒）
  trafficLights: number  // 红绿灯数量
  routeName?: string  // 路线名称
}

const props = defineProps<{
  visible: boolean
  routeInfo: RouteInfo | null
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()

// 格式化距离
const distance = computed(() => {
  if (!props.routeInfo) return '-'
  const dist = props.routeInfo.distance
  if (dist < 1000) {
    return `${dist}米`
  }
  return `${(dist / 1000).toFixed(1)}公里`
})

// 格式化时间
const duration = computed(() => {
  if (!props.routeInfo) return '-'
  const dur = props.routeInfo.duration
  const minutes = Math.floor(dur / 60)
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const remainMinutes = minutes % 60
  return `${hours}小时${remainMinutes}分钟`
})

// 红绿灯
const trafficLights = computed(() => {
  return props.routeInfo?.trafficLights || 0
})

// 路线名称
const routeName = computed(() => {
  return props.routeInfo?.routeName || ''
})

// 预计到达时间
const arrivalTime = computed(() => {
  if (!props.routeInfo) return '-'
  const now = new Date()
  const arrival = new Date(now.getTime() + props.routeInfo.duration * 1000)
  const hours = arrival.getHours().toString().padStart(2, '0')
  const minutes = arrival.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
})

function handleCancel() {
  emit('cancel')
}

function handleConfirm() {
  emit('confirm')
}
</script>

<style scoped>
.navigation-preview-container {
  position: fixed;
  inset: 0;
  z-index: 420;
  pointer-events: none;
}

.navigation-panel {
  @apply fixed right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl;
  @apply transition-all duration-300 ease-out;
  top: 120px;
  width: 320px;
  pointer-events: auto;
}

.slide-in {
  @apply opacity-100 translate-x-0;
}

.slide-out {
  @apply opacity-0 translate-x-full;
}

.panel-content {
  @apply p-5;
}

.route-info {
  @apply grid grid-cols-2 gap-3 mb-4;
}

.info-card {
  @apply flex items-center gap-3 p-3 rounded-lg;
  @apply bg-gray-50 dark:bg-gray-700/50;
}

.info-icon {
  @apply w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0;
}

.info-content {
  @apply flex-1 min-w-0;
}

.info-label {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.info-value {
  @apply text-sm font-bold text-gray-900 dark:text-white mt-0.5;
  @apply truncate;
}

.route-name {
  @apply flex items-center gap-2 p-3 rounded-lg mb-4;
  @apply bg-blue-50 dark:bg-blue-900/20;
}

.action-buttons {
  @apply flex gap-3;
}

@media (max-width: 640px) {
  .navigation-panel {
    @apply left-4 right-4;
    width: auto;
  }
  
  .route-info {
    @apply grid-cols-1;
  }
}
</style>

