/**
 * @name createVitePlugins
 * @description 封装plugins数组统一调用
 */
import uniPlugin from '@dcloudio/vite-plugin-uni'
import UniKuRoot from '@uni-ku/root'
import Components from '@uni-helper/vite-plugin-uni-components'
import ViteRestart from 'vite-plugin-restart'
import { AutoImportDeps } from './autoImport'
import { uViewProResolver, ZPagingResolver } from '@uni-helper/vite-plugin-uni-components/resolvers'

export default function createVitePlugins(isBuild) {
  const vitePlugins = [
    AutoImportDeps(),
    // https://uni-helper.js.org/vite-plugin-uni-components
    Components({
      dts: false,
      resolvers: [ZPagingResolver(), uViewProResolver()]
    }),
    // uni插件
    UniKuRoot(),
    // uni支持(兼容性写法，当type为module时，必须要这样写)
    uniPlugin.default()
  ]

  // 开发环境添加自动重启插件
  if (!isBuild) {
    vitePlugins.push(ViteRestart())
  }

  if (isBuild) {
    const buildPlugins = []
    vitePlugins.push(...buildPlugins)
  }

  return vitePlugins
}
