# 路由权限控制说明

## 功能概述

本项目已实现完整的路由权限控制系统，可以控制哪些页面需要登录才能访问。

## 权限配置

### 1. 在 pages.json 中配置需要登录的页面

在页面配置中添加 `needLogin: true` 标记：

```json
{
  "path": "pages/tabbar/user/index",
  "style": {
    "navigationBarTitleText": "我的"
  },
  "needLogin": true  // 标记此页面需要登录
}
```

### 2. 当前需要登录的页面

- ✅ **我的页面** (`pages/tabbar/user/index`) - tabbar页面
- ✅ **Pinia示例** (`pages/business/pinia/index`) - 分包页面
- ✅ **Axios示例** (`pages/business/axios/index`) - 分包页面

### 3. 无需登录的页面（白名单）

- 首页 (`pages/tabbar/home/index`)
- 列表页 (`pages/tabbar/list/index`)
- 登录页 (`pages/common/login/index`)
- 404页面 (`pages/common/404/index`)
- 网页容器 (`pages/common/webview/index`)
- uView示例 (`pages/business/uview/index`)

## 权限实现原理

### 1. 路由拦截器 (src/plugins/permission.js)

```javascript
// 拦截所有页面跳转方法
['navigateTo', 'redirectTo', 'reLaunch', 'switchTab'].forEach((item) => {
  uni.addInterceptor(item, {
    invoke(args) {
      return hasPerm(args.url)  // 检查权限
    }
  })
})
```

### 2. 权限检查逻辑

```javascript
export function hasPerm(path = '') {
  // 1. 检查路径是否存在
  if (!isPathExists(path)) {
    uni.redirectTo({ url: ERROR404_PATH })
    return false
  }

  // 2. 白名单或已登录，直接放行
  const hasPermission = whiteList.includes(path) || isLogin()

  // 3. 无权限，跳转到登录页
  if (!hasPermission) {
    uni.redirectTo({
      url: `${LOGIN_PATH}?redirect=${encodeURIComponent(path)}`
    })
  }

  return hasPermission
}
```

### 3. 登录状态管理 (src/utils/auth.js)

```javascript
// 检查是否登录
export function isLogin() {
  return !!uni.getStorageSync('admin-token')
}

// 保存登录凭证
export function setToken(token) {
  uni.setStorageSync('admin-token', token)
}

// 清除登录凭证
export function clearToken() {
  uni.removeStorageSync('admin-token')
}
```

## 使用说明

### 测试登录功能

1. **登录账号**
   - 用户名: `admin`
   - 密码: `123456`

2. **测试流程**

   **未登录状态：**
   - 访问首页 ✅ 可以正常访问
   - 访问列表页 ✅ 可以正常访问
   - 点击"我的"tabbar ❌ 自动跳转到登录页
   - 访问Pinia页面 ❌ 自动跳转到登录页
   - 访问Axios页面 ❌ 自动跳转到登录页

   **已登录状态：**
   - 所有页面 ✅ 都可以正常访问
   - 在"我的"页面可以点击"退出登录"按钮退出

### 添加新的需要登录的页面

只需在 `pages.json` 中对应页面配置添加 `needLogin: true`：

```json
{
  "path": "pages/yourpage/index",
  "style": {
    "navigationBarTitleText": "您的页面"
  },
  "needLogin": true  // 添加这一行
}
```

### 重定向功能

当用户访问需要登录的页面时：
1. 系统自动跳转到登录页
2. 登录成功后自动跳转回原目标页面
3. 实现原理：通过URL参数传递 `redirect` 参数

```javascript
// 登录成功后跳转
const redirectPath = getRedirectPath()  // 获取原目标页面
uni.reLaunch({ url: redirectPath })
```

## 注意事项

### TabBar 页面特殊处理

⚠️ 由于微信小程序的限制，点击 tabbar 不会触发 `uni.switchTab` 拦截器。

**解决方案：**
在需要登录的 tabbar 页面的 `onShow` 生命周期中手动检查：

```javascript
onShow(() => {
  if (!isLogin()) {
    uni.redirectTo({
      url: LOGIN_PATH
    })
  }
})
```

### 路径格式

- 所有路径必须以 `/` 开头
- 支持携带查询参数，如：`/pages/index/index?id=123`
- 权限检查会自动去除查询参数

## 文件结构

```
src/
├── plugins/
│   └── permission.js          # 路由权限拦截器
├── router/
│   └── index.js              # 路由工具函数
├── utils/
│   └── auth.js               # 登录状态管理
├── pages/
│   ├── common/
│   │   ├── login/           # 登录页
│   │   └── 404/             # 404页面
│   ├── tabbar/
│   │   └── user/            # 需要登录的"我的"页面
│   └── business/
│       ├── pinia/           # 需要登录的Pinia示例
│       └── axios/           # 需要登录的Axios示例
└── pages.json               # 页面路由配置
```

## API 参考

### router/index.js

- `routes` - 所有路由配置数组
- `HOME_PATH` - 首页路径常量
- `LOGIN_PATH` - 登录页路径常量
- `ERROR404_PATH` - 404页面路径常量
- `currentRoute()` - 获取当前路由
- `isPathExists(path)` - 判断路径是否存在
- `isTabBarPath(path)` - 判断是否为tabbar页面
- `removeQueryString(path)` - 去除URL查询参数

### utils/auth.js

- `isLogin()` - 检查是否已登录
- `getToken()` - 获取token
- `setToken(token)` - 保存token
- `clearToken()` - 清除token

### plugins/permission.js

- `hasPerm(path)` - 检查路径权限
- `setupPermission()` - 初始化权限拦截器（默认导出）
