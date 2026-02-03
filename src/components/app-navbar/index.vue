<script setup>
/**
 *
 * AppNavbar - 自定义导航栏组件
 * 功能：
 * - 渐变色/纯色背景
 * - 左/中/右插槽自定义
 * - 固定定位
 * - 沉浸式适配
 */
import { computed } from 'vue'

const props = defineProps({
  // 导航栏标题
  title: {
    type: String,
    default: ''
  },
  // 是否显示返回按钮
  showBack: {
    type: Boolean,
    default: true
  },
  // 是否固定在顶部
  isFixed: {
    type: Boolean,
    default: true
  },
  // 是否沉浸式（状态栏是否占用导航栏空间）
  immersive: {
    type: Boolean,
    default: false
  },
  // 返回按钮图标
  backIcon: {
    type: String,
    default: 'arrow-leftward'
  },
  // 标题颜色
  titleColor: {
    type: String,
    default: '#ffffff'
  },
  // 返回按钮颜色
  backIconColor: {
    type: String,
    default: '#ffffff'
  },
  // 标题宽度
  titleWidth: {
    type: [String, Number],
    default: 350
  },
  // 渐变色配置
  gradient: {
    type: Object,
    default: () => ({
      startColor: 'var(--u-type-primary-dark)',
      endColor: 'var(--u-type-primary-disabled)',
      direction: '90deg'
    })
  },
  // 纯色背景（gradient 为 null 时生效）
  backgroundColor: {
    type: String,
    default: 'var(--u-type-primary)'
  },
  // 自定义背景配置（优先级最高）
  background: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['back'])

// 计算背景样式
const navBackground = computed(() => {
  // 自定义背景优先级最高
  if (props.background) {
    return props.background
  }

  // 渐变色
  if (props.gradient) {
    return {
      backgroundColor: props.backgroundColor,
      backgroundImage: `linear-gradient(${props.gradient.direction}, ${props.gradient.startColor}, ${props.gradient.endColor})`
    }
  }

  // 纯色
  return {
    backgroundColor: props.backgroundColor
  }
})

// 返回按钮点击
const handleBack = () => {
  emit('back')
  // 如果没有自定义处理，执行默认返回
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    // 返回首页
    uni.reLaunch({ url: '/pages/tabbar/home/index' })
  }
}
</script>

<template>
  <u-navbar
    :is-back="showBack"
    :title="title"
    :background="navBackground"
    :is-fixed="isFixed"
    :immersive="immersive"
    :back-icon-name="backIcon"
    :title-width="titleWidth"
    :title-color="titleColor"
    :back-icon-color="backIconColor"
    @custom-back="handleBack"
  >
    <!-- 左侧插槽 -->
    <template #left>
      <slot name="left"></slot>
    </template>

    <!-- 中间标题插槽 -->
    <template #center>
      <slot name="center"></slot>
    </template>

    <!-- 右侧插槽 -->
    <template #right>
      <slot name="right"></slot>
    </template>
  </u-navbar>
</template>

<style lang="scss" scoped></style>
