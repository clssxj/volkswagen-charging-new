<template>
  <div class="charging-flow-container" v-if="visible">
    <!-- 遮罩层 -->
    <div 
      class="fixed inset-0 bg-black/50 transition-opacity"
      style="z-index: 450;"
      :class="visible ? 'opacity-100' : 'opacity-0'"
      @click="handleClose"
    ></div>
    
    <!-- 流程面板 -->
    <div 
      class="charging-flow-panel"
      style="z-index: 460;"
      :class="visible ? 'translate-y-0' : 'translate-y-full'"
    >
      <!-- 步骤1: 选择充电桩 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="step-header">
          <button @click="handleClose" class="back-button">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <h2 class="step-title">选择充电桩</h2>
        </div>
        
        <div class="connector-list">
          <div
            v-for="connector in availableConnectors"
            :key="connector.connectorId"
            class="connector-card"
            :class="[
              { 'selected': selectedConnector?.connectorId === connector.connectorId },
              connector.connectorType === 4 ? 'fast-charging-card' : 'slow-charging-card'
            ]"
            @click="selectConnector(connector)"
          >
            <div class="flex items-start gap-3">
              <!-- 充电类型徽章 -->
              <div class="charge-type-badge">
                <svg v-if="connector.connectorType === 4" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707z"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
                </svg>
                <span class="text-xs font-bold">
                  {{ connector.connectorType === 4 ? '快充' : '慢充' }}
                </span>
              </div>
              
              <!-- 状态指示器 -->
              <div 
                class="w-4 h-4 rounded-full mt-1"
                :class="connector.status === 1 ? 'bg-green-500' : 'bg-yellow-500'"
              ></div>
              
              <div class="flex-1">
                <div class="font-semibold text-gray-900 dark:text-white">
                  车位号：{{ connector.sortLabel }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ connector.connectorId }}
                </div>
                <div class="flex items-center gap-3 mt-2">
                  <span class="text-sm font-medium text-gray-900 dark:text-gray-300">
                    {{ connector.power }}kW
                  </span>
                  <span class="text-sm" :class="connector.status === 1 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'">
                    {{ connector.status === 1 ? '空闲' : '占用' }}
                  </span>
                </div>
              </div>
              <div 
                v-if="selectedConnector?.connectorId === connector.connectorId" 
                class="text-primary-600 flex-shrink-0"
              >
                <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div 
                v-else
                class="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
              ></div>
            </div>
          </div>
        </div>
        
        <div class="step-actions">
          <button @click="handleClose" class="btn-secondary flex-1">取消</button>
          <button @click="nextStep" :disabled="!selectedConnector" class="btn-primary flex-1">
            下一步
          </button>
        </div>
      </div>
      
      <!-- 步骤2: 确认充电信息 -->
      <div v-else-if="currentStep === 2" class="step-content">
        <div class="step-header">
          <button @click="prevStep" class="back-button">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 class="step-title">确认充电信息</h2>
        </div>
        
        <div class="info-section">
          <h3 class="section-title">充电站信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">充电站</span>
              <span class="info-value">{{ stationName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">充电桩</span>
              <span class="info-value">车位号 {{ selectedConnector?.sortLabel }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">功率</span>
              <span class="info-value">{{ selectedConnector?.power }}kW</span>
            </div>
          </div>
        </div>
        
        <div class="info-section">
          <h3 class="section-title">充电设置</h3>
          <div class="charging-options">
            <!-- 充电方式 -->
            <div class="option-group">
              <label class="option-label">充电方式</label>
              <div class="flex gap-3">
                <button
                  v-for="mode in chargingModes"
                  :key="mode.value"
                  class="mode-button"
                  :class="{ 'active': selectedMode === mode.value }"
                  @click="selectedMode = mode.value"
                >
                  {{ mode.label }}
                </button>
              </div>
            </div>
            
            <!-- 充电量/金额 -->
            <div class="option-group">
              <label class="option-label">
                {{ selectedMode === 'amount' ? '充电金额（元）' : '充电电量（度）' }}
              </label>
              <input
                v-model.number="chargingValue"
                type="number"
                :min="selectedMode === 'amount' ? 10 : 5"
                :max="selectedMode === 'amount' ? 500 : 100"
                class="value-input"
                :placeholder="selectedMode === 'amount' ? '请输入充电金额' : '请输入充电电量'"
              />
            </div>
            
            <!-- 预计费用 -->
            <div class="estimate-box">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">当前电价</span>
                <span class="text-lg font-bold text-primary-600">
                  ¥{{ currentPrice.toFixed(2) }}<span class="text-xs">/度</span>
                </span>
              </div>
              <div class="flex justify-between items-center mt-2">
                <span class="text-gray-600 dark:text-gray-400">预计费用</span>
                <span class="text-xl font-bold text-gray-900 dark:text-white">
                  ¥{{ estimatedCost.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="step-actions">
          <button @click="prevStep" class="btn-secondary flex-1">上一步</button>
          <button @click="nextStep" :disabled="!chargingValue" class="btn-primary flex-1">
            开始充电
          </button>
        </div>
      </div>
      
      <!-- 步骤3: 充电中 -->
      <div v-else-if="currentStep === 3" class="step-content">
        <div class="step-header">
          <h2 class="step-title">充电中</h2>
        </div>
        
        <div class="charging-status">
          <!-- 充电动画 -->
          <div class="charging-animation">
            <div class="battery-icon">
              <div class="battery-fill" :style="{ width: `${chargingProgress}%` }"></div>
            </div>
            <div class="text-4xl font-bold text-primary-600 mt-4">
              {{ chargingProgress }}%
            </div>
          </div>
          
          <!-- 充电信息 -->
          <div class="charging-info">
            <div class="info-row">
              <span class="info-label">已充电量</span>
              <span class="info-value">{{ chargedAmount.toFixed(2) }}度</span>
            </div>
            <div class="info-row">
              <span class="info-label">已充时长</span>
              <span class="info-value">{{ chargingDuration }}分钟</span>
            </div>
            <div class="info-row">
              <span class="info-label">当前功率</span>
              <span class="info-value">{{ selectedConnector?.power }}kW</span>
            </div>
            <div class="info-row">
              <span class="info-label">已花费用</span>
              <span class="info-value text-primary-600 font-bold">
                ¥{{ currentCost.toFixed(2) }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="step-actions">
          <button @click="stopCharging" class="btn-secondary flex-1">
            结束充电
          </button>
        </div>
      </div>
      
      <!-- 步骤4: 支付 -->
      <div v-else-if="currentStep === 4" class="step-content">
        <div class="step-header">
          <h2 class="step-title">支付订单</h2>
        </div>
        
        <div class="payment-section">
          <!-- 订单信息 -->
          <div class="order-summary">
            <div class="summary-header">
              <svg class="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mt-3">
                充电完成
              </h3>
            </div>
            
            <div class="order-details">
              <div class="detail-row">
                <span>充电电量</span>
                <span>{{ finalAmount.toFixed(2) }}度</span>
              </div>
              <div class="detail-row">
                <span>充电时长</span>
                <span>{{ finalDuration }}分钟</span>
              </div>
              <div class="detail-row">
                <span>电费</span>
                <span>¥{{ electricityCost.toFixed(2) }}</span>
              </div>
              <div class="detail-row">
                <span>服务费</span>
                <span>¥{{ serviceCost.toFixed(2) }}</span>
              </div>
              <div class="detail-row total">
                <span>合计</span>
                <span class="text-2xl font-bold text-primary-600">
                  ¥{{ totalCost.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 支付方式 -->
          <div class="payment-methods">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              选择支付方式
            </h4>
            <div class="space-y-2">
              <button
                v-for="method in paymentMethods"
                :key="method.value"
                class="payment-method"
                :class="{ 'active': selectedPayment === method.value }"
                @click="selectedPayment = method.value"
              >
                <span class="text-2xl">{{ method.icon }}</span>
                <span class="flex-1 text-left ml-3">{{ method.label }}</span>
                <div v-if="selectedPayment === method.value" class="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        <div class="step-actions">
          <button @click="handlePayment" :disabled="!selectedPayment" class="btn-primary w-full">
            确认支付 ¥{{ totalCost.toFixed(2) }}
          </button>
        </div>
      </div>
      
      <!-- 步骤5: 支付成功 -->
      <div v-else-if="currentStep === 5" class="step-content">
        <div class="success-section">
          <svg class="w-20 h-20 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-6">
            支付成功
          </h2>
          <p class="text-gray-500 dark:text-gray-400 mt-2">
            感谢您的使用，祝您旅途愉快！
          </p>
          
          <div class="order-info mt-8">
            <div class="info-item">
              <span class="text-gray-500">订单号</span>
              <span class="font-mono">{{ orderId }}</span>
            </div>
            <div class="info-item">
              <span class="text-gray-500">支付金额</span>
              <span class="text-xl font-bold text-primary-600">
                ¥{{ totalCost.toFixed(2) }}
              </span>
            </div>
            <div class="info-item">
              <span class="text-gray-500">支付时间</span>
              <span>{{ paymentTime }}</span>
            </div>
          </div>
        </div>
        
        <div class="step-actions">
          <button @click="handleClose" class="btn-primary w-full">
            完成
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ConnectorInfo } from '@/types'
import { ConnectorStatus } from '@/types'
import { createChargingOrder, OrderSource } from '@/utils/concurrency'

// eslint-disable-next-line @typescript-eslint/no-explicit-any

const props = defineProps<{
  visible: boolean
  stationName: string
  connectors: ConnectorInfo[]
  currentPrice: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'complete', orderId: string, amount: number): void
}>()

const currentStep = ref(1)
const selectedConnector = ref<ConnectorInfo | null>(null)
const selectedMode = ref<'amount' | 'energy'>('amount' as 'amount' | 'energy')
const chargingValue = ref<number>(50)
const chargingProgress = ref(0)
const chargedAmount = ref(0)
const chargingDuration = ref(0)
const currentCost = ref(0)
const selectedPayment = ref<string>('')

let chargingTimer: number | null = null

// 可用充电桩
const availableConnectors = computed(() => 
  props.connectors.filter((c: ConnectorInfo) => 
    c.status === ConnectorStatus.AVAILABLE || 
    c.status === ConnectorStatus.OCCUPIED
  )
)

// 充电方式选项
const chargingModes = [
  { value: 'amount', label: '按金额' },
  { value: 'energy', label: '按电量' }
]

// 支付方式
const paymentMethods = [
  { value: 'wechat', label: '微信支付', icon: '💚' },
  { value: 'alipay', label: '支付宝', icon: '💙' },
  { value: 'unionpay', label: '银联支付', icon: '🧡' }
]

// 预计费用
const estimatedCost = computed(() => {
  if (selectedMode.value === 'amount') {
    return chargingValue.value
  } else {
    return chargingValue.value * props.currentPrice
  }
})

// 最终数据
const finalAmount = ref(0)
const finalDuration = ref(0)
const electricityCost = ref(0)
const serviceCost = ref(0)
const totalCost = ref(0)
const orderId = ref('')
const paymentTime = ref('')

// 选择充电桩
function selectConnector(connector: ConnectorInfo) {
  selectedConnector.value = connector
  console.log('✅ 已选择充电桩:', connector.sortLabel, connector.connectorId)
}

// 下一步
async function nextStep() {
  if (currentStep.value === 1 && !selectedConnector.value) return
  if (currentStep.value === 2 && !chargingValue.value) return
  
  if (currentStep.value === 2) {
    // 开始充电前，先检查并发冲突
    await handleStartChargingWithConflictCheck()
    return
  }
  
  currentStep.value++
}

// 处理充电开始（含并发冲突检测）
async function handleStartChargingWithConflictCheck() {
  if (!selectedConnector.value) return
  
  console.log(`🔄 准备开始充电，检查充电桩可用性...`)
  
  // 模拟订单来源（随机选择APP远程或现场扫码）
  const source = Math.random() > 0.5 ? OrderSource.APP_REMOTE : OrderSource.ONSITE_SCAN
  const userId = `user-${Date.now()}`
  
  console.log(`📱 订单来源: ${source === OrderSource.ONSITE_SCAN ? '现场扫码' : 'APP远程下单'}`)
  
  // 创建订单（含并发检测）
  const result = await createChargingOrder(
    selectedConnector.value.connectorId,
    userId,
    source
  )
  
  if (result.success) {
    // 订单确认成功，开始充电
    console.log(`✅ 充电桩预约成功，开始充电`)
    startCharging()
    currentStep.value = 3
  } else {
    // 订单失败，显示错误
    console.error(`❌ 充电桩预约失败: ${result.error}`)
    alert(`充电桩预约失败\n\n${result.error}\n\n请返回重新选择充电桩`)
    
    // 回到选择充电桩页面
    currentStep.value = 1
    selectedConnector.value = null
  }
}

// 上一步
function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// 开始充电
function startCharging() {
  chargingProgress.value = 0
  chargedAmount.value = 0
  chargingDuration.value = 0
  currentCost.value = 0
  
  // 计算目标电量
  const targetEnergy = selectedMode.value === 'amount' 
    ? chargingValue.value / props.currentPrice  // 根据金额算电量
    : chargingValue.value                        // 直接使用电量
  
  // 获取充电桩功率（kW）
  const power = selectedConnector.value?.power || 60
  
  // 计算总充电时间（分钟）= 电量(kWh) / 功率(kW) * 60
  const totalMinutes = (targetEnergy / power) * 60
  
  // 实时显示模拟：每秒更新一次
  // 但为了演示方便，加速10倍（否则太慢了）
  const DEMO_SPEED_MULTIPLIER = 1 // 演示加速倍数
  const updateInterval = 1000 // 每秒更新
  const minutesPerUpdate = (totalMinutes / 100) * DEMO_SPEED_MULTIPLIER // 每次更新的分钟数
  
  console.log(`⚡ 充电参数:`)
  console.log(`   功率: ${power}kW`)
  console.log(`   目标电量: ${targetEnergy.toFixed(2)}kWh`)
  console.log(`   理论充电时间: ${totalMinutes.toFixed(1)}分钟`)
  console.log(`   演示时间: ${(totalMinutes / DEMO_SPEED_MULTIPLIER).toFixed(1)}分钟 (${DEMO_SPEED_MULTIPLIER}倍速)`)
  
  // 模拟充电进度
  chargingTimer = window.setInterval(() => {
    if (chargingProgress.value < 100) {
      chargingProgress.value += 1
      chargingDuration.value += minutesPerUpdate
      
      // 根据功率和时间计算实际充电量
      chargedAmount.value = (power / 60) * chargingDuration.value
      currentCost.value = chargedAmount.value * props.currentPrice
      
      // 检查是否达到目标
      if (chargedAmount.value >= targetEnergy) {
        chargingProgress.value = 100
        chargedAmount.value = targetEnergy
        currentCost.value = targetEnergy * props.currentPrice
        stopCharging()
      }
    } else {
      stopCharging()
    }
  }, updateInterval)
}

// 停止充电
function stopCharging() {
  if (chargingTimer) {
    clearInterval(chargingTimer)
    chargingTimer = null
  }
  
  // 计算最终费用
  finalAmount.value = chargedAmount.value
  finalDuration.value = chargingDuration.value
  
  // 电费 = 电量 * 电价 * 70% (假设电费占总价70%)
  electricityCost.value = finalAmount.value * props.currentPrice * 0.7
  // 服务费 = 电量 * 电价 * 30%
  serviceCost.value = finalAmount.value * props.currentPrice * 0.3
  // 总费用
  totalCost.value = electricityCost.value + serviceCost.value
  
  // 进入支付步骤
  currentStep.value = 4
}

// 支付
function handlePayment() {
  if (!selectedPayment.value) return
  
  // 生成订单号
  orderId.value = `CHG${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  paymentTime.value = new Date().toLocaleString('zh-CN')
  
  // 模拟支付延迟
  setTimeout(() => {
    currentStep.value = 5
    emit('complete', orderId.value, totalCost.value)
  }, 1500)
}

// 关闭
function handleClose() {
  if (chargingTimer) {
    clearInterval(chargingTimer)
    chargingTimer = null
  }
  currentStep.value = 1
  selectedConnector.value = null
  chargingValue.value = 50
  selectedPayment.value = ''
  emit('close')
}

// 监听visible变化
watch(() => props.visible, (newVal: boolean) => {
  if (!newVal) {
    handleClose()
  }
})
</script>

<style scoped>
.charging-flow-container {
  position: fixed;
  inset: 0;
  z-index: 450;
}

.charging-flow-panel {
  @apply fixed bottom-0 left-0 right-0;
  @apply bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl;
  @apply max-h-[90vh] flex flex-col;
  @apply transition-transform duration-300 ease-out;
  z-index: 60;
}

.step-content {
  @apply flex flex-col h-full overflow-y-auto;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
}

.step-header {
  @apply flex items-center gap-4 px-4 py-4 border-b border-gray-200 dark:border-gray-700;
  @apply sticky top-0 bg-white dark:bg-gray-800 z-10;
}

.back-button {
  @apply p-2 -ml-2 rounded-lg;
  @apply text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200;
  @apply hover:bg-gray-100 dark:hover:bg-gray-700;
  @apply transition-colors;
}

.step-title {
  @apply flex-1 text-lg font-semibold text-gray-900 dark:text-white text-center;
}

.connector-list {
  @apply flex-1 overflow-y-auto p-4 space-y-3;
}

.connector-card {
  @apply p-4 rounded-lg border-2;
  @apply cursor-pointer transition-all duration-200;
  @apply hover:shadow-md;
  position: relative;
  overflow: hidden;
}

.connector-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.connector-card.fast-charging-card {
  @apply border-orange-200 dark:border-orange-800;
  @apply bg-orange-50/30 dark:bg-orange-900/10;
}

.connector-card.fast-charging-card::before {
  @apply bg-orange-500;
}

.connector-card.fast-charging-card:hover {
  @apply border-orange-300 dark:border-orange-700;
  @apply bg-orange-50/50 dark:bg-orange-900/20;
}

.connector-card.slow-charging-card {
  @apply border-blue-200 dark:border-blue-800;
  @apply bg-blue-50/30 dark:bg-blue-900/10;
}

.connector-card.slow-charging-card::before {
  @apply bg-blue-500;
}

.connector-card.slow-charging-card:hover {
  @apply border-blue-300 dark:border-blue-700;
  @apply bg-blue-50/50 dark:bg-blue-900/20;
}

.connector-card:active {
  transform: scale(0.98);
}

.connector-card.selected {
  @apply border-primary-600;
  @apply shadow-xl;
  @apply ring-4 ring-primary-500 ring-opacity-30;
  transform: scale(1.02);
}

.connector-card.fast-charging-card.selected {
  @apply bg-orange-100 dark:bg-orange-900/30;
}

.connector-card.slow-charging-card.selected {
  @apply bg-blue-100 dark:bg-blue-900/30;
}

.charge-type-badge {
  @apply flex items-center gap-1 px-2.5 py-1 rounded-full;
  @apply text-xs font-bold;
}

.fast-charging-card .charge-type-badge {
  @apply bg-orange-500 text-white;
  @apply shadow-sm;
}

.slow-charging-card .charge-type-badge {
  @apply bg-blue-500 text-white;
  @apply shadow-sm;
}

.step-actions {
  @apply flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700;
  @apply bg-white dark:bg-gray-800 sticky bottom-0;
}

.info-section {
  @apply p-4 border-b border-gray-100 dark:border-gray-700;
}

.section-title {
  @apply text-base font-semibold text-gray-900 dark:text-white mb-3;
}

.info-grid {
  @apply space-y-2;
}

.info-item {
  @apply flex justify-between items-center;
}

.info-label {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.info-value {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.charging-options {
  @apply space-y-4;
}

.option-group {
  @apply space-y-2;
}

.option-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.mode-button {
  @apply flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700;
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
  @apply transition-all;
  @apply hover:border-primary-300 dark:hover:border-primary-600;
}

.mode-button.active {
  @apply border-primary-600 bg-primary-50 dark:bg-primary-900/20;
  @apply text-primary-700 dark:text-primary-300;
}

.value-input {
  @apply w-full px-4 py-3 rounded-lg;
  @apply border-2 border-gray-200 dark:border-gray-700;
  @apply bg-white dark:bg-gray-700;
  @apply text-gray-900 dark:text-white;
  @apply focus:border-primary-600 focus:ring-2 focus:ring-primary-200;
  @apply transition-all;
}

.estimate-box {
  @apply p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50;
}

.charging-status {
  @apply flex-1 overflow-y-auto p-6;
}

.charging-animation {
  @apply text-center py-8;
}

.battery-icon {
  @apply w-32 h-16 mx-auto;
  @apply rounded-lg border-4 border-primary-600;
  @apply relative overflow-hidden;
  @apply bg-gray-100 dark:bg-gray-700;
}

.battery-fill {
  @apply absolute left-0 top-0 bottom-0;
  @apply bg-gradient-to-r from-primary-500 to-primary-600;
  @apply transition-all duration-300;
}

.charging-info {
  @apply mt-8 space-y-3;
}

.info-row {
  @apply flex justify-between items-center py-2;
  @apply border-b border-gray-100 dark:border-gray-700;
}

.payment-section {
  @apply flex-1 overflow-y-auto p-4 space-y-6;
}

.order-summary {
  @apply bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4;
}

.summary-header {
  @apply text-center pb-4 border-b border-gray-200 dark:border-gray-600;
}

.order-details {
  @apply mt-4 space-y-2;
}

.detail-row {
  @apply flex justify-between items-center text-sm;
  @apply text-gray-600 dark:text-gray-400;
}

.detail-row.total {
  @apply pt-3 mt-3 border-t-2 border-gray-300 dark:border-gray-600;
  @apply text-base font-semibold text-gray-900 dark:text-white;
}

.payment-methods {
  @apply mt-4;
}

.payment-method {
  @apply w-full flex items-center px-4 py-3 rounded-lg;
  @apply border-2 border-gray-200 dark:border-gray-700;
  @apply transition-all;
  @apply hover:border-primary-300 dark:hover:border-primary-600;
}

.payment-method.active {
  @apply border-primary-600 bg-primary-50 dark:bg-primary-900/20;
}

.success-section {
  @apply flex-1 text-center p-8;
}

.order-info {
  @apply space-y-4;
}
</style>

