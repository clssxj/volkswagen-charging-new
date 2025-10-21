/**
 * 并发冲突处理工具
 * 实现乐观锁、优先级判断、轮询重试等机制
 */

import type { ConnectorInfo } from '@/types'

// 订单来源类型
export enum OrderSource {
  APP_REMOTE = 'app_remote',    // APP远程下单
  ONSITE_SCAN = 'onsite_scan',  // 现场扫码
}

// 订单优先级
export enum OrderPriority {
  HIGH = 1,    // 高优先级（现场扫码）
  NORMAL = 2,  // 普通优先级（远程下单）
}

// 订单状态
export enum OrderStatus {
  PENDING = 'pending',       // 待确认
  CONFIRMED = 'confirmed',   // 已确认
  REJECTED = 'rejected',     // 已拒绝
  TIMEOUT = 'timeout',       // 超时
}

// 订单信息
export interface ChargingOrder {
  orderId: string
  connectorId: string
  userId: string
  source: OrderSource
  priority: OrderPriority
  timestamp: number
  status: OrderStatus
  version: number  // 乐观锁版本号
}

// 模拟订单存储
const ordersMap = new Map<string, ChargingOrder[]>()

/**
 * 创建充电订单（乐观更新）
 */
export async function createChargingOrder(
  connectorId: string,
  userId: string,
  source: OrderSource
): Promise<{ success: boolean; order?: ChargingOrder; error?: string }> {
  
  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  
  // 确定优先级
  const priority = source === OrderSource.ONSITE_SCAN 
    ? OrderPriority.HIGH 
    : OrderPriority.NORMAL
  
  const order: ChargingOrder = {
    orderId,
    connectorId,
    userId,
    source,
    priority,
    timestamp: Date.now(),
    status: OrderStatus.PENDING,
    version: 1,
  }
  
  console.log(`🔄 创建订单: ${orderId}`)
  console.log(`   充电桩: ${connectorId}`)
  console.log(`   来源: ${source === OrderSource.ONSITE_SCAN ? '现场扫码' : 'APP远程'}`)
  console.log(`   优先级: ${priority === OrderPriority.HIGH ? '高' : '普通'}`)
  
  // 乐观更新：先假设成功
  if (!ordersMap.has(connectorId)) {
    ordersMap.set(connectorId, [])
  }
  ordersMap.get(connectorId)!.push(order)
  
  // 模拟网络延迟
  await delay(300 + Math.random() * 200)
  
  // 检查并发冲突
  const conflict = checkConcurrentConflict(connectorId, order)
  
  if (conflict) {
    console.warn(`⚠️ 检测到并发冲突: ${conflict.reason}`)
    
    // 启动轮询重试
    const resolved = await pollForResolution(connectorId, order)
    
    if (resolved.success) {
      order.status = OrderStatus.CONFIRMED
      console.log(`✅ 订单确认成功: ${orderId}`)
      return { success: true, order }
    } else {
      order.status = OrderStatus.REJECTED
      console.error(`❌ 订单被拒绝: ${resolved.reason}`)
      
      // 回滚乐观更新
      rollbackOrder(connectorId, orderId)
      
      return { success: false, error: resolved.reason }
    }
  }
  
  // 无冲突，直接确认
  order.status = OrderStatus.CONFIRMED
  console.log(`✅ 订单确认成功（无冲突）: ${orderId}`)
  return { success: true, order }
}

/**
 * 检查并发冲突
 */
function checkConcurrentConflict(
  connectorId: string,
  currentOrder: ChargingOrder
): { hasConflict: boolean; reason?: string; competingOrders?: ChargingOrder[] } | null {
  
  const orders = ordersMap.get(connectorId) || []
  
  // 查找同一充电桩上的其他待处理订单
  const competingOrders = orders.filter(o => 
    o.orderId !== currentOrder.orderId &&
    o.status === OrderStatus.PENDING &&
    Math.abs(o.timestamp - currentOrder.timestamp) < 5000 // 5秒内的订单
  )
  
  if (competingOrders.length > 0) {
    console.log(`🔍 发现${competingOrders.length}个竞争订单:`)
    competingOrders.forEach(o => {
      console.log(`   - ${o.orderId} (${o.source === OrderSource.ONSITE_SCAN ? '现场' : '远程'}, 优先级:${o.priority})`)
    })
    
    return {
      hasConflict: true,
      reason: '充电桩被多人同时预约',
      competingOrders
    }
  }
  
  return null
}

/**
 * 轮询解决冲突
 */
async function pollForResolution(
  connectorId: string,
  currentOrder: ChargingOrder
): Promise<{ success: boolean; reason?: string }> {
  
  const MAX_RETRIES = 5
  const RETRY_INTERVAL = 1000 // 1秒
  
  console.log(`🔄 开始轮询（最多${MAX_RETRIES}次）...`)
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`   尝试 ${attempt}/${MAX_RETRIES}...`)
    
    await delay(RETRY_INTERVAL)
    
    const orders = ordersMap.get(connectorId) || []
    const competingOrders = orders.filter(o => 
      o.orderId !== currentOrder.orderId &&
      o.status === OrderStatus.PENDING
    )
    
    if (competingOrders.length === 0) {
      console.log(`✅ 竞争订单已清除，当前订单可以确认`)
      return { success: true }
    }
    
    // 按优先级判断
    const hasHigherPriority = competingOrders.some(o => o.priority < currentOrder.priority)
    
    if (hasHigherPriority) {
      // 有更高优先级的订单
      const higherOrder = competingOrders.find(o => o.priority < currentOrder.priority)
      console.log(`⚠️ 存在更高优先级订单: ${higherOrder?.orderId}`)
      
      if (currentOrder.priority === OrderPriority.NORMAL) {
        // 普通优先级订单让位给高优先级
        return { 
          success: false, 
          reason: '充电桩已被现场用户占用，请选择其他充电桩' 
        }
      }
    } else {
      // 当前订单优先级更高或相同
      if (currentOrder.priority === OrderPriority.HIGH) {
        // 高优先级订单直接抢占
        console.log(`✅ 当前订单优先级更高，抢占充电桩`)
        
        // 拒绝其他订单
        competingOrders.forEach(o => {
          o.status = OrderStatus.REJECTED
        })
        
        return { success: true }
      }
    }
    
    // 相同优先级，先到先得
    const earlierOrder = competingOrders.find(o => o.timestamp < currentOrder.timestamp)
    if (earlierOrder) {
      console.log(`⚠️ 存在更早的订单: ${earlierOrder.orderId}`)
      return { 
        success: false, 
        reason: '充电桩已被他人预约，请选择其他充电桩' 
      }
    }
  }
  
  // 超时
  console.error(`❌ 轮询超时，订单确认失败`)
  return { 
    success: false, 
    reason: '服务器繁忙，请稍后重试' 
  }
}

/**
 * 回滚订单
 */
function rollbackOrder(connectorId: string, orderId: string) {
  const orders = ordersMap.get(connectorId) || []
  const index = orders.findIndex(o => o.orderId === orderId)
  
  if (index !== -1) {
    orders.splice(index, 1)
    console.log(`🔙 订单已回滚: ${orderId}`)
  }
}

/**
 * 模拟延迟
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 模拟并发场景（用于测试）
 */
export async function simulateConcurrentOrders(
  connectorId: string
): Promise<void> {
  console.log(`\n🎭 ===== 模拟并发场景 =====`)
  console.log(`充电桩: ${connectorId}`)
  
  // 场景：几乎同时发起两个订单
  const order1Promise = createChargingOrder(
    connectorId,
    'user-app-001',
    OrderSource.APP_REMOTE
  )
  
  // 延迟100ms，模拟网络差异
  await delay(100)
  
  const order2Promise = createChargingOrder(
    connectorId,
    'user-onsite-002',
    OrderSource.ONSITE_SCAN
  )
  
  // 等待两个订单处理完成
  const [result1, result2] = await Promise.all([order1Promise, order2Promise])
  
  console.log(`\n📊 ===== 并发测试结果 =====`)
  console.log(`远程订单: ${result1.success ? '✅ 成功' : '❌ 失败 - ' + result1.error}`)
  console.log(`现场订单: ${result2.success ? '✅ 成功' : '❌ 失败 - ' + result2.error}`)
  console.log(`\n预期结果: 现场订单应该成功（高优先级），远程订单应该失败`)
  console.log(`=============================\n`)
}

/**
 * 清除所有订单（用于测试）
 */
export function clearAllOrders() {
  ordersMap.clear()
  console.log('🧹 所有订单已清除')
}

/**
 * 获取充电桩的订单列表
 */
export function getConnectorOrders(connectorId: string): ChargingOrder[] {
  return ordersMap.get(connectorId) || []
}



