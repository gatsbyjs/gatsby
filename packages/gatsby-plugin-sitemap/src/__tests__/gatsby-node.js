jest.mock(`sitemap`, () => {
  return {
    simpleSitemapAndIndex: jest.fn(),
  }
})

const path = require(`path`)
const sitemap = require(`sitemap`)
const { onPostBuild } = require(`../gatsby-node`)

const pathPrefix = ``

const reporter = {
  verbose: jest.fn(),
  panic: jest.fn(),
}

beforeEach(() => {
  global.__PATH_PREFIX__ = ``

  sitemap.simpleSitemapAndIndex.mockReset()
})

describe(`gatsby-plugin-sitemap Node API`, () => {
  it(`default settings work properly`, async () => {
    const graphql = jest.fn()
    graphql.mockResolvedValue({
      data: {
        site: {
          siteMetadata: {
            siteUrl: `http://dummy.url`,
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
      },
    })
    await onPostBuild({ graphql, pathPrefix, reporter }, {})
    const {
      destinationDir,
      sourceData,
    } = sitemap.simpleSitemapAndIndex.mock.calls[0][0]
    expect(destinationDir).toEqual(path.join(`public`, `sitemap`))
    expect(sourceData).toMatchSnapshot()
  })

  it(`custom query runs`, async () => {
    const graphql = jest.fn()
    const siteUrl = `http://dummy.url`
    graphql.mockResolvedValue({
      data: {
        allSitePage: {
          edges: [
            {
              node: {
                path: `/page-1`,
              },
            },
            {
              node: {
                path: `/post/exclude-page`,
              },
            },
          ],
        },
      },
    })
    const customQuery = `
      {
        allSitePage {
          edges {
            node {
              path
            }
          }
        } 
    }`
    const options = {
      output: `custom-folder`,
      resolveSiteUrl: () => siteUrl,
      resolvePages: data => data.allSitePage.edges.map(edge => edge.node),
      serialize: (page, { resolvePagePath }) => {
        return {
          url: resolvePagePath(page),
          changefreq: `weekly`,
          priority: 0.8,
        }
      },
      excludes: [`/post/exclude-page`],
      query: customQuery,
    }

    await onPostBuild({ graphql, pathPrefix, reporter }, options)

    const {
      destinationDir,
      sourceData,
    } = sitemap.simpleSitemapAndIndex.mock.calls[0][0]

    expect(destinationDir).toEqual(path.join(`public`, `custom-folder`))
    expect(sourceData).toMatchSnapshot()
    expect(graphql).toBeCalledWith(customQuery)
  })
  describe(`sitemap index`, () => {
    let graphql = null
    const queryResult = {
      data: {
        site: {
          siteMetadata: {
            siteUrl: `http://dummy.url`,
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
      },
    }
    beforeEach(() => {
      graphql = jest.fn()
      graphql.mockResolvedValue(queryResult)
    })
    it(`should include path prefix when creating creating index sitemap`, async () => {
      const options = {
        entryLimit: 1,
      }
      const prefix = `/test`
      await onPostBuild({ graphql, pathPrefix: prefix, reporter }, options)
      const { sourceData } = sitemap.simpleSitemapAndIndex.mock.calls[0][0]
      sourceData.forEach(page => {
        expect(page.url).toEqual(expect.stringContaining(prefix))
      })
    })
  })
})
