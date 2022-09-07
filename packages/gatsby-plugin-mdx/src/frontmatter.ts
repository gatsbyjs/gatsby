import grayMatter from "gray-matter"

const cacheMap = new Map()

export function parseFrontmatter(
  cacheKey: string,
  source: string
): { body: string; frontmatter: { [key: string]: unknown } } {
  if (cacheMap.has(cacheKey)) {
    return cacheMap.get(cacheKey)
  }

  const { content, data } = grayMatter(source, {
    language: `yaml`,
    // Disable JS/JSON frontmatter parsing.
    // See: https://github.com/gatsbyjs/gatsby/pull/35830
    engines: {
      js: () => {
        return {}
      },
      javascript: () => {
        return {}
      },
      json: () => {
        return {}
      },
    },
  })
  cacheMap.set(cacheKey, { body: content, frontmatter: data })

  return { body: content, frontmatter: data }
}
