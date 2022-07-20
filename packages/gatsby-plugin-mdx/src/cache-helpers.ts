export function createFileToMdxCacheKey(absolutePath: string): string {
  return `fileToMdx-${absolutePath}`
}
