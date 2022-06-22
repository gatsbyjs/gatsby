const configModuleCache = new Map<string, unknown>()

export function setGatsbyConfigCache(
  name: string,
  moduleObject: unknown
): void {
  configModuleCache.set(name, moduleObject)
}

export function requireGatsbyConfig(name: string): unknown {
  return configModuleCache.get(name)
}

export function getAllGatsbyConfig(): Map<string, unknown> {
  return configModuleCache
}
