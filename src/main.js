import * as Pinia from 'pinia'
import { createSSRApp } from 'vue'

import App from './App.vue'
import plugins from '@/plugins'

export function createApp() {
  const app = createSSRApp(App)

  // 统一注册所有插件
  app.use(plugins)

  return {
    app,
    Pinia
  }
}
