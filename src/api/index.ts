/**
 * API 接口层
 */

import axios from 'axios'
import type { StationListItem, StationDetail, StationListResponse } from '@/types'
import { 
  getAllStations, 
  getStationDetail, 
  getStationsByBounds,
  getStationsByRadius,
  searchStations 
} from '@/mock/data'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 是否使用 Mock 数据
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 等认证信息
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

/**
 * 模拟延迟
 */
function mockDelay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 获取充电站列表（分页）
 */
export async function fetchStationList(params: {
  pageIndex?: number
  pageSize?: number
  lat?: number
  lng?: number
  radius?: number
}): Promise<StationListResponse> {
  if (USE_MOCK) {
    await mockDelay(200)
    
    const { pageIndex = 1, pageSize = 20, lat, lng, radius = 10 } = params
    
    let stations: StationListItem[] = []
    
    if (lat && lng) {
      stations = getStationsByRadius(lat, lng, radius, 500)
    } else {
      stations = getAllStations()
    }
    
    const total = stations.length
    const totalPage = Math.ceil(total / pageSize)
    const start = (pageIndex - 1) * pageSize
    const end = start + pageSize
    
    return {
      pageIndex,
      pageSize,
      total,
      totalPage,
      stationList: stations.slice(start, end),
    }
  }
  
  return apiClient.get('/stations', { params })
}

/**
 * 根据地图边界获取充电站列表
 */
export async function fetchStationsByBounds(bounds: {
  northeast: { lat: number, lng: number }
  southwest: { lat: number, lng: number }
}): Promise<StationListItem[]> {
  if (USE_MOCK) {
    await mockDelay(100)
    return getStationsByBounds(bounds.northeast, bounds.southwest)
  }
  
  return apiClient.post('/stations/bounds', bounds)
}

/**
 * 获取充电站详情
 */
export async function fetchStationDetail(stationId: string): Promise<StationDetail | null> {
  if (USE_MOCK) {
    await mockDelay(200)
    return getStationDetail(stationId)
  }
  
  return apiClient.get(`/stations/${stationId}`)
}

/**
 * 搜索充电站
 */
export async function fetchSearchStations(keyword: string): Promise<StationListItem[]> {
  if (USE_MOCK) {
    await mockDelay(300)
    return searchStations(keyword)
  }
  
  return apiClient.get('/stations/search', { params: { keyword } })
}

/**
 * 获取附近充电站
 */
export async function fetchNearbyStations(
  lat: number, 
  lng: number, 
  radius: number = 10
): Promise<StationListItem[]> {
  if (USE_MOCK) {
    await mockDelay(200)
    return getStationsByRadius(lat, lng, radius)
  }
  
  return apiClient.get('/stations/nearby', { params: { lat, lng, radius } })
}

export default apiClient











