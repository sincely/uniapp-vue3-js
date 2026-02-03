# AppPage 组件 - 自定义导航栏

## 功能特性

- ✅ 支持渐变色背景
- ✅ 支持纯色背景
- ✅ 支持左、中、右插槽自定义
- ✅ 自动适配 TabBar 页面
- ✅ 支持自定义样式
- ✅ 平滑过渡动画

## 基础用法

### 1. 默认导航栏（渐变色）

```vue
<template>
  <app-page nav-title="页面标题">
    <view>页面内容</view>
  </app-page>
</template>
```

**效果：** 蓝紫渐变导航栏 + 返回按钮 + 标题

### 2. 自定义渐变色

```vue
<template>
  <app-page
    nav-title="自定义渐变"
    :nav-gradient="{
      startColor: '#667eea',
      endColor: '#764ba2',
      direction: '135deg'
    }"
  >
    <view>页面内容</view>
  </app-page>
</template>
```

### 3. 纯色背景

```vue
<template>
  <app-page
    nav-title="纯色背景"
    nav-background="#ff6600"
    :nav-gradient="null"
  >
    <view>页面内容</view>
  </app-page>
</template>
```

### 4. 隐藏导航栏

```vue
<template>
  <app-page :hide-nav="true">
    <view>无导航栏页面</view>
  </app-page>
</template>
```

### 5. TabBar 页面

```vue
<template>
  <app-page
    nav-title="首页"
    :show-nav-back="false"
    :show-tabbar="true"
  >
    <view>首页内容</view>
  </app-page>
</template>
```

## 插槽自定义

### 左侧插槽

```vue
<template>
  <app-page nav-title="自定义左侧">
    <!-- 自定义左侧内容 -->
    <template #nav-left>
      <view class="custom-left" @click="handleClick">
        <u-icon name="home" color="#fff" size="20"></u-icon>
        <text class="text">首页</text>
      </view>
    </template>

    <view>页面内容</view>
  </app-page>
</template>

<script setup>
const handleClick = () => {
  uni.reLaunch({ url: '/pages/tabbar/home/index' })
}
</script>

<style scoped>
.custom-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 0 20rpx;
}

.text {
  color: #fff;
  font-size: 28rpx;
}
</style>
```

### 中间标题插槽

```vue
<template>
  <app-page>
    <!-- 自定义标题样式 -->
    <template #nav-center>
      <view class="custom-title">
        <u-icon name="star-fill" color="#FFD700" size="18"></u-icon>
        <text class="title-text">VIP专享</text>
        <u-icon name="star-fill" color="#FFD700" size="18"></u-icon>
      </view>
    </template>

    <view>页面内容</view>
  </app-page>
</template>

<style scoped>
.custom-title {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.title-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}
</style>
```

### 右侧插槽

```vue
<template>
  <app-page nav-title="购物车">
    <!-- 自定义右侧按钮 -->
    <template #nav-right>
      <view class="custom-right">
        <u-icon
          name="search"
          color="#fff"
          size="20"
          @click="handleSearch"
        ></u-icon>
        <u-icon
          name="share"
          color="#fff"
          size="20"
          @click="handleShare"
          style="margin-left: 20rpx;"
        ></u-icon>
      </view>
    </template>

    <view>页面内容</view>
  </app-page>
</template>

<script setup>
const handleSearch = () => {
  console.log('搜索')
}

const handleShare = () => {
  console.log('分享')
}
</script>

<style scoped>
.custom-right {
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}
</style>
```

### 组合使用

```vue
<template>
  <app-page
    :nav-gradient="{
      startColor: '#FF416C',
      endColor: '#FF4B2B',
      direction: '45deg'
    }"
  >
    <!-- 左侧：返回+首页 -->
    <template #nav-left>
      <view class="left-box">
        <u-icon name="arrow-left" color="#fff" size="20" @click="goBack"></u-icon>
        <view class="divider"></view>
        <u-icon name="home" color="#fff" size="20" @click="goHome"></u-icon>
      </view>
    </template>

    <!-- 中间：搜索框 -->
    <template #nav-center>
      <view class="search-box" @click="handleSearch">
        <u-icon name="search" color="#999" size="16"></u-icon>
        <text class="search-text">搜索商品</text>
      </view>
    </template>

    <!-- 右侧：购物车 -->
    <template #nav-right>
      <view class="cart-box" @click="goCart">
        <u-icon name="shopping-cart" color="#fff" size="20"></u-icon>
        <view class="badge">3</view>
      </view>
    </template>

    <view>页面内容</view>
  </app-page>
</template>

<script setup>
const goBack = () => uni.navigateBack()
const goHome = () => uni.reLaunch({ url: '/pages/tabbar/home/index' })
const handleSearch = () => console.log('搜索')
const goCart = () => uni.navigateTo({ url: '/pages/cart/index' })
</script>

<style scoped>
.left-box {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 0 20rpx;
}

.divider {
  width: 1px;
  height: 30rpx;
  background: rgba(255, 255, 255, 0.3);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 10rpx 30rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 40rpx;
  width: 400rpx;
}

.search-text {
  color: #999;
  font-size: 28rpx;
}

.cart-box {
  position: relative;
  padding: 0 20rpx;
}

.badge {
  position: absolute;
  top: -10rpx;
  right: 10rpx;
  background: #ff0000;
  color: #fff;
  font-size: 20rpx;
  padding: 2rpx 8rpx;
  border-radius: 20rpx;
  min-width: 30rpx;
  text-align: center;
}
</style>
```

## Props 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| navTitle | String | 'uView Pro' | 导航栏标题 |
| showNavBack | Boolean | true | 是否显示返回按钮 |
| hideNav | Boolean | false | 是否隐藏整个导航栏 |
| showTabbar | Boolean | false | 是否显示底部TabBar |
| customStyle | String/Object | '' | 自定义页面样式 |
| customClass | String/Object | '' | 自定义页面类名 |
| navGradient | Object | 见下方 | 导航栏渐变色配置 |
| navBackground | String | 'var(--u-type-primary)' | 导航栏纯色背景 |

### navGradient 对象结构

```javascript
{
  startColor: '#667eea',      // 渐变起始色
  endColor: '#764ba2',        // 渐变结束色
  direction: '90deg'          // 渐变方向
}
```

**渐变方向示例：**
- `'90deg'` - 从左到右
- `'180deg'` - 从上到下
- `'135deg'` - 斜角渐变
- `'45deg'` - 反向斜角

## 插槽 Slots

| 插槽名 | 说明 |
|--------|------|
| default | 页面主要内容 |
| nav-left | 导航栏左侧区域 |
| nav-center | 导航栏中间标题区域 |
| nav-right | 导航栏右侧区域 |

## 渐变色方案推荐

### 1. 清新蓝绿

```javascript
{
  startColor: '#11998e',
  endColor: '#38ef7d',
  direction: '135deg'
}
```

### 2. 浪漫粉紫

```javascript
{
  startColor: '#ee0979',
  endColor: '#ff6a00',
  direction: '90deg'
}
```

### 3. 科技蓝紫

```javascript
{
  startColor: '#667eea',
  endColor: '#764ba2',
  direction: '135deg'
}
```

### 4. 日落橙红

```javascript
{
  startColor: '#FF416C',
  endColor: '#FF4B2B',
  direction: '45deg'
}
```

### 5. 深海蓝

```javascript
{
  startColor: '#2193b0',
  endColor: '#6dd5ed',
  direction: '180deg'
}
```

### 6. 森林绿

```javascript
{
  startColor: '#134e5e',
  endColor: '#71b280',
  direction: '90deg'
}
```

## 完整示例

### 电商商品详情页

```vue
<template>
  <app-page
    :nav-gradient="{
      startColor: '#FF6B6B',
      endColor: '#FFE66D',
      direction: '135deg'
    }"
  >
    <template #nav-left>
      <view class="nav-left">
        <u-icon name="arrow-left" color="#fff" size="22" @click="goBack"></u-icon>
      </view>
    </template>

    <template #nav-center>
      <view class="nav-tabs">
        <text
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-item', { active: currentTab === tab.id }]"
          @click="switchTab(tab.id)"
        >
          {{ tab.name }}
        </text>
      </view>
    </template>

    <template #nav-right>
      <view class="nav-right">
        <u-icon name="share-square" color="#fff" size="20" @click="share"></u-icon>
        <u-icon name="more-dot-fill" color="#fff" size="20" @click="showMore"></u-icon>
      </view>
    </template>

    <view class="product-detail">
      <!-- 商品详情内容 -->
    </view>
  </app-page>
</template>

<script setup>
import { ref } from 'vue'

const tabs = [
  { id: 1, name: '商品' },
  { id: 2, name: '详情' },
  { id: 3, name: '评价' }
]

const currentTab = ref(1)

const goBack = () => uni.navigateBack()
const switchTab = (id) => currentTab.value = id
const share = () => console.log('分享')
const showMore = () => console.log('更多')
</script>

<style scoped>
.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 0 20rpx;
}

.nav-tabs {
  display: flex;
  gap: 40rpx;
}

.tab-item {
  color: rgba(255, 255, 255, 0.7);
  font-size: 28rpx;
  transition: all 0.3s;

  &.active {
    color: #fff;
    font-weight: bold;
    font-size: 32rpx;
  }
}
</style>
```

## 注意事项

1. **插槽优先级**
   - 使用插槽时，对应的 prop 配置会失效
   - 例如使用 `nav-center` 插槽后，`navTitle` 无效

2. **渐变色设置**
   - 设置 `navGradient` 为 `null` 可禁用渐变
   - 渐变色优先级高于纯色背景

3. **TabBar 页面**
   - TabBar 页面应设置 `showTabbar="true"`
   - 同时设置 `showNavBack="false"` 隐藏返回按钮

4. **性能优化**
   - 避免在插槽中使用过于复杂的组件
   - 合理使用 v-show 和 v-if

5. **兼容性**
   - 渐变色在所有平台都支持
   - 插槽功能在所有平台都可用
