import { defineStore } from 'pinia'
import { ref } from 'vue'

const useTabbarStore = defineStore(
  'tabbar',
  () => {
    const activeIndex = ref(0)
    const tabbarList = ref([
      {
        text: '首页',
        iconPath: 'home',
        selectedIconPath: 'home-fill',
        pagePath: '/pages/tabbar/home/index'
      },
      {
        text: '账户',
        iconPath: 'plus',
        selectedIconPath: 'account-fill',
        midButton: true, // 如果是凸起按钮项，需配置此值为true
        pagePath: '/pages/tabbar/list/index',
        iconSize: 40, // 图标大小，不设置默认跟随prop为40rpx
        textSize: 26 // 文字大小，不设置默认跟随prop为26rpx
      },

      {
        text: '我的',
        iconPath: 'account',
        selectedIconPath: 'account-fill',
        pagePath: '/pages/tabbar/user/index'
      }
    ])

    const setActiveIndex = (index) => {
      activeIndex.value = index
    }

    const updateBadge = (index, count) => {
      tabbarList.value[index].count = count
    }

    const updateIsDot = (index, isDot) => {
      tabbarList.value[index].isDot = isDot
    }

    return {
      activeIndex,
      tabbarList,
      setActiveIndex,
      updateBadge,
      updateIsDot
    }
  },
  {
    persist: true
  }
)

export default useTabbarStore
