const {
  runQuery,
  defaultOptions: { serialize },
} = require(`../internals`)

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

    it(`excludes pages`, async () => {
      const graphql = () => Promise.resolve(generateQueryResultsMock())
      const queryRecords = await runQuery(graphql, ``, [`/page-2`], pathPrefix)
      const urls = serialize(queryRecords)

      verifyUrlsExistInResults(urls, [`http://dummy.url${pathPrefix}/page-1`])
    })
  }

  describe(`no path-prefix`, () => {
    runTests()
  })

  describe(`with path-prefix`, () => {
    runTests(`/path-prefix`)
  })
})
