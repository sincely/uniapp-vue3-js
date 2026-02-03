<script setup>
/**
 * ====================================
 * AppPage - 页面容器组件
 * ====================================
 * 功能：
 * - 统一页面布局
 * - 集成导航栏和 TabBar
 * - 页面过渡动画
 */
import { $u } from 'uview-pro'

defineProps({
  // ======== 导航栏配置 ========
  navTitle: {
    type: String,
    default: ''
  },
  showNavBack: {
    type: Boolean,
    default: true
  },
  hideNav: {
    type: Boolean,
    default: false
  },
  // 导航栏渐变色配置
  navGradient: {
    type: Object,
    default: () => ({
      startColor: 'var(--u-type-primary-dark)',
      endColor: 'var(--u-type-primary-disabled)',
      direction: '90deg'
    })
  },
  // 导航栏纯色背景
  navBackground: {
    type: String,
    default: 'var(--u-type-primary)'
  },

  // ======== 页面配置 ========
  showTabbar: {
    type: Boolean,
    default: false
  },
  customStyle: {
    type: [String, Object],
    default: ''
  },
  customClass: {
    type: [String, Object],
    default: ''
  },
  // 是否启用页面过渡动画
  transition: {
    type: Boolean,
    default: true
  },
  // 过渡动画名称
  transitionName: {
    type: String,
    default: 'slide-left'
  }
})
</script>

<template>
  <view class="app-page" :class="[customClass, { 'has-tabbar': showTabbar }]" :style="$u.toStyle(customStyle)">
    <!-- #ifndef MP-ALIPAY -->
    <app-navbar
      v-if="!hideNav"
      :title="navTitle"
      :show-back="showNavBack && !showTabbar"
      :gradient="navGradient"
      :background-color="navBackground"
    >
      <template #left>
        <slot name="nav-left"></slot>
      </template>
      <template #center>
        <slot name="nav-center"></slot>
      </template>
      <template #right>
        <slot name="nav-right"></slot>
      </template>
    </app-navbar>
    <!-- #endif -->
    <!-- 页面内容 -->
    <u-transition v-if="transition" :name="transitionName" :appear="true">
      <slot />
    </u-transition>
    <template v-else>
      <slot />
    </template>

    <!-- 底部 TabBar -->
    <app-tabbar v-if="showTabbar" />
  </view>
</template>

<style lang="scss" scoped>
.app-page {
  width: 100%;
  min-height: 100vh;
  overflow-y: auto;
  background-color: $u-bg-white;
  -webkit-font-smoothing: antialiased;
  color: $u-main-color;
  transition: background 0.3s ease;

  &.has-tabbar {
    background-image: linear-gradient(
      135deg,
      rgba(var(--u-type-primary-rgb, 41, 121, 255), 0.04) 0%,
      rgba(var(--u-type-success-rgb, 25, 190, 107), 0.04) 40%,
      rgba(var(--u-type-warning-rgb, 255, 153, 0), 0.04) 100%
    );
  }
}
</style>
