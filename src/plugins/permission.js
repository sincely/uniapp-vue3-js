import { ERROR404_PATH, isPathExists, LOGIN_PATH, removeQueryString, routes } from '@/router'
import { isLogin } from '@/utils/auth'

/**
 * ====================================
 * 路由权限控制系统
 * ====================================
 * 功能：控制哪些页面需要登录才能访问
 * 使用：在 pages.json 中为页面添加 needLogin: true 标记
 */

// ========== 1. 构建白名单 ==========
/**
 * 白名单：不需要登录即可访问的页面路径列表
 * 自动从 routes 中提取所有 needLogin !== true 的页面
 */
const buildWhiteList = () => {
  const list = ['/'] // 根路径默认在白名单中

  routes.forEach((route) => {
    // 如果页面没有标记 needLogin: true，则加入白名单
    if (route.needLogin !== true) {
      list.push(route.path)
    }
  })

  return list
}

const WHITE_LIST = buildWhiteList()

// ========== 2. 权限检查函数 ==========
/**
 * 检查路径是否在白名单中（不需要登录）
 */
const isInWhiteList = (path) => {
  const cleanPath = removeQueryString(path)
  return WHITE_LIST.includes(cleanPath)
}

/**
 * 跳转到 404 页面
 */
const redirectTo404 = () => {
  uni.redirectTo({ url: ERROR404_PATH })
}

/**
 * 跳转到登录页（携带重定向参数）
 */
const redirectToLogin = (targetPath) => {
  const loginUrl = `${LOGIN_PATH}?redirect=${encodeURIComponent(targetPath)}`
  uni.redirectTo({ url: loginUrl })
}

/**
 * 核心权限校验函数
 * @param {string} path - 要访问的页面路径
 * @returns {boolean} - true: 允许访问, false: 拒绝访问
 */
export function checkPermission(path = '') {
  // 步骤1: 检查路径是否存在
  if (!isPathExists(path) && path !== '/') {
    redirectTo404()
    return false
  }

  // 步骤2: 检查是否需要登录
  // 情况A: 在白名单中 → 直接放行
  if (isInWhiteList(path)) {
    return true
  }

  // 情况B: 不在白名单中，检查登录状态
  if (isLogin()) {
    return true // 已登录 → 放行
  }

  // 情况C: 未登录且不在白名单 → 跳转登录页
  redirectToLogin(path)
  return false
}

// ========== 3. 初始化路由拦截器 ==========
/**
 * 设置路由拦截器
 * 拦截所有页面跳转方法，在跳转前进行权限检查
 */
function setupPermission() {
  // 需要拦截的跳转方法列表
  const NAVIGATION_METHODS = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab']

  NAVIGATION_METHODS.forEach((method) => {
    uni.addInterceptor(method, {
      invoke(args) {
        // 在页面跳转前检查权限
        return checkPermission(args.url)
      }
    })
  })

  console.log('✅ 路由权限拦截器已启动')
  console.log('📋 白名单页面数量:', WHITE_LIST.length)
}

/**
 * 注意事项：
 *
 * 1. TabBar 页面特殊处理
 *    微信小程序中，点击 TabBar 不会触发 uni.switchTab 拦截器
 *    解决方案：在需要登录的 TabBar 页面的 onShow 中手动检查登录状态
 *
 * 2. 白名单自动生成
 *    所有未标记 needLogin: true 的页面自动加入白名单
 *
 * 3. 登录重定向
 *    未登录用户访问受限页面时，会自动跳转到登录页
 *    登录成功后会自动跳转回原目标页面
 */

export default setupPermission
