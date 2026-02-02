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
        pagePath: '/pages/home/home',
        isDot: true
      },
      {
        text: '关于',
        iconPath: 'account',
        selectedIconPath: 'account-fill',
        pagePath: '/pages/about/about',
        count: 3
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
