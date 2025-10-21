/**
 * 生成本地HTTPS证书脚本
 * 用于支持Geolocation API（需要HTTPS环境）
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const certsDir = join(__dirname, '../certs')

// 创建证书目录
if (!existsSync(certsDir)) {
  mkdirSync(certsDir, { recursive: true })
}

console.log('正在生成HTTPS证书...')

try {
  // 检查是否安装了mkcert
  try {
    execSync('mkcert -version', { stdio: 'ignore' })
  } catch (e) {
    console.error('\n❌ 未找到 mkcert 工具')
    console.log('\n请先安装 mkcert:')
    console.log('  macOS:   brew install mkcert')
    console.log('  Windows: choco install mkcert')
    console.log('  Linux:   请参考 https://github.com/FiloSottile/mkcert\n')
    process.exit(1)
  }

  // 安装本地CA（如果尚未安装）
  console.log('安装本地证书颁发机构...')
  execSync('mkcert -install', { stdio: 'inherit' })

  // 生成localhost证书
  console.log('生成localhost证书...')
  execSync(
    `mkcert -key-file ${join(certsDir, 'localhost-key.pem')} -cert-file ${join(certsDir, 'localhost.pem')} localhost 127.0.0.1 ::1`,
    { stdio: 'inherit' }
  )

  console.log('\n✅ HTTPS证书生成成功!')
  console.log(`证书位置: ${certsDir}`)
  console.log('\n现在可以使用 npm run dev 启动HTTPS开发服务器\n')
} catch (error) {
  console.error('\n❌ 证书生成失败:', error.message)
  console.log('\n你也可以手动生成证书：')
  console.log('1. 安装 mkcert: https://github.com/FiloSottile/mkcert')
  console.log('2. 运行: mkcert -install')
  console.log(`3. 运行: mkcert -key-file ${join(certsDir, 'localhost-key.pem')} -cert-file ${join(certsDir, 'localhost.pem')} localhost\n`)
  process.exit(1)
}




