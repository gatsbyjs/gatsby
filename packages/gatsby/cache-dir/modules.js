const modules = new Map()

export function addModule(moduleId, m) {
  modules.set(moduleId, m)
}

export function getModule(moduleId) {
  return modules.get(moduleId)
}
