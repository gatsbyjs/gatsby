/**
 * @jest-environment node
 */

const { fetchGraphql } = require("./test-utils/graphql")
const { URL } = require("url")

const gatsbyConfig = require("../gatsby-config")

const { testResolvedData } = require("./test-utils/test-resolved-data")
const { queries } = require("./test-utils/queries")

const { incrementalIt } = require(`./test-utils/incremental-it`)

const isWarmCache = process.env.WARM_CACHE
const url = `http://localhost:8000/___graphql`

const getPluginConfig = () =>
  gatsbyConfig.plugins.find(
    plugin =>
      typeof plugin === "object" && plugin.resolve === `gatsby-source-wordpress`
  )

describe(`data resolution`, () => {
  it(`resolves correct number of nodes`, async () => {
    const { data } = await fetchGraphql({
      url,
      query: queries.nodeCounts,
    })

    expect(data[`allWpMediaItem`].nodes).toBeTruthy()
    expect(data[`allWpMediaItem`].nodes).toMatchSnapshot()
    expect(data[`allWpMediaItem`].totalCount).toBe(18)

    expect(data[`allWpTag`].totalCount).toBe(5)
    expect(data[`allWpUser`].totalCount).toBe(1)
    expect(data[`allWpPage`].totalCount).toBe(
      // a page is created before the warm cache test run starts
      isWarmCache ? 8 : 7
    )
    expect(data[`allWpPost`].totalCount).toBe(5)
    expect(data[`allWpComment`].totalCount).toBe(1)
    expect(data[`allWpTaxonomy`].totalCount).toBe(3)
    expect(data[`allWpCategory`].totalCount).toBe(9)
    expect(data[`allWpMenu`].totalCount).toBe(3)
    expect(data[`allWpMenuItem`].totalCount).toBe(4)
    expect(data[`allWpPostFormat`].totalCount).toBe(0)
    expect(data[`allWpContentType`].totalCount).toBe(9)
  })

  testResolvedData({
    url,
    title: `resolves wp-graphql-acf data`,
    gatsbyQuery: queries.acfData,
    queryReplace: {
      from: `wpPage(title: { eq: "ACF Field Test" }) {`,
      to: `page(id: "cG9zdDo3NjQ2") {`,
    },
    fields: {
      gatsby: `wpPage`,
      wpgql: `page`,
    },
  })

  it(`resolves node interfaces without errors`, async () => {
    const query = /* GraphQL */ `
      query {
        allWpTermNode {
          nodes {
            id
          }
        }

        allWpContentNode {
          nodes {
            id
          }
        }
      }
    `

    // this will throw if there are gql errors
    const gatsbyResult = await fetchGraphql({
      url,
      query,
    })

    expect(gatsbyResult.data.allWpTermNode.nodes.length).toBe(14)

    expect(gatsbyResult.data.allWpContentNode.nodes.length).toBe(
      // A media item and page node are created before running our warm cache build.
      isWarmCache ? 35 : 33
    )
  })

  it(`resolves interface fields which are a mix of Gatsby nodes and regular object data with no node`, async () => {
    const query = /* GraphQL */ `
      query {
        wpPost(id: { eq: "cG9zdDox" }) {
          id
          comments {
            nodes {
              author {
                # this is an interface of WpUser (Gatsby node type) and WpCommentAuthor (no node for this so needs to be fetched on the comment)
                node {
                  name
                }
              }
            }
          }
        }
      }
    `

    // this will throw an error if there are gql errors
    const gatsbyResult = await fetchGraphql({
      url,
      query,
    })

    expect(gatsbyResult.data.wpPost.comments.nodes.length).toBe(1)
  })

  it(`resolves hierarchichal categories`, async () => {
    const gatsbyResult = await fetchGraphql({
      url,
      query: /* GraphQL */ `
        fragment NestedCats on WpCategory {
          name
          wpChildren {
            nodes {
              name
              wpChildren {
                nodes {
                  name
                  wpChildren {
                    nodes {
                      name
                    }
                  }
                }
              }
            }
          }
        }

        {
          allWpCategory {
            nodes {
              name
            }
          }
          wpPost(id: { eq: "cG9zdDo5MzYx" }) {
            id
            title
            categories {
              nodes {
                ...NestedCats
              }
            }
          }
        }
      `,
    })

    const categoryNodes = gatsbyResult.data.allWpCategory.nodes
    const categoryNames = categoryNodes.map(({ name }) => name)

    expect(categoryNames.includes(`h1`)).toBeTruthy()
    expect(categoryNames.includes(`h2`)).toBeTruthy()
    expect(categoryNames.includes(`h3`)).toBeTruthy()
    expect(categoryNames.includes(`h4`)).toBeTruthy()
  })

  incrementalIt(`resolves menus`, async () => {
    const result = await fetchGraphql({
      url,
      query: queries.menus,
    })

    expect(result).toMatchSnapshot()
  })

  incrementalIt(`resolves pages`, async () => {
    const result = await fetchGraphql({
      url,
      query: queries.pages,
    })

    expect(result).toMatchSnapshot()

    expect(result.data.testPage.title).toEqual(
      isWarmCache ? `Sample Page DELTA SYNC` : `Sample Page`
    )
  })

  incrementalIt(`resolves posts`, async () => {
    const result = await fetchGraphql({
      url,
      query: queries.posts,
    })

    expect(result).toMatchSnapshot()

    expect(result.data.testPost.title).toEqual(
      isWarmCache ? `Hello world! DELTA SYNC` : `Hello world!`
    )
  })

  incrementalIt(`resolves users`, async () => {
    const result = await fetchGraphql({
      url,
      query: queries.users,
    })

    expect(result).toMatchSnapshot()

    expect(result.data.testUser.name).toEqual(`admin`)
  })

  it(`resolves data added via a fn file in onBeforeChangeNode type option`, async () => {
    const result = await fetchGraphql({
      url,
      query: /* GraphQL */ `
        {
          # fn as a file path
          allWpPage {
            nodes {
              id
              beforeChangeNodeTest
            }
          }
        }
      `,
    })

    result.data.allWpPage.nodes.forEach(node => {
      expect(node.beforeChangeNodeTest).toBe(`TEST-${node.id}`)
    })
  })

  it(`resolves root fields`, async () => {
    const result = await fetchGraphql({
      url,
      query: queries.rootFields,
    })

    expect(result).toMatchSnapshot()
  })

  testResolvedData({
    url,
    title: `resolves wp-graphql-gutenberg columns`,
    gatsbyQuery: queries.gutenbergColumns,
    queryReplace: {
      from: `wpPost(title: { eq: "Gutenberg: Columns" }) {`,
      to: `post(id: "cG9zdDoxMjg=") {`,
    },
    fields: {
      gatsby: `wpPost`,
      wpgql: `post`,
    },
  })

  testResolvedData({
    url,
    title: `resolves wp-graphql-gutenberg layout elements`,
    gatsbyQuery: queries.gutenbergLayoutElements,
    queryReplace: {
      from: `wpPost(id: { eq: "cG9zdDoxMjU=" }) {`,
      to: `post(id: "cG9zdDoxMjU=") {`,
    },
    fields: {
      gatsby: `wpPost`,
      wpgql: `post`,
    },
  })

  testResolvedData({
    url,
    title: `resolves wp-graphql-gutenberg formatting blocks`,
    gatsbyQuery: queries.gutenbergFormattingBlocks,
    queryReplace: {
      from: `wpPost(id: { eq: "cG9zdDoxMjI=" }) {`,
      to: `post(id: "cG9zdDoxMjI=") {`,
    },
    fields: {
      gatsby: `wpPost`,
      wpgql: `post`,
    },
  })

  testResolvedData({
    url,
    title: `resolves wp-graphql-gutenberg common blocks`,
    gatsbyQuery: queries.gutenbergCommonBlocks,
    queryReplace: {
      from: `wpPost(id: { eq: "cG9zdDo5NA==" }) {`,
      to: `post(id: "cG9zdDo5NA==") {`,
    },
    fields: {
      gatsby: `wpPost`,
      wpgql: `post`,
    },
  })

  it(`resolves Yoast SEO data`, async () => {
    const gatsbyResult = await fetchGraphql({
      url,
      query: /* GraphQL */ `
        {
          wp {
            ${queries.yoastRootFields}
          }
          wpPage(title: {eq: "Yoast SEO"}) {
            ${queries.pageYoastFields}
          }
        }
      `,
    })

    const { data: WPGraphQLData } = await fetchGraphql({
      url: process.env.WPGRAPHQL_URL,
      query: /* GraphQL */ `
      {
        ${queries.yoastRootFields}
        page(id: "cG9zdDo3ODY4") {
          ${queries.pageYoastFields}
        }
      }
    `,
    })

    const wpGraphQLPageNormalizedPaths = JSON.parse(
      JSON.stringify(WPGraphQLData.page).replace(
        /http:\/\/localhost:8001/gm,
        ``
      )
    )

    expect(gatsbyResult.data.wpPage).toEqual(wpGraphQLPageNormalizedPaths)
    expect(gatsbyResult.data.wp.seo).toEqual(WPGraphQLData.seo)
  })

  it(`Does not download files whose size exceed the maxFileSizeBytes option`, async () => {
    const wpPluginOpts = getPluginConfig()
    const { maxFileSizeBytes } = wpPluginOpts.options.type.MediaItem.localFile
    /**
     * Ensure that the fileSize "gt" filter value matches the maxFileSizeBytes value in gatsby-config
     */
    const {
      data: {
        allWpMediaItem: { nodes },
      },
    } = await fetchGraphql({
      url,
      query: /* GraphQL */ `
        query tooLargeFiles(
          $maxFileSizeBytes: Int!
          $includedMimeTypes: [String]!
        ) {
          allWpMediaItem(
            filter: {
              fileSize: { gt: $maxFileSizeBytes }
              mimeType: { in: $includedMimeTypes }
            }
          ) {
            nodes {
              id
              sourceUrl
              fileSize
              localFile {
                absolutePath
                size
              }
            }
          }
        }
      `,
      variables: {
        maxFileSizeBytes,
        includedMimeTypes: ["image/jpeg"],
      },
    })

    expect(nodes.length).toEqual(1)
    nodes.forEach(node => {
      expect(node.localFile).toEqual(null)
    })
  })

  it(`Downloads files and creates a local file node for files whose size are <= maxFileSizeBytes`, async () => {
    const wpPluginOpts = getPluginConfig()
    const { maxFileSizeBytes } = wpPluginOpts.options.type.MediaItem.localFile
    /**
     * Ensure that the fileSize "gt" filter value matches the maxFileSizeBytes value in gatsby-config
     */
    const {
      data: {
        allWpMediaItem: { nodes },
      },
    } = await fetchGraphql({
      url,
      query: /* GraphQL */ `
        query tooLargeFiles(
          $maxFileSizeBytes: Int!
          $includedMimeTypes: [String]!
        ) {
          allWpMediaItem(
            filter: {
              fileSize: { lte: $maxFileSizeBytes }
              mimeType: { in: $includedMimeTypes }
            }
          ) {
            nodes {
              id
              sourceUrl
              fileSize
              localFile {
                absolutePath
                size
              }
            }
          }
        }
      `,
      variables: {
        maxFileSizeBytes,
        includedMimeTypes: ["image/jpeg"],
      },
    })

    nodes.forEach(node => {
      expect(node.localFile).toBeDefined()
    })
  })

  it(`Does not download files whose mime types are excluded`, async () => {
    const wpPluginOpts = getPluginConfig()
    const { excludeByMimeTypes } = wpPluginOpts.options.type.MediaItem.localFile

    const {
      data: {
        allWpMediaItem: { nodes },
      },
    } = await fetchGraphql({
      url,
      query: /* GraphQL */ `
        query excludedMimeType($excludeByMimeTypes: [String]) {
          allWpMediaItem(filter: { mimeType: { in: $excludeByMimeTypes } }) {
            nodes {
              id
              mimeType
              localFile {
                size
              }
            }
          }
        }
      `,
      variables: {
        excludeByMimeTypes,
      },
    })

    expect(nodes.length).toEqual(2)
    nodes.forEach(node => {
      expect(node.localFile).toEqual(null)
    })
  })

  it(`Creats a local file node for files not excluded by the "excludedByMimeTypes" option`, async () => {
    const wpPluginOpts = getPluginConfig()
    const { excludeByMimeTypes } = wpPluginOpts.options.type.MediaItem.localFile

    const {
      data: {
        allWpMediaItem: { nodes },
      },
    } = await fetchGraphql({
      url,
      query: /* GraphQL */ `
        query excludedMimeType($excludeByMimeTypes: [String]) {
          allWpMediaItem(filter: { mimeType: { nin: $excludeByMimeTypes } }) {
            nodes {
              id
              mimeType
              localFile {
                size
              }
            }
          }
        }
      `,
      variables: {
        excludeByMimeTypes,
      },
    })

    nodes.forEach(node => {
      expect(node.localFile).toBeDefined()
    })
  })

  it(`Only sources MediaItem nodes that are in use and does so incrementally`, async () => {
    // we need to set media item #195 as the featured image on post #94 at the start of warm builds and remove it at the start of cold builds
    const {
      data: { wpMediaItem },
    } = await fetchGraphql({
      url,
      query: /* GraphQL */ `
        query MediaItem {
          wpMediaItem(databaseId: { eq: 195 }) {
            slug
            localFile {
              name
            }
          }
        }
      `,
    })

    // we make a mutation to WPGraphQL on our second build (warm cache) adding this media item to a post in WP which  makes it available in Gatsby
    if (isWarmCache) {
      expect(wpMediaItem).toBeTruthy()
      expect(wpMediaItem.localFile).toBeTruthy()
    }
    // otherwise this media item shouldn't exist in Gatsby
    else {
      expect(wpMediaItem).toBeNull()
    }
  })

  it(`Resolves Gatsby Image CDN data`, async () => {
    const {
      data: { allWpPost },
    } = await fetchGraphql({
      url,
      query: /* GraphQL */ `
        query {
          allWpPost {
            nodes {
              featuredImage {
                node {
                  filename
                  mediaItemUrl
                  resize(width: 100, height: 100, quality: 100) {
                    width
                    height
                    src
                  }
                }
              }
            }
          }
        }
      `,
    })

    allWpPost.nodes.forEach(node => {
      if (!node.featuredImage?.node) {
        return
      }

      const { resize, mediaItemUrl } = node.featuredImage.node
      const parsedUrl = new URL(resize.src, "https://www.gatsbyjs.com")

      const sourceUrl = parsedUrl.searchParams.get("u")

      expect(mediaItemUrl).toEqual(sourceUrl)
      expect(
        parsedUrl.pathname.endsWith(node.featuredImage.node.filename)
      ).toBe(true)
    })
  })
})
