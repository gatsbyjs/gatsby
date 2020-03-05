import fetchGraphql from "gatsby-source-wordpress-experimental/utils/fetch-graphql"
import { introspectionQuery } from "gatsby-source-wordpress-experimental/utils/graphql-queries"

import { runGatsby } from "../test-utils/run-gatsby"
import gql from "gatsby-source-wordpress-experimental/utils/gql"
import { incrementalIt } from "../test-utils/incremental-it"

jest.setTimeout(100000)

require(`dotenv`).config({
  path: `./test-runtime/.env.development`,
})

describe(`[gatsby-source-wordpress-experimental] schema`, () => {
  runGatsby()

  const url = process.env.WPGRAPHQL_URL

  if (!url) {
    throw new Error(
      `No URL specified. Please add one to process.env.WPGRAPHQL_URL`
    )
  }

  it(`hasn't altered the remote WPGraphQL schema`, async () => {
    const result = await fetchGraphql({
      query: introspectionQuery,
      url,
    })

    expect(result.data.__schema).toMatchSnapshot()
  })

  it(`hasn't altered the local Gatsby schema`, async () => {
    const result = await fetchGraphql({
      url: `http://localhost:8000/___graphql`,
      query: introspectionQuery,
    })

    const pluginTypes = result.data.__schema.types.filter(type =>
      type.name.startsWith(`Wp`)
    )

    expect(pluginTypes).toMatchSnapshot()
  })

  const gatsbyDataQuery = gql`
    {
      allWpPage {
        nodes {
          uri
          title
          childPages {
            nodes {
              title
            }
          }
          author {
            name
          }
          translations {
            title
          }
          acfPageFields {
            flex {
              __typename
              ... on WpPage_Acfpagefields_Flex_Header {
                header
              }
              ... on WpPage_Acfpagefields_Flex_TeamMembers {
                teamMembers {
                  teamMember {
                    __typename
                    ... on WpTeamMember {
                      acfData {
                        name
                        title
                        twitterlink {
                          target
                          title
                          url
                        }
                        webSite {
                          target
                          title
                          url
                        }
                        portrait {
                          sourceUrl
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      allWpPost {
        nodes {
          title
          featuredImage {
            altText
            sourceUrl
          }
          author {
            avatar {
              url
            }
            capKey
            capabilities
            comments {
              nodes {
                content
              }
            }
          }
        }
      }
    }
  `

  incrementalIt(`queries data properly`, async () => {
    const result = await fetchGraphql({
      url: `http://localhost:8000/___graphql`,
      query: gatsbyDataQuery,
    })

    expect(result).toMatchSnapshot()
  })
})
