import fetchGraphql from "gatsby-source-wordpress-experimental/utils/fetch-graphql"
import { introspectionQuery } from "gatsby-source-wordpress-experimental/utils/graphql-queries"

import { runGatsby } from "../test-utils/run-gatsby"
import gql from "gatsby-source-wordpress-experimental/utils/gql"

jest.setTimeout(100000)

require(`dotenv`).config({
  path: `./test-runtime/.env.development`,
})

const isIncrement = process.env.WPGRAPHQL_INCREMENT

const incrementalIt = (name, test) => {
  // full fetch
  ;(isIncrement ? it : it.skip)(name, test)
  // incremental data fetch
  ;(!isIncrement ? it : it.skip)(`${name} INCREMENTED`, test)
}

describe(`gatsby-source-wordpress-experimental`, () => {
  runGatsby()

  it(`hasn't altered the remote WPGraphQL schema`, async () => {
    const result = await fetchGraphql({
      query: introspectionQuery,
      url: process.env.WPGRAPHQL_URL,
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
        }
      }
      allWpPost {
        nodes {
          title
          acfPageContent {
            fieldGroupName
            modules {
              __typename
              ... on WpPost_Acfpagecontent_Modules_Hero {
                fieldGroupName
                headline
                image {
                  uri
                }
              }
            }
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
