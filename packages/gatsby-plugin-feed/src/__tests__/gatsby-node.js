const fs = require(`fs`)
const path = require(`path`)
const { onPostBuild } = require(`../gatsby-node`)
const internals = require(`../internals`)
jest.mock(`fs`)
const DATE_TO_USE = new Date(`2018`)
const _Date = Date
global.Date = jest.fn(() => DATE_TO_USE)
global.Date.UTC = _Date.UTC
global.Date.now = _Date.now

describe(`Test plugin feed`, async () => {
  fs.existsSync = jest.fn()
  fs.existsSync.mockReturnValue(true)

  it(`default settings work properly`, async () => {
    internals.writeFile = jest.fn()
    internals.writeFile.mockResolvedValue(true)
    const graphql = jest.fn()
    graphql.mockResolvedValue({
      data: {
        site: {
          siteMetadata: {
            title: `a sample title`,
            description: `a description`,
            siteUrl: `http://dummy.url/`,
          },
        },
        allMarkdownRemark: {
          edges: [
            {
              node: {
                fields: {
                  slug: `a-slug`,
                },
                excerpt: `post description`,
              },
            },
          ],
        },
      },
    })
    await onPostBuild({ graphql }, {})
    const [filePath, contents] = internals.writeFile.mock.calls[0]
    expect(filePath).toEqual(path.join(`public`, `rss.xml`))
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
            title: `a sample title`,
            description: `a description`,
            siteUrl: `http://dummy.url/`,
          },
        },
        allMarkdownRemark: {
          edges: [
            {
              node: {
                frontmatter: {
                  path: `a-custom-path`,
                },
                excerpt: `post description`,
              },
            },
            {
              node: {
                frontmatter: {
                  path: `another-custom-path`,
                },
                excerpt: `post description`,
              },
            },
          ],
        },
      },
    })
    const customQuery = `
    {
      allMarkdownRemark(
        limit: 1000,
      ) {
        edges {
          node {
            frontmatter {
              path
            }
            excerpt
          }
        }
      }
    }
  `
    const options = {
      feeds: [
        {
          output: `rss_new.xml`,
          serialize: ({ query: { site, allMarkdownRemark } }) =>
            allMarkdownRemark.edges.map(edge => {
              return {
                ...edge.node.frontmatter,
                description: edge.node.excerpt,
                url: site.siteMetadata.siteUrl + edge.node.frontmatter.path,
              }
            }),
          query: customQuery,
        },
      ],
    }
    await onPostBuild({ graphql }, options)
    const [filePath, contents] = internals.writeFile.mock.calls[0]
    expect(filePath).toEqual(path.join(`public`, `rss_new.xml`))
    expect(contents).toMatchSnapshot()
    expect(graphql).toBeCalledWith(customQuery)
  })
})
