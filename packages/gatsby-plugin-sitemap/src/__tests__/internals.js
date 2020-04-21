const {
  filterQuery,
  defaultOptions: { serialize },
} = require(`../internals`)

beforeEach(() => {
  global.__PATH_PREFIX__ = ``
})

const verifyUrlsExistInResults = (results, urls) => {
  expect(results.map(result => result.url)).toEqual(urls)
}

describe(`results using default settings`, () => {
  const generateQueryResultsMock = (
    { siteUrl } = { siteUrl: `http://dummy.url` }
  ) => {
    return {
      data: {
        site: {
          siteMetadata: {
            siteUrl: siteUrl,
          },
        },
        allSitePage: {
          edges: [
            {
              node: {
                path: `/page-1`,
              },
            },
            {
              node: {
                path: `/page-2`,
              },
            },
          ],
        },
      },
    }
  }

  const runTests = (pathPrefix = ``) => {
    beforeEach(() => {
      global.__PATH_PREFIX__ = pathPrefix
    })

    it(`prepares all urls correctly`, async () => {
      const graphql = () => Promise.resolve(generateQueryResultsMock())
      const results = await graphql(``)
      const queryRecords = filterQuery(results, [], pathPrefix)
      const urls = serialize(queryRecords)

      verifyUrlsExistInResults(urls, [
        `http://dummy.url${pathPrefix}/page-1`,
        `http://dummy.url${pathPrefix}/page-2`,
      ])
    })

    it(`sanitize siteUrl`, async () => {
      const graphql = () =>
        Promise.resolve(
          generateQueryResultsMock({ siteUrl: `http://dummy.url/` })
        )

      const data = await graphql(``)
      const queryRecords = filterQuery(data, [], pathPrefix)
      const urls = serialize(queryRecords)

      verifyUrlsExistInResults(urls, [
        `http://dummy.url${pathPrefix}/page-1`,
        `http://dummy.url${pathPrefix}/page-2`,
      ])
    })

    it(`excludes pages without trailing slash`, async () => {
      const graphql = () => Promise.resolve(generateQueryResultsMock())
      const data = await graphql(``)
      const queryRecords = filterQuery(data, [`/page-2`], pathPrefix)
      const urls = serialize(queryRecords)

      verifyUrlsExistInResults(urls, [`http://dummy.url${pathPrefix}/page-1`])
    })

    it(`excludes pages with trailing slash`, async () => {
      const graphql = () => Promise.resolve(generateQueryResultsMock())
      const data = await graphql(``)
      const queryRecords = filterQuery(data, [`/page-2/`], pathPrefix)
      const urls = serialize(queryRecords)

      verifyUrlsExistInResults(urls, [`http://dummy.url${pathPrefix}/page-1`])
    })

    it(`should fail when siteUrl is not set`, async () => {
      const graphql = () =>
        Promise.resolve(generateQueryResultsMock({ siteUrl: null }))
      expect.assertions(1)

      try {
        const data = await graphql(``)
        filterQuery(data, [], pathPrefix)
      } catch (err) {
        expect(err.message).toEqual(
          expect.stringContaining(`SiteMetaData 'siteUrl' property is required`)
        )
      }
    })
  }

  describe(`no path-prefix`, () => {
    runTests()
  })

  describe(`with path-prefix`, () => {
    runTests(`/path-prefix`)
  })
})

describe(`results using non default alternatives`, () => {
  const generateQueryResultsMockNodes = (
    { siteUrl } = { siteUrl: `http://dummy.url` }
  ) => {
    return {
      data: {
        site: {
          siteMetadata: {
            siteUrl: siteUrl,
          },
        },
        allSitePage: {
          nodes: [
            {
              path: `/page-1`,
            },
            {
              path: `/page-2`,
            },
          ],
        },
        otherData: {
          nodes: [
            {
              name: `test`,
            },
            {
              name: `test 2`,
            },
          ],
        },
      },
    }
  }

  it(`handles allSitePage.nodes type query properly`, async () => {
    const graphql = () => Promise.resolve(generateQueryResultsMockNodes())
    const results = await graphql(``)
    const queryRecords = filterQuery(results, [], ``)
    const urls = serialize(queryRecords)

    verifyUrlsExistInResults(urls, [
      `http://dummy.url/page-1`,
      `http://dummy.url/page-2`,
    ])
  })

  it(`handles custom siteUrl Resolver Properly type query properly`, async () => {
    const customUrl = `https://another.dummy.url`
    const customSiteResolver = () => customUrl
    const graphql = () => Promise.resolve(generateQueryResultsMockNodes())
    const results = await graphql(``)
    const queryRecords = filterQuery(results, [], ``, customSiteResolver)

    expect(queryRecords.site.siteMetadata.siteUrl).toEqual(customUrl)
    expect(queryRecords).toHaveProperty(`otherData`)
  })
})
