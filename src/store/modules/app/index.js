import { defineStore } from 'pinia'

const useAppStore = defineStore('app', {
  state: () => ({
    // 系统信息
    systemInfo: {},
    // 胶囊按钮信息（小程序）
    menuButtonInfo: {},
    // 网络状态
    networkType: 'unknown', // wifi/2g/3g/4g/5g/ethernet/unknown/none
    isConnected: true,
    // 主题模式
    darkMode: false,
    // 应用状态
    isBackground: false, // 是否在后台
    // 启动参数
    launchOptions: {}
  }),

  getters: {
    /** 完整系统信息 */
    getSystemInfo: (state) => state.systemInfo,

    /** 网络类型 */
    getNetworkType: (state) => state.networkType,

    /** 是否联网 */
    getIsConnected: (state) => state.isConnected,

    /** 是否Wifi */
    isWifi: (state) => state.networkType === 'wifi',

    /** 是否无网络 */
    isOffline: (state) => state.networkType === 'none' || !state.isConnected,

    /** 是否深色模式 */
    isDarkMode: (state) => state.darkMode,

    /** 是否在后台 */
    getIsBackground: (state) => state.isBackground,

    /** 启动参数 */
    getLaunchOptions: (state) => state.launchOptions
  },

  actions: {
    /**
     * 初始化应用Store（在App.vue onLaunch中调用）
     */
    async init() {
      this.initSystemInfo()
      this.initNetworkStatus()
      this.initTheme()
    },

    /**
     * 获取并设置系统信息
     */
    initSystemInfo() {
      try {
        const res = uni.getSystemInfo()
        console.log('222', res)
        this.systemInfo = res
      } catch (err) {
        console.error('[useAppStore] 获取系统信息失败:', err)
      }
    },

    /**
     * 初始化网络状态并开启监听
     */
    initNetworkStatus() {
      // 获取当前网络状态
      uni.getNetworkType({
        success: (res) => {
          this.networkType = res.networkType
          this.isConnected = res.networkType !== 'none'
        }
      })
      // 监听网络状态变化
      uni.onNetworkStatusChange((res) => {
        this.networkType = res.networkType
        this.isConnected = res.isConnected
        // 网络恢复或断开时可以触发相应逻辑
        if (!res.isConnected) {
          console.warn('[useAppStore] 网络已断开')
        }
      })
    },

    /**
     * 初始化主题（跟随系统）
     */
    initTheme() {
      try {
        const { theme } = uni.getSystemInfoSync()
        this.darkMode = theme === 'dark'
      } catch (err) {
        this.darkMode = false
      }
    },

    // ========== 更新方法 ==========
    /**
     * 设置系统信息
     */
    setSystemInfo(info) {
      this.systemInfo = info
    },

    /**
     * 切换主题模式
     */
    setDarkMode(isDark) {
      this.darkMode = isDark
    },

    /**
     * 切换主题
     */
    toggleDarkMode() {
      this.darkMode = !this.darkMode
    },

    /**
     * 设置应用前后台状态
     */
    setBackgroundState(isBackground) {
      this.isBackground = isBackground
    },

    /**
     * 设置启动参数
     */
    setLaunchOptions(options) {
      this.launchOptions = options
    },

    // ========== 小程序更新检测 ==========
    /**
     * 检测小程序更新（仅小程序有效）
     */
    checkUpdate() {
      // #ifdef MP
      if (!uni.getUpdateManager) {
        console.warn('[useAppStore] 当前环境不支持 getUpdateManager')
        return
      }
      const updateManager = uni.getUpdateManager()

      updateManager.onCheckForUpdate((res) => {
        console.log('[useAppStore] 检测更新:', res.hasUpdate ? '有新版本' : '已是最新')
      })

      updateManager.onUpdateReady(() => {
        uni.showModal({
          title: '更新提示',
          content: '新版本已准备好，是否立即重启应用？',
          success: (res) => {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
            }
          }
        })
      })

      updateManager.onUpdateFailed(() => {
        // 新的版本下载失败
        uni.showModal({
          title: '已经有新版本了哟~',
          content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
          showCancel: false
        })
      })
    },
    // 持久化配置
    persist: {
      key: 'app-store',
      paths: ['darkMode'] // 仅持久化主题设置
    }
  }
})

export default useAppStore
