<template>
  <!-- 布局参考线（仅开发环境显示） -->
  <div v-if="showGuide" class="layout-guide">
    <!-- 顶部安全区域 -->
    <div class="guide-line top-safe">
      <span class="guide-label">搜索栏区域 (60px)</span>
    </div>
    
    <!-- 右侧地图控件区域 -->
    <div class="guide-area controls-area">
      <span class="guide-label">地图控件区域</span>
    </div>
    
    <!-- 右下缩放控件区域 -->
    <div class="guide-area zoom-area">
      <span class="guide-label">缩放控件</span>
    </div>
    
    <!-- 右下浮动按钮区域 -->
    <div class="guide-area floating-area">
      <span class="guide-label">浮动按钮</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showGuide = ref(import.meta.env.DEV)
</script>

<style scoped>
.layout-guide {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
}

.guide-line {
  position: absolute;
  left: 0;
  right: 0;
  border: 2px dashed rgba(255, 0, 0, 0.3);
  background: rgba(255, 0, 0, 0.05);
}

.top-safe {
  top: 0;
  height: 60px;
}

.guide-area {
  position: absolute;
  border: 2px dashed rgba(0, 255, 0, 0.3);
  background: rgba(0, 255, 0, 0.05);
}

.controls-area {
  top: 70px;
  right: 16px;
  width: 56px;
  height: 180px;
}

.zoom-area {
  bottom: 140px;
  right: 16px;
  width: 56px;
  height: 110px;
}

.floating-area {
  bottom: 16px;
  right: 16px;
  width: 56px;
  height: 130px;
}

.guide-label {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 10px;
  color: rgba(0, 0, 0, 0.5);
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 4px;
  border-radius: 2px;
}
</style>



