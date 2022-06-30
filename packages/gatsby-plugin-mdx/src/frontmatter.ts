import grayMatter from "gray-matter"

const cacheMap = new Map()

export function parseFrontmatter(
  cacheKey: string,
  source: string
): { body: string; frontmatter: { [key: string]: unknown } } {
  if (cacheMap.has(cacheKey)) {
    return cacheMap.get(cacheKey)
  }

  const { content, data } = grayMatter(source)
  cacheMap.set(cacheKey, { content, data })

  return { body: content, frontmatter: data }
}
