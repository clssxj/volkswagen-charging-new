import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'

// 创建应用实例
const app = createApp(App)

// 使用 Pinia
const pinia = createPinia()
app.use(pinia)

// 挂载应用
app.mount('#app')

// 注册 Service Worker（PWA）
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker 注册成功:', registration)
      })
      .catch(error => {
        console.log('Service Worker 注册失败:', error)
      })
  })
}

// 性能监控
if (import.meta.env.DEV) {
  // 首屏加载时间
  window.addEventListener('load', () => {
    const perfData = performance.timing
    const loadTime = perfData.loadEventEnd - perfData.navigationStart
    console.log(`页面加载时间: ${loadTime}ms`)
    
    // 首屏渲染时间
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]
    if (fcp) {
      console.log(`首屏渲染时间: ${fcp.startTime}ms`)
    }
  })
}

// 错误捕获
app.config.errorHandler = (err, instance, info) => {
  console.error('应用错误:', err, info)
  
  // 可以上报到监控服务
  // reportError(err, info)
}

// 全局属性（可选）
app.config.globalProperties.$toast = (message: string) => {
  console.log('Toast:', message)
}

console.log('新能源汽车充电地图应用已启动 🚗⚡')











