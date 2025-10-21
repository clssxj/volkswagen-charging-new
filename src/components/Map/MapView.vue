<template>
  <div class="map-container">
    <div ref="mapContainer" class="amap-container"></div>
    
    <!-- 加载提示 -->
    <div v-if="isInitializing" class="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-10">
      <div class="text-center">
        <div class="loading-spinner mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">正在加载地图...</p>
      </div>
    </div>
    
    <!-- 地图控件 -->
    <div class="absolute right-4 space-y-2 safe-area-top" style="top: 70px; z-index: 100;">
      <!-- 定位按钮 -->
      <button 
        @click="handleLocate" 
        :disabled="isLocating"
        class="map-control w-12 h-12 flex items-center justify-center"
        title="定位到当前位置"
      >
        <svg v-if="!isLocating" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <div v-else class="loading-spinner" style="width: 20px; height: 20px;"></div>
      </button>
      
      <!-- 主题切换 -->
      <button 
        @click="mapStore.toggleTheme()" 
        class="map-control w-12 h-12 flex items-center justify-center"
        title="切换主题"
      >
        <svg v-if="!mapStore.isDarkMode" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
      </button>
      
      <!-- 图层切换 -->
      <button 
        @click="toggleTraffic" 
        class="map-control w-12 h-12 flex items-center justify-center"
        :class="{ 'bg-primary-100': showTraffic }"
        title="路况图层"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
        </svg>
      </button>
    </div>
    
    <!-- 缩放控件 -->
    <div class="absolute right-4 space-y-1 safe-area-bottom" style="bottom: 140px; z-index: 100;">
      <button 
        @click="handleZoomIn" 
        class="map-control w-12 h-12 flex items-center justify-center text-xl font-bold"
        title="放大"
      >
        +
      </button>
      <button 
        @click="handleZoomOut" 
        class="map-control w-12 h-12 flex items-center justify-center text-xl font-bold"
        title="缩小"
      >
        −
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useMapStore } from '@/stores/map'
import { useStationStore } from '@/stores/station'
import { loadAMap, createMap, generateStationMarkerIcon, generateClusterMarkerIcon, calculateAvailableRatio, getCurrentPosition, getAccuratePosition } from '@/utils/map'
import type { StationListItem } from '@/types'

const emit = defineEmits<{
  (e: 'station-click', station: StationListItem): void
  (e: 'map-ready'): void
}>()

const mapStore = useMapStore()
const stationStore = useStationStore()

const mapContainer = ref<HTMLElement>()
const isInitializing = ref(true)
const isLocating = ref(false)
const showTraffic = ref(false)

let map: any = null
let markers: Map<string, any> = new Map()
let clusterMarkers: Map<string, any> = new Map()
let trafficLayer: any = null
let currentLocationMarker: any = null
let isSpiderfyActive = false // 标记是否正在Spiderfy状态
let lastGridSize: number = 0 // 记录上次的网格大小

// 自定义聚合配置
const CLUSTER_THRESHOLD = 20 // 超过20个点时聚合
const CLUSTER_ZOOM_THRESHOLD = 16 // 缩放级别大于16时不聚合
const SPIDERFY_THRESHOLD = 10 // 聚合点数量小于10时使用spiderfy展开

/**
 * 初始化地图
 */
async function initMap() {
  try {
    isInitializing.value = true
    
    // 加载高德地图
    const AMap = await loadAMap()
    
    // 创建地图实例
    map = createMap(mapContainer.value!, {
      mapStyle: mapStore.isDarkMode ? 'amap://styles/dark' : 'amap://styles/normal',
    })
    
    mapStore.setMapInstance(map)
    
    // 添加地图事件监听
    map.on('moveend', handleMapMoveEnd)
    map.on('zoomend', handleMapZoomEnd)
    
    // 尝试定位（粗略定位加快速度）
    handleInitialLocation()
    
    // 初始化路况图层
    trafficLayer = new AMap.TileLayer.Traffic({
      zIndex: 10,
    })
    trafficLayer.hide() // 初始隐藏
    map.add(trafficLayer)
    
    isInitializing.value = false
    emit('map-ready')
    
    // 延迟加载初始数据
    setTimeout(() => {
      // 初始化网格大小
      lastGridSize = getGridSizeByZoom(map.getZoom())
      updateMapBounds()
      updateVisibleStations()
    }, 500)
    
  } catch (error) {
    console.error('地图初始化失败:', error)
    isInitializing.value = false
  }
}

/**
 * 初始定位
 */
async function handleInitialLocation() {
  try {
    mapStore.setLocating(true)
    
    // 先快速粗略定位
    const position = await getCurrentPosition()
    const { latitude, longitude } = position.coords
    
    mapStore.setCurrentLocation({ lat: latitude, lng: longitude })
    
    // 设置地图中心并缩放到合适级别
    if (map) {
      map.setZoomAndCenter(14, [longitude, latitude], false)
      console.log(`✅ 定位成功，已放大到级别14: (${latitude}, ${longitude})`)
    }
    
    // 添加当前位置标记
    updateCurrentLocationMarker(latitude, longitude)
    
    // 后台进行精确定位
    getAccuratePosition().then(accuratePos => {
      const { latitude: lat, longitude: lng } = accuratePos.coords
      mapStore.setCurrentLocation({ lat, lng })
      updateCurrentLocationMarker(lat, lng)
      
      // 精确定位后微调中心点（不改变缩放级别）
      if (map) {
        map.setCenter([lng, lat])
        console.log(`✅ 精确定位完成: (${lat}, ${lng})`)
      }
    }).catch(err => {
      console.warn('精确定位失败:', err)
    })
    
  } catch (error: any) {
    console.warn('定位失败，使用默认位置（合肥）:', error)
    mapStore.setLocationError(error.message || '定位失败')
    
    // 定位失败，仍然设置默认缩放级别
    if (map) {
      map.setZoom(12)
    }
  } finally {
    mapStore.setLocating(false)
  }
}

/**
 * 更新当前位置标记
 */
function updateCurrentLocationMarker(lat: number, lng: number) {
  if (!map) return
  
  const AMap = (window as any).AMap
  
  if (currentLocationMarker) {
    currentLocationMarker.setPosition([lng, lat])
  } else {
    currentLocationMarker = new AMap.Marker({
      position: [lng, lat],
      icon: new AMap.Icon({
        size: new AMap.Size(40, 40),
        image: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#0ea5e9" opacity="0.2"/>
            <circle cx="20" cy="20" r="12" fill="#0ea5e9" opacity="0.4"/>
            <circle cx="20" cy="20" r="6" fill="#0ea5e9"/>
            <circle cx="20" cy="20" r="3" fill="white"/>
          </svg>
        `),
        imageSize: new AMap.Size(40, 40),
      }),
      offset: new AMap.Pixel(-20, -20),
      zIndex: 200,
    })
    map.add(currentLocationMarker)
  }
}

/**
 * 地图移动结束
 */
function handleMapMoveEnd() {
  // 如果正在Spiderfy状态，不要重新渲染
  if (isSpiderfyActive) {
    console.log('Spiderfy活动中，跳过重新渲染')
    return
  }
  
  updateMapBounds()
  updateVisibleStations()
}

/**
 * 地图缩放结束
 */
function handleMapZoomEnd() {
  const zoom = map.getZoom()
  mapStore.setMapZoom(zoom)
  
  // 如果正在Spiderfy状态，清除Spiderfy并重新聚合
  if (isSpiderfyActive) {
    console.log('缩放级别变化，退出Spiderfy模式')
    clearSpiderfy()
  }
  
  // 检查网格大小是否改变
  const newGridSize = getGridSizeByZoom(zoom)
  
  // 只有网格大小真正改变时才重新聚合
  if (newGridSize !== lastGridSize) {
    console.log(`网格大小变化: ${lastGridSize} → ${newGridSize}，重新聚合`)
    lastGridSize = newGridSize
    updateMapBounds()
    updateVisibleStations()
  } else {
    console.log(`网格大小未变化(${newGridSize})，保持当前聚合`)
    // 只更新边界，不重新聚合
    updateMapBounds()
  }
}

/**
 * 更新地图边界
 */
function updateMapBounds() {
  if (!map) return
  
  const bounds = map.getBounds()
  const ne = bounds.getNorthEast()
  const sw = bounds.getSouthWest()
  
  const mapBounds = {
    northeast: { lat: ne.lat, lng: ne.lng },
    southwest: { lat: sw.lat, lng: sw.lng },
  }
  
  mapStore.setMapBounds(mapBounds)
}

/**
 * 更新可见充电站
 */
async function updateVisibleStations() {
  await mapStore.updateVisibleStations()
  updateMarkers()
}

/**
 * 自定义区域聚合
 */
function clusterStationsByRegion(stations: StationListItem[], zoom: number) {
  // 如果缩放级别大于阈值或总数少于阈值，不聚合
  if (zoom >= CLUSTER_ZOOM_THRESHOLD || stations.length <= CLUSTER_THRESHOLD) {
    console.log(`不聚合: zoom=${zoom}, count=${stations.length}`)
    return { clusters: [], singles: stations }
  }
  
  // 根据缩放级别计算网格大小
  const gridSize = getGridSizeByZoom(zoom)
  
  // 使用网格聚合算法
  const grid: Map<string, StationListItem[]> = new Map()
  
  stations.forEach(station => {
    // 计算网格坐标
    const gridX = Math.floor(station.lng / gridSize)
    const gridY = Math.floor(station.lat / gridSize)
    const gridKey = `${gridX},${gridY}`
    
    if (!grid.has(gridKey)) {
      grid.set(gridKey, [])
    }
    grid.get(gridKey)!.push(station)
  })
  
  // 分离聚合点和单个点
  const clusters: Array<{ stations: StationListItem[], center: { lat: number, lng: number } }> = []
  const singles: StationListItem[] = []
  
  grid.forEach((stationGroup, key) => {
    if (stationGroup.length >= 2) {
      // 计算聚合中心点（平均位置）
      const centerLat = stationGroup.reduce((sum, s) => sum + s.lat, 0) / stationGroup.length
      const centerLng = stationGroup.reduce((sum, s) => sum + s.lng, 0) / stationGroup.length
      
      clusters.push({
        stations: stationGroup,
        center: { lat: centerLat, lng: centerLng }
      })
    } else {
      singles.push(...stationGroup)
    }
  })
  
  console.log(`🔍 聚合结果: ${clusters.length}个聚合点(共${clusters.reduce((sum, c) => sum + c.stations.length, 0)}个站点), ${singles.length}个单点`)
  
  return { clusters, singles }
}

/**
 * 根据缩放级别获取网格大小
 * 注意：多个缩放级别共用同一网格，最大化稳定性
 */
function getGridSizeByZoom(zoom: number): number {
  // 实现国家→省→市→区→街道的多层次聚合
  // 相邻2-3个缩放级别共用同一网格大小，避免缩放时聚合跳变
  
  if (zoom >= 16) return 0.0035   // 约350m - zoom 16-18 (不聚合)
  if (zoom >= 14) return 0.01   // 约1km - zoom 14-15 (精细级)
  if (zoom >= 13) return 0.02    // 约2km - zoom 13 (街道级)
  if (zoom >= 12) return 0.05    // 约5km - zoom 12 (区域级)
  if (zoom >= 11) return 0.12    // 约12km - zoom 11 (市区级)
  if (zoom >= 10) return 0.3     // 约30km - zoom 10 (城市级)
  if (zoom >= 9) return 0.6      // 约60km - zoom 9 (城市群)
  if (zoom >= 8) return 1.0      // 约100km - zoom 8 (省级)
  if (zoom >= 7) return 1.8      // 约200km - zoom 7 (大省级)
  if (zoom >= 6) return 3.0      // 约330km - zoom 6 (多省级)
  if (zoom >= 5) return 5.0      // 约550km - zoom 5 (大区级)
  return 8.0                      // 约900km - zoom 3-4 (国家级)
}

/**
 * 平滑缩放到指定位置
 */
function smoothZoomToCenter(zoom: number, lng: number, lat: number) {
  if (!map) return
  
  const currentZoom = map.getZoom()
  const zoomDiff = zoom - currentZoom
  
  if (zoomDiff === 0) {
    // 只需移动中心
    map.panTo([lng, lat], 300)
    return
  }
  
  // 使用缓动函数实现平滑缩放
  const duration = 500 // 总持续时间
  const steps = Math.abs(zoomDiff) * 15 // 每级15帧
  const startTime = Date.now()
  const startZoom = currentZoom
  const startCenter = map.getCenter()
  
  function easeInOutQuad(t: number) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }
  
  function animate() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeInOutQuad(progress)
    
    // 计算当前缩放和位置
    const currentZ = startZoom + zoomDiff * eased
    const currentLng = startCenter.lng + (lng - startCenter.lng) * eased
    const currentLat = startCenter.lat + (lat - startCenter.lat) * eased
    
    map.setZoomAndCenter(currentZ, [currentLng, currentLat], false)
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  requestAnimationFrame(animate)
}

/**
 * 清除Spiderfy状态
 */
function clearSpiderfy() {
  // 清除spider标记和连接线
  markers.forEach((marker, key) => {
    if (key.startsWith('spider-')) {
      try {
        map.remove(marker)
      } catch (e) {
        // 忽略
      }
      markers.delete(key)
    }
  })
  
  isSpiderfyActive = false
  console.log('Spiderfy状态已清除')
}

/**
 * Spiderfy展开效果 - 蜘蛛网状展开聚合点
 */
function spiderfyCluster(cluster: { stations: StationListItem[], center: { lat: number, lng: number } }, AMap: any) {
  const { stations } = cluster
  const count = stations.length
  
  console.log(`开始Spiderfy展开 ${count} 个充电站`)
  
  // 设置Spiderfy活动标志
  isSpiderfyActive = true
  
  // 1. 计算聚合内所有点的真实中心点
  const realCenter = {
    lat: stations.reduce((sum, s) => sum + s.lat, 0) / count,
    lng: stations.reduce((sum, s) => sum + s.lng, 0) / count
  }
  
  // 2. 计算到最远点的距离
  let maxDistance = 0
  stations.forEach(station => {
    const distance = Math.sqrt(
      Math.pow(station.lat - realCenter.lat, 2) + 
      Math.pow(station.lng - realCenter.lng, 2)
    )
    maxDistance = Math.max(maxDistance, distance)
  })
  
  // 3. 设置展开半径：更紧凑，基于实际距离
  // 如果聚合内的点本身就很分散，使用较小的倍数
  // 如果聚合内的点很密集，需要稍大的半径避免重叠
  const baseRadius = Math.max(maxDistance * 1.2, 0.0003) // 最小30米
  const radius = baseRadius + (count > 6 ? 0.0001 : 0) // 超过6个点时略增加
  
  console.log(`中心点: (${realCenter.lat.toFixed(6)}, ${realCenter.lng.toFixed(6)})`)
  console.log(`展开半径: ${(radius * 111).toFixed(0)}米`)
  
  // 4. 清除之前可能存在的spiderfy标记
  clearSpiderfy()
  isSpiderfyActive = true // 重新设置活动标志
  
  // 5. 直接在原位置显示充电站，不移动位置
  // 只添加连接线和中心点作为视觉提示
  
  // 先添加充电站标记（在原位置）
  stations.forEach((station, index) => {
    const ratio = calculateAvailableRatio(station)
    const available = station.quickAvailableNum + station.slowAvailableNum
    const total = station.quickChargeNum + station.slowChargeNum
    const icon = generateStationMarkerIcon(
      ratio, 
      station.totalCostPrice, 
      available,
      total,
      mapStore.isDarkMode
    )
    
    // 延迟添加，创建依次出现效果
    setTimeout(() => {
      const marker = new AMap.Marker({
        position: [station.lng, station.lat], // 使用原位置
        icon: new AMap.Icon({
          size: new AMap.Size(90, 100),
          image: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(icon),
          imageSize: new AMap.Size(90, 100),
        }),
        offset: new AMap.Pixel(-45, -70),
        extData: station,
        zIndex: 200,
        clickable: true,
        animation: 'AMAP_ANIMATION_DROP', // 掉落动画
      })
      
      // 点击事件
      marker.on('click', () => {
        handleMarkerClick(station)
      })
      
      map.add(marker)
      markers.set(`spider-marker-${station.stationId}`, marker)
    }, index * 40) // 每个延迟40ms
  })
  
  // 再添加连接线（从中心点到每个充电站）
  setTimeout(() => {
    stations.forEach((station, index) => {
      setTimeout(() => {
        const line = new AMap.Polyline({
          path: [
            [realCenter.lng, realCenter.lat],
            [station.lng, station.lat] // 连接到原位置
          ],
          strokeColor: mapStore.isDarkMode ? '#6b7280' : '#d1d5db',
          strokeWeight: 2,
          strokeOpacity: 0,
          zIndex: 50,
        })
        map.add(line)
        
        // 线条淡入动画
        let opacity = 0
        const lineInterval = setInterval(() => {
          opacity += 0.15
          if (opacity >= 0.7) {
            opacity = 0.7
            clearInterval(lineInterval)
          }
          line.setOptions({ strokeOpacity: opacity })
        }, 30)
        
        markers.set(`spider-line-${index}`, line)
      }, index * 25)
    })
  }, 100)
  
  // 6. 在中心点添加一个标记，标识聚合中心
  setTimeout(() => {
    const centerMarker = new AMap.CircleMarker({
      center: [realCenter.lng, realCenter.lat],
      radius: 8,
      strokeColor: mapStore.isDarkMode ? '#0ea5e9' : '#0ea5e9',
      strokeWeight: 3,
      fillColor: mapStore.isDarkMode ? '#1f2937' : '#ffffff',
      fillOpacity: 1,
      zIndex: 60,
    })
    map.add(centerMarker)
    markers.set('spider-center', centerMarker)
    
    // 添加脉冲动画效果
    const pulseCircle = new AMap.Circle({
      center: [realCenter.lng, realCenter.lat],
      radius: 50, // 50米
      strokeColor: '#0ea5e9',
      strokeWeight: 2,
      strokeOpacity: 0.5,
      fillColor: '#0ea5e9',
      fillOpacity: 0.1,
      zIndex: 55,
    })
    map.add(pulseCircle)
    markers.set('spider-pulse', pulseCircle)
  }, 50)
  
  // 7. 移除原聚合点（只移除当前被点击的聚合）
  clusterMarkers.forEach((marker, key) => {
    const extData = marker.getExtData()
    if (extData && extData.type === 'cluster' && 
        Math.abs(extData.center.lat - realCenter.lat) < 0.0001 &&
        Math.abs(extData.center.lng - realCenter.lng) < 0.0001) {
      map.remove(marker)
      clusterMarkers.delete(key)
      console.log(`移除被展开的聚合点`)
    }
  })
  
  // 8. 智能调整视野：包含所有站点，同时保留周围环境
  // 计算所有充电站原始位置的边界
  const minLat = Math.min(...stations.map(s => s.lat))
  const maxLat = Math.max(...stations.map(s => s.lat))
  const minLng = Math.min(...stations.map(s => s.lng))
  const maxLng = Math.max(...stations.map(s => s.lng))
  
  // 添加50%的边距，确保能看到周围的聚合点
  const latPadding = Math.max((maxLat - minLat) * 0.5, 0.002) // 至少200米边距
  const lngPadding = Math.max((maxLng - minLng) * 0.5, 0.002)
  
  const targetBounds = new AMap.Bounds(
    new AMap.LngLat(minLng - lngPadding, minLat - latPadding),
    new AMap.LngLat(maxLng + lngPadding, maxLat + latPadding)
  )
  
  // 立即调整视野（不等待）
  // 临时移除moveend监听，避免触发重新渲染
  map.off('moveend', handleMapMoveEnd)
  map.setBounds(targetBounds, false, [80, 80, 80, 80])
  
  // 延迟恢复moveend监听
  setTimeout(() => {
    map.on('moveend', handleMapMoveEnd)
  }, 400)
  
  // 4秒后自动清除连接线和中心点，保留充电站标记
  setTimeout(() => {
    // 清除连接线和中心点
    markers.forEach((marker, key) => {
      if (key.startsWith('spider-line-') || key === 'spider-center' || key === 'spider-pulse') {
        try {
          map.remove(marker)
          markers.delete(key)
        } catch (e) {
          // 忽略
        }
      }
    })
    
    // 但保持isSpiderfyActive为true，避免moveend事件触发重新渲染
    // 用户可以通过缩放或拖动来退出Spiderfy模式
    console.log('✅ 连接线和中心点已自动隐藏')
  }, 4000)
  
  console.log(`✅ Spiderfy展开完成: ${count}个充电站在原位置显示，4秒后连接线自动消失`)
}

/**
 * 更新标记
 */
function updateMarkers() {
  if (!map) {
    console.warn('地图未初始化')
    return
  }
  
  const AMap = (window as any).AMap
  const stations = mapStore.visibleStations
  const currentZoom = map.getZoom()
  
  console.log(`开始渲染 ${stations.length} 个充电站，缩放级别: ${currentZoom}`)
  
  // 如果正在Spiderfy状态，先清除
  if (isSpiderfyActive) {
    clearSpiderfy()
  }
  
  // 清除旧标记（但不包括正在spiderfy的标记）
  markers.forEach((marker, key) => {
    if (!key.startsWith('spider-')) {
      try {
        map.remove(marker)
      } catch (e) {
        // 忽略已移除的标记
      }
    }
  })
  
  // 只清除非spider标记
  const keysToDelete: string[] = []
  markers.forEach((marker, key) => {
    if (!key.startsWith('spider-')) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach(key => markers.delete(key))
  
  clusterMarkers.forEach(marker => {
    try {
      map.remove(marker)
    } catch (e) {
      // 忽略已移除的标记
    }
  })
  clusterMarkers.clear()
  
  if (stations.length === 0) {
    console.warn('⚠️ 没有充电站需要渲染')
    return
  }
  
  // 执行自定义聚合
  const { clusters, singles } = clusterStationsByRegion(stations, currentZoom)
  
  // 渲染聚合标记
  console.log(`准备渲染 ${clusters.length} 个聚合点`)
  
  clusters.forEach((cluster, index) => {
    const count = cluster.stations.length
    const icon = generateClusterMarkerIcon(count, mapStore.isDarkMode)
    
    console.log(`聚合点${index + 1}: 位置(${cluster.center.lat.toFixed(4)}, ${cluster.center.lng.toFixed(4)}), 包含${count}个站点`)
    
    const clusterMarker = new AMap.Marker({
      position: [cluster.center.lng, cluster.center.lat],
      icon: new AMap.Icon({
        size: new AMap.Size(70, 70),
        image: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(icon),
        imageSize: new AMap.Size(70, 70),
      }),
      offset: new AMap.Pixel(-35, -35),
      zIndex: 150,
      clickable: true,
      cursor: 'pointer',
      extData: { type: 'cluster', stations: cluster.stations, center: cluster.center }
    })
    
    // 聚合点击事件 - 根据数量决定行为
    clusterMarker.on('click', (e: any) => {
      try {
        console.log(`🔵 聚合点被点击: 包含${count}个充电站，位置(${cluster.center.lat}, ${cluster.center.lng})`)
        
        if (count <= SPIDERFY_THRESHOLD) {
          // 数量较少，使用spiderfy展开
          console.log(`→ 使用Spiderfy展开 ${count} 个充电站`)
          spiderfyCluster(cluster, AMap)
        } else {
          // 数量较多，温和放大地图（只放大1级）
          const newZoom = Math.min(currentZoom + 1, 17)
          console.log(`→ 聚合点数量较多(${count}个)，平滑放大到级别 ${newZoom}`)
          
          // 使用平滑过渡动画
          smoothZoomToCenter(newZoom, cluster.center.lng, cluster.center.lat)
        }
        
        // 阻止事件冒泡到地图
        if (e && e.stopPropagation) {
          e.stopPropagation()
        }
      } catch (error) {
        console.error('聚合点点击处理失败:', error)
      }
    })
    
    // 确保聚合点添加到地图
    try {
      map.add(clusterMarker)
      clusterMarkers.set(`cluster-${index}`, clusterMarker)
      console.log(`✅ 聚合点${index + 1}已添加到地图`)
    } catch (error) {
      console.error(`❌ 聚合点${index + 1}添加失败:`, error)
    }
  })
  
  console.log(`✅ 所有聚合点渲染完成，共${clusters.length}个`)
  
  // 渲染单个充电站标记
  singles.forEach(station => {
    const ratio = calculateAvailableRatio(station)
    const available = station.quickAvailableNum + station.slowAvailableNum
    const total = station.quickChargeNum + station.slowChargeNum
    const icon = generateStationMarkerIcon(
      ratio, 
      station.totalCostPrice, 
      available,
      total,
      mapStore.isDarkMode
    )
    
    const marker = new AMap.Marker({
      position: [station.lng, station.lat],
      icon: new AMap.Icon({
        size: new AMap.Size(90, 100),
        image: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(icon),
        imageSize: new AMap.Size(90, 100),
      }),
      offset: new AMap.Pixel(-45, -70),
      extData: station,
      zIndex: 100,
      clickable: true,
    })
    
    // 点击事件
    marker.on('click', () => {
      handleMarkerClick(station)
    })
    
    map.add(marker)
    markers.set(station.stationId, marker)
  })
  
  console.log(`✅ 渲染完成: ${clusters.length}个聚合点 + ${singles.length}个单点`)
}

/**
 * 标记点击事件
 */
function handleMarkerClick(station: StationListItem) {
  mapStore.selectStation(station)
  emit('station-click', station)
}

/**
 * 定位按钮点击
 */
async function handleLocate() {
  if (isLocating.value) return
  
  try {
    isLocating.value = true
    mapStore.setLocating(true)
    
    const position = await getCurrentPosition()
    const { latitude, longitude } = position.coords
    
    mapStore.setCurrentLocation({ lat: latitude, lng: longitude })
    mapStore.flyTo({ lat: latitude, lng: longitude }, 15)
    
    updateCurrentLocationMarker(latitude, longitude)
    
    // 后台精确定位
    getAccuratePosition().then(accuratePos => {
      const { latitude: lat, longitude: lng } = accuratePos.coords
      mapStore.setCurrentLocation({ lat, lng })
      updateCurrentLocationMarker(lat, lng)
    }).catch(() => {})
    
  } catch (error: any) {
    console.error('定位失败:', error)
    alert('定位失败，请确保已授予位置权限')
  } finally {
    isLocating.value = false
    mapStore.setLocating(false)
  }
}

/**
 * 放大
 */
function handleZoomIn() {
  if (map) {
    map.zoomIn()
  }
}

/**
 * 缩小
 */
function handleZoomOut() {
  if (map) {
    map.zoomOut()
  }
}

/**
 * 切换路况
 */
function toggleTraffic() {
  showTraffic.value = !showTraffic.value
  if (trafficLayer) {
    if (showTraffic.value) {
      trafficLayer.show()
      console.log('✅ 路况图层已显示')
    } else {
      trafficLayer.hide()
      console.log('✅ 路况图层已隐藏')
    }
  }
}

// 路线规划相关
let driving: any = null
let routePolyline: any = null

/**
 * 绘制导航路线
 */
async function drawRoute(destination: { lat: number; lng: number }): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!map) {
      reject(new Error('地图未初始化'))
      return
    }
    
    const currentLocation = mapStore.currentLocation
    if (!currentLocation) {
      reject(new Error('当前位置未获取'))
      return
    }
    
    // 清除之前的路线
    clearRoute()
    
    // 动态加载AMap对象
    const AMap = (window as any).AMap
    if (!AMap) {
      reject(new Error('高德地图API未加载'))
      return
    }
    
    // 创建驾车路线规划
    driving = new AMap.Driving({
      map: map,
      policy: AMap.DrivingPolicy.LEAST_TIME, // 最快捷模式
    })
    
    // 规划路线
    driving.search(
      [currentLocation.lng, currentLocation.lat],
      [destination.lng, destination.lat],
      (status: string, result: any) => {
        if (status === 'complete') {
          console.log('✅ 路线规划成功', result)
          
          // 获取第一条路线
          const route = result.routes[0]
          
          // 提取路线信息
          const routeInfo = {
            distance: route.distance, // 距离（米）
            duration: route.time, // 时间（秒）
            trafficLights: route.lights || 0, // 红绿灯数量
            routeName: route.policy || '', // 路线策略
          }
          
          // 自动调整视野以显示整条路线
          const bounds = route.bounds
          if (bounds) {
            map.setBounds(bounds, false, [60, 60, 60, 60])
          }
          
          resolve(routeInfo)
        } else {
          console.error('❌ 路线规划失败', result)
          reject(new Error('路线规划失败'))
        }
      }
    )
  })
}

/**
 * 清除路线
 */
function clearRoute() {
  if (driving) {
    driving.clear()
    driving = null
  }
  if (routePolyline) {
    map?.remove(routePolyline)
    routePolyline = null
  }
}

// 暴露方法给父组件
defineExpose({
  drawRoute,
  clearRoute,
})

// 监听主题变化，更新标记
watch(() => mapStore.isDarkMode, () => {
  if (mapStore.visibleStations.length > 0) {
    console.log('主题切换，重新渲染标记')
    updateMarkers()
  }
})

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  // 清理路线
  clearRoute()
  
  if (map) {
    map.destroy()
  }
})
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.amap-container {
  position: relative;
  z-index: 1;
  cursor: grab;
}

.amap-container:active {
  cursor: grabbing;
}
</style>

