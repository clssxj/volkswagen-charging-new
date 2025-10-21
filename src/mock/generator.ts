/**
 * 充电站静态数据生成器
 */

import type { StationListItem, StationDetail, ConnectorInfo, PeriodPrice, ConnectorStatus } from '@/types'
import { StationStatus, ConnectorStatus as CS } from '@/types'

// 安徽省主要城市及其中心坐标
export const ANHUI_CITIES = [
  { name: '合肥市', lat: 31.8206, lng: 117.2272, count: 150 },
  { name: '芜湖市', lat: 31.3526, lng: 118.3769, count: 120 },
  { name: '蚌埠市', lat: 32.9164, lng: 117.3889, count: 100 },
  { name: '淮南市', lat: 32.6255, lng: 117.0181, count: 90 },
  { name: '马鞍山市', lat: 31.6707, lng: 118.5078, count: 90 },
  { name: '淮北市', lat: 33.9600, lng: 116.7983, count: 80 },
  { name: '铜陵市', lat: 30.9450, lng: 117.8120, count: 80 },
  { name: '安庆市', lat: 30.5086, lng: 117.0531, count: 110 },
  { name: '黄山市', lat: 29.7146, lng: 118.3378, count: 90 },
  { name: '滁州市', lat: 32.2557, lng: 118.3164, count: 100 },
  { name: '阜阳市', lat: 32.8986, lng: 115.8142, count: 120 },
  { name: '宿州市', lat: 33.6367, lng: 116.9641, count: 100 },
  { name: '六安市', lat: 31.7339, lng: 116.5078, count: 110 },
  { name: '亳州市', lat: 33.8712, lng: 115.7786, count: 100 },
  { name: '池州市', lat: 30.6643, lng: 117.4910, count: 80 },
  { name: '宣城市', lat: 30.9406, lng: 118.7593, count: 80 },
]

// 品牌名称（基于真实数据）
const BRAND_NAMES = [
  '国家电网', '特来电', '星星充电', '依威', '云快充',
  '小桔充电', '快电', '安悦充电', '万马爱充', '普天新能源',
  '飞凡充电', 'BMVIRTUAL', '蔚来充电'
]

// 地址后缀
const ADDRESS_SUFFIXES = [
  '地下停车场', '地面停车场', '商业广场停车场', '购物中心停车场',
  '写字楼停车场', '住宅小区停车场', '公共停车场', '路边停车位',
  '充电站', '服务区', '加油站', '汽车城'
]

// 街道名称
const STREET_NAMES = [
  '人民路', '解放路', '建设路', '中山路', '长江路', '黄河路',
  '淮河路', '胜利路', '和平路', '光明路', '新华路', '文化路',
  '育才路', '前进路', '工业路', '商业街', '科技路', '创新大道'
]

// 停车费描述（基于真实数据）
const PARK_FEES = [
  '全天开放，免费停车',
  '充电期间免费停车',
  '前2小时免费，超出按2元/小时收费',
  '按实际停车收费，约3-5元/小时',
  '全天开放',
  '限时免费停车，每天第一次前2小时免停',
  '限时免费停车，每天第一次前2小时免停；超出时间参考价格：8元/小时（以实际收取为准）',
]

// 营业时间
const OPEN_TIMES = [
  '00:00-24:00',
  '06:00-22:00',
  '07:00-23:00',
  '24小时营业',
]

// 生成随机整数
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 生成随机浮点数
function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

// 生成随机元素
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// 在给定中心点附近生成随机坐标
function generateNearbyCoordinate(centerLat: number, centerLng: number, radiusKm: number = 20) {
  // 1度经纬度约等于111km
  const radiusDegree = radiusKm / 111
  const angle = Math.random() * 2 * Math.PI
  const distance = Math.random() * radiusDegree
  
  return {
    lat: parseFloat((centerLat + distance * Math.cos(angle)).toFixed(6)),
    lng: parseFloat((centerLng + distance * Math.sin(angle)).toFixed(6))
  }
}

// 生成充电站ID
function generateStationId(index: number): string {
  const prefix = randomItem(['AH', 'HF', 'WH', 'BB', 'HN', 'MA'])
  return `${prefix}-${String(index).padStart(4, '0')}`
}

// 生成充电桩状态分布（确保有合理的可用数量）
function generateConnectorCounts(total: number) {
  // 快充和慢充的比例随机
  const quickRatio = Math.random() > 0.5 ? 0.6 : 0.4
  const quickTotal = Math.max(0, Math.floor(total * quickRatio))
  const slowTotal = total - quickTotal
  
  // 可用数量占总数的50%-100%
  const quickAvailable = Math.floor(quickTotal * randomFloat(0.5, 1.0))
  const slowAvailable = Math.floor(slowTotal * randomFloat(0.5, 1.0))
  
  return {
    quickChargeNum: quickTotal,
    quickAvailableNum: quickAvailable,
    slowChargeNum: slowTotal,
    slowAvailableNum: slowAvailable,
  }
}

// 生成时段价格（根据峰谷平时段）
export function generatePeriodPrices(): PeriodPrice[] {
  // 基础电费（谷0.3-0.5，平0.6-0.8，峰0.9-1.3）
  const valleyEleFee = randomFloat(0.30, 0.50)
  const normalEleFee = randomFloat(0.60, 0.80)
  const peakEleFee = randomFloat(0.90, 1.30)
  
  // 服务费相对固定
  const serviceFee = randomFloat(0.25, 0.50)
  
  return [
    {
      startTime: '00:00',
      endTime: '06:00',
      eleFee: valleyEleFee.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      totalFee: (valleyEleFee + serviceFee).toFixed(2),
    },
    {
      startTime: '06:00',
      endTime: '08:00',
      eleFee: normalEleFee.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      totalFee: (normalEleFee + serviceFee).toFixed(2),
    },
    {
      startTime: '08:00',
      endTime: '12:00',
      eleFee: peakEleFee.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      totalFee: (peakEleFee + serviceFee).toFixed(2),
    },
    {
      startTime: '12:00',
      endTime: '14:00',
      eleFee: normalEleFee.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      totalFee: (normalEleFee + serviceFee).toFixed(2),
    },
    {
      startTime: '14:00',
      endTime: '18:00',
      eleFee: peakEleFee.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      totalFee: (peakEleFee + serviceFee).toFixed(2),
    },
    {
      startTime: '18:00',
      endTime: '21:00',
      eleFee: (peakEleFee + 0.2).toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      totalFee: (peakEleFee + 0.2 + serviceFee).toFixed(2),
    },
    {
      startTime: '21:00',
      endTime: '24:00',
      eleFee: normalEleFee.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      totalFee: (normalEleFee + serviceFee).toFixed(2),
    },
  ]
}

// 根据当前时间获取当前时段价格
export function getCurrentPeriodPrice(prices: PeriodPrice[]): number {
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  
  for (const price of prices) {
    if (currentTime >= price.startTime && currentTime < price.endTime) {
      return parseFloat(price.totalFee)
    }
  }
  
  return parseFloat(prices[0].totalFee)
}

// 生成充电桩列表
function generateConnectors(count: number, type: 'fast' | 'slow', stationId: string): ConnectorInfo[] {
  const connectors: ConnectorInfo[] = []
  const power = type === 'fast' ? randomInt(60, 120) : randomInt(7, 40)
  
  for (let i = 0; i < count; i++) {
    const status = Math.random()
    let connectorStatus: ConnectorStatus
    
    if (status < 0.6) {
      connectorStatus = CS.AVAILABLE
    } else if (status < 0.85) {
      connectorStatus = CS.CHARGING
    } else if (status < 0.95) {
      connectorStatus = CS.OCCUPIED
    } else {
      connectorStatus = CS.OFFLINE
    }
    
    connectors.push({
      connectorId: `${stationId}-${type === 'fast' ? 'Q' : 'S'}-${String(i + 1).padStart(2, '0')}`,
      connectorName: `${i + 1}号${type === 'fast' ? '快充' : '慢充'}桩`,
      connectorType: type === 'fast' ? 4 : 1,
      status: connectorStatus,
      power: power,
      lockFlag: 0,
      sortLabel: i + 1,
    })
  }
  
  return connectors
}

// 生成充电桩列表（根据指定的可用数量）
function generateConnectorsWithAvailability(
  total: number, 
  availableCount: number,
  type: 'fast' | 'slow', 
  stationId: string
): ConnectorInfo[] {
  const connectors: ConnectorInfo[] = []
  const power = type === 'fast' ? randomInt(60, 120) : randomInt(7, 40)
  
  // 先生成可用的充电桩
  for (let i = 0; i < availableCount; i++) {
    connectors.push({
      connectorId: `${stationId}-${type === 'fast' ? 'Q' : 'S'}-${String(i + 1).padStart(2, '0')}`,
      connectorName: `${i + 1}号${type === 'fast' ? '快充' : '慢充'}桩`,
      connectorType: type === 'fast' ? 4 : 1,
      status: CS.AVAILABLE,
      power: power,
      lockFlag: 0,
      sortLabel: i + 1,
    })
  }
  
  // 再生成占用/充电中的充电桩
  for (let i = availableCount; i < total; i++) {
    const status = Math.random()
    let connectorStatus: ConnectorStatus
    
    if (status < 0.7) {
      connectorStatus = CS.CHARGING
    } else if (status < 0.95) {
      connectorStatus = CS.OCCUPIED
    } else {
      connectorStatus = CS.OFFLINE
    }
    
    connectors.push({
      connectorId: `${stationId}-${type === 'fast' ? 'Q' : 'S'}-${String(i + 1).padStart(2, '0')}`,
      connectorName: `${i + 1}号${type === 'fast' ? '快充' : '慢充'}桩`,
      connectorType: type === 'fast' ? 4 : 1,
      status: connectorStatus,
      power: power,
      lockFlag: 0,
      sortLabel: i + 1,
    })
  }
  
  return connectors
}

// 生成充电站列表项
function generateStationListItem(index: number, cityName: string, lat: number, lng: number): StationListItem {
  const stationId = generateStationId(index)
  const brandName = randomItem(BRAND_NAMES)
  const streetName = randomItem(STREET_NAMES)
  const addressSuffix = randomItem(ADDRESS_SUFFIXES)
  const roadNumber = randomInt(1, 999)
  
  const totalConnectors = randomInt(4, 20)
  const connectorCounts = generateConnectorCounts(totalConnectors)
  
  const periodPrices = generatePeriodPrices()
  const currentPrice = getCurrentPeriodPrice(periodPrices)
  
  return {
    stationId,
    stationName: `${cityName}${streetName}${randomInt(1, 100)}号${addressSuffix}`,
    address: `安徽省${cityName}${streetName}${roadNumber}号${addressSuffix}`,
    lat,
    lng,
    brandName,
    brandType: randomInt(1, 3),
    operatorId: `OP${randomInt(100000, 999999)}`,
    electricityPrice: randomFloat(0.6, 1.2),
    servicePrice: randomFloat(0.25, 0.50),
    totalCostPrice: currentPrice,
    ...connectorCounts,
    openStatus: 1,
    openTime: randomItem(OPEN_TIMES),
    parkFee: randomItem(PARK_FEES),
    parkCost: randomInt(0, 5),
    stationStatus: Math.random() > 0.95 ? StationStatus.MAINTENANCE : StationStatus.NORMAL,
    stationLevel: randomInt(0, 3),
    stationGradeScore: randomFloat(3.5, 5.0, 1),
    stationCategory: [randomInt(1, 100)],
    stationTel: Math.random() > 0.3 ? `138${randomInt(10000000, 99999999)}` : undefined,
  }
}

// 真实充电站照片（来自后端样例）
const REAL_PICTURES = [
  'https://resource.teld.cn/teldimage/134/9ddad89384494b93abec6dd72d301d7e.jpg',
  'https://resource.teld.cn/teldimage/134/886573f480124952949575a120481c7a.jpg',
  'https://resource.teld.cn/teldimage/134/57cf9722387a4da99936568c72586a8a.jpg',
  'https://resource.teld.cn/teldimage/134/87271b222f52470db39b540f41e47747.jpg',
  'https://resource.teld.cn/teldimage/134/68d182d6c5104029a720b56d5d9cd493.jpg',
  'https://resource.teld.cn/teldimage/134/dda176aef5da41b9807e9f4e5b1ea501.jpg',
  'https://resource.teld.cn/teldimage/115/405c08c2464f47cc80009c0d76336169.jpg',
  'https://resource.teld.cn/teldimage/134/011fa971bb95477fa43f4fcd0a94ed09.jpg',
  'https://resource.teld.cn/teldimage/134/32dc24a44aa5458da487e1b18e2a0b35.jpg'
]

// 备用图片（Unsplash）
const FALLBACK_PICTURES = [
  'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400',
  'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=400',
  'https://images.unsplash.com/photo-1593941707445-f985b8891f8c?w=400',
]

// 生成充电站详情
export function generateStationDetail(station: StationListItem): StationDetail {
  const periodPrices = generatePeriodPrices()
  
  // 使用station中已有的可用数量，而不是重新生成
  const quickAvailable = station.quickAvailableNum
  const slowAvailable = station.slowAvailableNum
  
  // 生成充电桩列表，确保可用数量与station一致
  const fastConnectors = generateConnectorsWithAvailability(
    station.quickChargeNum, 
    quickAvailable,
    'fast', 
    station.stationId
  )
  const slowConnectors = station.slowChargeNum > 0 ? 
    generateConnectorsWithAvailability(
      station.slowChargeNum,
      slowAvailable,
      'slow', 
      station.stationId
    ) : []
  
  // 使用station中的可用数量
  const quickAvailableCount = quickAvailable
  const slowAvailableCount = slowAvailable
  
  // 随机选择使用真实图片或备用图片
  const usePictures = Math.random() > 0.3 ? REAL_PICTURES : FALLBACK_PICTURES
  
  return {
    stationId: station.stationId,
    stationName: station.stationName,
    address: station.address,
    stationLat: station.lat,
    stationLng: station.lng,
    operatorId: station.operatorId,
    brandName: station.brandName,
    busineHours: `周一至周日${station.openTime}`,
    serviceTel: station.stationTel || randomItem(['4001-300-001', '400-810-9999', '400-000-0000']),
    parkFee: station.parkFee,
    parkMode: randomInt(1, 4),
    parkNums: randomInt(20, 100),
    siteGuide: `导航至${station.stationName}，停车场位于${randomItem(['地下一层', '地下二层', '地面停车场', '建筑物西侧', '建筑物东侧', '商场北侧地面停车场'])}`,
    pictures: usePictures.slice(0, randomInt(3, 6)), // 随机3-6张图片
    quickTotalCount: station.quickChargeNum,
    quickAvailableCount,
    slowTotalCount: station.slowChargeNum,
    slowAvailableCount,
    fastConnectors,
    slowConnectors: slowConnectors.length > 0 ? slowConnectors : undefined,
    periodPrices,
    electricityFee: periodPrices.map(p => `电费:${p.startTime}~${p.endTime}:${p.eleFee}`).join(','),
    serviceFee: periodPrices.map(p => `服务费:${p.startTime}~${p.endTime}:${p.serviceFee}`).join(','),
    chargeModes: randomInt(1, 2) === 1 ? [1, 2] : [2],
    stationStatus: station.stationStatus,
  }
}

// 生成所有充电站数据
export function generateAllStations(): StationListItem[] {
  const stations: StationListItem[] = []
  let currentIndex = 1
  
  for (const city of ANHUI_CITIES) {
    for (let i = 0; i < city.count; i++) {
      const { lat, lng } = generateNearbyCoordinate(city.lat, city.lng, 25)
      const station = generateStationListItem(currentIndex, city.name, lat, lng)
      stations.push(station)
      currentIndex++
    }
  }
  
  return stations
}

// 检查点是否在边界内
export function isPointInBounds(lat: number, lng: number, bounds: { northeast: { lat: number, lng: number }, southwest: { lat: number, lng: number } }): boolean {
  return lat >= bounds.southwest.lat && 
         lat <= bounds.northeast.lat && 
         lng >= bounds.southwest.lng && 
         lng <= bounds.northeast.lng
}

// 计算两点间距离（简化版，单位：km）
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}


