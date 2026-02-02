import * as Pinia from 'pinia'
import { createSSRApp } from 'vue'

import App from './App.vue'
import uViewPro, { httpPlugin } from 'uview-pro'
import themes from '@/common/uview-pro.theme'
import store from '@/store'
import { httpInterceptor, httpRequestConfig } from './common/http.interceptor'
export function createApp() {
  const app = createSSRApp(App)
  app.use(uViewPro, {
    theme: {
      themes: themes,
      defaultTheme: 'green',
      defaultDarkMode: 'light'
    },
    locale: 'zh-CN'
  })
  app.use(httpPlugin, {
    requestConfig: httpRequestConfig,
    interceptor: httpInterceptor
  })
  app.use(store)
  return {
    app,
    Pinia
  }
}
