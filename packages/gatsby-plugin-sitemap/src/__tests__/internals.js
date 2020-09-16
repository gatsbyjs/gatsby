const {
  withoutTrailingSlash,
  prefixPath,
  resolveSiteUrl,
  resolvePagePath,
  resolvePages,
  defaultFilterPages,
  serialize,
} = require(`../internals`)

const minimatch = require(`minimatch`)

beforeEach(() => {
  global.__PATH_PREFIX__ = ``
})

const SiteUrl = `https://example.net`
const TestPath = `/test/path/`

describe(`sitemap internals tests`, () => {
  it(`test withoutTrailingSlash`, () => {
    const result = withoutTrailingSlash(`/`)
    expect(result).toEqual(`/`)

    const result2 = withoutTrailingSlash(TestPath)
    expect(result2).toStrictEqual(`/test/path`)
  })

  it(`test prefixPath`, () => {
    const result = prefixPath({
      url: TestPath,
      siteUrl: SiteUrl,
      pathPrefix: `/root`,
    })
    expect(result).toStrictEqual(`https://example.net/root/test/path/`)
  })

  it(`test default resolveSiteUrl`, () => {
    const result = resolveSiteUrl({
      site: { siteMetadata: { siteUrl: SiteUrl } },
    })
    expect(result).toStrictEqual(SiteUrl)
  })

  it(`test default resolvePagePath`, () => {
    const result = resolvePagePath({ path: TestPath })
    expect(result).toStrictEqual(TestPath)
  })

  it(`test default resolvePages`, () => {
    const pages = [{ path: `/page-1/` }, { path: `/page-2/` }]
    const result = resolvePages({ allSitePage: { nodes: pages } })
    expect(result).toEqual(pages)
  })

  it(`test defaultFilterPages`, () => {
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

  it(`test default serialize`, () => {
    const page = { path: TestPath }
    const result = serialize(page, { resolvePagePath })

    expect(result).toEqual(
      expect.objectContaining({
        url: TestPath,
        changefreq: `daily`,
        priority: 0.7,
      })
    )
  })
})
