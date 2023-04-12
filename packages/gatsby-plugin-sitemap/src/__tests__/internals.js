const {
  withoutTrailingSlash,
  prefixPath,
  resolveSiteUrl,
  resolvePagePath,
  resolvePages,
  defaultFilterPages,
  serialize,
  pageFilter,
} = require(`../internals`)

const minimatch = require(`minimatch`)

beforeEach(() => {
  global.__PATH_PREFIX__ = ``
})

const SiteUrl = `https://example.net`
const TestPath = `/test/path/`

describe(`gatsby-plugin-sitemap internals tests`, () => {
  it(`withoutTrailingSlash should correct paths without final slash`, () => {
    const result = withoutTrailingSlash(`/`)
    expect(result).toEqual(`/`)

    const result2 = withoutTrailingSlash(TestPath)
    expect(result2).toStrictEqual(`/test/path`)
  })

  it(`prefixPath should correctly concatonate path`, () => {
    const result = prefixPath({
      url: TestPath,
      siteUrl: SiteUrl,
      pathPrefix: `/root`,
    })

    expect(result).toStrictEqual(`https://example.net/root/test/path/`)
  })

  it(`resolveSiteUrl should return SiteUrl`, () => {
    const result = resolveSiteUrl({
      site: { siteMetadata: { siteUrl: SiteUrl } },
    })
    expect(result).toStrictEqual(SiteUrl)
  })

  it(`resolvePagePath should return TestPath`, () => {
    const result = resolvePagePath({ path: TestPath })
    expect(result).toStrictEqual(TestPath)
  })

  it(`resolvePages should return sample pages`, () => {
    const pages = [{ path: `/page-1/` }, { path: `/page-2/` }]
    const result = resolvePages({ allSitePage: { nodes: pages } })
    expect(result).toEqual(pages)
  })

  it(`defaultFilterPages correctly detects path`, () => {
    const page = { path: TestPath }
    const result = defaultFilterPages(page, `/another/path/`, {
      resolvePagePath,
      minimatch,
      withoutTrailingSlash,
    })
    expect(result).toStrictEqual(false)

    const result2 = defaultFilterPages(page, TestPath, {
      resolvePagePath,
      minimatch,
      withoutTrailingSlash,
    })
    expect(result2).toStrictEqual(true)
  })

  it(`serialize should create expected object`, () => {
    const page = { path: TestPath }
    const result = serialize(page, { resolvePagePath })

    expect(result).toEqual({
      url: TestPath,
      changefreq: `daily`,
      priority: 0.7,
    })
  })

  it(`pageFilter should filter correctly`, () => {
    const { filteredPages: results } = pageFilter({
      allPages: [
        { path: `/404.html` },
        { path: `/to/be/removed` },
        { path: `/to/keep/1` },
        { path: `/to/keep/2` },
      ],
      filterPages: defaultFilterPages,
      excludes: [`/to/be/removed/`],
    })

    expect(results).toMatchSnapshot()
  })

  it(`pageFilter should filter correctly on consecutive runs`, () => {
    const allPages = [
      { path: `/to/keep/1` },
      { path: `/to/keep/2` },
      { path: `/404.html` },
    ]
    const filterPages = jest.fn()

    const { filteredPages } = pageFilter({
      allPages,
      filterPages,
      excludes: [],
    })
    expect(filteredPages).toHaveLength(2)
    expect(filteredPages).not.toContainEqual({ path: `/404.html` })

    const { filteredPages: filteredPages2 } = pageFilter({
      allPages,
      filterPages,
      excludes: [],
    })
    expect(filteredPages2).toHaveLength(2)
    expect(filteredPages2).not.toContainEqual({ path: `/404.html` })
  })
})
