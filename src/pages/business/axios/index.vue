<template>
  <app-page nav-title="pinia" show-nav-back>
    <view class="app-container">
      <view class="h1">Axios Page</view>
      <u-input v-model="phone" type="number" />
      <u-button @click="getCode">获取验证码(GET)</u-button>
    </view>
  </app-page>
</template>
<script setup>
import { ref } from 'vue'

const phone = ref('12345678901')
</script>

<style lang="scss">
.app-container {
  padding: 32rpx;
  min-height: 100vh;
}

.h1 {
  font-size: 50rpx;
}
</style>
