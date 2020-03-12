jest.mock(`fs-extra`)
const fs = require(`fs-extra`)
const path = require(`path`)
const { onPreBootstrap, onPostBuild } = require(`../gatsby-node`)
const DATE_TO_USE = new Date(`2018`)
const _Date = Date
global.Date = jest.fn(() => DATE_TO_USE)
global.Date.UTC = _Date.UTC
global.Date.now = _Date.now

describe(`Test plugin feed`, () => {
  beforeEach(() => {
    fs.exists = jest.fn().mockResolvedValue(true)
    fs.writeFile = jest.fn().mockResolvedValue()
    fs.mkdirp = jest.fn().mockResolvedValue()
  })

  describe(`options validation`, () => {
    const setup = async options => {
      const reporter = {
        stripIndent: jest.fn(value => value.trim()),
        warn: jest.fn(),
      }
      await onPreBootstrap({ reporter }, options)

      return [reporter, options]
    }

    const deprecationNotice = `This behavior will be removed in the next major release of gatsby-plugin-feed`

    it(`removes plugins`, async () => {
      const options = { plugins: [] }

      await setup(options)

      expect(options.plugins).toBeUndefined()
    })

    it(`warns when feeds is not supplied`, async () => {
      const options = {}

      const [reporter] = await setup(options)

      expect(reporter.warn).toHaveBeenCalledTimes(1)
      expect(reporter.warn).toHaveBeenCalledWith(
        expect.stringContaining(deprecationNotice)
      )
    })

    it(`warns when individual feed does not have title`, async () => {
      const options = {
        feeds: [
          {
            output: `rss.xml`,
            query: `{}`,
            serialize: () => {},
          },
        ],
      }

      const [reporter] = await setup(options)

      expect(reporter.warn).toHaveBeenCalledTimes(1)
      expect(reporter.warn).toHaveBeenCalledWith(
        expect.stringContaining(`title`)
      )
    })

    it(`warns when individual feed does not have serialize function`, async () => {
      const options = {
        feeds: [
          {
            output: `rss.xml`,
            query: `{}`,
            title: `my feed`,
          },
        ],
      }

      const [reporter] = await setup(options)

      expect(reporter.warn).toHaveBeenCalledTimes(1)
      expect(reporter.warn).toHaveBeenCalledWith(
        expect.stringContaining(deprecationNotice)
      )
    })

    it(`throws when invalid plugin options`, async () => {
      const invalidOptions = [
        {
          feeds: [
            {
              // output is missing
              query: `{}`,
            },
          ],
        },
        {
          feeds: [
            {
              output: `rss.xml`,
              // query is missing
            },
          ],
        },
      ]

      for (let options of invalidOptions) {
        try {
          await setup(options)
        } catch (e) {
          expect(e).toMatchSnapshot()
        }
      }

      expect.assertions(invalidOptions.length)
    })
  })

  it(`default settings work properly`, async () => {
    fs.writeFile = jest.fn()
    fs.writeFile.mockResolvedValue(true)
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
    const [filePath, contents] = fs.writeFile.mock.calls[0]
    expect(filePath).toEqual(path.join(`public`, `rss.xml`))
    expect(contents).toMatchSnapshot()
  })

  it(`custom properties work properly`, async () => {
    fs.writeFile = jest.fn()
    fs.writeFile.mockResolvedValue(true)
    const graphql = jest.fn()
    graphql.mockResolvedValue({
      data: {
        site: {
          siteMetadata: {
            title: `site title`,
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
          output: `rss.xml`,
          title: `feed title`,
          language: `en`,
          generator: `custom generator`,
          query: customQuery,
          serialize: ({ query: { site, allMarkdownRemark } }) =>
            allMarkdownRemark.edges.map(edge => {
              return {
                ...edge.node.frontmatter,
                description: edge.node.excerpt,
                url: site.siteMetadata.siteUrl + edge.node.frontmatter.path,
              }
            }),
        },
      ],
    }
    await onPostBuild({ graphql }, options)
    const [filePath, contents] = fs.writeFile.mock.calls[0]
    expect(filePath).toEqual(path.join(`public`, `rss.xml`))
    expect(contents).toMatchSnapshot()
  })

  it(`custom query runs`, async () => {
    fs.writeFile = jest.fn()
    fs.writeFile.mockResolvedValue(true)
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
          title: `my feed`,
        },
      ],
    }
    await onPostBuild({ graphql }, options)
    const [filePath, contents] = fs.writeFile.mock.calls[0]
    expect(filePath).toEqual(path.join(`public`, `rss_new.xml`))
    expect(contents).toMatchSnapshot()
    expect(graphql).toBeCalledWith(customQuery)
  })

  it(`does not mutate base query when merging`, async () => {
    fs.writeFile = jest.fn()
    fs.writeFile.mockResolvedValue()

    const siteQuery = {
      data: {
        site: {
          siteMetadata: {
            title: `Hello World`,
          },
        },
      },
    }

    const markdownQuery = {
      data: {
        allMarkdownRemark: {
          edges: [
            {
              node: {
                fields: {
                  slug: `/hello-world`,
                },
                frontmatter: {
                  title: `Hello World`,
                },
              },
            },
          ],
        },
      },
    }

    const graphql = jest
      .fn()
      .mockResolvedValueOnce(siteQuery)
      .mockResolvedValueOnce(markdownQuery)

    const options = {
      query: `{}`,
      feeds: [
        {
          output: `rss.xml`,
          query: `{ firstMarkdownQuery }`,
        },
      ],
    }

    await onPostBuild({ graphql }, options)

    expect(siteQuery).toEqual({
      data: {
        site: expect.any(Object),
      },
    })
  })
})
