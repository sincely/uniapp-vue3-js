<template>
  <app-page nav-title="测试11" :showNavBack="false" showTabbar>
    <view class="app-container">
      <text class="h2">查看其它页面↓</text>
      <view>
        <navigator v-for="v in pages" :key="v.id" :url="v.url">{{ v.title }}</navigator>
      </view>
    </view>
  </app-page>
</template>

<script setup>
import { reactive } from 'vue'
import Hello from '@/components/hello/index.vue'

const pages = reactive([
  {
    title: 'Pinia Demo',
    url: '/pages/business/pinia/index',
    id: 1
  },
  {
    title: 'Axios Demo',
    url: '/pages/business/axios/index',
    id: 2
  },
  {
    title: 'uView Demo',
    url: '/pages/business/uview/index',
    id: 3
  }
])
</script>

<style lang="scss" scoped>
.app-container {
  padding: 32rpx;
  min-height: 100vh;
}
</style>
