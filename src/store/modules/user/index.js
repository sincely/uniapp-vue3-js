import { defineStore } from 'pinia'

const userAuthStore = defineStore('user', {
  state: () => ({
    authCode: ''
  }),
  getters: {
    getAuthCode() {
      return this.authCode
    }
  },
  actions: {
    setAuthCode(authCode) {
      this.authCode = authCode
    },
    clearAuthCode() {
      this.authCode = ''
    }
  },
  persist: true
})

export default userAuthStore
