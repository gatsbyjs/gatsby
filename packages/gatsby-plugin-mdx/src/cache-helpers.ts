export function createFileToMdxCacheKey(absolutePath: string): string {
  return `fileToMdx-${absolutePath}`
}

const importCache: Map<string, unknown> = new Map()

export async function cachedImport<Type>(packageName: string): Promise<Type> {
  if (importCache.has(packageName)) {
    return importCache.get(packageName) as Type
  }
  const importedPackage = await import(packageName)

  return importedPackage
}
