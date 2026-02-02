const PREFIX = import.meta.env.VITE_APP_PREFIX

const storage = {
  local: {
    has: (key) => {
      return !!uni.getStorageSync(`${PREFIX}${key}`)
    },
    get: (key) => {
      return uni.getStorageSync(`${PREFIX}${key}`)
    },
    set: (key, value) => {
      uni.setStorageSync(`${PREFIX}${key}`, value)
    },
    remove: (key) => {
      uni.removeStorageSync(`${PREFIX}${key}`)
    },
    clear: () => {
      uni.clearStorageSync()
    }
  }
}

export default storage
