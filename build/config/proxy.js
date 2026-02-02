export const createViteProxy = (env) => {
  const { VITE_APP_PROXY, VITE_API_PREFIX, VITE_API_BASE_URL } = env
  console.log('VITE_APP_PROXY -> ', VITE_APP_PROXY)
  console.log('VITE_API_PREFIX -> ', VITE_API_PREFIX)
  console.log('VITE_API_BASE_URL -> ', VITE_API_BASE_URL)
  // ┌─────────────────────────────────────────────────────────────┐
  // │                      没有代理（跨域）                         │
  // ├─────────────────────────────────────────────────────────────┤
  // │  浏览器                                     后端服务器        │
  // │  localhost:3000  ──── ❌ 被阻止 ────→  api.example.com       │
  // └─────────────────────────────────────────────────────────────┘

  // ┌─────────────────────────────────────────────────────────────┐
  // │                      使用代理（解决跨域）                      │
  // ├─────────────────────────────────────────────────────────────┤
  // │  浏览器           Vite 代理服务器            后端服务器        │
  // │  localhost:3000 ──→ localhost:3000 ──→ api.example.com     │
  // │                                                             │
  // │  请求: /api/user                                            │
  // │  代理转发: https://api.example.com/user                     │
  // └─────────────────────────────────────────────────────────────┘

  // 前端请求	          代理转发到
  // /api/user/login	https://api.example.com/user/login
  // /api/order/list	https://api.example.com/order/list
  // 不使用代理直接返回
  if (!JSON.parse(VITE_APP_PROXY)) return undefined
  const proxy = {
    // 匹配以 /api 开头的请求
    [VITE_API_PREFIX]: {
      // 转发到后端服务器
      target: VITE_API_BASE_URL,
      // 修改请求头中的 Origin
      changeOrigin: true,
      // 重写路径：去掉 /api 前缀
      rewrite: (path) => path.replace(new RegExp(`^${VITE_API_PREFIX}`), '')
    }
  }
  return proxy
}
