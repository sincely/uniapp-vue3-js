// 请求状态错误
export const httpLogError = (error, msg) => {
  error.message = msg
  uni.showToast({
    title: msg,
    icon: 'error',
    duration: 2000
  })
}

// api请求错误
export const requestError = (response) => {
  return new Promise((resolve, reject) => {
    const { data } = response
    const msg = `api请求出错 ${response.config.url}：${data.message}`
    uni.showToast({
      title: msg,
      icon: 'error',
      duration: 2000
    })
    reject(data)
  })
}

// 登录失效
export const throttleToLogin = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const fullPath = currentPage?.$page?.fullPath || (currentPage?.route ? `/${currentPage.route}` : '')
  const redirect = encodeURIComponent(fullPath)
  uni.reLaunch({
    url: `/pages/common/login/index?redirect=${redirect}`
  })
}
