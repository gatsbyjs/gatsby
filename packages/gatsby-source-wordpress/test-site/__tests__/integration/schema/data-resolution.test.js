/**
 * @jest-environment node
 */

import fetchGraphql from "gatsby-source-wordpress/dist/utils/fetch-graphql"
import { incrementalIt } from "../../../test-utils/incremental-it"
import { testResolvedData } from "../../../test-utils/test-resolved-data"
import { queries } from "../../../test-utils/queries"

jest.setTimeout(100000)

const url = `http://localhost:8000/___graphql`

describe(`[gatsby-source-wordpress] data resolution`, () => {
  it(`resolves correct number of nodes`, async () => {
    const { data } = await fetchGraphql({
      url,
      query: queries.nodeCounts,
    })

    expect(data[`allWpMediaItem`].nodes).toBeTruthy()
    expect(data[`allWpMediaItem`].nodes).toMatchSnapshot()
    expect(data[`allWpMediaItem`].totalCount).toBe(36)

    expect(data[`allWpTag`].totalCount).toBe(5)
    expect(data[`allWpUser`].totalCount).toBe(5)
    expect(data[`allWpPage`].totalCount).toBe(20)
    expect(data[`allWpPost`].totalCount).toBe(10)
    expect(data[`allWpComment`].totalCount).toBe(1)
    expect(data[`allWpProject`].totalCount).toBe(1)
    expect(data[`allWpTaxonomy`].totalCount).toBe(3)
    expect(data[`allWpCategory`].totalCount).toBe(9)
    expect(data[`allWpMenu`].totalCount).toBe(3)
    expect(data[`allWpMenuItem`].totalCount).toBe(4)
    expect(data[`allWpTeamMember`].totalCount).toBe(1)
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
      process.env.WPGQL_INCREMENT ? `Sample Page DELTA SYNC` : `Sample Page`
    )
  })

  incrementalIt(`resolves posts`, async () => {
    const result = await fetchGraphql({
      url,
      query: queries.posts,
    })

    expect(result).toMatchSnapshot()

    expect(result.data.testPost.title).toEqual(
      process.env.WPGQL_INCREMENT ? `Hello world! DELTA SYNC` : `Hello world!`
    )
  })

  incrementalIt(`resolves users`, async () => {
    const result = await fetchGraphql({
      url,
      query: queries.users,
    })

    expect(result).toMatchSnapshot()

    expect(result.data.testUser.firstName).toEqual(
      process.env.WPGQL_INCREMENT ? `Tyler DELTA SYNC` : `Tyler`
    )
  })

  incrementalIt(`resolves root fields`, async () => {
    const result = await fetchGraphql({
      url,
      query: queries.rootFields,
    })

    expect(result).toMatchSnapshot()
  })
})
