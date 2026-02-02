import { request } from '../request'

function login(account, pwd) {
  return request('user/login', {
    account,
    pwd
  })
}

/**
 * 获取验证码
 * @param mobile 手机号
 */
function getCode(phone) {
  return request('random/code', {
    params: {
      phone
    }
  })
}

/**
 * 钉钉免登登录
 * @param {string} authCode - 钉钉免登授权码
 * @returns {Promise} 登录结果，包含 token 和用户信息
 */
function dingTalkLogin(authCode) {
  return request({
    url: '/user/dingtalk/login',
    method: 'POST',
    data: {
      authCode
    }
  })
}

/**
 * 扫码登录
 * @param {string} qrCode - 扫码获取的内容
 * @returns {Promise} 登录结果
 */
function scanLogin(qrCode) {
  return request({
    url: '/user/scan/login',
    method: 'POST',
    data: {
      qrCode
    }
  })
}

/**
 * 通过钉钉 authCode 获取用户信息
 * @param {string} authCode - 钉钉免登授权码
 * @returns {Promise} 用户信息
 */
function getDingTalkUserInfo(authCode) {
  return request({
    url: '/user/dingtalk/info',
    method: 'GET',
    params: {
      authCode
    }
  })
}

export default {
  login,
  getCode,
  dingTalkLogin,
  scanLogin,
  getDingTalkUserInfo
}
