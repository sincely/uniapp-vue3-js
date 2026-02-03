<script setup>
import { onLaunch, onShow, onHide, onThemeChange } from '@dcloudio/uni-app'
import { mpUpdate } from '@/utils/updateVersion'
onLaunch(() => {
  console.log('App Launch')
  // #ifdef MP-WEIXIN
  mpUpdate()
  // #endif
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
onThemeChange((res) => {
  console.log('[App.vue] system theme changed', res)
})
</script>
<style lang="scss">
@import 'uview-pro/index.scss';
@import '@/styles/index.scss';
</style>
