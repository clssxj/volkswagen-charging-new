/**
 * WebSocket 模拟实时更新服务
 */

import type { StationListItem } from '@/types'
import { updateStationAvailability } from '@/mock/data'
import type { useMapStore } from '@/stores/map'
import type { useStationStore } from '@/stores/station'

let updateTimer: number | null = null
let mapStoreRef: ReturnType<typeof useMapStore> | null = null
let stationStoreRef: ReturnType<typeof useStationStore> | null = null

/**
 * 启动实时更新
 */
export function startRealtimeUpdate(
  mapStore: ReturnType<typeof useMapStore>,
  stationStore: ReturnType<typeof useStationStore>
) {
  mapStoreRef = mapStore
  stationStoreRef = stationStore
  
  // 停止之前的更新
  stopRealtimeUpdate()
  
  console.log('启动实时更新服务...')
  
  // 每10-15分钟更新一次可用充电桩数量
  const updateInterval = getRandomInterval(10 * 60 * 1000, 15 * 60 * 1000)
  
  updateTimer = window.setInterval(() => {
    updateVisibleStations()
  }, updateInterval)
  
  // 首次立即更新（延迟3秒，避免和地图初始化冲突）
  setTimeout(() => {
    updateVisibleStations()
  }, 3000)
}

/**
 * 停止实时更新
 */
export function stopRealtimeUpdate() {
  if (updateTimer) {
    clearInterval(updateTimer)
    updateTimer = null
  }
  console.log('实时更新服务已停止')
}

/**
 * 更新可见充电站的可用数量
 */
function updateVisibleStations() {
  if (!mapStoreRef) return
  
  const visibleStations = mapStoreRef.visibleStations
  if (visibleStations.length === 0) return
  
  console.log(`正在更新 ${visibleStations.length} 个可见充电站的状态...`)
  
  let updatedCount = 0
  
  // 随机选择一些充电站进行更新
  const updateCount = Math.min(
    Math.floor(visibleStations.length * 0.3), // 更新30%的充电站
    20 // 最多更新20个
  )
  
  const stationsToUpdate = getRandomItems(visibleStations, updateCount)
  
  stationsToUpdate.forEach(station => {
    // 随机增减充电桩数量（-3 到 +3）
    const quickDelta = getRandomDelta()
    const slowDelta = getRandomDelta()
    
    // 更新数据
    const success = updateStationAvailability(station.stationId, quickDelta, slowDelta)
    
    if (success) {
      updatedCount++
      
      // 更新UI中的数量
      station.quickAvailableNum = Math.max(
        0,
        Math.min(station.quickChargeNum, station.quickAvailableNum + quickDelta)
      )
      station.slowAvailableNum = Math.max(
        0,
        Math.min(station.slowChargeNum, station.slowAvailableNum + slowDelta)
      )
      
      // 如果当前有打开的详情页，更新详情
      if (stationStoreRef && stationStoreRef.stationDetail?.stationId === station.stationId) {
        stationStoreRef.updateStationAvailability(
          station.stationId,
          station.quickAvailableNum,
          station.slowAvailableNum
        )
      }
      
      // 添加视觉反馈（可选）
      animateStationUpdate(station)
    }
  })
  
  console.log(`已更新 ${updatedCount} 个充电站的状态`)
}

/**
 * 获取随机数量变化（-3 到 +3）
 */
function getRandomDelta(): number {
  const deltas = [-3, -2, -1, 0, 0, 0, 1, 2, 3] // 0的概率更高
  return deltas[Math.floor(Math.random() * deltas.length)]
}

/**
 * 获取随机区间
 */
function getRandomInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 从数组中随机获取N个元素
 */
function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * 充电站更新动画（可选）
 */
function animateStationUpdate(station: StationListItem) {
  // 这里可以添加一些视觉反馈
  // 例如在地图上闪烁标记，或者触发一个事件
  console.log(`充电站 ${station.stationName} 状态已更新`)
}

/**
 * 模拟价格更新（根据时间段）
 */
export function updatePriceByTime() {
  // 这个功能在 generator.ts 的 generatePeriodPrices 中已经实现
  // 价格会根据当前时间段自动计算
  console.log('价格已根据时间段更新')
}

/**
 * WebSocket 连接管理（预留接口，用于真实后端）
 */
export class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectTimer: number | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  
  constructor(private url: string) {}
  
  /**
   * 连接
   */
  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return
    }
    
    try {
      this.ws = new WebSocket(this.url)
      
      this.ws.onopen = () => {
        console.log('WebSocket 连接成功')
        this.reconnectAttempts = 0
      }
      
      this.ws.onmessage = (event) => {
        this.handleMessage(event.data)
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket 错误:', error)
      }
      
      this.ws.onclose = () => {
        console.log('WebSocket 连接关闭')
        this.attemptReconnect()
      }
    } catch (error) {
      console.error('WebSocket 连接失败:', error)
      this.attemptReconnect()
    }
  }
  
  /**
   * 断开连接
   */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
  
  /**
   * 发送消息
   */
  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket 未连接，无法发送消息')
    }
  }
  
  /**
   * 处理消息
   */
  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data)
      console.log('收到 WebSocket 消息:', message)
      
      // 根据消息类型处理
      switch (message.type) {
        case 'station_status_update':
          this.handleStationStatusUpdate(message.data)
          break
        case 'price_update':
          this.handlePriceUpdate(message.data)
          break
        default:
          console.log('未知消息类型:', message.type)
      }
    } catch (error) {
      console.error('解析 WebSocket 消息失败:', error)
    }
  }
  
  /**
   * 处理充电站状态更新
   */
  private handleStationStatusUpdate(data: any) {
    if (mapStoreRef) {
      const station = mapStoreRef.visibleStations.find(s => s.stationId === data.stationId)
      if (station) {
        station.quickAvailableNum = data.quickAvailableNum
        station.slowAvailableNum = data.slowAvailableNum
      }
    }
    
    if (stationStoreRef) {
      stationStoreRef.updateStationAvailability(
        data.stationId,
        data.quickAvailableNum,
        data.slowAvailableNum
      )
    }
  }
  
  /**
   * 处理价格更新
   */
  private handlePriceUpdate(data: any) {
    console.log('价格更新:', data)
    // 更新价格逻辑
  }
  
  /**
   * 尝试重连
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('达到最大重连次数，停止重连')
      return
    }
    
    this.reconnectAttempts++
    console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
    
    this.reconnectTimer = window.setTimeout(() => {
      this.connect()
    }, this.reconnectDelay * this.reconnectAttempts)
  }
}

// 导出全局实例（用于真实后端时）
let wsManager: WebSocketManager | null = null

/**
 * 初始化 WebSocket 连接（用于真实后端）
 */
export function initWebSocket(url: string) {
  if (!wsManager) {
    wsManager = new WebSocketManager(url)
    wsManager.connect()
  }
  return wsManager
}

/**
 * 关闭 WebSocket 连接
 */
export function closeWebSocket() {
  if (wsManager) {
    wsManager.disconnect()
    wsManager = null
  }
}
