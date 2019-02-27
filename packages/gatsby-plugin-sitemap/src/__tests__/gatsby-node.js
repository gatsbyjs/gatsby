const fs = require(`fs`)
const path = require(`path`)
const { onPostBuild } = require(`../gatsby-node`)
const internals = require(`../internals`)
const pathPrefix = ``

describe(`Test plugin sitemap`, async () => {
  it(`default settings work properly`, async () => {
    internals.writeFile = jest.fn()
    internals.writeFile.mockResolvedValue(true)
    const graphql = jest.fn()
    graphql.mockResolvedValue({
      data: {
        site: {
          siteMetadata: {
            siteUrl: `http://dummy.url`,
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
    })
    await onPostBuild({ graphql, pathPrefix }, {})
    const [filePath, contents] = internals.writeFile.mock.calls[0]
    expect(filePath).toEqual(path.join(`public`, `sitemap.xml`))
    expect(contents).toMatchSnapshot()
  })
  it(`custom query runs`, async () => {
    internals.writeFile = jest.fn()
    internals.writeFile.mockResolvedValue(true)
    const graphql = jest.fn()
    graphql.mockResolvedValue({
      data: {
        site: {
          siteMetadata: {
            siteUrl: `http://dummy.url`,
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
                path: `/post/exclude-page`,
              },
            },
          ],
        },
      },
    })
    const customQuery = `
      {
        site {
          siteMetadata {
            siteUrl
          }
        }

        allSitePage {
          edges {
            node {
              path
            }
          }
        } 
    }`
    const options = {
      output: `custom-sitemap.xml`,
      serialize: ({ site, allSitePage }) =>
        allSitePage.edges.map(edge => {
          return {
            url: site.siteMetadata.siteUrl + `/post` + edge.node.path,
            changefreq: `weekly`,
            priority: 0.8,
          }
        }),
      exclude: [`/post/exclude-page`],
      query: customQuery,
    }
    await onPostBuild({ graphql, pathPrefix }, options)
    const [filePath, contents] = internals.writeFile.mock.calls[0]
    expect(filePath).toEqual(path.join(`public`, `custom-sitemap.xml`))
    expect(contents).toMatchSnapshot()
    expect(graphql).toBeCalledWith(customQuery)
  })
  describe(`sitemap index`, () => {
    let queryResult = {
      data: {
        site: {
          siteMetadata: {
            siteUrl: `http://dummy.url`,
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
    it(`set sitemap size and urls are more than it.`, async () => {
      const tmp = require(`os`).tmpdir()
      const graphql = jest.fn()
      const expectedFiles = [
        tmp + `/sitemap-0.xml`,
        tmp + `/sitemap-1.xml`,
        tmp + `/sitemap.xml`,
      ]
      graphql.mockResolvedValue(queryResult)
      const options = {
        sitemapSize: 1,
        targetFolder: tmp,
      }
      await onPostBuild({ graphql, pathPrefix }, options)
      expectedFiles.forEach(expectedFile => {
        expect(fs.existsSync(expectedFile)).toBe(true)
        fs.unlinkSync(expectedFile)
      })
    })
    it(`set sitempa size and urls are less than it.`, async () => {
      const tmp = require(`os`).tmpdir()
      internals.writeFile = jest.fn()
      internals.writeFile.mockResolvedValue(true)
      const graphql = jest.fn()
      graphql.mockResolvedValue(queryResult)
      const options = {
        sitemapSize: 100,
        targetFolder: tmp,
      }
      await onPostBuild({ graphql, pathPrefix }, options)
      const [filePath, contents] = internals.writeFile.mock.calls[0]
      expect(filePath).toEqual(path.join(tmp, `sitemap.xml`))
      expect(contents).toMatchSnapshot()
    })
  })
})
