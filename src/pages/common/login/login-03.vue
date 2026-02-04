<template>
  <view class="login-container">
    <!-- 科技感背景 -->
    <view class="bg" aria-hidden="true">
      <view class="grid-lines"></view>
      <view class="scan-line"></view>
      <view class="glow glow-1"></view>
      <view class="glow glow-2"></view>
      <view class="particles">
        <view v-for="i in 12" :key="i" class="particle" :class="`p-${i}`"></view>
      </view>
    </view>

    <view class="login-box" :class="{ entered }">
      <view class="box-border"></view>
      <view class="corner corner-tl"></view>
      <view class="corner corner-tr"></view>
      <view class="corner corner-bl"></view>
      <view class="corner corner-br"></view>

      <view class="logo">
        <view class="logo-icon">
          <view class="hex"></view>
          <view class="hex hex-inner"></view>
        </view>
        <text class="logo-text">SYSTEM LOGIN</text>
        <text class="logo-sub">身份验证 · 安全接入</text>
      </view>

      <view class="mode-switch">
        <view class="mode-indicator" :style="modeIndicatorStyle"></view>
        <view class="mode-item" :class="{ active: mode === 'wechat' }" @click="mode = 'wechat'">
          <text class="mode-icon">◈</text>
          微信快捷
        </view>
        <view class="mode-item" :class="{ active: mode === 'sms' }" @click="mode = 'sms'">
          <text class="mode-icon">◇</text>
          验证码
        </view>
      </view>

      <view class="form">
        <transition name="fade-slide" mode="out-in">
          <view :key="mode" class="panel">
            <view v-if="mode === 'wechat'" class="wechat-area">
              <view class="tech-illu" aria-hidden="true">
                <view class="illu-ring ring-1"></view>
                <view class="illu-ring ring-2"></view>
                <view class="illu-ring ring-3"></view>
                <view class="illu-core">
                  <view class="core-inner"></view>
                </view>
                <view class="illu-dot dot-1"></view>
                <view class="illu-dot dot-2"></view>
                <view class="illu-dot dot-3"></view>
              </view>

              <!-- #ifdef MP-WEIXIN -->
              <view class="form-item">
                <u-button
                  type="primary"
                  :loading="loading"
                  openType="getPhoneNumber"
                  @getphonenumber="onGetPhoneNumber"
                >
                  <text class="btn-icon">⬡</text>
                  获取微信手机号登录
                </u-button>
              </view>
              <!-- #endif -->

              <!-- #ifndef MP-WEIXIN -->
              <view class="tips">
                <text class="tip-text">[ 当前终端不支持微信快捷登录 ]</text>
              </view>
              <!-- #endif -->

              <view class="tips">
                <text class="tip-text">◈ 使用微信绑定手机号进行身份验证</text>
              </view>
            </view>

            <view v-else class="sms-area">
              <view class="form-item">
                <view class="input-wrapper">
                  <text class="input-label">PHONE</text>
                  <u-input
                    v-model="smsForm.phone"
                    placeholder="输入手机号码"
                    prefixIcon="phone"
                    :clearable="true"
                    type="number"
                  />
                </view>
              </view>

              <view class="form-item code-row">
                <view class="code-input">
                  <view class="input-wrapper">
                    <text class="input-label">CODE</text>
                    <u-input
                      v-model="smsForm.code"
                      placeholder="输入验证码"
                      prefixIcon="email"
                      :clearable="true"
                      type="number"
                    />
                  </view>
                </view>
                <view class="code-btn">
                  <u-button
                    type="primary"
                    :disabled="sending || countdown > 0 || !isValidPhone"
                    :loading="sending"
                    @click="handleSendCode"
                  >
                    {{ countdown > 0 ? `${countdown}s` : '发送' }}
                  </u-button>
                </view>
              </view>

              <view class="form-item">
                <u-button
                  type="primary"
                  :loading="loading"
                  :disabled="!isValidPhone || !smsForm.code"
                  @click="handleSmsLogin"
                >
                  <text class="btn-icon">►</text>
                  验证登录
                </u-button>
              </view>

              <view class="tips">
                <text class="tip-text">[ DEV MODE ] 测试验证码: 123456</text>
              </view>
            </view>
          </view>
        </transition>
      </view>

      <view class="status-bar">
        <text class="status-dot"></text>
        <text class="status-text">SECURE CONNECTION</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRequest } from '@/api'
import { setToken } from '@/utils/auth'
import { HOME_PATH } from '@/router'

const mode = ref('wechat')
const loading = ref(false)

const entered = ref(false)

const smsForm = ref({
  phone: '',
  code: ''
})

const sending = ref(false)
const countdown = ref(0)
let countdownTimer = null

const api = useRequest?.() || {}
const wechatPhoneLoginApi = api.wechatPhoneLogin
const sendSmsCodeApi = api.sendSmsCode
const smsLoginApi = api.smsLogin

const isValidPhone = computed(() => /^1[3-9]\d{9}$/.test(String(smsForm.value.phone || '')))

const modeIndicatorStyle = computed(() => {
  const x = mode.value === 'wechat' ? 0 : 1
  return {
    transform: `translateX(${x * 100}%)`
  }
})

onMounted(() => {
  // 让卡片有一个“入场”动画
  setTimeout(() => {
    entered.value = true
  }, 30)
})

// 获取重定向路径
const getRedirectPath = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage?.$page?.options || {}
  return options.redirect ? decodeURIComponent(options.redirect) : HOME_PATH
}

const goAfterLogin = () => {
  const redirectPath = getRedirectPath()
  setTimeout(() => {
    uni.reLaunch({
      url: redirectPath
    })
  }, 300)
}

// #ifdef MP-WEIXIN
const onGetPhoneNumber = async (e) => {
  const detail = e?.detail || e || {}
  const phoneCode = detail?.code
  const encryptedData = detail?.encryptedData
  const iv = detail?.iv
  const errMsg = detail?.errMsg || ''
  // 打印出信息
  console.log('getPhoneNumber detail:', detail)

  if (!phoneCode && !encryptedData) {
    const denied = typeof errMsg === 'string' && errMsg.includes('deny')
    uni.showToast({
      title: denied ? '已取消授权' : '未获取到手机号凭证',
      icon: 'none'
    })
    console.warn('getPhoneNumber 返回：', detail)
    return
  }
  if (!wechatPhoneLoginApi) {
    uni.showToast({
      title: '未配置登录接口',
      icon: 'none'
    })
    return
  }

  try {
    loading.value = true

    // 获取 wx.login code（部分后端会用到）
    const wxCode = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: (res) => resolve(res.code),
        fail: reject
      })
    })

    const result = await wechatPhoneLoginApi({ phoneCode, encryptedData, iv, wxCode })
    const token = result?.token || result?.accessToken
    if (!token) {
      throw new Error('登录接口未返回 token')
    }

    setToken(token)
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })
    goAfterLogin()
  } catch (error) {
    console.error('微信手机号登录失败:', error)
    uni.showToast({
      title: error?.message || '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
// #endif

const startCountdown = (seconds = 60) => {
  countdown.value = seconds
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
      countdown.value = 0
    }
  }, 1000)
}

const handleSendCode = async () => {
  if (!isValidPhone.value) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }
  if (!sendSmsCodeApi) {
    uni.showToast({
      title: '未配置验证码接口',
      icon: 'none'
    })
    return
  }

  try {
    sending.value = true
    await sendSmsCodeApi(smsForm.value.phone)
    uni.showToast({
      title: '验证码已发送',
      icon: 'success'
    })
    startCountdown(60)
  } catch (error) {
    console.error('发送验证码失败:', error)
    uni.showToast({
      title: error?.message || '发送失败',
      icon: 'none'
    })
  } finally {
    sending.value = false
  }
}

const handleSmsLogin = async () => {
  if (!isValidPhone.value || !smsForm.value.code) return
  if (!smsLoginApi) {
    uni.showToast({
      title: '未配置登录接口',
      icon: 'none'
    })
    return
  }

  try {
    loading.value = true
    const result = await smsLoginApi(smsForm.value.phone, smsForm.value.code)
    const token = result?.token || result?.accessToken
    if (!token) {
      throw new Error('登录接口未返回 token')
    }

    setToken(token)
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })
    goAfterLogin()
  } catch (error) {
    console.error('验证码登录失败:', error)
    uni.showToast({
      title: error?.message || '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = null
})
</script>

<style lang="scss" scoped>
// 科技感配色
$primary: #00f0ff;
$secondary: #a855f7;
$accent: #22d3ee;
$dark: #0a0e17;
$dark-card: rgba(10, 14, 23, 0.92);

.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e17 0%, #1a1f35 50%, #0d1321 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 44rpx;
  position: relative;
  overflow: hidden;
}

// 背景动效
.bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;

  .grid-lines {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba($primary, 0.03) 1rpx, transparent 1rpx),
      linear-gradient(90deg, rgba($primary, 0.03) 1rpx, transparent 1rpx);
    background-size: 60rpx 60rpx;
    animation: gridMove 20s linear infinite;
  }

  .scan-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 4rpx;
    background: linear-gradient(90deg, transparent, rgba($primary, 0.6), transparent);
    animation: scanDown 3s ease-in-out infinite;
    box-shadow: 0 0 30rpx rgba($primary, 0.5);
  }

  .glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(120rpx);
    opacity: 0.4;
  }

  .glow-1 {
    width: 600rpx;
    height: 600rpx;
    left: -200rpx;
    top: -100rpx;
    background: radial-gradient(circle, rgba($primary, 0.5), transparent 70%);
    animation: glowPulse 4s ease-in-out infinite;
  }

  .glow-2 {
    width: 500rpx;
    height: 500rpx;
    right: -150rpx;
    bottom: 100rpx;
    background: radial-gradient(circle, rgba($secondary, 0.5), transparent 70%);
    animation: glowPulse 5s ease-in-out infinite reverse;
  }

  .particles {
    position: absolute;
    inset: 0;
  }

  .particle {
    position: absolute;
    width: 4rpx;
    height: 4rpx;
    background: $primary;
    border-radius: 50%;
    box-shadow: 0 0 10rpx $primary;
    animation: particleFloat 8s ease-in-out infinite;

    @for $i from 1 through 12 {
      &.p-#{$i} {
        left: random(100) * 1%;
        top: random(100) * 1%;
        animation-delay: -#{$i * 0.6}s;
        animation-duration: #{5 + random(5)}s;
      }
    }
  }
}

// 登录卡片
.login-box {
  width: 100%;
  max-width: 620rpx;
  background: $dark-card;
  border-radius: 8rpx;
  padding: 64rpx 44rpx;
  position: relative;
  transform: translateY(30rpx);
  opacity: 0;
  transition: all 500ms cubic-bezier(0.2, 0.9, 0.2, 1);
  backdrop-filter: blur(20rpx);

  &.entered {
    transform: translateY(0);
    opacity: 1;
  }

  .box-border {
    position: absolute;
    inset: 0;
    border: 1rpx solid rgba($primary, 0.3);
    border-radius: 8rpx;
    pointer-events: none;

    &::before {
      content: '';
      position: absolute;
      inset: -1rpx;
      border: 1rpx solid transparent;
      border-radius: 8rpx;
      background: linear-gradient(135deg, rgba($primary, 0.5), transparent 50%, rgba($secondary, 0.3)) border-box;
      mask:
        linear-gradient(#fff 0 0) padding-box,
        linear-gradient(#fff 0 0);
      mask-composite: exclude;
    }
  }

  .corner {
    position: absolute;
    width: 24rpx;
    height: 24rpx;
    border-color: $primary;
    border-style: solid;

    &-tl {
      top: -2rpx;
      left: -2rpx;
      border-width: 3rpx 0 0 3rpx;
    }
    &-tr {
      top: -2rpx;
      right: -2rpx;
      border-width: 3rpx 3rpx 0 0;
    }
    &-bl {
      bottom: -2rpx;
      left: -2rpx;
      border-width: 0 0 3rpx 3rpx;
    }
    &-br {
      bottom: -2rpx;
      right: -2rpx;
      border-width: 0 3rpx 3rpx 0;
    }
  }
}

// Logo区域
.logo {
  text-align: center;
  margin-bottom: 48rpx;

  .logo-icon {
    width: 80rpx;
    height: 80rpx;
    margin: 0 auto 20rpx;
    position: relative;

    .hex {
      position: absolute;
      inset: 0;
      border: 2rpx solid $primary;
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      animation: hexRotate 10s linear infinite;

      &-inner {
        inset: 12rpx;
        border-color: rgba($primary, 0.5);
        animation-direction: reverse;
        animation-duration: 8s;
      }
    }
  }

  .logo-text {
    font-size: 44rpx;
    font-weight: 700;
    color: #fff;
    letter-spacing: 8rpx;
    text-shadow: 0 0 20rpx rgba($primary, 0.5);
  }

  .logo-sub {
    display: block;
    margin-top: 12rpx;
    font-size: 22rpx;
    color: rgba($primary, 0.7);
    letter-spacing: 4rpx;
  }
}

// 模式切换
.mode-switch {
  position: relative;
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  border: 1rpx solid rgba($primary, 0.2);
  border-radius: 6rpx;
  margin-bottom: 40rpx;
  padding: 4rpx;

  .mode-indicator {
    position: absolute;
    top: 4rpx;
    left: 4rpx;
    width: calc(50% - 4rpx);
    height: calc(100% - 8rpx);
    border-radius: 4rpx;
    background: linear-gradient(135deg, rgba($primary, 0.15), rgba($secondary, 0.1));
    border: 1rpx solid rgba($primary, 0.4);
    box-shadow: 0 0 20rpx rgba($primary, 0.2);
    transition: transform 280ms cubic-bezier(0.2, 0.9, 0.2, 1);
  }

  .mode-item {
    flex: 1;
    text-align: center;
    padding: 22rpx 0;
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.5);
    position: relative;
    z-index: 1;
    transition: color 200ms ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;

    .mode-icon {
      font-size: 20rpx;
    }

    &.active {
      color: $primary;
      text-shadow: 0 0 10rpx rgba($primary, 0.5);
    }
  }
}

// 表单区域
.form {
  .panel {
    min-height: 340rpx;
  }

  .form-item {
    margin-bottom: 28rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .input-wrapper {
    position: relative;

    .input-label {
      position: absolute;
      left: 80rpx;
      top: -16rpx;
      font-size: 18rpx;
      color: rgba($primary, 0.6);
      letter-spacing: 2rpx;
      z-index: 1;
      background: $dark-card;
      padding: 0 8rpx;
    }
  }

  :deep(.u-input) {
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1rpx solid rgba($primary, 0.2) !important;
    border-radius: 6rpx !important;

    .u-input__content__field-wrapper__field {
      color: #fff !important;
    }

    &:focus-within {
      border-color: rgba($primary, 0.5) !important;
      box-shadow: 0 0 20rpx rgba($primary, 0.1);
    }
  }

  :deep(.u-button) {
    width: 100%;
    height: 88rpx;
    font-size: 28rpx;
    border-radius: 6rpx;
    background: linear-gradient(135deg, rgba($primary, 0.2), rgba($secondary, 0.15)) !important;
    border: 1rpx solid rgba($primary, 0.4) !important;
    color: $primary !important;
    letter-spacing: 4rpx;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba($primary, 0.1), transparent);
      transform: translateX(-100%);
      animation: btnShine 3s ease-in-out infinite;
    }

    .btn-icon {
      margin-right: 8rpx;
    }
  }

  :deep(.u-btn:active) {
    transform: scale(0.98);
    box-shadow: 0 0 30rpx rgba($primary, 0.3);
  }

  :deep(.u-button--disabled) {
    opacity: 0.4 !important;
  }
}

// 科技感插画
.tech-illu {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 180rpx;
  margin-bottom: 30rpx;
  position: relative;

  .illu-ring {
    position: absolute;
    border: 1rpx solid rgba($primary, 0.3);
    border-radius: 50%;

    &.ring-1 {
      width: 140rpx;
      height: 140rpx;
      animation: ringPulse 2s ease-out infinite;
    }

    &.ring-2 {
      width: 100rpx;
      height: 100rpx;
      animation: ringPulse 2s ease-out infinite 0.4s;
    }

    &.ring-3 {
      width: 60rpx;
      height: 60rpx;
      animation: ringPulse 2s ease-out infinite 0.8s;
    }
  }

  .illu-core {
    width: 40rpx;
    height: 40rpx;
    background: linear-gradient(135deg, $primary, $secondary);
    border-radius: 50%;
    position: relative;
    box-shadow: 0 0 30rpx rgba($primary, 0.6);
    animation: corePulse 1.5s ease-in-out infinite;

    .core-inner {
      position: absolute;
      inset: 8rpx;
      background: $dark;
      border-radius: 50%;
    }
  }

  .illu-dot {
    position: absolute;
    width: 8rpx;
    height: 8rpx;
    background: $primary;
    border-radius: 50%;
    box-shadow: 0 0 10rpx $primary;

    &.dot-1 {
      animation: dotOrbit 3s linear infinite;
    }

    &.dot-2 {
      animation: dotOrbit 3s linear infinite reverse;
      animation-delay: -1s;
    }

    &.dot-3 {
      animation: dotOrbit 4s linear infinite;
      animation-delay: -2s;
    }
  }
}

// 验证码行
.code-row {
  display: flex;
  gap: 20rpx;

  .code-input {
    flex: 1;
  }

  .code-btn {
    width: 160rpx;
  }

  :deep(.u-button) {
    height: 88rpx;
    font-size: 24rpx;
    letter-spacing: 2rpx;
  }
}

// 提示文本
.tips {
  margin-top: 36rpx;
  text-align: center;

  .tip-text {
    font-size: 22rpx;
    color: rgba($primary, 0.5);
    letter-spacing: 1rpx;
  }
}

// 状态栏
.status-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 40rpx;
  padding-top: 30rpx;
  border-top: 1rpx solid rgba($primary, 0.1);

  .status-dot {
    width: 10rpx;
    height: 10rpx;
    background: #22c55e;
    border-radius: 50%;
    box-shadow: 0 0 10rpx #22c55e;
    animation: statusBlink 2s ease-in-out infinite;
  }

  .status-text {
    font-size: 20rpx;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 4rpx;
  }
}

// 过渡动画
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 200ms ease,
    transform 220ms cubic-bezier(0.2, 0.9, 0.2, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(16rpx);
}

// 关键帧动画
@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(60rpx, 60rpx);
  }
}

@keyframes scanDown {
  0% {
    top: -10%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 110%;
    opacity: 0;
  }
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

@keyframes particleFloat {
  0%,
  100% {
    transform: translate(0, 0);
    opacity: 0.6;
  }
  25% {
    transform: translate(20rpx, -30rpx);
    opacity: 1;
  }
  50% {
    transform: translate(-10rpx, -60rpx);
    opacity: 0.8;
  }
  75% {
    transform: translate(30rpx, -30rpx);
    opacity: 1;
  }
}

@keyframes hexRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes ringPulse {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes corePulse {
  0%,
  100% {
    box-shadow: 0 0 30rpx rgba($primary, 0.6);
  }
  50% {
    box-shadow: 0 0 50rpx rgba($primary, 0.9);
  }
}

@keyframes dotOrbit {
  0% {
    transform: rotate(0deg) translateX(70rpx) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateX(70rpx) rotate(-360deg);
  }
}

@keyframes btnShine {
  0% {
    transform: translateX(-100%);
  }
  50%,
  100% {
    transform: translateX(100%);
  }
}

@keyframes statusBlink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
