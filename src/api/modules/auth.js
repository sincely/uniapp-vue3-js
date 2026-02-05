import { request } from '../request'
/**
 * @description 扫码登录
 * @export scanQrcode
 * @param {*} ticket
 */
function scanQrcode(text) {
  return request({
    url: '/dingtalk/scan_qrcode',
    method: 'get',
    params: {
      ticket: text
    }
  })
}

/**
 * @description 扫码授权
 * @export scanQrcode
 * @param {*} ticket
 */
function verifyQrcode(params) {
  return request({
    url: '/dingtalk/verify_qrcode',
    method: 'get',
    params
  })
}

export default {
  scanQrcode,
  verifyQrcode
}
