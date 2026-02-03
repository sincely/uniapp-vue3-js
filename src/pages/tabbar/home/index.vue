<template>
  <app-page nav-title="测试" show-nav-back>
    <view class="app-container">
      <Hello />
      <text class="h2">查看其它页面↓</text>
      <view>
        <navigator v-for="(v, idx) in pages" :key="idx" :url="v.url">{{ v.title }}</navigator>
      </view>
      <u-button>默认按钮</u-button>
      <u-button type="primary">主要按钮</u-button>
      <u-button type="success">成功按钮</u-button>
      <u-button type="info">信息按钮</u-button>
      <u-button type="warning">警告按钮</u-button>
      <u-button type="error">危险按钮</u-button>
    </view>
  </app-page>
</template>

<script setup>
import { reactive } from 'vue'
import Hello from '@/components/hello/index.vue'

const pages = reactive([
  {
    title: 'Pinia Demo',
    url: '/pages/pinia/index'
  },
  {
    title: 'Axios Demo',
    url: '/pages/axios/index'
  },
  {
    title: 'uView Demo',
    url: '/pages/uview/index'
  }
])
</script>

<style lang="scss" scoped>
.app-container {
  padding: 32rpx;
  min-height: 100vh;
}

.h2 {
  font-size: 50rpx;
  color: green;
}

navigator {
  color: #1e80ff;
}
</style>
