jest.mock(`fs-extra`)
const fs = require(`fs-extra`)
const path = require(`path`)
const { onPostBuild } = require(`../gatsby-node`)
const DATE_TO_USE = new Date(`2018`)
const _Date = Date
global.Date = jest.fn(() => DATE_TO_USE)
global.Date.UTC = _Date.UTC
global.Date.now = _Date.now

const mockSiteMetadata = {
  site: {
    siteMetadata: {
      title: `a sample title`,
      description: `a description`,
      siteUrl: `http://dummy.url/`,
    },
  },
}

const firstMarkdownNode = {
  frontmatter: {
    path: `a-custom-path`,
  },
  excerpt: `post description`,
}

const secondMarkdownNode = {
  ...firstMarkdownNode,
  frontmatter: {
    path: `another-custom-path`,
  },
}

const htmlWithAnchorTags = `<p>Here is link to my <a href="/first-post">first post</a>.</p>`
const htmlWithMultipleImageLinks = `
  <p>This is what a salty egg looks like.</p>
  <p>
    <span
      class="gatsby-resp-image-wrapper"
      style="position: relative; display: block; margin-left: auto; margin-right: auto; max-width: 630px; "
    >
      <a
        class="gatsby-resp-image-link"
        href="/static/8058f3f26913fea3b6a89a73344fe94a/e1596/salty_egg.jpg"
        style="display: block"
        target="_blank"
        rel="noopener"
      >
        <span
          class="gatsby-resp-image-background-image"
          style="padding-bottom: 75.31645569620254%; position: relative; bottom: 0; left: 0; background-image: url('data:image/jpeg;base64,/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAPABQDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAMB/8QAFwEAAwEAAAAAAAAAAAAAAAAAAAEEBf/aAAwDAQACEAMQAAABgik0dWC//8QAGRABAAMBAQAAAAAAAAAAAAAAAQACERJC/9oACAEBAAEFAkqW7B5Zovtvk//EABcRAQADAAAAAAAAAAAAAAAAAAAREkH/2gAIAQMBAT8B1WX/xAAWEQEBAQAAAAAAAAAAAAAAAAAAESL/2gAIAQIBAT8BjT//xAAbEAABBAMAAAAAAAAAAAAAAAAAAQIRISIxMv/aAAgBAQAGPwK9GNocyS8hCj//xAAaEAADAQEBAQAAAAAAAAAAAAAAAREhQYGx/9oACAEBAAE/IXOrA43oOyg9wgU86OZMfwZKypT/2gAMAwEAAgADAAAAEMjv/8QAFxEBAQEBAAAAAAAAAAAAAAAAAQARIf/aAAgBAwEBPxARwyusv//EABcRAQEBAQAAAAAAAAAAAAAAAAEAIVH/2gAIAQIBAT8QOoVoX//EAB0QAQEAAgIDAQAAAAAAAAAAAAERADFhgSFB0eH/2gAIAQEAAT8QSpwaGjrBSrtHyF9iY8RpUnGRBGqtOcsiDE6fM3AgiXf5M//Z'); background-size: cover; display: block;"
        >
        </span>
        <img
          class="gatsby-resp-image-image"
          alt="Chinese Salty Egg"
          title="Chinese Salty Egg"
          src="/static/8058f3f26913fea3b6a89a73344fe94a/828fb/salty_egg.jpg"
          srcset="/static/8058f3f26913fea3b6a89a73344fe94a/ff44c/salty_egg.jpg 158w,
          /static/8058f3f26913fea3b6a89a73344fe94a/a6688/salty_egg.jpg 315w,
          /static/8058f3f26913fea3b6a89a73344fe94a/828fb/salty_egg.jpg 630w,
          /static/8058f3f26913fea3b6a89a73344fe94a/0ede0/salty_egg.jpg 945w,
          /static/8058f3f26913fea3b6a89a73344fe94a/3ac88/salty_egg.jpg 1260w,
          /static/8058f3f26913fea3b6a89a73344fe94a/e1596/salty_egg.jpg 2048w"
          sizes="(max-width: 630px) 100vw, 630px"
          style="width:100%;height:100%;margin:0;vertical-align:middle;position:absolute;top:0;left:0;"
          loading="lazy"
          decoding="async"
        />
      </a>
    </span>
  </p>
`

const mockAllMarkdownWithHtml = {
  allMarkdownRemark: {
    edges: [
      {
        node: { ...firstMarkdownNode, html: htmlWithAnchorTags },
      },
      {
        node: { ...secondMarkdownNode, html: htmlWithMultipleImageLinks },
      },
    ],
  },
}

const serializeContentWithHtml = ({ query: { site, allMarkdownRemark } }) =>
  allMarkdownRemark.edges.map(({ node }) => {
    return {
      ...node.frontmatter,
      description: node.excerpt,
      url: site.siteMetadata.siteUrl + node.frontmatter.path,
      custom_elements: [{ "content:encoded": node.html }],
    }
  })

const customQueryForHtml = `
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
            html
          }
        }
      }
    }
    `

describe(`Test plugin feed`, () => {
  beforeEach(() => {
    fs.exists = jest.fn().mockResolvedValue(true)
    fs.writeFile = jest.fn().mockResolvedValue()
    fs.mkdirp = jest.fn().mockResolvedValue()
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
          serialize: ({ query: { allMarkdownRemark } }) =>
            allMarkdownRemark.edges.map(edge => {
              return {
                ...edge.node.frontmatter,
              }
            }),
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

  it(`run query for custom HTML content`, async () => {
    fs.writeFile = jest.fn()
    fs.writeFile.mockResolvedValue(true)
    const graphql = jest.fn()

    const htmlCount = mockAllMarkdownWithHtml.allMarkdownRemark.edges.filter(
      ({ node }) => node.html
    ).length
    graphql.mockResolvedValue({
      data: { ...mockSiteMetadata, ...mockAllMarkdownWithHtml },
    })

    const options = {
      feeds: [
        {
          output: `rss_post_content.xml`,
          serialize: serializeContentWithHtml,
          query: customQueryForHtml,
          title: `Custom feed which contains html content for each post`,
        },
      ],
    }
    await onPostBuild({ graphql }, options)
    const [filePath, contents] = fs.writeFile.mock.calls[0]
    const found = contents.match(/<content:encoded>/g)
    expect(found.length).toEqual(htmlCount)
    expect(filePath).toEqual(path.join(`public`, `rss_post_content.xml`))
    expect(contents).toMatchSnapshot()
    expect(graphql).toBeCalledWith(customQueryForHtml)
  })
})
