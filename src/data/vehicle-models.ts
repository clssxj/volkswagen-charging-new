/**
 * 电动车车型数据库
 * 包含主流品牌的电动车型号，重点突出大众品牌
 */

export interface VehicleModel {
  id: string
  brand: string           // 品牌
  model: string           // 车型
  fullName: string        // 完整名称
  batteryCapacity: number // 电池容量（kWh）
  range: number           // 续航里程（km）
  category: 'compact' | 'sedan' | 'suv' | 'premium' // 车型类别
  logo?: string           // 品牌logo emoji
}

export const vehicleModels: VehicleModel[] = [
  // ========== 大众品牌 ==========
  {
    id: 'vw-id3',
    brand: '大众',
    model: 'ID.3',
    fullName: '大众 ID.3',
    batteryCapacity: 57.3,
    range: 430,
    category: 'compact',
    logo: '🔵'
  },
  {
    id: 'vw-id4-crozz',
    brand: '大众',
    model: 'ID.4 CROZZ',
    fullName: '大众 ID.4 CROZZ',
    batteryCapacity: 83.4,
    range: 560,
    category: 'suv',
    logo: '🔵'
  },
  {
    id: 'vw-id6-crozz',
    brand: '大众',
    model: 'ID.6 CROZZ',
    fullName: '大众 ID.6 CROZZ',
    batteryCapacity: 83.4,
    range: 565,
    category: 'suv',
    logo: '🔵'
  },
  {
    id: 'vw-id7-vizzion',
    brand: '大众',
    model: 'ID.7 VIZZION',
    fullName: '大众 ID.7 VIZZION',
    batteryCapacity: 84.8,
    range: 642,
    category: 'premium',
    logo: '🔵'
  },
  {
    id: 'vw-id-buzz',
    brand: '大众',
    model: 'ID. BUZZ',
    fullName: '大众 ID. BUZZ',
    batteryCapacity: 77,
    range: 423,
    category: 'suv',
    logo: '🔵'
  },
  
  // ========== 比亚迪 ==========
  {
    id: 'byd-han-ev',
    brand: '比亚迪',
    model: '汉 EV',
    fullName: '比亚迪汉 EV',
    batteryCapacity: 85.4,
    range: 715,
    category: 'premium',
    logo: '🔷'
  },
  {
    id: 'byd-tang-ev',
    brand: '比亚迪',
    model: '唐 EV',
    fullName: '比亚迪唐 EV',
    batteryCapacity: 86.4,
    range: 635,
    category: 'suv',
    logo: '🔷'
  },
  {
    id: 'byd-yuan-plus',
    brand: '比亚迪',
    model: '元 PLUS',
    fullName: '比亚迪元 PLUS',
    batteryCapacity: 60.48,
    range: 510,
    category: 'suv',
    logo: '🔷'
  },
  {
    id: 'byd-dolphin',
    brand: '比亚迪',
    model: '海豚',
    fullName: '比亚迪海豚',
    batteryCapacity: 44.9,
    range: 420,
    category: 'compact',
    logo: '🔷'
  },
  {
    id: 'byd-seal',
    brand: '比亚迪',
    model: '海豹',
    fullName: '比亚迪海豹',
    batteryCapacity: 82.5,
    range: 700,
    category: 'sedan',
    logo: '🔷'
  },
  
  // ========== 特斯拉 ==========
  {
    id: 'tesla-model-3',
    brand: '特斯拉',
    model: 'Model 3',
    fullName: '特斯拉 Model 3',
    batteryCapacity: 60,
    range: 556,
    category: 'sedan',
    logo: '⚡'
  },
  {
    id: 'tesla-model-y',
    brand: '特斯拉',
    model: 'Model Y',
    fullName: '特斯拉 Model Y',
    batteryCapacity: 78.4,
    range: 660,
    category: 'suv',
    logo: '⚡'
  },
  {
    id: 'tesla-model-s',
    brand: '特斯拉',
    model: 'Model S',
    fullName: '特斯拉 Model S',
    batteryCapacity: 100,
    range: 715,
    category: 'premium',
    logo: '⚡'
  },
  {
    id: 'tesla-model-x',
    brand: '特斯拉',
    model: 'Model X',
    fullName: '特斯拉 Model X',
    batteryCapacity: 100,
    range: 664,
    category: 'suv',
    logo: '⚡'
  },
  
  // ========== 蔚来 ==========
  {
    id: 'nio-et5',
    brand: '蔚来',
    model: 'ET5',
    fullName: '蔚来 ET5',
    batteryCapacity: 75,
    range: 560,
    category: 'sedan',
    logo: '🔺'
  },
  {
    id: 'nio-et7',
    brand: '蔚来',
    model: 'ET7',
    fullName: '蔚来 ET7',
    batteryCapacity: 100,
    range: 1000,
    category: 'premium',
    logo: '🔺'
  },
  {
    id: 'nio-es6',
    brand: '蔚来',
    model: 'ES6',
    fullName: '蔚来 ES6',
    batteryCapacity: 75,
    range: 625,
    category: 'suv',
    logo: '🔺'
  },
  {
    id: 'nio-es8',
    brand: '蔚来',
    model: 'ES8',
    fullName: '蔚来 ES8',
    batteryCapacity: 100,
    range: 605,
    category: 'suv',
    logo: '🔺'
  },
  
  // ========== 小鹏 ==========
  {
    id: 'xpeng-p7',
    brand: '小鹏',
    model: 'P7',
    fullName: '小鹏 P7',
    batteryCapacity: 80.9,
    range: 706,
    category: 'sedan',
    logo: '🅿️'
  },
  {
    id: 'xpeng-g9',
    brand: '小鹏',
    model: 'G9',
    fullName: '小鹏 G9',
    batteryCapacity: 98,
    range: 702,
    category: 'suv',
    logo: '🅿️'
  },
  {
    id: 'xpeng-p5',
    brand: '小鹏',
    model: 'P5',
    fullName: '小鹏 P5',
    batteryCapacity: 71.4,
    range: 600,
    category: 'sedan',
    logo: '🅿️'
  },
  
  // ========== 理想 ==========
  {
    id: 'li-l7',
    brand: '理想',
    model: 'L7',
    fullName: '理想 L7',
    batteryCapacity: 42.8,
    range: 210,
    category: 'suv',
    logo: '🔶'
  },
  {
    id: 'li-l8',
    brand: '理想',
    model: 'L8',
    fullName: '理想 L8',
    batteryCapacity: 42.8,
    range: 210,
    category: 'suv',
    logo: '🔶'
  },
  {
    id: 'li-l9',
    brand: '理想',
    model: 'L9',
    fullName: '理想 L9',
    batteryCapacity: 44.5,
    range: 215,
    category: 'premium',
    logo: '🔶'
  },
  
  // ========== 极氪 ==========
  {
    id: 'zeekr-001',
    brand: '极氪',
    model: '001',
    fullName: '极氪 001',
    batteryCapacity: 100,
    range: 741,
    category: 'premium',
    logo: '⚫'
  },
  {
    id: 'zeekr-009',
    brand: '极氪',
    model: '009',
    fullName: '极氪 009',
    batteryCapacity: 116,
    range: 822,
    category: 'premium',
    logo: '⚫'
  },
  {
    id: 'zeekr-x',
    brand: '极氪',
    model: 'X',
    fullName: '极氪 X',
    batteryCapacity: 66,
    range: 560,
    category: 'suv',
    logo: '⚫'
  },
  
  // ========== 其他品牌 ==========
  {
    id: 'mercedes-eqe',
    brand: '奔驰',
    model: 'EQE',
    fullName: '奔驰 EQE',
    batteryCapacity: 90.6,
    range: 752,
    category: 'premium',
    logo: '⭐'
  },
  {
    id: 'bmw-ix3',
    brand: '宝马',
    model: 'iX3',
    fullName: '宝马 iX3',
    batteryCapacity: 74,
    range: 535,
    category: 'suv',
    logo: '🔷'
  },
  {
    id: 'audi-etron',
    brand: '奥迪',
    model: 'e-tron',
    fullName: '奥迪 e-tron',
    batteryCapacity: 95,
    range: 500,
    category: 'suv',
    logo: '⚪'
  },
  {
    id: 'geely-zeekr-001',
    brand: '吉利',
    model: '几何A',
    fullName: '吉利几何A',
    batteryCapacity: 70,
    range: 600,
    category: 'sedan',
    logo: '🔵'
  },
  {
    id: 'nio-ec6',
    brand: '蔚来',
    model: 'EC6',
    fullName: '蔚来 EC6',
    batteryCapacity: 75,
    range: 615,
    category: 'suv',
    logo: '🔺'
  },
]

// 按品牌分组
export const vehiclesByBrand = vehicleModels.reduce((acc, vehicle) => {
  if (!acc[vehicle.brand]) {
    acc[vehicle.brand] = []
  }
  acc[vehicle.brand].push(vehicle)
  return acc
}, {} as Record<string, VehicleModel[]>)

// 品牌列表（大众排第一）
export const brands = [
  '大众',
  '比亚迪',
  '特斯拉',
  '蔚来',
  '小鹏',
  '理想',
  '极氪',
  '其他'
]

/**
 * 根据车型ID获取车型信息
 */
export function getVehicleById(id: string): VehicleModel | undefined {
  return vehicleModels.find(v => v.id === id)
}

/**
 * 根据品牌获取车型列表
 */
export function getVehiclesByBrand(brand: string): VehicleModel[] {
  return vehicleModels.filter(v => v.brand === brand)
}

/**
 * 获取随机初始SOC（5%-60%）
 */
export function getRandomInitialSOC(): number {
  return 5 + Math.random() * 55
}

