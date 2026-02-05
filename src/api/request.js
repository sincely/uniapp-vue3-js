import { service } from './service'
function createRequest(service) {
  function request(config) {
    console.log('API baseURL:', import.meta.env.VITE_API_BASE_URL) // 调试用
    // axios默认配置
    const configDefault = {
      baseURL: import.meta.env.VITE_API_BASE_URL, // 所有通过此配置的基础地址 在.env文件配置
      timeout: 15000, // 请求超时时间
      // responseType: 'json', //  支付宝小程序 request 暂不支持 responseType响应类型
      headers: {
        // 请求头配置...
      }
    }
    const requestConfig = Object.assign(configDefault, config)
    return service(requestConfig)
  }
  return request
}

export const request = createRequest(service)
