<script setup>
import { onLaunch, onShow, onHide, onThemeChange } from '@dcloudio/uni-app'
import { useAppStore } from '@/store'
onLaunch((options) => {
  console.log('App Launch')
  // 初始化 App Store
  const appStore = useAppStore()
  appStore.init()
  appStore.setLaunchOptions(options)

  // #ifdef MP
  // 小程序更新检测
  appStore.checkUpdate()
  // #endif
})
onShow(() => {
  console.log('App Show')
  const appStore = useAppStore()
  appStore.setBackgroundState(false)
})
onHide(() => {
  console.log('App Hide')
  const appStore = useAppStore()
  appStore.setBackgroundState(true)
})
onThemeChange((res) => {
  console.log('[App.vue] system theme changed', res)
  const appStore = useAppStore()
  appStore.setDarkMode(res.theme === 'dark')
})
</script>
<style lang="scss">
@import 'uview-pro/index.scss';
@import '@/styles/index.scss';
</style>
