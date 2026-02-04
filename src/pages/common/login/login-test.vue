<template>
  <view class="login-container">
    <view class="login-box">
      <view class="logo">
        <text class="logo-text">欢迎登录</text>
      </view>

      <view class="form">
        <view class="form-item">
          <u-input v-model="form.username" placeholder="请输入用户名" prefixIcon="account" :clearable="true" />
        </view>

        <view class="form-item">
          <u-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefixIcon="lock"
            :clearable="true"
          />
        </view>

        <view class="form-item">
          <u-button type="primary" :loading="loading" :disabled="!form.username || !form.password" @click="handleLogin">
            登录
          </u-button>
        </view>

        <view class="tips">
          <text class="tip-text">测试账号: admin / 123456</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { setToken } from '@/utils/auth'
import { HOME_PATH } from '@/router'

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)

// 获取重定向路径
const getRedirectPath = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage?.$page?.options || {}
  return options.redirect ? decodeURIComponent(options.redirect) : HOME_PATH
}

const handleLogin = async () => {
  try {
    loading.value = true

    // 模拟登录接口请求
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 简单验证（实际项目中应该调用后端接口）
    if (form.value.username === 'admin' && form.value.password === '123456') {
      // 保存token
      setToken('mock-token-' + Date.now())

      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 跳转到重定向页面或首页
      const redirectPath = getRedirectPath()

      setTimeout(() => {
        uni.reLaunch({
          url: redirectPath
        })
      }, 500)
    } else {
      uni.showToast({
        title: '用户名或密码错误',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('登录失败:', error)
    uni.showToast({
      title: '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.login-box {
  width: 100%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

.logo {
  text-align: center;
  margin-bottom: 60rpx;

  .logo-text {
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
  }
}

.form {
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
</style>
