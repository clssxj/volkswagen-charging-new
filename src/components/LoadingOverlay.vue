<template>
  <div v-if="visible" class="loading-overlay">
    <!-- 背景遮罩 -->
    <div class="overlay-backdrop"></div>
    
    <!-- 加载内容 -->
    <div class="loading-content">
      <!-- 视频动画 -->
      <div class="video-container">
        <video
          ref="videoRef"
          class="loading-video"
          autoplay
          loop
          muted
          playsinline
        >
          <source src="/loading-animation.mp4" type="video/mp4">
        </video>
      </div>
      
      <!-- 加载文本 -->
      <div class="loading-text">
        <h3 class="loading-title">{{ title }}</h3>
        <p v-if="message" class="loading-message">{{ message }}</p>
        
        <!-- 加载进度点 -->
        <div class="loading-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  visible: boolean
  title?: string
  message?: string
}>()

const videoRef = ref<HTMLVideoElement>()

// 监听visible变化，控制视频播放
watch(() => props.visible, (newVal) => {
  if (newVal && videoRef.value) {
    videoRef.value.play().catch(() => {
      // 如果自动播放失败，忽略错误
      console.warn('视频自动播放失败')
    })
  } else if (!newVal && videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
  }
})

onMounted(() => {
  if (props.visible && videoRef.value) {
    videoRef.value.play().catch(() => {
      console.warn('视频自动播放失败')
    })
  }
})
</script>

<style scoped>
.loading-overlay {
  @apply fixed inset-0 flex items-center justify-center;
  z-index: 500;
  pointer-events: all;
}

.overlay-backdrop {
  @apply absolute inset-0 bg-black/60;
  backdrop-filter: blur(4px);
}

.loading-content {
  @apply relative z-10 flex flex-col items-center;
  animation: fadeIn 0.3s ease-out;
}

.video-container {
  @apply relative w-64 h-64 mb-6;
  @apply rounded-2xl overflow-hidden;
  @apply shadow-2xl;
}

.loading-video {
  @apply w-full h-full object-cover;
}

.loading-text {
  @apply text-center;
}

.loading-title {
  @apply text-2xl font-bold text-white mb-2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.loading-message {
  @apply text-base text-gray-200 mb-4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.loading-dots {
  @apply flex gap-2 justify-center;
}

.dot {
  @apply w-2 h-2 bg-white rounded-full;
  animation: dotPulse 1.4s ease-in-out infinite;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes dotPulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 移动端优化 */
@media (max-width: 640px) {
  .video-container {
    @apply w-48 h-48;
  }
  
  .loading-title {
    @apply text-xl;
  }
  
  .loading-message {
    @apply text-sm;
  }
}
</style>


