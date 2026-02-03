<template>
  <view class="error-container">
    <view class="error-content">
      <view class="error-icon">404</view>
      <view class="error-title">页面不存在</view>
      <view class="error-desc">抱歉，您访问的页面不存在或已被删除</view>

      <view class="error-actions">
        <u-button type="primary" @click="goHome">返回首页</u-button>
        <u-button plain style="margin-top: 20rpx" @click="goBack">返回上一页</u-button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { HOME_PATH } from '@/router'

const goHome = () => {
  uni.reLaunch({
    url: HOME_PATH
  })
}

const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    goHome()
  }
}
</script>

<style lang="scss" scoped>
.error-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  background: #f5f5f5;
}

.error-content {
  text-align: center;
  width: 100%;
  max-width: 600rpx;
}

.error-icon {
  font-size: 160rpx;
  font-weight: bold;
  color: #e0e0e0;
  line-height: 1;
  margin-bottom: 40rpx;
}

.error-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.error-desc {
  font-size: 28rpx;
  color: #999;
  line-height: 1.6;
  margin-bottom: 60rpx;
}

.error-actions {
  padding: 0 40rpx;

  :deep(.u-button) {
    width: 100%;
  }
}
</style>
