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
        pagePath: '/pages/tabbar/home/index',
        customIcon: false
      },
      {
        text: '账户',
        iconPath: 'plus-circle',
        selectedIconPath: 'plus-circle-fill',
        midButton: true, // 如果是凸起按钮项，需配置此值为true
        pagePath: '/pages/tabbar/list/index',
        customIcon: false
        // iconPath: "/static/uview/example/min_button.png",
        // selectedIconPath: "/static/uview/example/min_button_select.png",
      },

      {
        text: '我的',
        iconPath: 'account',
        selectedIconPath: 'account-fill',
        pagePath: '/pages/tabbar/user/index',
        customIcon: false
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
