<template>
  <app-page nav-title="pinia" show-nav-back>
    <view class="app-container">
      <view class="pinia-demo">
        <view class="h2">Pinia(Replace Vuex)</view>
      </view>
    </view>
  </app-page>
</template>
<script setup></script>
<style lang="scss" scoped>
.app-container {
  padding: 32rpx;
  min-height: 100vh;
}

.pinia-demo {
  text-align: center;

  .h2 {
    font-size: 40rpx;
    color: red;
  }

  .h3 {
    font-weight: bold;
  }
}
</style>
