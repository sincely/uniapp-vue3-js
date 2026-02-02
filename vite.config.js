import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import { createViteProxy } from './build/config'
import createVitePlugins from './build/plugins'
import { resolve } from 'path'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // mode: 区分生产环境还是开发环境
  console.log('command, mode -> ', command, mode)

  const { UNI_PLATFORM } = process.env
  console.log('UNI_PLATFORM -> ', UNI_PLATFORM) // 得到 mp-weixin, h5, app 等

  const env = loadEnv(mode, fileURLToPath(new URL('./env', import.meta.url)))
  console.log('环境变量 env -> ', env)
  console.log('process.env.NODE_ENV -> ', process.env.NODE_ENV)
  const isBuild = process.env.NODE_ENV === 'production'

  // 安全解析布尔值
  const dropConsole = env.VITE_DROP_CONSOLE === 'true'
  const enableProxy = env.VITE_APP_PROXY === 'true'
  console.log('enableProxy -> ', enableProxy)
  return {
    // 自定义env目录
    envDir: './env',
    resolve: {
      // 设置别名
      alias: {
        '@': resolve(__dirname, './src'),
        '@/styles': resolve(__dirname, 'src/styles'),
        '@/views': resolve(__dirname, 'src/views'),
        '@/components': resolve(__dirname, 'src/components'),
        '@/utils': resolve(__dirname, 'src/utils'),
        '@/assets': resolve(__dirname, 'src/assets'),
        '@/store': resolve(__dirname, 'src/store')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', 'vue'] // 默认支持
    },
    // vite 相关配置
    server: {
      port: Number.parseInt(env.VITE_APP_PORT, 10),
      hmr: true,
      host: true,
      open: true,
      proxy: enableProxy ? createViteProxy(env) : undefined
    },
    plugins: createVitePlugins(isBuild),
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "uview-pro/theme.scss";'
        }
      }
    },
    esbuild: {
      drop: dropConsole ? ['console', 'debugger'] : []
    },
    build: {
      // 忽略空 chunk 警告
      chunkSizeWarningLimit: 1000,
      rollupOptions: {}
    }
  }
})
