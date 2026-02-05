<template>
  <app-page nav-title="扫码登录确认" show-nav-back>
    <view class="confirm-page">
      <view class="card">
        <view class="title">确认本次扫码登录？</view>
        <u-button class="btn" type="primary" shape="square" @click="handleConfirm">确认扫码</u-button>
        <u-button class="btn" type="success" shape="square" @click="handleCancel">取消扫码</u-button>
      </view>
    </view>
  </app-page>
</template>

<script setup>
import auth from '@/api/modules/auth'
const eventChannel = uni.getOpenerEventChannel?.()

const authCode = ref('')
const ticket = ref('')

const handleConfirm = async () => {
  eventChannel?.emit('auth-confirm-scan', { status: 0 })

  const result = await auth.verifyQrcode({
    code: authCode.value,
    ticket: ticket.value,
    op: 0
  })
  if (result.code === 200) {
    console.log('result', result)
    // 延迟1秒，确保事件发送完成
    setTimeout(() => {
      uni.navigateBack({ delta: 1 })
    }, 1000)
  }
}

const handleCancel = async () => {
  eventChannel?.emit('auth-cancel-scan', { status: 1 })
  // uni.navigateBack({ delta: 1 })
  const result = await auth.verifyQrcode({
    code: authCode.value,
    ticket: ticket.value,
    op: 0
  })
  console.log('result', result)

  if (result.code === 200) {
    console.log('result', result)
    // 延迟1秒，确保事件发送完成
    setTimeout(() => {
      uni.navigateBack({ delta: 1 })
    }, 1000)
  }
}

onLoad((options) => {
  //    url: '/pages/common/authConfirm/index?authCode=' + authCode.value + '&ticket=' + result.data.ticket,可以通过 options 解析参数
  console.log('authConfirm options:', options)
  authCode.value = options.code
  ticket.value = options.ticket
})
</script>

<style lang="scss" scoped>
.confirm-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  background: linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%);
}

.card {
  width: 100%;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

  .title {
    font-size: 36rpx;
    font-weight: 600;
    color: #1f2937;
    text-align: center;
    margin-bottom: 16rpx;
  }

  .desc {
    font-size: 26rpx;
    color: #6b7280;
    text-align: center;
    margin-bottom: 40rpx;
  }

  .btn {
    margin-bottom: 20rpx;
  }
}
</style>
