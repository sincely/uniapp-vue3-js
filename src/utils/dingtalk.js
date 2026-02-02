/**
 * 钉钉小程序工具类
 * 文档: https://open.dingtalk.com/document/orgapp/
 */

/**
 * 检测是否在钉钉环境中
 * @returns {boolean}
 */
export function isDingTalk() {
  // #ifdef MP-DINGTALK
  return typeof dd !== 'undefined'
  // #endif
}

/**
 * 获取钉钉免登授权码
 * @param {string} corpId - 企业 CorpID
 * @returns {Promise<string>} 授权码 authCode，有效期5分钟，只能使用一次
 */
export function getAuthCode(corpId) {
  return new Promise((resolve, reject) => {
    if (!isDingTalk()) {
      reject(new Error('当前环境不支持钉钉API'))
      return
    }
    // #ifdef MP-DINGTALK
    dd.getAuthCode({
      corpId,
      success: (res) => {
        console.log('[DingTalk] getAuthCode success:', res)
        resolve(res.authCode)
      },
      fail: (err) => {
        console.error('[DingTalk] getAuthCode fail:', err)
        reject(err)
      }
    })
    // #endif
  })
}

/**
 * 钉钉扫码
 * @param {Object} options - 扫码配置
 * @param {string} options.type - 扫码类型: 'qr' (二维码) | 'bar' (条形码) | 'all' (全部)
 * @returns {Promise<{text: string, code: string}>} 扫码结果
 */
export function scan(options = {}) {
  const { type = 'all' } = options

  return new Promise((resolve, reject) => {
    // #ifdef MP-DINGTALK
    if (isDingTalk()) {
      dd.scan({
        type,
        success: (res) => {
          console.log('[DingTalk] scan success:', res)
          resolve({
            text: res.text || res.code,
            code: res.code
          })
        },
        fail: (err) => {
          console.error('[DingTalk] scan fail:', err)
          reject(err)
        }
      })
      return
    }
    // #endif

    // 非钉钉环境使用 uni 的扫码 API
    uni.scanCode({
      scanType: type === 'qr' ? ['qrCode'] : type === 'bar' ? ['barCode'] : ['qrCode', 'barCode'],
      success: (res) => {
        console.log('[UniApp] scanCode success:', res)
        resolve({
          text: res.result,
          code: res.scanType
        })
      },
      fail: (err) => {
        console.error('[UniApp] scanCode fail:', err)
        reject(err)
      }
    })
  })
}

/**
 * 获取钉钉用户信息 (需要授权)
 * @returns {Promise<Object>} 用户信息
 */
export function getUserInfo() {
  return new Promise((resolve, reject) => {
    if (!isDingTalk()) {
      reject(new Error('当前环境不支持钉钉API'))
      return
    }
    // #ifdef MP-DINGTALK
    dd.getPhoneInfo({
      success: (res) => {
        console.log('[DingTalk] getPhoneInfo success:', res)
        resolve(res)
      },
      fail: (err) => {
        console.error('[DingTalk] getPhoneInfo fail:', err)
        reject(err)
      }
    })
    // #endif
  })
}

/**
 * 显示 Toast 提示
 * @param {string} content - 提示内容
 * @param {string} type - 提示类型: 'none' | 'success' | 'fail' | 'exception'
 * @param {number} duration - 显示时长(ms)
 */
export function showToast(content, type = 'none', duration = 2000) {
  // #ifdef MP-DINGTALK
  if (isDingTalk()) {
    dd.showToast({
      content,
      type,
      duration
    })
    return
  }
  // #endif

  uni.showToast({
    title: content,
    icon: type === 'success' ? 'success' : type === 'fail' ? 'error' : 'none',
    duration
  })
}

/**
 * 显示加载提示
 * @param {string} content - 提示内容
 */
export function showLoading(content = '加载中...') {
  // #ifdef MP-DINGTALK
  if (isDingTalk()) {
    dd.showLoading({
      content
    })
    return
  }
  // #endif

  uni.showLoading({
    title: content
  })
}

/**
 * 隐藏加载提示
 */
export function hideLoading() {
  // #ifdef MP-DINGTALK
  if (isDingTalk()) {
    dd.hideLoading()
    return
  }
  // #endif

  uni.hideLoading()
}

/**
 * 显示确认对话框
 * @param {Object} options - 配置选项
 * @returns {Promise<{confirm: boolean}>}
 */
export function showConfirm(options = {}) {
  const { title = '提示', content = '', confirmText = '确定', cancelText = '取消' } = options

  return new Promise((resolve) => {
    // #ifdef MP-DINGTALK
    if (isDingTalk()) {
      dd.confirm({
        title,
        content,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        success: (res) => {
          resolve({ confirm: res.confirm })
        },
        fail: () => {
          resolve({ confirm: false })
        }
      })
      return
    }
    // #endif

    uni.showModal({
      title,
      content,
      confirmText,
      cancelText,
      success: (res) => {
        resolve({ confirm: res.confirm })
      },
      fail: () => {
        resolve({ confirm: false })
      }
    })
  })
}

/**
 * 设置导航栏标题
 * @param {string} title - 标题
 */
export function setNavigationBarTitle(title) {
  // #ifdef MP-DINGTALK
  if (isDingTalk()) {
    dd.setNavigationBar({
      title
    })
    return
  }
  // #endif

  uni.setNavigationBarTitle({
    title
  })
}

/**
 * 获取系统信息
 * @returns {Promise<Object>}
 */
export function getSystemInfo() {
  return new Promise((resolve, reject) => {
    // #ifdef MP-DINGTALK
    if (isDingTalk()) {
      dd.getSystemInfo({
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          reject(err)
        }
      })
      return
    }
    // #endif

    uni.getSystemInfo({
      success: (res) => {
        resolve(res)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

export default {
  isDingTalk,
  getAuthCode,
  scan,
  getUserInfo,
  showToast,
  showLoading,
  hideLoading,
  showConfirm,
  setNavigationBarTitle,
  getSystemInfo
}
