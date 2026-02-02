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
export default {
  login,
  getCode
}
