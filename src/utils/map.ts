/**
 * 地图工具函数
 */

import AMapLoader from '@amap/amap-jsapi-loader'
import type { StationListItem } from '@/types'

// 高德地图实例类型
export type AMapInstance = any
export type AMapMarker = any
export type AMapInfoWindow = any

// 地图配置
const AMAP_CONFIG = {
  key: import.meta.env.VITE_AMAP_KEY,
  version: '2.0',
  plugins: [
    'AMap.Scale',
    'AMap.ToolBar',
    'AMap.Geolocation',
    'AMap.MarkerCluster',
    'AMap.Geocoder',
    'AMap.Driving',
  ],
}

// 设置安全密钥
;(window as any)._AMapSecurityConfig = {
  securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE,
}

/**
 * 加载高德地图
 */
export async function loadAMap(): Promise<typeof AMap> {
  try {
    const AMap = await AMapLoader.load(AMAP_CONFIG)
    console.log('高德地图加载成功')
    return AMap
  } catch (error) {
    console.error('高德地图加载失败:', error)
    throw error
  }
}

/**
 * 创建地图实例
 */
export function createMap(container: string | HTMLElement, options: any = {}): AMapInstance {
  return new (window as any).AMap.Map(container, {
    zoom: 11,  // 初始缩放级别设置小一点，等定位后再放大
    center: [117.2272, 31.8206], // 合肥市中心（默认）
    mapStyle: 'amap://styles/normal',
    viewMode: '2D',
    showLabel: true,
    resizeEnable: true,
    animateEnable: true,  // 启用动画
    jogEnable: false,     // 禁用惯性拖拽
    pitchEnable: false,   // 禁用俯仰角
    ...options,
  })
}

/**
 * 生成充电站标记的SVG图标
 * @param availableRatio 可用率
 * @param price 价格
 * @param available 可用数量
 * @param total 总数量
 * @param isDark 是否暗色模式
 */
export function generateStationMarkerIcon(
  availableRatio: number,
  price: number,
  available: number,
  total: number,
  isDark: boolean = false
): string {
  let color: string
  
  if (availableRatio >= 0.5) {
    color = '#10b981' // 绿色 - 充足
  } else if (availableRatio >= 0.2) {
    color = '#f59e0b' // 黄色 - 紧张
  } else if (availableRatio > 0) {
    color = '#ef4444' // 红色 - 紧缺
  } else {
    color = '#9ca3af' // 灰色 - 无可用
  }
  
  const bgColor = isDark ? '#1f2937' : '#ffffff'
  const textColor = isDark ? '#f3f4f6' : '#1f2937'
  
  return `
    <svg width="90" height="100" viewBox="0 0 90 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.25"/>
        </filter>
      </defs>
      
      <!-- 背景卡片 -->
      <rect x="5" y="5" width="80" height="50" rx="8" fill="${bgColor}" filter="url(#shadow)" stroke="${color}" stroke-width="2.5"/>
      
      <!-- 充电图标 -->
      <path d="M 18 18 L 24 18 L 21 28 L 26 28 L 16 42 L 20 30 L 15 30 Z" fill="${color}" stroke="${color}" stroke-width="0.5"/>
      
      <!-- 价格 -->
      <text x="52" y="25" font-size="16" font-weight="bold" fill="${color}" text-anchor="middle">${price.toFixed(2)}</text>
      
      <!-- 可用数/总数 -->
      <text x="45" y="45" font-size="13" font-weight="600" fill="${textColor}" text-anchor="middle">${available}/${total}</text>
      
      <!-- 指针 -->
      <path d="M 45 55 L 38 70 L 52 70 Z" fill="${bgColor}" stroke="${color}" stroke-width="2"/>
      
      <!-- 中心定位点 -->
      <circle cx="45" cy="70" r="4" fill="${color}" stroke="${bgColor}" stroke-width="1.5"/>
    </svg>
  `
}

/**
 * 生成聚合点的SVG图标
 */
export function generateClusterMarkerIcon(count: number, isDark: boolean = false): string {
  const size = Math.min(60 + Math.log(count) * 10, 100)
  const bgColor = isDark ? '#1f2937' : '#0ea5e9'
  const textColor = '#ffffff'
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.4"/>
        </filter>
      </defs>
      
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="${bgColor}" opacity="0.2" filter="url(#shadow)"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 10}" fill="${bgColor}" filter="url(#shadow)"/>
      
      <text x="${size/2}" y="${size/2 + 6}" font-size="${size/3}" font-weight="bold" fill="${textColor}" text-anchor="middle">${count}</text>
    </svg>
  `
}

/**
 * 计算可用率
 */
export function calculateAvailableRatio(station: StationListItem): number {
  const total = station.quickChargeNum + station.slowChargeNum
  const available = station.quickAvailableNum + station.slowAvailableNum
  
  if (total === 0) return 0
  return available / total
}

/**
 * 获取充电站状态文本
 */
export function getStationStatusText(station: StationListItem): string {
  const ratio = calculateAvailableRatio(station)
  
  if (ratio >= 0.5) return '充足'
  if (ratio >= 0.2) return '紧张'
  if (ratio > 0) return '紧缺'
  return '暂满'
}

/**
 * 获取充电站状态颜色类
 */
export function getStationStatusClass(station: StationListItem): string {
  const ratio = calculateAvailableRatio(station)
  
  if (ratio >= 0.5) return 'status-available'
  if (ratio >= 0.2) return 'status-warning'
  if (ratio > 0) return 'status-busy'
  return 'status-offline'
}

/**
 * 格式化距离
 */
export function formatDistance(distance?: number): string {
  if (distance === undefined) return ''
  if (distance < 1) return `${Math.round(distance * 1000)}m`
  return `${distance.toFixed(1)}km`
}

/**
 * 获取用户当前位置
 */
export function getCurrentPosition(options: PositionOptions = {}): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理定位'))
      return
    }
    
    const defaultOptions: PositionOptions = {
      enableHighAccuracy: false, // 先用粗略定位加快速度
      timeout: 5000,
      maximumAge: 10000,
      ...options,
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, defaultOptions)
  })
}

/**
 * 获取精确位置（在粗略定位后调用）
 */
export function getAccuratePosition(): Promise<GeolocationPosition> {
  return getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  })
}


