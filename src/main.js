import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import plugins from '@/plugins'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)

  // 统一注册所有插件
  app.use(plugins)

  return {
    app,
    Pinia
  }
}
