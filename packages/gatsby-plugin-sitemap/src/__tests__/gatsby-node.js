/* eslint-disable no-import-assign */
jest.mock(`fs`)

const fs = require(`fs`)
const path = require(`path`)
const sitemap = require(`sitemap`)

const { onPostBuild } = require(`../gatsby-node`)
import * as internals from "../internals"
const pathPrefix = ``

beforeEach(() => {
  global.__PATH_PREFIX__ = ``
})

describe(`Test plugin sitemap`, () => {
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
    let graphql = null
    const queryResult = {
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
    beforeEach(() => {
      graphql = jest.fn()
      graphql.mockResolvedValue(queryResult)

      internals.renameFile = jest.fn()
      internals.renameFile.mockResolvedValue(true)

      internals.writeFile = jest.fn()
      internals.writeFile.mockResolvedValue(true)

      fs.createWriteStream.mockReset()
      fs.createWriteStream.mockReturnValue({
        once: jest.fn((event, cb) => cb()),
        write: jest.fn(),
        end: jest.fn(),
      })

      fs.statSync.mockReset()
      fs.statSync.mockReturnValue({
        isDirectory: jest.fn(() => true),
      })
    })

    it(`set sitemap size and urls are more than it.`, async () => {
      const options = {
        sitemapSize: 1,
      }
      await onPostBuild({ graphql, pathPrefix }, options)
      expect(fs.createWriteStream.mock.calls[0][0]).toEqual(
        `./public/sitemap-0.xml`
      )
      expect(fs.createWriteStream.mock.calls[1][0]).toEqual(
        `./public/sitemap-1.xml`
      )
      expect(fs.createWriteStream.mock.calls[2][0]).toEqual(
        `./public/sitemap-index.xml`
      )
      const [originalFile, newFile] = internals.renameFile.mock.calls[0]
      expect(originalFile).toEqual(path.join(`public`, `sitemap-index.xml`))
      expect(newFile).toEqual(path.join(`public`, `sitemap.xml`))
    })
    it(`set sitemap size and urls are less than it.`, async () => {
      const options = {
        sitemapSize: 100,
      }
      await onPostBuild({ graphql, pathPrefix }, options)
      const [filePath, contents] = internals.writeFile.mock.calls[0]
      expect(filePath).toEqual(path.join(`public`, `sitemap.xml`))
      expect(contents).toMatchSnapshot()
    })
    it(`should include path prefix when creating creating index sitemap`, async () => {
      const sitemapSpy = jest.spyOn(sitemap, `createSitemapIndex`)
      const options = {
        sitemapSize: 1,
      }
      const prefix = `/test`
      await onPostBuild({ graphql, pathPrefix: prefix }, options)
      expect(sitemapSpy.mock.calls[0][0].hostname).toEqual(
        `${queryResult.data.site.siteMetadata.siteUrl}${prefix}`
      )
    })
  })
})
