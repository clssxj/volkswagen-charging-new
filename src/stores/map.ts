/**
 * 地图状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { StationListItem, Location, MapBounds, ThemeMode } from '@/types'
import { fetchStationsByBounds } from '@/api'

export const useMapStore = defineStore('map', () => {
  // 地图实例
  const mapInstance = ref<any>(null)
  
  // 当前位置
  const currentLocation = ref<Location | null>(null)
  
  // 地图中心
  const mapCenter = ref<Location>({
    lat: 31.8206,
    lng: 117.2272, // 合肥市中心
  })
  
  // 地图缩放级别
  const mapZoom = ref<number>(12)
  
  // 地图边界
  const mapBounds = ref<MapBounds | null>(null)
  
  // 可见的充电站列表
  const visibleStations = ref<StationListItem[]>([])
  
  // 选中的充电站
  const selectedStation = ref<StationListItem | null>(null)
  
  // 主题模式
  const themeMode = ref<ThemeMode>('light')
  
  // 是否正在加载
  const isLoading = ref(false)
  
  // 是否正在定位
  const isLocating = ref(false)
  
  // 定位错误
  const locationError = ref<string | null>(null)
  
  // 是否为暗色模式
  const isDarkMode = computed(() => themeMode.value === 'dark')
  
  /**
   * 设置地图实例
   */
  function setMapInstance(instance: any) {
    mapInstance.value = instance
  }
  
  /**
   * 设置当前位置
   */
  function setCurrentLocation(location: Location) {
    currentLocation.value = location
    locationError.value = null
  }
  
  /**
   * 设置地图中心
   */
  function setMapCenter(center: Location) {
    mapCenter.value = center
    if (mapInstance.value) {
      mapInstance.value.setCenter([center.lng, center.lat])
    }
  }
  
  /**
   * 设置地图缩放
   */
  function setMapZoom(zoom: number) {
    mapZoom.value = zoom
    if (mapInstance.value) {
      mapInstance.value.setZoom(zoom)
    }
  }
  
  /**
   * 设置地图边界
   */
  function setMapBounds(bounds: MapBounds) {
    mapBounds.value = bounds
  }
  
  /**
   * 更新可见充电站
   */
  async function updateVisibleStations() {
    if (!mapBounds.value) {
      console.warn('地图边界未设置')
      return
    }
    
    console.log('更新可见充电站，边界:', mapBounds.value)
    
    try {
      isLoading.value = true
      const stations = await fetchStationsByBounds(mapBounds.value)
      visibleStations.value = stations
      console.log(`✅ 获取到 ${stations.length} 个可见充电站`)
    } catch (error) {
      console.error('加载充电站失败:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 选择充电站
   */
  function selectStation(station: StationListItem | null) {
    selectedStation.value = station
  }
  
  /**
   * 切换主题
   */
  function toggleTheme() {
    themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
    
    // 更新 HTML 类名
    if (themeMode.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // 更新地图样式
    if (mapInstance.value) {
      const mapStyle = themeMode.value === 'dark' 
        ? 'amap://styles/dark' 
        : 'amap://styles/normal'
      mapInstance.value.setMapStyle(mapStyle)
    }
    
    // 保存到本地存储
    localStorage.setItem('theme', themeMode.value)
  }
  
  /**
   * 初始化主题
   */
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null
    if (savedTheme) {
      themeMode.value = savedTheme
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark')
      }
    } else {
      // 检测系统主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      themeMode.value = prefersDark ? 'dark' : 'light'
      if (prefersDark) {
        document.documentElement.classList.add('dark')
      }
    }
  }
  
  /**
   * 设置定位状态
   */
  function setLocating(locating: boolean) {
    isLocating.value = locating
  }
  
  /**
   * 设置定位错误
   */
  function setLocationError(error: string | null) {
    locationError.value = error
  }
  
  /**
   * 飞到指定位置
   */
  function flyTo(location: Location, zoom?: number) {
    if (!mapInstance.value) return
    
    mapInstance.value.setZoomAndCenter(
      zoom || mapZoom.value,
      [location.lng, location.lat],
      true,
      300
    )
  }
  
  return {
    // State
    mapInstance,
    currentLocation,
    mapCenter,
    mapZoom,
    mapBounds,
    visibleStations,
    selectedStation,
    themeMode,
    isLoading,
    isLocating,
    locationError,
    
    // Getters
    isDarkMode,
    
    // Actions
    setMapInstance,
    setCurrentLocation,
    setMapCenter,
    setMapZoom,
    setMapBounds,
    updateVisibleStations,
    selectStation,
    toggleTheme,
    initTheme,
    setLocating,
    setLocationError,
    flyTo,
  }
})

