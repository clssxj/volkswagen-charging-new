/**
 * Mock数据存储
 */

import type { StationListItem, StationDetail } from '@/types'
import { generateAllStations, generateStationDetail } from './generator'

// 生成并缓存所有充电站数据
let cachedStations: StationListItem[] | null = null
let stationDetailsCache: Map<string, StationDetail> = new Map()

/**
 * 获取所有充电站数据（懒加载+缓存）
 */
export function getAllStations(): StationListItem[] {
  if (!cachedStations) {
    console.log('正在生成安徽省2000个充电站数据...')
    const startTime = Date.now()
    cachedStations = generateAllStations()
    console.log(`充电站数据生成完成，共${cachedStations.length}个站点，耗时${Date.now() - startTime}ms`)
  }
  return cachedStations
}

/**
 * 根据ID获取充电站详情
 */
export function getStationDetail(stationId: string): StationDetail | null {
  // 先从缓存获取
  if (stationDetailsCache.has(stationId)) {
    return stationDetailsCache.get(stationId)!
  }
  
  // 从列表中查找并生成详情
  const stations = getAllStations()
  const station = stations.find(s => s.stationId === stationId)
  
  if (!station) {
    return null
  }
  
  const detail = generateStationDetail(station)
  stationDetailsCache.set(stationId, detail)
  return detail
}

/**
 * 根据边界获取充电站列表
 */
export function getStationsByBounds(
  northeast: { lat: number, lng: number },
  southwest: { lat: number, lng: number }
): StationListItem[] {
  const stations = getAllStations()
  
  return stations.filter(station => {
    return station.lat >= southwest.lat &&
           station.lat <= northeast.lat &&
           station.lng >= southwest.lng &&
           station.lng <= northeast.lng
  })
}

/**
 * 根据中心点和半径获取充电站列表
 */
export function getStationsByRadius(
  centerLat: number,
  centerLng: number,
  radiusKm: number = 10,
  limit: number = 100
): StationListItem[] {
  const stations = getAllStations()
  
  // 计算距离并排序
  const stationsWithDistance = stations.map(station => {
    const distance = calculateDistance(centerLat, centerLng, station.lat, station.lng)
    return {
      ...station,
      distance: parseFloat(distance.toFixed(2))
    }
  }).filter(station => station.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
  
  return stationsWithDistance
}

/**
 * 计算两点间距离（km）
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 搜索充电站
 */
export function searchStations(keyword: string, limit: number = 20): StationListItem[] {
  const stations = getAllStations()
  const lowerKeyword = keyword.toLowerCase()
  
  return stations.filter(station => {
    return station.stationName.toLowerCase().includes(lowerKeyword) ||
           station.address.toLowerCase().includes(lowerKeyword) ||
           station.brandName.toLowerCase().includes(lowerKeyword)
  }).slice(0, limit)
}

/**
 * 更新充电站可用数量（用于模拟实时更新）
 */
export function updateStationAvailability(stationId: string, quickDelta: number, slowDelta: number): boolean {
  const stations = getAllStations()
  const station = stations.find(s => s.stationId === stationId)
  
  if (!station) {
    return false
  }
  
  // 更新快充可用数量
  station.quickAvailableNum = Math.max(0, Math.min(
    station.quickChargeNum,
    station.quickAvailableNum + quickDelta
  ))
  
  // 更新慢充可用数量
  station.slowAvailableNum = Math.max(0, Math.min(
    station.slowChargeNum,
    station.slowAvailableNum + slowDelta
  ))
  
  // 同时更新详情缓存
  if (stationDetailsCache.has(stationId)) {
    const detail = stationDetailsCache.get(stationId)!
    detail.quickAvailableCount = station.quickAvailableNum
    detail.slowAvailableCount = station.slowAvailableNum
  }
  
  return true
}

/**
 * 清空缓存（用于测试）
 */
export function clearCache() {
  cachedStations = null
  stationDetailsCache.clear()
}











