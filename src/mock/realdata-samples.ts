/**
 * 后端真实数据样例（用于参考和测试）
 */

import type { StationListItem, StationDetail } from '@/types'

/**
 * 真实站点列表样例数据（来自后端接口）
 */
export const REAL_STATION_SAMPLES: Partial<StationListItem>[] = [
  {
    address: "犀浦镇国宁东路69号百伦广场犀浦店地下停车场258",
    brandName: "依威",
    brandType: 1,
    distance: 1859.03,
    electricityPrice: 1.20,
    lat: 30.756089,
    lng: 103.975038,
    openStatus: 1,
    openTime: "00:00-24:00",
    operatorId: "320513112",
    parkCost: 2,
    parkFee: "全天开放",
    quickAvailableNum: 0,
    quickChargeNum: 0,
    servicePrice: 0.80,
    slowAvailableNum: 10,
    slowChargeNum: 10,
    stationCategory: [64],
    stationGradeScore: 0.0,
    stationId: "28-093",
    stationLevel: 0,
    stationName: "百伦广场犀浦店停车场",
    stationStatus: 50,
    stationTel: "13811111111",
    totalCostPrice: 2.00
  },
  {
    address: "百草路1067号天府创意产业园地面停车场",
    brandName: "依威",
    brandType: 1,
    distance: 2464.3,
    electricityPrice: 1.20,
    lat: 30.751367,
    lng: 103.953172,
    openStatus: 1,
    openTime: "00:00-24:00",
    operatorId: "320513112",
    parkCost: 2,
    parkFee: "全天开放",
    quickAvailableNum: 0,
    quickChargeNum: 0,
    servicePrice: 0.80,
    slowAvailableNum: 6,
    slowChargeNum: 6,
    stationCategory: [],
    stationGradeScore: 0.0,
    stationId: "28-231",
    stationLevel: 1,
    stationName: "天府创业园",
    stationStatus: 50,
    stationTel: "13811111111",
    totalCostPrice: 2.00
  }
]

/**
 * 真实站点详情样例（来自后端接口）
 */
export const REAL_DETAIL_SAMPLE: Partial<StationDetail> = {
  address: "北京市市辖区朝阳区高井村甲八号地上停车场西北侧，飞凡汽车专属车位为西侧2个；共享车位为东侧4个",
  busineHours: "周一至周日00:00-24:00",
  chargeModes: [2],
  electricityFee: "电费:00:00~07:00:0.2849,07:00~10:00:0.7523,10:00~15:00:1.271,15:00~18:00:0.7523,18:00~21:00:1.271,21:00~23:00:0.7523,23:00~24:00:0.2849",
  operatorId: "BMVIRTUAL",
  parkFee: "限时免费停车,每天第一次前2小时免停；超出时间参考价格：8元/小时（以实际收取为准）",
  parkMode: 3,
  parkNums: 0,
  fastConnectors: [
    {
      connectorId: "225712000200020302",
      connectorName: "",
      connectorType: 4,
      lockFlag: 0,
      power: 120.00,
      sortLabel: 0,
      status: 1
    },
    {
      connectorId: "225796010000000716",
      connectorName: "",
      connectorType: 4,
      lockFlag: 0,
      power: 960.00,
      sortLabel: 0,
      status: 1
    }
  ],
  periodPrices: [
    {
      eleFee: "0.90",
      endTime: "06:00",
      serviceFee: "0.05",
      startTime: "00:00",
      totalFee: "0.95"
    },
    {
      currentFlag: true,
      eleFee: "0.90",
      endTime: "14:00",
      serviceFee: "0.35",
      startTime: "06:00",
      totalFee: "1.25"
    },
    {
      eleFee: "0.90",
      endTime: "16:00",
      nextFlag: true,
      serviceFee: "0.30",
      startTime: "14:00",
      totalFee: "1.20"
    },
    {
      eleFee: "0.90",
      endTime: "18:00",
      serviceFee: "0.39",
      startTime: "16:00",
      totalFee: "1.29"
    },
    {
      eleFee: "0.90",
      endTime: "20:00",
      serviceFee: "0.55",
      startTime: "18:00",
      totalFee: "1.45"
    },
    {
      eleFee: "0.90",
      endTime: "24:00",
      serviceFee: "0.39",
      startTime: "20:00",
      totalFee: "1.29"
    }
  ],
  pictures: [
    "https://resource.teld.cn/teldimage/134/9ddad89384494b93abec6dd72d301d7e.jpg",
    "https://resource.teld.cn/teldimage/134/886573f480124952949575a120481c7a.jpg",
    "https://resource.teld.cn/teldimage/134/57cf9722387a4da99936568c72586a8a.jpg",
    "https://resource.teld.cn/teldimage/134/87271b222f52470db39b540f41e47747.jpg",
    "https://resource.teld.cn/teldimage/134/68d182d6c5104029a720b56d5d9cd493.jpg",
    "https://resource.teld.cn/teldimage/134/dda176aef5da41b9807e9f4e5b1ea501.jpg",
    "https://resource.teld.cn/teldimage/115/405c08c2464f47cc80009c0d76336169.jpg",
    "https://resource.teld.cn/teldimage/134/011fa971bb95477fa43f4fcd0a94ed09.jpg",
    "https://resource.teld.cn/teldimage/134/32dc24a44aa5458da487e1b18e2a0b35.jpg"
  ],
  quickAvailableCount: 6,
  quickTotalCount: 7,
  serviceFee: "服务费:00:00~07:00:0.8,07:00~10:00:0.8,10:00~15:00:0.8,15:00~18:00:0.8,18:00~21:00:0.8,21:00~23:00:0.8,23:00~24:00:0.8",
  serviceTel: "4001-300-001",
  siteGuide: "商场北侧地面停车场11111",
  slowAvailableCount: 0,
  slowTotalCount: 0,
  stationId: "VOSTATION001",
  stationLat: 39.915561,
  stationLng: 116.539937,
  stationName: "斑马虚拟品牌站(编辑8)",
  stationStatus: 0,
  serviceTel: ""
}

/**
 * 真实图片URL（来自后端）
 */
export const REAL_PICTURE_SAMPLES = [
  "https://resource.teld.cn/teldimage/134/9ddad89384494b93abec6dd72d301d7e.jpg",
  "https://resource.teld.cn/teldimage/134/886573f480124952949575a120481c7a.jpg",
  "https://resource.teld.cn/teldimage/134/57cf9722387a4da99936568c72586a8a.jpg",
  "https://resource.teld.cn/teldimage/134/87271b222f52470db39b540f41e47747.jpg",
  "https://resource.teld.cn/teldimage/134/68d182d6c5104029a720b56d5d9cd493.jpg",
  "https://resource.teld.cn/teldimage/134/dda176aef5da41b9807e9f4e5b1ea501.jpg",
  "https://resource.teld.cn/teldimage/115/405c08c2464f47cc80009c0d76336169.jpg",
  "https://resource.teld.cn/teldimage/134/011fa971bb95477fa43f4fcd0a94ed09.jpg",
  "https://resource.teld.cn/teldimage/134/32dc24a44aa5458da487e1b18e2a0b35.jpg"
]

/**
 * 真实地址样例
 */
export const REAL_ADDRESS_SAMPLES = [
  "犀浦镇国宁东路69号百伦广场犀浦店地下停车场258",
  "百草路1067号天府创意产业园地面停车场",
  "朝阳区高井村甲八号地上停车场西北侧"
]

/**
 * 真实服务电话样例
 */
export const REAL_SERVICE_TELS = [
  "4001-300-001",
  "400-000-0000",
  "400-810-9999"
]

