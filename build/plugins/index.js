/**
 * @name createVitePlugins
 * @description 封装plugins数组统一调用
 */
import uniPlugin from '@dcloudio/vite-plugin-uni'
import UniKuRoot from '@uni-ku/root'
import Components from '@uni-helper/vite-plugin-uni-components'
import { AutoImportDeps } from './autoImport'
import { uViewProResolver, ZPagingResolver } from '@uni-helper/vite-plugin-uni-components/resolvers'
export default function createVitePlugins (isBuild) {
  const vitePlugins = [
    AutoImportDeps(),
    // 自动按需引入依赖
    AutoImportDeps(),
    // https://uni-helper.js.org/vite-plugin-uni-components
    Components({
      dts: false,
      resolvers: [ZPagingResolver(), uViewProResolver()],
    }),
    // uni插件
    UniKuRoot(),
    // uni支持(兼容性写法，当type为module时，必须要这样写)
    uniPlugin.default(),
  ]

  if (isBuild) {
    const buildPlugins = []
    vitePlugins.push(...buildPlugins)
  }

  return vitePlugins
}
