/**
 * 充电站状态管理
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { StationListItem, StationDetail } from '@/types'
import { fetchStationDetail, fetchNearbyStations, fetchSearchStations } from '@/api'

export const useStationStore = defineStore('station', () => {
  // 充电站详情
  const stationDetail = ref<StationDetail | null>(null)
  
  // 附近充电站列表
  const nearbyStations = ref<StationListItem[]>([])
  
  // 搜索结果
  const searchResults = ref<StationListItem[]>([])
  
  // 搜索关键词
  const searchKeyword = ref('')
  
  // 是否正在加载详情
  const isLoadingDetail = ref(false)
  
  // 是否正在搜索
  const isSearching = ref(false)
  
  // 详情加载错误
  const detailError = ref<string | null>(null)
  
  /**
   * 加载充电站详情
   */
  async function loadStationDetail(stationId: string) {
    try {
      isLoadingDetail.value = true
      detailError.value = null
      const detail = await fetchStationDetail(stationId)
      stationDetail.value = detail
      return detail
    } catch (error) {
      console.error('加载充电站详情失败:', error)
      detailError.value = '加载充电站详情失败'
      return null
    } finally {
      isLoadingDetail.value = false
    }
  }
  
  /**
   * 加载附近充电站
   */
  async function loadNearbyStations(lat: number, lng: number, radius: number = 10) {
    try {
      const stations = await fetchNearbyStations(lat, lng, radius)
      nearbyStations.value = stations
      return stations
    } catch (error) {
      console.error('加载附近充电站失败:', error)
      return []
    }
  }
  
  /**
   * 搜索充电站
   */
  async function searchStations(keyword: string) {
    if (!keyword.trim()) {
      searchResults.value = []
      searchKeyword.value = ''
      return []
    }
    
    try {
      isSearching.value = true
      searchKeyword.value = keyword
      const results = await fetchSearchStations(keyword)
      searchResults.value = results
      return results
    } catch (error) {
      console.error('搜索充电站失败:', error)
      return []
    } finally {
      isSearching.value = false
    }
  }
  
  /**
   * 清空搜索结果
   */
  function clearSearch() {
    searchResults.value = []
    searchKeyword.value = ''
  }
  
  /**
   * 清空详情
   */
  function clearDetail() {
    stationDetail.value = null
    detailError.value = null
  }
  
  /**
   * 更新充电站可用数量（用于实时更新）
   */
  function updateStationAvailability(stationId: string, quickAvailable: number, slowAvailable: number) {
    // 更新详情中的可用数量
    if (stationDetail.value && stationDetail.value.stationId === stationId) {
      stationDetail.value.quickAvailableCount = quickAvailable
      stationDetail.value.slowAvailableCount = slowAvailable
    }
    
    // 更新附近充电站列表
    const nearbyStation = nearbyStations.value.find(s => s.stationId === stationId)
    if (nearbyStation) {
      nearbyStation.quickAvailableNum = quickAvailable
      nearbyStation.slowAvailableNum = slowAvailable
    }
    
    // 更新搜索结果
    const searchResult = searchResults.value.find(s => s.stationId === stationId)
    if (searchResult) {
      searchResult.quickAvailableNum = quickAvailable
      searchResult.slowAvailableNum = slowAvailable
    }
  }
  
  return {
    // State
    stationDetail,
    nearbyStations,
    searchResults,
    searchKeyword,
    isLoadingDetail,
    isSearching,
    detailError,
    
    // Actions
    loadStationDetail,
    loadNearbyStations,
    searchStations,
    clearSearch,
    clearDetail,
    updateStationAvailability,
  }
})











