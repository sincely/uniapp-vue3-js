import { request } from '../request'

const enableMock = import.meta.env.VITE_APP_MOCK_LOGIN === 'true'

/**
 * 微信手机号一键登录
 * 前端获取到 getPhoneNumber 返回的 code（phoneCode）后传给后端。
 * 后端需调用微信接口 phonenumber.getPhoneNumber 换取手机号，并返回业务 token。
 */
function wechatPhoneLogin({ phoneCode, encryptedData, iv, wxCode } = {}) {
  if (enableMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: `mock-token-wechat-${Date.now()}`
        })
      }, 600)
    })
  }

  return request({
    url: 'auth/wechat/phone-login',
    method: 'POST',
    data: {
      phoneCode,
      encryptedData,
      iv,
      wxCode
    }
  })
}

/**
 * 发送短信验证码
 */
function sendSmsCode(phone) {
  if (enableMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true
        })
      }, 500)
    })
  }

  return request({
    url: 'auth/sms/send',
    method: 'POST',
    data: {
      phone
    }
  })
}

/**
 * 手机验证码登录
 */
function smsLogin(phone, code) {
  if (enableMock) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (code === '123456') {
          resolve({
            token: `mock-token-sms-${Date.now()}`
          })
        } else {
          reject(new Error('验证码错误'))
        }
      }, 600)
    })
  }

  return request({
    url: 'auth/sms/login',
    method: 'POST',
    data: {
      phone,
      code
    }
  })
}

export default {
  wechatPhoneLogin,
  sendSmsCode,
  smsLogin
}
