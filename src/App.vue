<template>
  <div id="app" class="app-container">
    <!-- 地图容器 -->
    <div class="map-wrapper">
      <MapView
        ref="mapViewRef"
        @station-click="handleStationClick"
        @map-ready="handleMapReady"
      />
    </div>
    
    <!-- 搜索栏 -->
    <SearchBar
      :search-results="stationStore.searchResults"
      :is-searching="stationStore.isSearching"
      @search="handleSearch"
      @result-click="handleSearchResultClick"
      @cancel="handleSearchCancel"
    />
    
    <!-- 浮动按钮 -->
    <FloatingButton
      ref="floatingButtonRef"
      @list-click="handleListOpen"
      @list-close="handleListClose"
      @filter-click="handleFilterClick"
    >
      <template #list>
        <StationList
          :stations="mapStore.visibleStations"
          :is-loading="mapStore.isLoading"
          @station-click="handleStationClick"
          @refresh="handleRefresh"
        />
      </template>
    </FloatingButton>
    
    <!-- 充电站详情 -->
    <StationDetail
      :visible="showDetail"
      :station-id="selectedStationId"
      :detail="stationStore.stationDetail"
      :is-loading="stationStore.isLoadingDetail"
      :error="stationStore.detailError"
      @close="handleDetailClose"
      @navigate="handleNavigate"
      @start-charging="handleStartCharging"
      @retry="handleDetailRetry"
    />
    
    <!-- 充电流程 -->
    <ChargingFlow
      :visible="showChargingFlow"
      :station-name="stationStore.stationDetail?.stationName || ''"
      :connectors="[
        ...(stationStore.stationDetail?.fastConnectors || []),
        ...(stationStore.stationDetail?.slowConnectors || [])
      ]"
      :current-price="stationStore.stationDetail?.periodPrices?.find(p => p.currentFlag)?.totalFee ? parseFloat(stationStore.stationDetail.periodPrices.find(p => p.currentFlag)!.totalFee) : 1.25"
      @close="handleChargingFlowClose"
      @complete="handleChargingComplete"
    />
    
    <!-- 导航预览 -->
    <NavigationPreview
      :visible="showNavigationPreview"
      :route-info="navigationRouteInfo"
      @cancel="handleNavigationCancel"
      @confirm="handleNavigationConfirm"
    />
    
    <!-- 加载动画 -->
    <LoadingOverlay
      :visible="showLoadingOverlay"
      :title="loadingTitle"
      :message="loadingMessage"
    />
    
    <!-- Toast 提示 -->
    <transition name="fade">
      <div v-if="toast.show" class="toast-container">
        <div class="toast" :class="`toast-${toast.type}`">
          <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <svg v-else-if="toast.type === 'error'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <span>{{ toast.message }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useMapStore } from '@/stores/map'
import { useStationStore } from '@/stores/station'
import MapView from '@/components/Map/MapView.vue'
import SearchBar from '@/components/SearchBar.vue'
import StationList from '@/components/StationList.vue'
import StationDetail from '@/components/StationDetail.vue'
import FloatingButton from '@/components/FloatingButton.vue'
import ChargingFlow from '@/components/ChargingFlow.vue'
import NavigationPreview from '@/components/NavigationPreview.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import type { StationListItem, StationDetail as StationDetailType } from '@/types'
import { startRealtimeUpdate, stopRealtimeUpdate } from '@/utils/websocket'

const mapStore = useMapStore()
const stationStore = useStationStore()

const mapViewRef = ref<InstanceType<typeof MapView>>()
const floatingButtonRef = ref<InstanceType<typeof FloatingButton>>()
const showDetail = ref(false)
const selectedStationId = ref<string | null>(null)
const showChargingFlow = ref(false)
const showNavigationPreview = ref(false)
const navigationRouteInfo = ref<any>(null)
const currentNavigationDestination = ref<StationDetailType | null>(null)
const showLoadingOverlay = ref(false)
const loadingTitle = ref('正在规划路线')
const loadingMessage = ref('请稍候...')

// Toast 提示
const toast = ref({
  show: false,
  message: '',
  type: 'info' as 'success' | 'error' | 'info',
})

// 显示提示
function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// 地图准备完成
function handleMapReady() {
  console.log('地图加载完成')
  // 启动实时更新
  startRealtimeUpdate(mapStore, stationStore)
}

// 搜索
async function handleSearch(keyword: string) {
  if (!keyword.trim()) {
    stationStore.clearSearch()
    return
  }
  await stationStore.searchStations(keyword)
}

// 搜索结果点击
function handleSearchResultClick(station: StationListItem) {
  // 关闭搜索
  stationStore.clearSearch()
  
  // 定位到该充电站
  mapStore.flyTo({ lat: station.lat, lng: station.lng }, 16)
  
  // 选中并显示详情
  mapStore.selectStation(station)
  handleStationClick(station)
}

// 搜索取消
function handleSearchCancel() {
  stationStore.clearSearch()
}

// 充电站点击
async function handleStationClick(station: StationListItem) {
  selectedStationId.value = station.stationId
  showDetail.value = true
  
  // 加载详情
  await stationStore.loadStationDetail(station.stationId)
}

// 详情关闭
function handleDetailClose() {
  showDetail.value = false
  selectedStationId.value = null
  mapStore.selectStation(null)
}

// 详情重试
async function handleDetailRetry() {
  if (selectedStationId.value) {
    await stationStore.loadStationDetail(selectedStationId.value)
  }
}

// 导航
async function handleNavigate(detail: StationDetailType) {
  const { stationLat, stationLng, stationName } = detail
  
  // 保存目标信息
  currentNavigationDestination.value = detail
  
  // 关闭站点详情弹窗
  showDetail.value = false
  
  // 显示加载动画
  loadingTitle.value = '正在规划路线'
  loadingMessage.value = `为您规划前往${stationName}的最佳路线...`
  showLoadingOverlay.value = true
  
  try {
    // 调用地图组件绘制路线
    const routeInfo = await mapViewRef.value?.drawRoute({
      lat: stationLat,
      lng: stationLng
    })
    
    console.log('✅ 路线信息:', routeInfo)
    
    // 保存路线信息
    navigationRouteInfo.value = routeInfo
    
    // 隐藏加载动画
    showLoadingOverlay.value = false
    
    // 显示导航预览弹窗
    showNavigationPreview.value = true
    
  } catch (error: any) {
    console.error('❌ 路线规划失败:', error)
    
    // 隐藏加载动画
    showLoadingOverlay.value = false
    
    showToast(error.message || '路线规划失败', 'error')
    
    // 如果规划失败，重新显示详情
    showDetail.value = true
  }
}

// 取消导航
function handleNavigationCancel() {
  showNavigationPreview.value = false
  navigationRouteInfo.value = null
  showLoadingOverlay.value = false
  
  // 清除地图上的路线
  mapViewRef.value?.clearRoute()
  
  // 重新显示详情
  showDetail.value = true
}

// 确认导航（跳转到高德导航）
function handleNavigationConfirm() {
  if (!currentNavigationDestination.value) return
  
  const { stationLat, stationLng, stationName } = currentNavigationDestination.value
  
  // 关闭预览弹窗
  showNavigationPreview.value = false
  showLoadingOverlay.value = false
  
  // 清除地图上的路线
  mapViewRef.value?.clearRoute()
  
  // 尝试调用高德地图APP
  const amapUrl = `androidamap://route?sourceApplication=charging-map&dlat=${stationLat}&dlon=${stationLng}&dname=${encodeURIComponent(stationName)}&dev=0&t=0`
  
  // 检测是否有导航APP
  if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
    // iOS设备
    window.location.href = amapUrl
    setTimeout(() => {
      // 如果没有安装APP，打开网页版
      window.open(`https://uri.amap.com/navigation?to=${stationLng},${stationLat},${encodeURIComponent(stationName)}&mode=car&src=charging-map`)
    }, 2000)
  } else if (/(Android)/i.test(navigator.userAgent)) {
    // Android设备
    try {
      window.location.href = amapUrl
      setTimeout(() => {
        window.open(`https://uri.amap.com/navigation?to=${stationLng},${stationLat},${encodeURIComponent(stationName)}&mode=car&src=charging-map`)
      }, 2000)
    } catch (e) {
      window.open(`https://uri.amap.com/navigation?to=${stationLng},${stationLat},${encodeURIComponent(stationName)}&mode=car&src=charging-map`)
    }
  } else {
    // PC端或其他设备，直接打开网页版
    window.open(`https://uri.amap.com/navigation?to=${stationLng},${stationLat},${encodeURIComponent(stationName)}&mode=car&src=charging-map`)
  }
  
  showToast('正在启动导航...', 'success')
}

// 开始充电（模拟）
function handleStartCharging(detail: StationDetailType) {
  // 检查是否有可用充电桩
  if (detail.quickAvailableCount === 0 && detail.slowAvailableCount === 0) {
    showToast('当前无可用充电桩', 'error')
    return
  }
  
  // 关闭详情页，打开充电流程
  showDetail.value = false
  showChargingFlow.value = true
}

// 充电流程关闭
function handleChargingFlowClose() {
  showChargingFlow.value = false
}

// 充电完成
function handleChargingComplete(orderId: string, amount: number) {
  showToast(`充电完成！订单号：${orderId}`, 'success')
  console.log('充电完成', { orderId, amount })
  
  // 可以在这里更新充电站状态
  if (selectedStationId.value) {
    stationStore.loadStationDetail(selectedStationId.value)
  }
}

// 列表打开
function handleListOpen() {
  console.log('打开列表')
}

// 列表关闭
function handleListClose() {
  console.log('关闭列表')
}

// 筛选
function handleFilterClick() {
  showToast('筛选功能开发中', 'info')
}

// 刷新
async function handleRefresh() {
  await mapStore.updateVisibleStations()
  showToast('刷新成功', 'success')
}

// 初始化
onMounted(() => {
  // 初始化主题
  mapStore.initTheme()
  
  // 监听网络状态
  window.addEventListener('online', () => {
    showToast('网络已连接', 'success')
  })
  
  window.addEventListener('offline', () => {
    showToast('网络已断开', 'error')
  })
})

// 清理
onUnmounted(() => {
  // 停止实时更新
  stopRealtimeUpdate()
})
</script>

<style scoped>
.app-container {
  @apply w-full h-screen overflow-hidden relative;
  @apply bg-gray-50 dark:bg-gray-900;
}

.map-wrapper {
  @apply absolute inset-0;
  z-index: 1;
}

/* Toast */
.toast-container {
  @apply fixed top-20 left-1/2 -translate-x-1/2;
  @apply px-4;
  z-index: 500;
}

.toast {
  @apply flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg;
  @apply text-white font-medium;
  @apply min-w-[200px] max-w-[90vw];
}

.toast-success {
  @apply bg-green-500;
}

.toast-error {
  @apply bg-red-500;
}

.toast-info {
  @apply bg-blue-500;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  @apply transition-all duration-200;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0 -translate-y-2;
}
</style>

