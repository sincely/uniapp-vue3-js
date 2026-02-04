<template>
  <view class="login-container">
    <view class="bg" aria-hidden="true">
      <view class="blob blob-1"></view>
      <view class="blob blob-2"></view>
      <view class="blob blob-3"></view>
      <view class="grain"></view>
    </view>

    <view class="login-box" :class="{ entered }">
      <view class="logo">
        <text class="logo-text">欢迎回来</text>
        <text class="logo-sub">微信一键登录 / 验证码登录</text>
      </view>

      <view class="mode-switch">
        <view class="mode-indicator" :style="modeIndicatorStyle"></view>
        <view class="mode-item" :class="{ active: mode === 'wechat' }" @click="mode = 'wechat'">微信一键登录</view>
        <view class="mode-item" :class="{ active: mode === 'sms' }" @click="mode = 'sms'">验证码登录</view>
      </view>

      <view class="form">
        <transition name="fade-slide" mode="out-in">
          <view :key="mode" class="panel">
            <view v-if="mode === 'wechat'" class="wechat-area">
              <view class="wechat-illu" aria-hidden="true">
                <view class="illu-core">
                  <view class="phone"></view>
                  <view class="bubble bubble-1"></view>
                  <view class="bubble bubble-2"></view>
                  <view class="bubble bubble-3"></view>
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
                  获取微信绑定手机号并登录
                </u-button>
              </view>
              <!-- #endif -->

              <!-- #ifndef MP-WEIXIN -->
              <view class="tips">
                <text class="tip-text">当前平台不支持微信手机号一键登录，请使用验证码登录。</text>
              </view>
              <!-- #endif -->

              <view class="tips">
                <text class="tip-text">将使用微信手机号用于账号绑定/登录</text>
              </view>
            </view>

            <view v-else class="sms-area">
              <view class="form-item">
                <u-input
                  v-model="smsForm.phone"
                  placeholder="请输入手机号"
                  prefixIcon="phone"
                  :clearable="true"
                  type="number"
                />
              </view>

              <view class="form-item code-row">
                <view class="code-input">
                  <u-input
                    v-model="smsForm.code"
                    placeholder="请输入验证码"
                    prefixIcon="email"
                    :clearable="true"
                    type="number"
                  />
                </view>
                <view class="code-btn">
                  <u-button
                    type="primary"
                    :disabled="sending || countdown > 0 || !isValidPhone"
                    :loading="sending"
                    @click="handleSendCode"
                  >
                    {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
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
                  登录
                </u-button>
              </view>

              <view class="tips">
                <text class="tip-text">开发环境默认 Mock：验证码 123456</text>
              </view>
            </view>
          </view>
        </transition>
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
.login-container {
  min-height: 100vh;
  background: radial-gradient(1200rpx 900rpx at 20% 10%, #d7f5ff 0%, rgba(215, 245, 255, 0) 60%),
    radial-gradient(1000rpx 700rpx at 85% 20%, #ffe0f3 0%, rgba(255, 224, 243, 0) 55%),
    linear-gradient(135deg, #e9f2ff 0%, #f7f3ff 40%, #effaf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 44rpx;
  position: relative;
  overflow: hidden;
}

.bg {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .blob {
    position: absolute;
    width: 520rpx;
    height: 520rpx;
    border-radius: 50%;
    filter: blur(2rpx);
    opacity: 0.55;
    transform: translate3d(0, 0, 0);
  }

  .blob-1 {
    left: -160rpx;
    top: -180rpx;
    background: radial-gradient(circle at 30% 30%, rgba(125, 211, 252, 0.9), rgba(99, 102, 241, 0.35));
    animation: float1 7s ease-in-out infinite;
  }

  .blob-2 {
    right: -220rpx;
    top: 120rpx;
    background: radial-gradient(circle at 35% 35%, rgba(255, 185, 236, 0.9), rgba(168, 85, 247, 0.25));
    animation: float2 8.5s ease-in-out infinite;
  }

  .blob-3 {
    left: 120rpx;
    bottom: -220rpx;
    width: 620rpx;
    height: 620rpx;
    background: radial-gradient(circle at 35% 35%, rgba(110, 231, 183, 0.85), rgba(59, 130, 246, 0.18));
    animation: float3 9s ease-in-out infinite;
  }

  .grain {
    position: absolute;
    inset: 0;
    opacity: 0.05;
    background-image: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.5) 0,
        rgba(0, 0, 0, 0.5) 1rpx,
        transparent 1rpx,
        transparent 3rpx
      ),
      repeating-linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.4) 0,
        rgba(0, 0, 0, 0.4) 1rpx,
        transparent 1rpx,
        transparent 4rpx
      );
    mix-blend-mode: soft-light;
  }
}

.login-box {
  width: 100%;
  max-width: 600rpx;
  background: rgba(255, 255, 255, 0.82);
  border-radius: 28rpx;
  padding: 64rpx 44rpx;
  box-shadow: 0 28rpx 70rpx rgba(24, 34, 52, 0.12);
  border: 1rpx solid rgba(255, 255, 255, 0.7);
  transform: translateY(24rpx) scale(0.98);
  opacity: 0;
  transition:
    transform 420ms cubic-bezier(0.2, 0.9, 0.2, 1),
    opacity 420ms ease;

  &.entered {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.logo {
  text-align: center;
  margin-bottom: 52rpx;

  .logo-text {
    font-size: 54rpx;
    font-weight: 800;
    color: #1f2937;
    letter-spacing: 2rpx;
  }

  .logo-sub {
    display: block;
    margin-top: 14rpx;
    font-size: 24rpx;
    color: rgba(31, 41, 55, 0.6);
  }
}

.mode-switch {
  position: relative;
  display: flex;
  background: rgba(17, 24, 39, 0.04);
  border-radius: 18rpx;
  overflow: hidden;
  margin-bottom: 40rpx;
  padding: 6rpx;

  .mode-indicator {
    position: absolute;
    top: 6rpx;
    left: 6rpx;
    width: calc(50% - 6rpx);
    height: calc(100% - 12rpx);
    border-radius: 14rpx;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 10rpx 30rpx rgba(17, 24, 39, 0.08);
    transition: transform 260ms cubic-bezier(0.2, 0.9, 0.2, 1);
    will-change: transform;
  }

  .mode-item {
    flex: 1;
    text-align: center;
    padding: 22rpx 0;
    font-size: 28rpx;
    color: rgba(31, 41, 55, 0.65);
    position: relative;
    z-index: 1;
    transition: color 200ms ease;

    &.active {
      color: #111827;
      font-weight: 700;
    }
  }
}

.form {
  .panel {
    min-height: 340rpx;
  }

  .form-item {
    margin-bottom: 30rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(.u-button) {
    width: 100%;
    height: 90rpx;
    font-size: 32rpx;
    border-radius: 18rpx;
  }

  :deep(.u-btn) {
    transition:
      transform 120ms ease,
      filter 180ms ease;
  }

  :deep(.u-btn:active) {
    transform: scale(0.98);
    filter: brightness(0.98);
  }

  :deep(.u-input) {
    border-radius: 18rpx;
  }
}

.wechat-illu {
  display: flex;
  justify-content: center;
  margin: 10rpx 0 34rpx;

  .illu-core {
    width: 220rpx;
    height: 170rpx;
    position: relative;
    transform: translate3d(0, 0, 0);
  }

  .phone {
    position: absolute;
    left: 50%;
    top: 14rpx;
    width: 120rpx;
    height: 150rpx;
    transform: translateX(-50%);
    border-radius: 26rpx;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.75));
    border: 1rpx solid rgba(17, 24, 39, 0.08);
    box-shadow: 0 18rpx 40rpx rgba(17, 24, 39, 0.12);
    overflow: hidden;
  }

  .phone::before {
    content: '';
    position: absolute;
    left: 14rpx;
    top: 18rpx;
    right: 14rpx;
    height: 86rpx;
    border-radius: 18rpx;
    background: radial-gradient(circle at 30% 30%, rgba(125, 211, 252, 0.9), rgba(99, 102, 241, 0.22));
  }

  .phone::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 18rpx;
    width: 44rpx;
    height: 10rpx;
    transform: translateX(-50%);
    border-radius: 999rpx;
    background: rgba(17, 24, 39, 0.14);
  }

  .bubble {
    position: absolute;
    border-radius: 999rpx;
    filter: blur(0.2rpx);
    opacity: 0.95;
  }

  .bubble-1 {
    left: 14rpx;
    top: 24rpx;
    width: 48rpx;
    height: 48rpx;
    background: radial-gradient(circle at 35% 35%, rgba(110, 231, 183, 0.95), rgba(59, 130, 246, 0.18));
    animation: bubbleUp 2.8s ease-in-out infinite;
  }

  .bubble-2 {
    right: 12rpx;
    top: 56rpx;
    width: 34rpx;
    height: 34rpx;
    background: radial-gradient(circle at 35% 35%, rgba(255, 185, 236, 0.95), rgba(168, 85, 247, 0.18));
    animation: bubbleUp 3.2s ease-in-out infinite;
  }

  .bubble-3 {
    right: 44rpx;
    bottom: 10rpx;
    width: 22rpx;
    height: 22rpx;
    background: radial-gradient(circle at 35% 35%, rgba(125, 211, 252, 0.95), rgba(99, 102, 241, 0.18));
    animation: bubbleUp 3.6s ease-in-out infinite;
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 220ms ease,
    transform 240ms cubic-bezier(0.2, 0.9, 0.2, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(12rpx);
}

.code-row {
  display: flex;
  gap: 20rpx;

  .code-input {
    flex: 1;
  }

  .code-btn {
    width: 220rpx;
  }

  :deep(.u-button) {
    height: 80rpx;
    font-size: 28rpx;
  }
}

.tips {
  margin-top: 40rpx;
  text-align: center;

  .tip-text {
    font-size: 24rpx;
    color: #999;
  }
}

@keyframes float1 {
  0% {
    transform: translate(-6rpx, 0) scale(1);
  }
  50% {
    transform: translate(14rpx, 18rpx) scale(1.04);
  }
  100% {
    transform: translate(-6rpx, 0) scale(1);
  }
}

@keyframes float2 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-18rpx, 22rpx) scale(1.06);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
}

@keyframes float3 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(18rpx, -16rpx) scale(1.05);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
}

@keyframes bubbleUp {
  0% {
    transform: translate3d(0, 6rpx, 0) scale(0.98);
    opacity: 0.85;
  }
  50% {
    transform: translate3d(0, -8rpx, 0) scale(1.03);
    opacity: 1;
  }
  100% {
    transform: translate3d(0, 6rpx, 0) scale(0.98);
    opacity: 0.88;
  }
}
</style>
