/**
 * @jest-environment node
 */

const {
  default: fetchGraphql,
} = require("gatsby-source-wordpress/dist/utils/fetch-graphql")

const { testResolvedData } = require("./test-utils/test-resolved-data")
const { queries } = require("./test-utils/queries")

const { incrementalIt } = require(`./test-utils/incremental-it`)

jest.setTimeout(100000)

const isWarmCache = process.env.WARM_CACHE
const url = `http://localhost:8000/___graphql`

describe(`data resolution`, () => {
  it(`resolves correct number of nodes`, async () => {
    const { data } = await fetchGraphql({
      url,
      query: queries.nodeCounts,
    })

    expect(data[`allWpMediaItem`].nodes).toBeTruthy()
    expect(data[`allWpMediaItem`].nodes).toMatchSnapshot()
    expect(data[`allWpMediaItem`].totalCount).toBe(7)

    expect(data[`allWpTag`].totalCount).toBe(5)
    expect(data[`allWpUser`].totalCount).toBe(1)
    expect(data[`allWpPage`].totalCount).toBe(3)
    expect(data[`allWpPost`].totalCount).toBe(1)
    expect(data[`allWpComment`].totalCount).toBe(1)
    expect(data[`allWpTaxonomy`].totalCount).toBe(3)
    expect(data[`allWpCategory`].totalCount).toBe(9)
    expect(data[`allWpMenu`].totalCount).toBe(1)
    expect(data[`allWpMenuItem`].totalCount).toBe(4)
    expect(data[`allWpPostFormat`].totalCount).toBe(0)
    expect(data[`allWpContentType`].totalCount).toBe(6)
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
    expect(gatsbyResult.data.allWpContentNode.nodes.length).toBe(14)
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

  it(`resolves root fields`, async () => {
    const result = await fetchGraphql({
      url,
      query: queries.rootFields,
    })

    expect(result).toMatchSnapshot()
  })
})
