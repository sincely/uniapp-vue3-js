import axios from 'axios'
import { createUniAppAxiosAdapter } from '@uni-helper/axios-adapter'
import { httpLogError, requestError, throttleToLogin } from './utils'
export function createService() {
  const request = axios.create({ adapter: createUniAppAxiosAdapter() })
  request.interceptors.request.use(
    (request) => {
      // 调试：打印请求信息
      console.log('🚀 Request:', {
        url: request.baseURL + request.url,
        method: request.method,
        data: request.data
      })
      return request
    },
    (err) => {
      return Promise.reject(err)
    }
  )

  request.interceptors.response.use(
    (response) => {
      const dataAxios = response.data
      // 这个状态码是和后端约定的
      const { code, data } = dataAxios
      // 根据 code 进行判断
      if (code === undefined) {
        return dataAxios
      } else {
        // 目前和公司后端口头约定是字符串,以防万一强制转字符串
        switch (`${code}`) {
          // code === 200 | 2 代表没有错误
          case '200':
            return data
          // code === 400001004 代表token 过期打回登录页
          case '400001004':
            throttleToLogin()
            break
          case '400':
            // 不是正确的 code
            return requestError(response)
          case '401':
            // 错误登录
            return throttleToLogin()
          default:
            // 不是正确的 code
            return requestError(response)
        }
      }
    },
    (error) => {
      // 详细打印错误信息
      console.log('❌ Request Error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      })
      const status = error.response?.status
      switch (status) {
        // TODO 再考虑下怎么判断是跨域问题
        case undefined:
        case null:
          httpLogError(error, '网路错误或跨域')
          break
        case 400:
          httpLogError(error, '请求错误')
          break
        case 401:
          httpLogError(error, '未授权，请登录')
          break
        case 403:
          httpLogError(error, '拒绝访问')
          break
        case 404:
          httpLogError(error, `请求地址出错: ${error.response.config.url}`)
          break
        case 408:
          httpLogError(error, '请求超时')
          break
        case 500:
          httpLogError(error, '服务器内部错误')
          break
        case 501:
          httpLogError(error, '服务未实现')
          break
        case 502:
          httpLogError(error, '网关错误')
          break
        case 503:
          httpLogError(error, '服务不可用')
          break
        case 504:
          httpLogError(error, '网关超时')
          break
        case 505:
          httpLogError(error, 'HTTP版本不受支持')
          break
        default:
          httpLogError(error, '请求错误')
          break
      }
      return Promise.reject(error)
    }
  )
  return request
}

export const service = createService()
