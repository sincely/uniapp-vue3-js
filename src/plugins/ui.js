import uViewPro, { httpPlugin } from 'uview-pro'
import themes from '@/common/uview-pro.theme'
import { httpInterceptor, httpRequestConfig } from '@/common/http.interceptor'

function setupUI(app) {
  // 配置 uView Pro UI框架
  app.use(uViewPro, {
    theme: {
      themes: themes,
      defaultTheme: 'green',
      defaultDarkMode: 'light'
    },
    locale: 'zh-CN'
  })

  // 配置 HTTP 插件
  app.use(httpPlugin, {
    requestConfig: httpRequestConfig,
    interceptor: httpInterceptor
  })
}

export default setupUI
