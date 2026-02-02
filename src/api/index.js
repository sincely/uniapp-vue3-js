const modulesHandle = (moduleContext = {}) => {
  if (!Object.keys(moduleContext).length) return
  const modules = {}
  Object.keys(moduleContext).forEach((v) => {
    for (const key in moduleContext[v].default) {
      modules[key] = moduleContext[v].default[key]
    }
  })
  return modules
}

const apis = modulesHandle(import.meta.glob('./modules/**/*.js', { eager: true }))
export const useRequest = () => apis
