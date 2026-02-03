<template>
  <app-page
    nav-title="导航栏示例"
    :show-nav-back="true"
    :nav-gradient="{
      startColor: '#667eea',
      endColor: '#764ba2',
      direction: '135deg'
    }"
  >
    <view class="demo-container">
      <view class="section">
        <text class="title">基础用法</text>
        <text class="desc">默认渐变色导航栏</text>
      </view>
    </view>
  </app-page>
</template>

<script setup></script>

<style lang="scss" scoped>
.demo-container {
  padding: 40rpx;
}

.section {
  margin-bottom: 40rpx;

  .title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
    color: #333;
  }

  .desc {
    display: block;
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
  }
}
</style>
