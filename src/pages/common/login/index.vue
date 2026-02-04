<template>
  <view class="login-container">
    <!-- 顶部紫色波浪背景 -->
    <view class="header-bg">
      <view class="wave-decoration">
        <view class="wave wave-1"></view>
        <view class="wave wave-2"></view>
        <view class="circle-deco c1"></view>
        <view class="circle-deco c2"></view>
        <view class="circle-deco c3"></view>
      </view>

      <!-- 顶部标签切换 -->
      <view class="header-tabs">
        <view class="tab-item" :class="{ active: mode === 'wechat' }" @click="mode = 'wechat'">
          <text class="tab-text">微信登录</text>
          <view v-if="mode === 'wechat'" class="tab-line"></view>
        </view>
        <view class="tab-item" :class="{ active: mode === 'sms' }" @click="mode = 'sms'">
          <text class="tab-text">验证码</text>
          <view v-if="mode === 'sms'" class="tab-line"></view>
        </view>
      </view>
    </view>

    <!-- 白色卡片区域 -->
    <view class="login-card" :class="{ entered }">
      <!-- 微信登录 -->
      <view v-show="mode === 'wechat'" class="panel wechat-panel">
        <view class="wechat-desc">
          <view class="wechat-icon-wrap">
            <text class="wechat-icon">💬</text>
          </view>
          <text class="desc-text">使用微信授权快速登录</text>
        </view>

        <!-- #ifdef MP-WEIXIN -->
        <u-button
          type="primary"
          :loading="loading && loginType === 'wechat'"
          openType="getPhoneNumber"
          class="login-btn"
          @getphonenumber="onGetPhoneNumber"
        >
          微信一键登录
        </u-button>
        <!-- #endif -->

        <!-- #ifndef MP-WEIXIN -->
        <view class="not-support">
          <text class="not-support-text">当前环境暂不支持微信登录</text>
        </view>
        <!-- #endif -->

        <text class="tip-text">将使用微信绑定的手机号登录</text>
      </view>

      <!-- 验证码登录 -->
      <view v-show="mode === 'sms'" class="panel sms-panel">
        <view class="form-item">
          <view class="input-box">
            <text class="input-icon">📱</text>
            <u-input
              v-model="smsForm.phone"
              placeholder="请输入手机号"
              :clearable="true"
              type="number"
              :border="false"
              :customStyle="{ flex: 1 }"
            />
          </view>
        </view>

        <view class="form-item">
          <view class="input-box">
            <text class="input-icon">🔐</text>
            <u-input
              v-model="smsForm.code"
              placeholder="请输入验证码"
              :clearable="true"
              type="number"
              :border="false"
              :customStyle="{ flex: 1 }"
            />
            <view class="code-link" @click="handleSendCode">
              <text v-if="countdown > 0" class="countdown">{{ countdown }}s</text>
              <text v-else class="get-code" :class="{ disabled: !isValidPhone || sending }">
                {{ sending ? '发送中' : '获取验证码' }}
              </text>
            </view>
          </view>
        </view>

        <u-button
          type="primary"
          :loading="loading && loginType === 'sms'"
          :disabled="!isValidPhone || !smsForm.code"
          class="login-btn"
          @click="handleSmsLogin"
        >
          登录
        </u-button>

        <text class="tip-text">测试验证码: 123456</text>
      </view>
    </view>

    <!-- 底部协议 -->
    <view class="footer">
      <view class="agreement">
        <text class="agreement-text">登录即表示同意</text>
        <text class="agreement-link">《用户协议》</text>
        <text class="agreement-text">和</text>
        <text class="agreement-link">《隐私政策》</text>
      </view>

      <!-- 其他登录方式 -->
      <view class="other-login">
        <view class="other-item">
          <text class="other-icon">💬</text>
        </view>
        <view class="other-item">
          <text class="other-icon">🔔</text>
        </view>
        <view class="other-item">
          <text class="other-icon">👁</text>
        </view>
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
const loginType = ref('')
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
    loginType.value = 'wechat'

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
    loginType.value = ''
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
    loginType.value = 'sms'
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
    loginType.value = ''
  }
}

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = null
})
</script>

<style lang="scss" scoped>
// 紫色主题配色
$purple: #7c3aed;
$purple-light: #a855f7;
$purple-dark: #6d28d9;
$purple-bg: #8b5cf6;
$white: #ffffff;
$gray: #f5f5f5;
$text: #333333;
$text-light: #666666;
$text-lighter: #999999;
$border: #e5e5e5;

.login-container {
  min-height: 100vh;
  background: $white;
  position: relative;
  display: flex;
  flex-direction: column;
}

// 顶部紫色背景
.header-bg {
  position: relative;
  height: 400rpx;
  background: linear-gradient(135deg, $purple 0%, $purple-light 100%);
  overflow: hidden;

  .wave-decoration {
    position: absolute;
    inset: 0;

    .wave {
      position: absolute;
      width: 200%;
      height: 200rpx;
      bottom: -50rpx;
      left: -50%;
      background: $white;
      border-radius: 50% 50% 0 0;
      opacity: 0.1;

      &.wave-1 {
        bottom: -80rpx;
        animation: waveMove 8s ease-in-out infinite;
      }

      &.wave-2 {
        bottom: -100rpx;
        opacity: 0.15;
        animation: waveMove 10s ease-in-out infinite reverse;
      }
    }

    .circle-deco {
      position: absolute;
      border-radius: 50%;
      border: 2rpx solid rgba($white, 0.2);

      &.c1 {
        width: 300rpx;
        height: 300rpx;
        top: -100rpx;
        right: -50rpx;
      }

      &.c2 {
        width: 200rpx;
        height: 200rpx;
        top: 100rpx;
        left: -60rpx;
      }

      &.c3 {
        width: 120rpx;
        height: 120rpx;
        bottom: 150rpx;
        right: 80rpx;
        background: rgba($white, 0.1);
      }
    }
  }

  // 顶部标签
  .header-tabs {
    position: absolute;
    bottom: 100rpx;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 100rpx;

    .tab-item {
      position: relative;
      padding: 20rpx 0;

      .tab-text {
        font-size: 36rpx;
        font-weight: 600;
        color: rgba($white, 0.7);
        transition: all 300ms ease;
      }

      &.active .tab-text {
        color: $white;
      }

      .tab-line {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 6rpx;
        background: $white;
        border-radius: 3rpx;
      }
    }
  }
}

// 登录卡片
.login-card {
  flex: 1;
  background: $white;
  margin-top: -60rpx;
  border-radius: 40rpx 40rpx 0 0;
  padding: 60rpx 50rpx;
  position: relative;
  z-index: 10;
  transform: translateY(30rpx);
  opacity: 0;
  transition: all 500ms cubic-bezier(0.4, 0, 0.2, 1);

  &.entered {
    transform: translateY(0);
    opacity: 1;
  }
}

// 面板
.panel {
  .tip-text {
    display: block;
    text-align: center;
    font-size: 24rpx;
    color: $text-lighter;
    margin-top: 40rpx;
  }
}

// 微信登录面板
.wechat-panel {
  .wechat-desc {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 60rpx;
    padding-top: 40rpx;

    .wechat-icon-wrap {
      width: 140rpx;
      height: 140rpx;
      background: linear-gradient(135deg, #07c160, #06b856);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30rpx;
      box-shadow: 0 16rpx 40rpx rgba(7, 193, 96, 0.3);

      .wechat-icon {
        font-size: 64rpx;
      }
    }

    .desc-text {
      font-size: 28rpx;
      color: $text-light;
    }
  }

  .not-support {
    padding: 60rpx 20rpx;
    text-align: center;
    background: $gray;
    border-radius: 16rpx;
    margin-bottom: 30rpx;

    .not-support-text {
      font-size: 28rpx;
      color: $text-lighter;
    }
  }
}

// 验证码登录面板
.sms-panel {
  padding-top: 40rpx;

  .form-item {
    margin-bottom: 40rpx;
  }

  .input-box {
    display: flex;
    align-items: center;
    height: 110rpx;
    background: $white;
    border: 2rpx solid $border;
    border-radius: 16rpx;
    padding: 0 30rpx;
    transition: all 300ms ease;

    &:focus-within {
      border-color: $purple;
      box-shadow: 0 0 0 4rpx rgba($purple, 0.1);
    }

    .input-icon {
      font-size: 36rpx;
      margin-right: 20rpx;
      opacity: 0.6;
    }

    :deep(.u-input) {
      flex: 1;
      background: transparent !important;
      border: none !important;
      height: 100% !important;
    }

    .code-link {
      flex-shrink: 0;
      padding-left: 20rpx;
      border-left: 2rpx solid $border;

      .get-code {
        font-size: 26rpx;
        color: $purple;
        font-weight: 500;

        &.disabled {
          color: $text-lighter;
        }
      }

      .countdown {
        font-size: 26rpx;
        color: $text-lighter;
      }
    }
  }
}

// 登录按钮
.login-btn {
  width: 100%;
  margin-top: 20rpx;

  :deep(.u-button) {
    width: 100% !important;
    height: 100rpx !important;
    background: linear-gradient(135deg, $purple, $purple-light) !important;
    border: none !important;
    border-radius: 50rpx !important;
    font-size: 34rpx !important;
    font-weight: 600 !important;
    box-shadow: 0 12rpx 30rpx rgba($purple, 0.4);

    &:active {
      transform: translateY(2rpx);
      box-shadow: 0 6rpx 20rpx rgba($purple, 0.35);
    }
  }

  :deep(.u-button--disabled) {
    opacity: 0.6 !important;
    box-shadow: none;
  }
}

// 底部
.footer {
  padding: 40rpx 50rpx 80rpx;

  .agreement {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 60rpx;

    .agreement-text {
      font-size: 24rpx;
      color: $text-lighter;
    }

    .agreement-link {
      font-size: 24rpx;
      color: $purple;
    }
  }

  .other-login {
    display: flex;
    justify-content: center;
    gap: 60rpx;

    .other-item {
      width: 90rpx;
      height: 90rpx;
      border-radius: 50%;
      border: 2rpx solid $border;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 300ms ease;

      .other-icon {
        font-size: 40rpx;
        opacity: 0.7;
      }

      &:active {
        background: $gray;
        transform: scale(0.95);
      }
    }
  }
}

// 动画
@keyframes waveMove {
  0%,
  100% {
    transform: translateX(0) rotate(0deg);
  }
  50% {
    transform: translateX(25%) rotate(2deg);
  }
}
</style>
