/**
 * 充电站类型定义
 */

// 充电站状态
export enum StationStatus {
  NORMAL = 50,        // 正常
  MAINTENANCE = 0,    // 维护中
}

// 充电桩状态
export enum ConnectorStatus {
  OFFLINE = 0,        // 离网
  AVAILABLE = 1,      // 空闲
  OCCUPIED = 2,       // 占用（未充电）
  CHARGING = 3,       // 占用（充电中）
  RESERVED = 4,       // 占用（预约锁定）
  FAULT = 255,        // 故障
}

// 充电站列表项
export interface StationListItem {
  stationId: string
  stationName: string
  address: string
  lat: number
  lng: number
  distance?: number
  brandName: string
  brandType: number
  operatorId: string
  electricityPrice: number
  servicePrice: number
  totalCostPrice: number
  quickChargeNum: number
  quickAvailableNum: number
  slowChargeNum: number
  slowAvailableNum: number
  openStatus: number
  openTime: string
  parkFee: string
  parkCost: number
  stationStatus: StationStatus
  stationLevel: number
  stationGradeScore: number
  stationCategory: number[]
  stationTel?: string
}

// 充电枪信息
export interface ConnectorInfo {
  connectorId: string
  connectorName: string
  connectorType: number
  status: ConnectorStatus
  power: number
  lockFlag: number
  sortLabel: number
}

// 时段价格
export interface PeriodPrice {
  startTime: string
  endTime: string
  eleFee: string
  serviceFee: string
  totalFee: string
  currentFlag?: boolean
  nextFlag?: boolean
}

// 充电站详情
export interface StationDetail {
  stationId: string
  stationName: string
  address: string
  stationLat: number
  stationLng: number
  operatorId: string
  brandName: string          // 运营品牌名称
  busineHours: string
  serviceTel: string
  parkFee: string
  parkMode: number
  parkNums: number
  siteGuide: string
  pictures: string[]
  quickTotalCount: number
  quickAvailableCount: number
  slowTotalCount: number
  slowAvailableCount: number
  fastConnectors: ConnectorInfo[]
  slowConnectors?: ConnectorInfo[]
  periodPrices: PeriodPrice[]
  electricityFee: string
  serviceFee: string
  chargeModes: number[]
  stationStatus: StationStatus
}

// 站点列表响应
export interface StationListResponse {
  pageIndex: number
  pageSize: number
  total: number
  totalPage: number
  stationList: StationListItem[]
}

// 地图边界
export interface MapBounds {
  northeast: {
    lat: number
    lng: number
  }
  southwest: {
    lat: number
    lng: number
  }
}

// 位置信息
export interface Location {
  lat: number
  lng: number
}

// WebSocket 消息类型
export enum WSMessageType {
  STATION_STATUS_UPDATE = 'station_status_update',
  CONNECTOR_STATUS_UPDATE = 'connector_status_update',
  PRICE_UPDATE = 'price_update',
}

// WebSocket 消息
export interface WSMessage {
  type: WSMessageType
  data: any
  timestamp: number
}

// 站点状态更新消息
export interface StationStatusUpdate {
  stationId: string
  quickAvailableNum: number
  slowAvailableNum: number
}

// 价格更新消息
export interface PriceUpdate {
  stationId: string
  periodPrices: PeriodPrice[]
}

// 地图聚合配置
export interface ClusterConfig {
  gridSize: number
  maxZoom: number
  minClusterSize: number
  averageCenter: boolean
}

// 主题类型
export type ThemeMode = 'light' | 'dark'

// 地图视口状态
export interface MapViewport {
  center: Location
  zoom: number
  bounds?: MapBounds
}











