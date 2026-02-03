<template>
  <app-page nav-title="测试11" showNavBack showTabbar>
    <view class="app-container">
      <Hello />
      <text class="h2">查看其它页面↓</text>
    </view>
  </app-page>
</template>

<script setup>
import { reactive } from 'vue'
import Hello from '@/components/hello/index.vue'
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
</style>
