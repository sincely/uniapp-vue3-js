import { service } from './service'
function createRequest(service) {
  function request(urlOrConfig) {
    const inputConfig = urlOrConfig

    // axios默认配置
    let baseURL = import.meta.env.VITE_API_BASE_URL
    // #ifdef H5
    // H5 开发环境可使用 Vite proxy，通过前缀转发（例如 /api）
    if (
      import.meta.env.VITE_APP_PROXY &&
      JSON.parse(import.meta.env.VITE_APP_PROXY) &&
      import.meta.env.VITE_API_PREFIX
    ) {
      baseURL = import.meta.env.VITE_API_PREFIX
    }
    // #endif

    const configDefault = {
      baseURL,
      timeout: 15000,
      responseType: 'json',
      headers: {}
    }

    const requestConfig = Object.assign(configDefault, inputConfig)
    return service(requestConfig)
  }
  return request
}

export const request = createRequest(service)
