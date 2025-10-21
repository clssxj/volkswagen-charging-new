/**
 * 设置加载动画视频文件
 * 
 * 这个脚本会将项目根目录下的"大众等待动画.mp4"复制到public目录
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 源文件路径
const sourceFile = path.join(__dirname, '..', '大众等待动画.mp4')
// 目标文件路径
const targetFile = path.join(__dirname, '..', 'public', 'loading-animation.mp4')

console.log('📹 正在设置加载动画视频...')
console.log(`   源文件: ${sourceFile}`)
console.log(`   目标文件: ${targetFile}`)

// 检查源文件是否存在
if (!fs.existsSync(sourceFile)) {
  console.error('❌ 错误: 找不到源文件 "大众等待动画.mp4"')
  console.log('   请确保视频文件位于项目根目录')
  process.exit(1)
}

// 检查目标目录是否存在
const publicDir = path.join(__dirname, '..', 'public')
if (!fs.existsSync(publicDir)) {
  console.log('📁 创建 public 目录...')
  fs.mkdirSync(publicDir, { recursive: true })
}

// 复制文件
try {
  fs.copyFileSync(sourceFile, targetFile)
  console.log('✅ 视频文件复制成功!')
  console.log(`   文件大小: ${(fs.statSync(targetFile).size / 1024 / 1024).toFixed(2)} MB`)
  console.log('')
  console.log('🎉 设置完成！现在可以使用加载动画了')
  process.exit(0)
} catch (error) {
  console.error('❌ 复制文件失败:', error.message)
  process.exit(1)
}

