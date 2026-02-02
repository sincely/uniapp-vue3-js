/**
 * vite-plugin-restart
 * 监听文件变化自动重启 Vite 服务
 * https://github.com/antfu/vite-plugin-restart
 */
import ViteRestart from 'vite-plugin-restart'

export default function createRestart() {
  return ViteRestart({
    // 监听这些文件变化时重启 Vite 服务
    restart: [
      // 环境变量文件
      'env/.env',
      'env/.env.*',
      // Vite 配置
      'vite.config.js',
      // 构建配置
      'build/**/*',
      // 包管理配置
      'package.json',
      // uni-app 配置
      'src/manifest.json',
      'src/pages.json'
    ],
    // 监听这些文件变化时刷新页面（不重启服务）
    reload: [
      // 静态资源
      'src/static/**/*'
    ]
  })
}
