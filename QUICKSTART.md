# 快速开始指南

本指南将帮助您在5分钟内运行新能源汽车充电地图项目。

## 前置要求

确保您的系统已安装：

- **Node.js** 16.0+ （推荐使用 18.0+）
- **npm** 7.0+ 或 **pnpm** 7.0+
- **Git**

检查版本：

```bash
node -v
npm -v
```

## 第一步：克隆项目

```bash
# 如果您已经在项目目录中，跳过此步骤
git clone <your-repository-url>
cd new-charging
```

## 第二步：安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm（更快）
pnpm install
```

预计安装时间：1-3分钟

## 第三步：配置环境变量

创建 `.env.local` 文件：

```bash
# 复制示例文件
cp .env.example .env.local
```

或手动创建 `.env.local` 文件，内容如下：

```env
# 高德地图配置（已提供测试密钥）
VITE_AMAP_KEY=e3ad3be46f028b631499ead7d2453741
VITE_AMAP_SECURITY_CODE=636a055bd173ac44c0e7dbbf37432bcd

# API配置
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws

# 使用Mock数据（开发必须为true）
VITE_USE_MOCK=true
```

> **注意**：配置文件中的高德地图密钥仅供开发测试使用。

## 第四步：生成HTTPS证书（重要！）

浏览器的地理定位API需要HTTPS环境。我们需要生成本地HTTPS证书。

### 安装 mkcert

#### macOS

```bash
brew install mkcert
```

#### Windows

```bash
# 使用 Chocolatey
choco install mkcert

# 或使用 Scoop
scoop install mkcert
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt install libnss3-tools
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert-v1.4.4-linux-amd64
sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert
```

### 生成证书

```bash
npm run generate-certs
```

这将：
1. 安装本地证书颁发机构（CA）
2. 为 localhost 生成SSL证书
3. 证书将保存在 `certs/` 目录

## 第五步：启动开发服务器

```bash
npm run dev
```

服务器将在以下地址启动：

```
HTTPS: https://localhost:5173
HTTP:  http://localhost:5173 （如果没有证书）
```

## 第六步：访问应用

在浏览器中打开：

```
https://localhost:5173
```

### 首次访问可能需要：

1. **接受证书警告**：
   - Chrome: 点击 "高级" → "继续访问 localhost（不安全）"
   - Firefox: 点击 "高级" → "接受风险并继续"
   - Safari: 点击 "显示详细信息" → "访问此网站"

2. **授予位置权限**：
   - 浏览器会请求访问您的位置
   - 点击 "允许" 以启用地图定位功能

## 验证功能

启动后，您应该能看到：

✅ 地图加载完成（显示合肥市中心）  
✅ 附近充电站标记显示  
✅ 搜索框可用  
✅ 底部浮动按钮（列表、筛选）  
✅ 主题切换按钮（右上角月亮/太阳图标）  

### 尝试以下操作：

1. **地图交互**
   - 拖动地图
   - 双指缩放（触摸屏）或鼠标滚轮缩放
   - 点击定位按钮（右上角）

2. **搜索充电站**
   - 在顶部搜索框输入"合肥"
   - 点击搜索结果

3. **查看充电站详情**
   - 点击地图上的充电站标记
   - 或点击列表中的充电站
   - 查看详细信息、充电桩状态、价格

4. **导航功能**
   - 在详情页点击"导航到站"
   - 将尝试打开导航应用

5. **充电流程**
   - 在详情页点击"开始充电"
   - 选择充电桩
   - 设置充电参数
   - 模拟充电过程
   - 完成支付

6. **主题切换**
   - 点击右上角的月亮/太阳图标
   - 切换明暗模式

## 常见问题

### Q: 地图不显示？

**A:** 检查以下几点：

1. 高德地图Key是否正确配置
2. 浏览器控制台是否有错误
3. 网络连接是否正常

### Q: 定位失败？

**A:** 

1. 确保使用 HTTPS 访问（`https://localhost:5173`）
2. 检查浏览器是否授予了位置权限
3. 部分浏览器可能需要刷新页面

### Q: 充电站数据不显示？

**A:**

1. 打开浏览器控制台，查看是否有数据生成日志
2. Mock数据首次加载会生成2000个充电站，可能需要1-2秒
3. 尝试移动地图到安徽省范围

### Q: 证书生成失败？

**A:**

1. 确保已安装 mkcert
2. 运行 `mkcert -install` 手动安装CA
3. 查看错误信息，按提示操作

如果证书无法生成，可以使用HTTP访问（但定位功能会受限）：
```
http://localhost:5173
```

### Q: 端口被占用？

**A:**

修改 `vite.config.ts` 中的端口：

```typescript
server: {
  port: 5174, // 改为其他端口
  // ...
}
```

## 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 运行测试
npm run test

# E2E测试
npm run test:e2e

# 代码检查
npm run lint

# 代码格式化
npm run format

# 生成HTTPS证书
npm run generate-certs
```

## 下一步

现在您已经成功运行了项目！接下来可以：

1. 📖 阅读 [README.md](./README.md) 了解项目详情
2. 🏗️ 查看 [ARCHITECTURE.md](./ARCHITECTURE.md) 了解技术架构
3. 🔧 根据需求修改代码
4. 🚀 构建并部署到生产环境

## 需要帮助？

- 查看项目文档
- 检查浏览器控制台的错误信息
- 查看 `src/` 目录下的代码注释

## 技术支持

如有问题，请查看：
- 项目 Issues
- 高德地图文档：https://lbs.amap.com/api/jsapi-v2/summary
- Vue 3 文档：https://cn.vuejs.org/

---

祝您开发愉快！🎉




