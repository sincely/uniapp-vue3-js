/**
 * 钉钉小程序登录 Hook
 * 文档: https://open.dingtalk.com/document/orgapp/obtain-the-micro-application-logon-free-authorization-code
 */

/**
 * 获取钉钉免登授权码
 * @param {string} corpId - 企业 CorpID
 * @returns {Promise<string>} 授权码 authCode
 */
export function getAuthCode(corpId) {
  return new Promise((resolve, reject) => {
    if (typeof dd === 'undefined') {
      reject(new Error('当前环境不支持钉钉API'))
      return
    }
    dd.getAuthCode({
      corpId,
      success: (res) => {
        console.log('获取钉钉授权码成功:', res.authCode)
        resolve(res.authCode)
      },
      fail: (err) => {
        console.error('获取钉钉授权码失败:', err)
        reject(err)
      }
    })
  })
}

/**
 * 钉钉扫码
 * @param {Object} options - 扫码配置
 * @param {string} options.type - 扫码类型: 'qr' (二维码) | 'bar' (条形码) | 'all' (全部)
 * @returns {Promise<Object>} 扫码结果
 */
export function scan(options = {}) {
  const { type = 'all' } = options
  return new Promise((resolve, reject) => {
    // #ifdef MP-DINGTALK
    if (typeof dd === 'undefined') {
      reject(new Error('当前环境不支持钉钉API'))
      return
    }
    dd.scan({
      type,
      success: (res) => {
        console.log('扫描出来的二维码:', res)
        resolve(res)
      },
      fail: (err) => {
        console.error('钉钉扫码失败:', err)
        reject(err)
      }
    })
    // #endif

    // #ifndef MP-DINGTALK
    // 非钉钉环境使用 uni 的扫码 API
    uni.scanCode({
      scanType: type === 'qr' ? ['qrCode'] : type === 'bar' ? ['barCode'] : ['qrCode', 'barCode'],
      success: (res) => {
        resolve({
          text: res.result,
          code: res.scanType
        })
      },
      fail: (err) => {
        console.error('扫码失败:', err)
        reject(err)
      }
    })
    // #endif
  })
}

/**
 * 钉钉小程序登录 Hook
 */
export function useDingTalkLogin() {
  const loading = ref(false)
  const authCode = ref('')
  const userInfo = ref(null)
  const errorMsg = ref('')

  /**
   * 获取免登授权码
   * @param {string} corpId - 企业 CorpID
   */
  async function fetchAuthCode(corpId) {
    if (!corpId) {
      errorMsg.value = '缺少企业 CorpID'
      return null
    }
    loading.value = true
    errorMsg.value = ''
    try {
      const code = await getAuthCode(corpId)

      authCode.value = code
      return code
    } catch (err) {
      errorMsg.value = err.message || '获取授权码失败'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 扫码登录
   * @param {Function} loginApi - 登录API函数，接收扫码结果作为参数
   */
  async function scanLogin(loginApi) {
    loading.value = true
    errorMsg.value = ''
    try {
      const scanResult = await scan({ type: 'qr' })

      console.log('扫码识别结果', scanResult)
      if (!scanResult.text) {
        throw new Error('扫码结果为空')
      }
      // 调用登录 API
      if (typeof loginApi === 'function') {
        const result = await loginApi(scanResult.text)
        userInfo.value = result
        return result
      }
      return scanResult
    } catch (err) {
      errorMsg.value = err.message || '扫码登录失败'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 钉钉免登
   * @param {string} corpId - 企业 CorpID
   * @param {Function} loginApi - 登录API函数，接收 authCode 作为参数
   */
  async function dingTalkLogin(corpId, loginApi) {
    loading.value = true
    errorMsg.value = ''
    try {
      const code = await getAuthCode(corpId)
      console.log('code1111111111111111', code)
      if (!code) {
        throw new Error('获取授权码失败')
      }
      authCode.value = code
      // 调用后端登录 API
      if (typeof loginApi === 'function') {
        const result = await loginApi(code)
        userInfo.value = result
        return result
      }
      return code
    } catch (err) {
      errorMsg.value = err.message || '钉钉登录失败'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置状态
   */
  function reset() {
    loading.value = false
    authCode.value = ''
    userInfo.value = null
    errorMsg.value = ''
  }

  return {
    loading,
    authCode,
    userInfo,
    errorMsg,
    fetchAuthCode,
    scan,
    scanLogin,
    dingTalkLogin,
    reset
  }
}

export default useDingTalkLogin
