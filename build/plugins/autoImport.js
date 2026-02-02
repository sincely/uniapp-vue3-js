/**
 * @name AutoImportDeps
 * @description 按需加载，自动引入
 */
import AutoImport from 'unplugin-auto-import/vite'

export const AutoImportDeps = () => {
  return AutoImport({
    imports: [
      'vue',
      'uni-app',
      'pinia',
      // uni-app 组合式 API 预设
      {
        '@dcloudio/uni-app': [
          'onLoad',
          'onShow',
          'onHide',
          'onPullDownRefresh',
          'onReachBottom',
          'onShareAppMessage',
          'useRouter',
          'useRoute'
        ]
      }
    ],
    dts: false,
    // 自动导入目录下的模块导出
    dirs: ['src/composables', 'src/utils', 'src/hooks'],
    vueTemplate: true,
    // 生成对应的 .eslintrc-auto-import.json
    eslintrc: {
      enabled: false,
      filepath: './.eslintrc-auto-import.json',
      globalsPropValue: true
    }
  })
}
