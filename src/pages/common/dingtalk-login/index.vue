<template>
  <app-page>
    <view class="dingtalk-login-page">
      <!-- 头部 Logo -->
      <view class="header">
        <image class="logo" src="/static/images/logo.png" mode="aspectFit" />
        <view class="title">钉钉扫码登录</view>
        <view class="subtitle">使用钉钉扫码快速登录</view>
      </view>

      <!-- 登录方式选择 -->
      <view class="login-options">
        <!-- 钉钉免登 (仅在钉钉小程序环境显示) -->
        <!-- #ifdef MP-DINGTALK -->
        <view class="login-card" @tap="handleDingTalkLogin">
          <view class="icon-wrap dingtalk">
            <text class="i-mdi-cellphone-check text-50rpx" />
          </view>
          <view class="info">
            <view class="name">钉钉免登</view>
            <view class="desc">在钉钉客户端内自动登录</view>
          </view>
          <view class="arrow">
            <u-icon name="arrow-right" color="#999" />
          </view>
        </view>
        <!-- #endif -->

        <!-- 扫码登录 -->
        <view class="login-card" @tap="handleScanLogin">
          <view class="icon-wrap scan">
            <text class="i-mdi-qrcode-scan text-50rpx" />
          </view>
          <view class="info">
            <view class="name">扫码登录</view>
            <view class="desc">扫描二维码快速登录</view>
          </view>
          <view class="arrow">
            <u-icon name="arrow-right" color="#999" />
          </view>
        </view>

        <!-- 手机号登录 -->
        <view class="login-card" @tap="goPhoneLogin">
          <view class="icon-wrap phone">
            <text class="i-mdi-cellphone text-50rpx" />
          </view>
          <view class="info">
            <view class="name">手机号登录</view>
            <view class="desc">使用手机号验证码登录</view>
          </view>
          <view class="arrow">
            <u-icon name="arrow-right" color="#999" />
          </view>
        </view>
      </view>
      <!-- 加载状态 -->
      <u-loading :show="loading" :size="40" />

      <!-- 协议 -->
      <view class="agreement">
        <view class="checkbox-wrap" @tap="toggleAgreement">
          <u-checkbox-group v-model="agreeList">
            <u-checkbox name="agree" shape="circle" />
          </u-checkbox-group>
        </view>
        <view class="text">
          登录即代表同意
          <text class="link" @tap.stop="viewAgreement('user')">《用户协议》</text>
          和
          <text class="link" @tap.stop="viewAgreement('privacy')">《隐私政策》</text>
        </view>
      </view>
    </view>
  </app-page>
</template>

<script setup>
import { useDingTalkLogin } from '@/hooks'
import { HOME_PATH, isTabBarPath, LOGIN_PATH } from '@/router'
import { setToken } from '@/utils/auth'
import userApi from '@/api/modules/user'

// 钉钉企业 CorpID，需要根据实际情况配置
const DINGTALK_CORP_ID = import.meta.env.VITE_DINGTALK_CORP_ID || ''

const { loading, errorMsg, dingTalkLogin, scanLogin } = useDingTalkLogin()
const agreeList = ref([])
let redirect = HOME_PATH

// 检查是否同意协议
function checkAgreement() {
  if (!agreeList.value.includes('agree')) {
    uni.$u.toast('请先同意用户协议和隐私政策')
    return false
  }
  return true
}

// 切换协议同意状态
function toggleAgreement() {
  if (agreeList.value.includes('agree')) {
    agreeList.value = []
  } else {
    agreeList.value = ['agree']
  }
}

// 查看协议
function viewAgreement(type) {
  const url =
    type === 'user'
      ? '/pages/common/webview/index?url=user-agreement'
      : '/pages/common/webview/index?url=privacy-policy'
  uni.navigateTo({ url })
}

// 钉钉免登登录
async function handleDingTalkLogin() {
  // if (!checkAgreement()) return

  console.log('DINGTALK_CORP_ID------', DINGTALK_CORP_ID)
  if (!DINGTALK_CORP_ID) {
    uni.$u.toast('未配置企业CorpID')
    return
  }

  const result = await dingTalkLogin(DINGTALK_CORP_ID, async (authCode) => {
    console.log('authCode------', authCode)
    // 调用后端接口，用 authCode 换取 token 和用户信息
    return await userApi.dingTalkLogin(authCode)
  })

  if (result) {
    handleLoginSuccess(result)
  } else if (errorMsg.value) {
    uni.$u.toast(errorMsg.value)
  }
}

// 扫码登录
async function handleScanLogin() {
  if (!checkAgreement()) return

  const result = await scanLogin(async (qrCode) => {
    // 调用后端接口，用扫码结果换取 token 和用户信息
    return await userApi.scanLogin(qrCode)
  })

  if (result) {
    handleLoginSuccess(result)
  } else if (errorMsg.value) {
    uni.$u.toast(errorMsg.value)
  }
}

// 跳转手机号登录
function goPhoneLogin() {
  uni.navigateTo({
    url: `${LOGIN_PATH}?redirect=${encodeURIComponent(redirect)}`
  })
}

// 登录成功处理
function handleLoginSuccess(result) {
  // 保存 token
  if (result.token) {
    setToken(result.token)
  }

  uni.$u.toast('登录成功')

  setTimeout(() => {
    uni.$u.route({
      type: isTabBarPath(redirect) ? 'switchTab' : 'redirectTo',
      url: redirect
    })
  }, 500)
}

onShow(() => {
  // 检查是否已登录
  console.log(222222222222222)
})

onLoad((options) => {
  console.log(1111111111111)
  // 检查是否已登录
  handleDingTalkLogin()

  if (options.redirect) {
    redirect = decodeURIComponent(options.redirect)
  }
})
</script>

<style lang="scss" scoped>
.dingtalk-login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%);
  padding: 0 40rpx;
}

.header {
  padding-top: 120rpx;
  text-align: center;

  .logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 40rpx;
  }

  .title {
    font-size: 48rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
  }

  .subtitle {
    font-size: 28rpx;
    color: #999;
  }
}

.login-options {
  margin-top: 80rpx;
}

.login-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

  &:active {
    opacity: 0.8;
  }

  .icon-wrap {
    width: 100rpx;
    height: 100rpx;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    color: #fff;

    &.dingtalk {
      background: linear-gradient(135deg, #3296fa 0%, #1677ff 100%);
    }

    &.scan {
      background: linear-gradient(135deg, #36cfc9 0%, #13c2c2 100%);
    }

    &.phone {
      background: linear-gradient(135deg, #ffc53d 0%, #faad14 100%);
    }
  }

  .info {
    flex: 1;

    .name {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 8rpx;
    }

    .desc {
      font-size: 24rpx;
      color: #999;
    }
  }

  .arrow {
    padding: 10rpx;
  }
}

.agreement {
  position: fixed;
  bottom: 80rpx;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 40rpx;

  .checkbox-wrap {
    margin-right: 8rpx;
  }

  .text {
    font-size: 24rpx;
    color: #999;

    .link {
      color: #1677ff;
    }
  }
}
</style>
