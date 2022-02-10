function getPath(path, currentPath) {
  if (path === undefined) {
    throw new Error(`path was undefined`)
  }
  const newPath = currentPath ? `${path.key}:${currentPath}` : String(path.key)
  if (!path.prev) {
    return newPath
  }
  return getPath(path.prev, newPath)
}
function findLongestPrefix(target, prefixes) {
  let match
  let matchLength = 0
  for (const prefix of prefixes) {
    if (target.startsWith(prefix)) {
      const length = prefix.length
      if (length > matchLength) {
        match = prefix
        matchLength = length
      }
    }
  }
  return match
}
export class CascadedContext {
  /*
    Stores a value by prefix like

    a:b       : true
    a:b:c:d   : false
    a:b:c:d:e : true

    the prefix is determined by walking the `info.path` property
    and concatenating it by `:`

    By finding the longest matching prefix for a given other path,
    we can determine the current state of the variable for that part of the cascade
  */
  cascadeMap = new Map()
  reporter = null

  constructor({ reporter }) {
    this.reporter = reporter
  }
  set(info, value) {
    const path = getPath(info.path)
    this.cascadeMap.set(path, value)
  }
  get(info) {
    if (!info.path) {
      return `en-US` // @todo make real this.defaultValue
    }
    const path = getPath(info.path)
    const cascadeKeys = [...this.cascadeMap.keys()]
    const lastCascade = findLongestPrefix(path, cascadeKeys)

    if (lastCascade) {
      // Since we pulled this out of the cascade keys,
      // there is always a T for this key
      this.reporter.verbose(
        `found this active locale from context:`,
        this.cascadeMap.get(lastCascade)
      )
      return this.cascadeMap.get(lastCascade)
    } else {
      this.reporter.verbose(`fallback to default locale`)
      return `en-US` // @todo make real this.defaultValue
    }
  }
  has(value) {
    for (const v of this.cascadeMap.values()) {
      if (v === value) {
        return true
      }
    }
    return false
  }
}
