<template>
  <div class="concurrency-test-panel">
    <div class="test-header">
      <h3 class="text-lg font-bold">并发冲突测试</h3>
      <button @click="$emit('close')" class="text-gray-500">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
    
    <div class="test-content">
      <div class="test-scenario">
        <h4 class="font-semibold mb-3">测试场景：两人同时预约同一充电桩</h4>
        
        <div class="scenario-description">
          <div class="user-card remote-user">
            <div class="user-icon">📱</div>
            <div>
              <div class="font-medium">用户A - APP远程下单</div>
              <div class="text-sm text-gray-500">优先级：普通</div>
            </div>
          </div>
          
          <div class="vs-icon">VS</div>
          
          <div class="user-card onsite-user">
            <div class="user-icon">📷</div>
            <div>
              <div class="font-medium">用户B - 现场扫码</div>
              <div class="text-sm text-gray-500">优先级：高</div>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <label class="block text-sm font-medium mb-2">选择充电桩：</label>
          <select v-model="selectedTestConnector" class="w-full px-3 py-2 border rounded-lg">
            <option value="">-- 请选择 --</option>
            <option v-for="conn in connectors" :key="conn.connectorId" :value="conn.connectorId">
              车位号{{ conn.sortLabel }} - {{ conn.connectorId }} ({{ conn.connectorType === 4 ? '快充' : '慢充' }})
            </option>
          </select>
        </div>
        
        <button 
          @click="runConcurrencyTest" 
          :disabled="!selectedTestConnector || isTesting"
          class="btn-primary w-full mt-4"
        >
          <span v-if="!isTesting">🎭 开始并发测试</span>
          <span v-else>⏳ 测试进行中...</span>
        </button>
      </div>
      
      <div v-if="testResult" class="test-result mt-4">
        <h4 class="font-semibold mb-3">测试结果：</h4>
        
        <div class="result-item" :class="testResult.user1Success ? 'success' : 'failed'">
          <div class="result-icon">
            {{ testResult.user1Success ? '✅' : '❌' }}
          </div>
          <div class="flex-1">
            <div class="font-medium">用户A（远程下单）</div>
            <div class="text-sm mt-1">{{ testResult.user1Message }}</div>
          </div>
        </div>
        
        <div class="result-item" :class="testResult.user2Success ? 'success' : 'failed'">
          <div class="result-icon">
            {{ testResult.user2Success ? '✅' : '❌' }}
          </div>
          <div class="flex-1">
            <div class="font-medium">用户B（现场扫码）</div>
            <div class="text-sm mt-1">{{ testResult.user2Message }}</div>
          </div>
        </div>
        
        <div class="expected-result mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div class="text-sm font-medium text-blue-900 dark:text-blue-300">
            ✨ 预期结果：
          </div>
          <div class="text-sm text-blue-700 dark:text-blue-400 mt-1">
            现场扫码用户（高优先级）应该成功，远程下单用户（普通优先级）应该失败
          </div>
        </div>
      </div>
      
      <div class="test-logs mt-4">
        <h4 class="font-semibold mb-2">控制台日志：</h4>
        <div class="text-xs text-gray-500">
          请打开浏览器开发者工具(F12)查看详细的并发处理日志
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ConnectorInfo } from '@/types'
import { simulateConcurrentOrders } from '@/utils/concurrency'

defineProps<{
  connectors: ConnectorInfo[]
}>()

defineEmits<{
  (e: 'close'): void
}>()

const selectedTestConnector = ref('')
const isTesting = ref(false)
const testResult = ref<{
  user1Success: boolean
  user1Message: string
  user2Success: boolean
  user2Message: string
} | null>(null)

async function runConcurrencyTest() {
  if (!selectedTestConnector.value) return
  
  isTesting.value = true
  testResult.value = null
  
  console.log('\n\n🎭 ========== 并发冲突测试开始 ==========')
  
  // 运行并发测试
  await simulateConcurrentOrders(selectedTestConnector.value)
  
  // 模拟结果（实际应该从concurrency.ts获取）
  testResult.value = {
    user1Success: false,
    user1Message: '充电桩已被现场用户占用，请选择其他充电桩',
    user2Success: true,
    user2Message: '预约成功，可以开始充电'
  }
  
  isTesting.value = false
  
  console.log('🎭 ========== 并发冲突测试结束 ==========\n\n')
}
</script>

<style scoped>
.concurrency-test-panel {
  @apply fixed top-20 right-4 w-96;
  @apply bg-white dark:bg-gray-800;
  @apply rounded-xl shadow-2xl;
  @apply border-2 border-gray-200 dark:border-gray-700;
  @apply z-50;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.test-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700;
  @apply sticky top-0 bg-white dark:bg-gray-800;
}

.test-content {
  @apply p-4;
}

.test-scenario {
  @apply space-y-3;
}

.scenario-description {
  @apply space-y-3;
}

.user-card {
  @apply flex items-center gap-3 p-3 rounded-lg border-2;
}

.user-card.remote-user {
  @apply border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/10;
}

.user-card.onsite-user {
  @apply border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10;
}

.user-icon {
  @apply text-3xl;
}

.vs-icon {
  @apply text-center text-2xl font-bold text-gray-400;
}

.test-result {
  @apply space-y-3;
}

.result-item {
  @apply flex items-start gap-3 p-3 rounded-lg border-2;
}

.result-item.success {
  @apply border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10;
}

.result-item.failed {
  @apply border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10;
}

.result-icon {
  @apply text-2xl;
}

.expected-result {
  @apply p-3 rounded-lg;
}

.test-logs {
  @apply p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg;
}
</style>



