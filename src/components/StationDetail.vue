<template>
  <div class="station-detail-container" v-if="visible">
    <!-- 遮罩层 -->
    <div 
      class="fixed inset-0 bg-black/30 transition-opacity"
      style="z-index: 400;"
      :class="visible ? 'opacity-100' : 'opacity-0'"
      @click="handleClose"
    ></div>
    
    <!-- 详情面板 -->
    <div 
      class="station-detail-panel"
      style="z-index: 410;"
      :class="visible ? 'translate-y-0' : 'translate-y-full'"
    >
      <!-- 头部 -->
      <div class="detail-header">
        <div class="flex-1">
          <button @click="handleClose" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
        </div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white text-center flex-1">站点详情</h2>
        <div class="flex-1"></div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="p-8 text-center">
        <div class="loading-spinner mx-auto mb-4"></div>
        <p class="text-gray-500 dark:text-gray-400">加载中...</p>
      </div>
      
      <!-- 错误提示 -->
      <div v-else-if="error" class="p-8 text-center">
        <p class="text-red-500">{{ error }}</p>
        <button @click="handleRetry" class="mt-4 btn-primary">重试</button>
      </div>
      
      <!-- 详情内容 -->
      <div v-else-if="detail" class="detail-content">
        <!-- 站点照片 -->
        <div v-if="detail.pictures && detail.pictures.length > 0" class="station-photos">
          <div class="photo-scroll">
            <img 
              v-for="(photo, index) in detail.pictures" 
              :key="index"
              :src="photo"
              :alt="`站点照片${index + 1}`"
              class="photo-item"
              @error="handleImageError"
            />
          </div>
        </div>
        
        <!-- 站点信息 -->
        <div class="section">
          <h3 class="section-title">{{ detail.stationName }}</h3>
          
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>{{ detail.address }}</span>
          </div>
          
          <div v-if="detail.siteGuide" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span class="text-gray-500">入口提示：</span>{{ detail.siteGuide }}
          </div>
        </div>
        
        <!-- 充电车位 -->
        <div class="section">
          <h4 class="section-subtitle">充电车位</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="stat-card">
              <div class="text-sm text-gray-600 dark:text-gray-400">快充</div>
              <div class="text-2xl font-bold mt-1" :class="getAvailableClass(detail.quickAvailableCount, detail.quickTotalCount)">
                {{ detail.quickAvailableCount }}
              </div>
              <div class="text-xs text-gray-500 mt-1">/ {{ detail.quickTotalCount }}总数</div>
            </div>
            <div class="stat-card">
              <div class="text-sm text-gray-600 dark:text-gray-400">慢充</div>
              <div class="text-2xl font-bold mt-1" :class="getAvailableClass(detail.slowAvailableCount, detail.slowTotalCount)">
                {{ detail.slowAvailableCount }}
              </div>
              <div class="text-xs text-gray-500 mt-1">/ {{ detail.slowTotalCount }}总数</div>
            </div>
          </div>
        </div>
        
        <!-- 充电桩列表 -->
        <div v-if="detail.fastConnectors && detail.fastConnectors.length > 0" class="section">
          <div class="flex items-center justify-between mb-3">
            <h4 class="section-subtitle">充电桩状态</h4>
            <button @click="showConnectors = !showConnectors" class="text-sm text-primary-600 dark:text-primary-400">
              {{ showConnectors ? '收起' : '展开' }}
            </button>
          </div>
          
          <div v-show="showConnectors" class="space-y-2">
            <div 
              v-for="connector in displayConnectors" 
              :key="connector.connectorId"
              class="connector-item"
              :class="connector.connectorType === 4 ? 'fast-connector' : 'slow-connector'"
            >
              <div class="flex items-center gap-3 flex-1">
                <!-- 充电类型标签 -->
                <div class="connector-type-badge">
                  <svg v-if="connector.connectorType === 4" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
                  </svg>
                  <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
                  </svg>
                  <span class="connector-type-text">
                    {{ connector.connectorType === 4 ? '快充' : '慢充' }}
                  </span>
                </div>
                
                <!-- 状态指示器 -->
                <div 
                  class="w-3 h-3 rounded-full"
                  :class="getConnectorStatusColor(connector.status)"
                ></div>
                
                <div class="flex-1">
                  <div class="font-medium text-gray-900 dark:text-white">
                    车位号：{{ connector.sortLabel }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ connector.connectorId }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ connector.power }}kW
                  </div>
                  <div class="text-xs" :class="getConnectorStatusClass(connector.status)">
                    {{ getConnectorStatusText(connector.status) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 时段价格 -->
        <div v-if="detail.periodPrices && detail.periodPrices.length > 0" class="section">
          <div class="flex items-center justify-between mb-3">
            <h4 class="section-subtitle">充电价格</h4>
            <span class="text-xs text-gray-500">根据时段计费，实时浮动</span>
          </div>
          
          <div class="space-y-2">
            <div 
              v-for="(period, index) in detail.periodPrices" 
              :key="index"
              class="price-item"
              :class="period.currentFlag ? 'price-current' : ''"
            >
              <div class="flex items-center gap-2">
                <span class="time-range">{{ period.startTime }} - {{ period.endTime }}</span>
                <span v-if="period.currentFlag" class="current-badge">当前时段</span>
              </div>
              <div class="price-detail">
                <div class="text-lg font-bold text-primary-600 dark:text-primary-400">
                  ¥{{ period.totalFee }}<span class="text-xs font-normal text-gray-500">/度</span>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  电费¥{{ period.eleFee }} + 服务费¥{{ period.serviceFee }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 其他信息 -->
        <div class="section">
          <h4 class="section-subtitle">其他信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">运营品牌</span>
              <span class="info-value font-semibold text-primary-600 dark:text-primary-400">
                {{ detail.brandName }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">营业时间</span>
              <span class="info-value">{{ detail.busineHours }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">停车费用</span>
              <span class="info-value">{{ detail.parkFee }}</span>
            </div>
            <div v-if="detail.serviceTel" class="info-item">
              <span class="info-label">联系电话</span>
              <a :href="`tel:${detail.serviceTel}`" class="info-value text-primary-600 dark:text-primary-400">
                {{ detail.serviceTel }}
              </a>
            </div>
            <div class="info-item">
              <span class="info-label">运营商ID</span>
              <span class="info-value">{{ detail.operatorId }}</span>
            </div>
          </div>
        </div>
        
        <!-- 底部操作按钮 -->
        <div class="detail-actions">
          <button @click="handleNavigate" class="btn-secondary flex-1">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
            导航到站
          </button>
          <button @click="handleStartCharging" class="btn-primary flex-1">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            开始充电
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { StationDetail, ConnectorInfo, ConnectorStatus } from '@/types'
import { ConnectorStatus as CS } from '@/types'

const props = defineProps<{
  visible: boolean
  stationId: string | null
  detail: StationDetail | null
  isLoading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'navigate', detail: StationDetail): void
  (e: 'start-charging', detail: StationDetail): void
  (e: 'retry'): void
}>()

const showConnectors = ref(false)

// 显示的充电桩列表（快充+慢充）
const displayConnectors = computed(() => {
  if (!props.detail) return []
  const connectors = [...props.detail.fastConnectors]
  if (props.detail.slowConnectors) {
    connectors.push(...props.detail.slowConnectors)
  }
  return connectors.sort((a, b) => a.sortLabel - b.sortLabel)
})

// 获取可用数量的颜色类
function getAvailableClass(available: number, total: number): string {
  if (total === 0) return 'text-gray-400'
  const ratio = available / total
  if (ratio >= 0.5) return 'text-green-600 dark:text-green-400'
  if (ratio >= 0.2) return 'text-yellow-600 dark:text-yellow-400'
  if (ratio > 0) return 'text-red-600 dark:text-red-400'
  return 'text-gray-400'
}

// 获取充电桩状态颜色
function getConnectorStatusColor(status: ConnectorStatus): string {
  switch (status) {
    case CS.AVAILABLE:
      return 'bg-green-500'
    case CS.CHARGING:
      return 'bg-blue-500'
    case CS.OCCUPIED:
      return 'bg-yellow-500'
    case CS.RESERVED:
      return 'bg-orange-500'
    case CS.FAULT:
      return 'bg-red-500'
    case CS.OFFLINE:
    default:
      return 'bg-gray-400'
  }
}

// 获取充电桩状态类
function getConnectorStatusClass(status: ConnectorStatus): string {
  switch (status) {
    case CS.AVAILABLE:
      return 'text-green-600 dark:text-green-400'
    case CS.CHARGING:
      return 'text-blue-600 dark:text-blue-400'
    case CS.OCCUPIED:
      return 'text-yellow-600 dark:text-yellow-400'
    case CS.RESERVED:
      return 'text-orange-600 dark:text-orange-400'
    case CS.FAULT:
      return 'text-red-600 dark:text-red-400'
    case CS.OFFLINE:
    default:
      return 'text-gray-400'
  }
}

// 获取充电桩状态文本
function getConnectorStatusText(status: ConnectorStatus): string {
  switch (status) {
    case CS.AVAILABLE:
      return '空闲'
    case CS.CHARGING:
      return '充电中'
    case CS.OCCUPIED:
      return '占用'
    case CS.RESERVED:
      return '预约'
    case CS.FAULT:
      return '故障'
    case CS.OFFLINE:
    default:
      return '离线'
  }
}

// 处理关闭
function handleClose() {
  emit('close')
}

// 处理导航
function handleNavigate() {
  if (props.detail) {
    emit('navigate', props.detail)
  }
}

// 处理开始充电
function handleStartCharging() {
  if (props.detail) {
    emit('start-charging', props.detail)
  }
}

// 处理重试
function handleRetry() {
  emit('retry')
}

// 处理图片加载错误
function handleImageError(e: Event) {
  const img = e.target as HTMLImageElement
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Zu+54mH5Yqg6L295aSx6LSlPC90ZXh0Pjwvc3ZnPg=='
}

// 监听visible变化，重置状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    showConnectors.value = false
  }
})
</script>

<style scoped>
.station-detail-container {
  position: fixed;
  inset: 0;
  z-index: 400;
}

.station-detail-panel {
  @apply fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl;
  @apply max-h-[85vh] flex flex-col;
  @apply transition-transform duration-300 ease-out;
  z-index: 50;
}

.detail-header {
  @apply flex items-center gap-4 px-4 py-4 border-b border-gray-200 dark:border-gray-700;
  @apply sticky top-0 bg-white dark:bg-gray-800 z-10;
}

.detail-content {
  @apply flex-1 overflow-y-auto;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
}

/* 站点照片 */
.station-photos {
  @apply w-full overflow-hidden;
}

.photo-scroll {
  @apply flex gap-2 overflow-x-auto px-4 py-3;
  @apply scrollbar-hide;
}

.photo-item {
  @apply h-32 w-48 flex-shrink-0 rounded-lg object-cover;
  @apply bg-gray-100 dark:bg-gray-700;
}

/* 区块 */
.section {
  @apply px-4 py-4 border-b border-gray-100 dark:border-gray-700;
}

.section-title {
  @apply text-xl font-bold text-gray-900 dark:text-white;
}

.section-subtitle {
  @apply text-base font-semibold text-gray-900 dark:text-white;
}

/* 统计卡片 */
.stat-card {
  @apply bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center;
}

/* 充电桩项 */
.connector-item {
  @apply flex items-center gap-3 p-3 rounded-lg;
  @apply bg-gray-50 dark:bg-gray-700/50;
  @apply transition-colors;
  @apply border-l-4;
}

.connector-item.fast-connector {
  @apply border-l-orange-500;
  @apply bg-orange-50/50 dark:bg-orange-900/10;
}

.connector-item.slow-connector {
  @apply border-l-blue-500;
  @apply bg-blue-50/50 dark:bg-blue-900/10;
}

.connector-type-badge {
  @apply flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium;
}

.fast-connector .connector-type-badge {
  @apply bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400;
}

.slow-connector .connector-type-badge {
  @apply bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400;
}

.connector-type-text {
  @apply font-semibold;
}

/* 价格项 */
.price-item {
  @apply flex items-center justify-between p-3 rounded-lg;
  @apply bg-gray-50 dark:bg-gray-700/50;
  @apply border-2 border-transparent;
  @apply transition-all;
}

.price-current {
  @apply border-primary-500 bg-primary-50 dark:bg-primary-900/20;
}

.time-range {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.current-badge {
  @apply text-xs px-2 py-0.5 rounded-full bg-primary-500 text-white;
}

.price-detail {
  @apply text-right;
}

/* 信息网格 */
.info-grid {
  @apply space-y-3;
}

.info-item {
  @apply flex justify-between items-start gap-4;
}

.info-label {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.info-value {
  @apply text-sm font-medium text-gray-900 dark:text-white text-right;
}

/* 底部操作 */
.detail-actions {
  @apply flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700;
  @apply bg-white dark:bg-gray-800;
  @apply sticky bottom-0;
}

/* 隐藏滚动条 */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

