const {
  runQuery,
  defaultOptions: { serialize },
} = require(`../internals`)

beforeEach(() => {
  global.__PATH_PREFIX__ = ``
})

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

  const verifyUrlsExistInResults = (results, urls) => {
    expect(results.map(result => result.url)).toEqual(urls)
  }

  const runTests = (pathPrefix = ``) => {
    beforeEach(() => {
      global.__PATH_PREFIX__ = pathPrefix
    })

    it(`prepares all urls correctly`, async () => {
      const graphql = () => Promise.resolve(generateQueryResultsMock())
      const queryRecords = await runQuery(graphql, ``, [], pathPrefix)
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
      const queryRecords = await runQuery(graphql, ``, [], pathPrefix)
      const urls = serialize(queryRecords)

      verifyUrlsExistInResults(urls, [
        `http://dummy.url${pathPrefix}/page-1`,
        `http://dummy.url${pathPrefix}/page-2`,
      ])
    })

    it(`excludes pages without trailing slash`, async () => {
      const graphql = () => Promise.resolve(generateQueryResultsMock())
      const queryRecords = await runQuery(graphql, ``, [`/page-2`], pathPrefix)
      const urls = serialize(queryRecords)

      verifyUrlsExistInResults(urls, [`http://dummy.url${pathPrefix}/page-1`])
    })

    it(`excludes pages with trailing slash`, async () => {
      const graphql = () => Promise.resolve(generateQueryResultsMock())
      const queryRecords = await runQuery(graphql, ``, [`/page-2/`], pathPrefix)
      const urls = serialize(queryRecords)

      verifyUrlsExistInResults(urls, [`http://dummy.url${pathPrefix}/page-1`])
    })

    it(`should fail when siteUrl is not set`, async () => {
      const graphql = () =>
        Promise.resolve(generateQueryResultsMock({ siteUrl: null }))
      expect.assertions(1)

      try {
        await runQuery(graphql, ``, [], pathPrefix)
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
