<template>
  <view class="login-container">
    <!-- 优雅背景 -->
    <view class="bg" aria-hidden="true">
      <view class="bg-pattern"></view>
      <view class="bg-overlay"></view>
      <view class="light-beam beam-1"></view>
      <view class="light-beam beam-2"></view>
    </view>

    <view class="login-box" :class="{ entered }">
      <!-- 顶部装饰线 -->
      <view class="decor-line top"></view>

      <view class="logo">
        <view class="logo-icon">
          <view class="key-shape"></view>
        </view>
        <text class="logo-text">WELCOME</text>
        <text class="logo-sub">尊享入住体验</text>
        <view class="divider">
          <view class="divider-line"></view>
          <view class="divider-diamond"></view>
          <view class="divider-line"></view>
        </view>
      </view>

      <view class="mode-switch">
        <view class="mode-indicator" :style="modeIndicatorStyle"></view>
        <view class="mode-item" :class="{ active: mode === 'wechat' }" @click="mode = 'wechat'">微信登录</view>
        <view class="mode-item" :class="{ active: mode === 'sms' }" @click="mode = 'sms'">验证码登录</view>
      </view>

      <view class="form">
        <transition name="fade-slide" mode="out-in">
          <view :key="mode" class="panel">
            <view v-if="mode === 'wechat'" class="wechat-area">
              <view class="hotel-illu" aria-hidden="true">
                <view class="card">
                  <view class="card-inner">
                    <view class="card-chip"></view>
                    <view class="card-line"></view>
                    <view class="card-line short"></view>
                  </view>
                  <view class="card-shine"></view>
                </view>
              </view>

              <!-- #ifdef MP-WEIXIN -->
              <view class="form-item">
                <u-button
                  type="primary"
                  :loading="loading"
                  openType="getPhoneNumber"
                  @getphonenumber="onGetPhoneNumber"
                >
                  微信一键入住
                </u-button>
              </view>
              <!-- #endif -->

              <!-- #ifndef MP-WEIXIN -->
              <view class="tips">
                <text class="tip-text">当前环境暂不支持微信登录</text>
              </view>
              <!-- #endif -->

              <view class="tips">
                <text class="tip-text">使用微信绑定手机号快速登录</text>
              </view>
            </view>

            <view v-else class="sms-area">
              <view class="form-item">
                <view class="input-group">
                  <text class="input-label">手机号码</text>
                  <u-input v-model="smsForm.phone" placeholder="请输入您的手机号" :clearable="true" type="number" />
                </view>
              </view>

              <view class="form-item code-row">
                <view class="code-input">
                  <view class="input-group">
                    <text class="input-label">验证码</text>
                    <u-input v-model="smsForm.code" placeholder="请输入验证码" :clearable="true" type="number" />
                  </view>
                </view>
                <view class="code-btn">
                  <u-button
                    type="primary"
                    :disabled="sending || countdown > 0 || !isValidPhone"
                    :loading="sending"
                    @click="handleSendCode"
                  >
                    {{ countdown > 0 ? `${countdown}s` : '获取' }}
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
                  立即登录
                </u-button>
              </view>

              <view class="tips">
                <text class="tip-text">测试验证码: 123456</text>
              </view>
            </view>
          </view>
        </transition>
      </view>

      <!-- 底部装饰 -->
      <view class="footer">
        <view class="stars">
          <text v-for="i in 5" :key="i" class="star">★</text>
        </view>
        <text class="footer-text">LUXURY EXPERIENCE</text>
      </view>

      <!-- 底部装饰线 -->
      <view class="decor-line bottom"></view>
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
// 奢华金色配色
$gold: #d4af37;
$gold-light: #f5e6a3;
$gold-dark: #b8860b;
$gold-shine: #ffd700;
$black: #0d0d0d;
$black-light: #1a1a1a;
$cream: #fffef8;
$text: #1a1a1a;

.login-container {
  min-height: 100vh;
  background: linear-gradient(160deg, #0d0d0d 0%, #1a1510 30%, #0d0906 70%, #000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 44rpx;
  position: relative;
  overflow: hidden;
}

// 背景
.bg {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .bg-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.06;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='%23d4af37' fill-opacity='1'/%3E%3C/svg%3E");
    background-size: 100rpx 100rpx;
    animation: patternShift 30s linear infinite;
  }

  .bg-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 120% 60% at 50% -10%, rgba($gold, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse 80% 50% at 20% 100%, rgba($gold-dark, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse 60% 40% at 90% 80%, rgba($gold, 0.08) 0%, transparent 50%);
  }

  .light-beam {
    position: absolute;
    width: 3rpx;
    background: linear-gradient(180deg, rgba($gold-shine, 0.6), rgba($gold, 0.2), transparent);
    animation: beamFade 5s ease-in-out infinite;
    filter: blur(1rpx);

    &.beam-1 {
      left: 15%;
      top: 0;
      height: 50%;
      animation-delay: 0s;
    }

    &.beam-2 {
      right: 20%;
      top: 0;
      height: 45%;
      animation-delay: 2.5s;
    }
  }
}

// 登录卡片
.login-box {
  width: 100%;
  max-width: 640rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 253, 245, 0.95) 100%);
  border-radius: 8rpx;
  padding: 0 52rpx 56rpx;
  position: relative;
  transform: translateY(50rpx);
  opacity: 0;
  transition: all 700ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 40rpx 100rpx rgba(0, 0, 0, 0.5),
    0 0 0 1rpx rgba($gold, 0.3),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.9);

  &::before {
    content: '';
    position: absolute;
    inset: -2rpx;
    border-radius: 10rpx;
    background: linear-gradient(135deg, $gold-shine, $gold, $gold-dark, $gold);
    z-index: -1;
    opacity: 0.8;
  }

  &.entered {
    transform: translateY(0);
    opacity: 1;
  }
}

// 装饰线
.decor-line {
  position: absolute;
  left: 52rpx;
  right: 52rpx;
  height: 2rpx;
  background: linear-gradient(90deg, transparent 0%, $gold 20%, $gold-shine 50%, $gold 80%, transparent 100%);

  &.top {
    top: 0;
  }

  &.bottom {
    bottom: 56rpx;
    height: 1rpx;
    opacity: 0.5;
  }
}

// Logo区域
.logo {
  text-align: center;
  padding-top: 64rpx;
  margin-bottom: 48rpx;

  .logo-icon {
    width: 88rpx;
    height: 88rpx;
    margin: 0 auto 28rpx;
    position: relative;

    .key-shape {
      position: absolute;
      inset: 0;
      border: 3rpx solid $gold;
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      animation: keyFloat 3s ease-in-out infinite;
      box-shadow:
        0 0 20rpx rgba($gold, 0.3),
        inset 0 0 15rpx rgba($gold, 0.1);

      &::before {
        content: '';
        position: absolute;
        left: 50%;
        top: 55%;
        width: 6rpx;
        height: 32rpx;
        background: linear-gradient(180deg, $gold-shine, $gold);
        transform: translateX(-50%);
        border-radius: 3rpx;
      }

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 10rpx;
        width: 20rpx;
        height: 6rpx;
        background: linear-gradient(90deg, $gold, $gold-shine, $gold);
        transform: translateX(-50%);
        border-radius: 3rpx;
      }
    }
  }

  .logo-text {
    font-size: 48rpx;
    font-weight: 300;
    color: $text;
    letter-spacing: 16rpx;
    display: block;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  }

  .logo-sub {
    display: block;
    margin-top: 16rpx;
    font-size: 26rpx;
    color: $gold-dark;
    letter-spacing: 8rpx;
    font-weight: 500;
  }

  .divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 32rpx;
    gap: 20rpx;

    .divider-line {
      width: 80rpx;
      height: 1rpx;
      background: linear-gradient(90deg, transparent, $gold);

      &:last-child {
        background: linear-gradient(90deg, $gold, transparent);
      }
    }

    .divider-diamond {
      width: 10rpx;
      height: 10rpx;
      background: linear-gradient(135deg, $gold-shine, $gold);
      transform: rotate(45deg);
      box-shadow: 0 0 8rpx rgba($gold, 0.5);
    }
  }
}

// 模式切换
.mode-switch {
  position: relative;
  display: flex;
  background: rgba($black, 0.03);
  border-radius: 6rpx;
  margin-bottom: 40rpx;
  padding: 6rpx;
  border: 1rpx solid rgba($gold, 0.3);

  .mode-indicator {
    position: absolute;
    top: 6rpx;
    left: 6rpx;
    width: calc(50% - 6rpx);
    height: calc(100% - 12rpx);
    border-radius: 4rpx;
    background: linear-gradient(135deg, $gold, $gold-dark);
    transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4rpx 16rpx rgba($gold-dark, 0.4);
  }

  .mode-item {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    font-size: 26rpx;
    color: $text;
    position: relative;
    z-index: 1;
    transition: color 300ms ease;
    letter-spacing: 2rpx;

    &.active {
      color: #fff;
    }
  }
}

// 表单区域
.form {
  .panel {
    min-height: 320rpx;
  }

  .form-item {
    margin-bottom: 24rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .input-group {
    .input-label {
      display: block;
      font-size: 22rpx;
      color: $gold-dark;
      letter-spacing: 2rpx;
      margin-bottom: 12rpx;
    }
  }

  :deep(.u-input) {
    background: #fff !important;
    border: 1rpx solid rgba($gold, 0.3) !important;
    border-radius: 4rpx !important;
    transition: all 300ms ease;

    &:focus-within {
      border-color: $gold !important;
      box-shadow: 0 0 0 3rpx rgba($gold, 0.1);
    }
  }

  :deep(.u-button) {
    width: 100%;
    height: 88rpx;
    font-size: 28rpx;
    border-radius: 4rpx;
    background: linear-gradient(135deg, $gold, $gold-dark) !important;
    border: none !important;
    color: #fff !important;
    letter-spacing: 4rpx;
    font-weight: 400;
    transition: all 300ms ease;
    box-shadow: 0 8rpx 24rpx rgba($gold-dark, 0.3);

    &:active {
      transform: translateY(2rpx);
      box-shadow: 0 4rpx 12rpx rgba($gold-dark, 0.3);
    }
  }

  :deep(.u-button--disabled) {
    opacity: 0.5 !important;
    box-shadow: none;
  }
}

// 酒店卡片插画
.hotel-illu {
  display: flex;
  justify-content: center;
  margin-bottom: 36rpx;
  perspective: 600rpx;

  .card {
    width: 220rpx;
    height: 140rpx;
    background: linear-gradient(135deg, $gold-shine, $gold, $gold-dark);
    border-radius: 14rpx;
    position: relative;
    transform: rotateY(-8deg) rotateX(5deg);
    box-shadow:
      0 30rpx 60rpx rgba(0, 0, 0, 0.3),
      0 15rpx 30rpx rgba($gold-dark, 0.3),
      inset 0 2rpx 0 rgba(#fff, 0.5),
      inset 0 -2rpx 0 rgba($gold-dark, 0.3);
    animation: cardFloat 4s ease-in-out infinite;

    .card-inner {
      padding: 24rpx;
    }

    .card-chip {
      width: 48rpx;
      height: 36rpx;
      background: linear-gradient(135deg, #fff8dc, #ffd700, #daa520);
      border-radius: 6rpx;
      margin-bottom: 18rpx;
      box-shadow:
        0 2rpx 4rpx rgba(0, 0, 0, 0.2),
        inset 0 1rpx 0 rgba(#fff, 0.8);
    }

    .card-line {
      height: 8rpx;
      background: linear-gradient(90deg, rgba(#fff, 0.7), rgba(#fff, 0.3));
      border-radius: 4rpx;
      margin-bottom: 10rpx;

      &.short {
        width: 60%;
      }
    }

    .card-shine {
      position: absolute;
      inset: 0;
      border-radius: 14rpx;
      background: linear-gradient(135deg, transparent 30%, rgba(#fff, 0.6) 50%, transparent 70%);
      animation: cardShine 3s ease-in-out infinite;
    }
  }
}

// 验证码行
.code-row {
  display: flex;
  gap: 16rpx;

  .code-input {
    flex: 1;
  }

  .code-btn {
    width: 140rpx;
    padding-top: 34rpx;
  }

  :deep(.u-button) {
    height: 88rpx;
    font-size: 24rpx;
    letter-spacing: 2rpx;
  }
}

// 提示文本
.tips {
  margin-top: 32rpx;
  text-align: center;

  .tip-text {
    font-size: 22rpx;
    color: rgba($text, 0.5);
    letter-spacing: 1rpx;
  }
}

// 底部装饰
.footer {
  margin-top: 44rpx;
  text-align: center;

  .stars {
    display: flex;
    justify-content: center;
    gap: 12rpx;
    margin-bottom: 16rpx;

    .star {
      font-size: 22rpx;
      color: $gold-shine;
      text-shadow: 0 0 10rpx rgba($gold, 0.6);
      animation: starTwinkle 2s ease-in-out infinite;

      @for $i from 1 through 5 {
        &:nth-child(#{$i}) {
          animation-delay: #{$i * 0.2}s;
        }
      }
    }
  }

  .footer-text {
    font-size: 20rpx;
    color: $gold-dark;
    letter-spacing: 8rpx;
    font-weight: 500;
  }
}

// 过渡动画
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 250ms ease,
    transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20rpx);
}

// 关键帧动画
@keyframes patternShift {
  0% {
    transform: translateX(0) translateY(0);
  }
  100% {
    transform: translateX(100rpx) translateY(100rpx);
  }
}

@keyframes beamFade {
  0%,
  100% {
    opacity: 0.2;
    height: 45%;
  }
  50% {
    opacity: 1;
    height: 55%;
  }
}

@keyframes keyFloat {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10rpx) rotate(3deg);
  }
}

@keyframes cardFloat {
  0%,
  100% {
    transform: rotateY(-8deg) rotateX(5deg) translateY(0);
  }
  50% {
    transform: rotateY(-4deg) rotateX(10deg) translateY(-12rpx);
  }
}

@keyframes cardShine {
  0% {
    opacity: 0;
    transform: translateX(-150%) rotate(-15deg);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(150%) rotate(-15deg);
  }
}

@keyframes starTwinkle {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}
</style>
