/**
 * @jest-environment node
 */

const { fetchGraphql } = require("./test-utils/graphql")
const { authedWPGQLRequest } = require("./test-utils/authed-wpgql-request")

const sortBy = require("lodash/sortBy")

const introspectionQuery = /* GraphQL */ `
  {
    __schema {
      types {
        name
        fields {
          name
        }
      }
    }
  }
`

describe(`schema integrity`, () => {
  it(`hasn't altered the remote WPGraphQL schema`, async () => {
    const data = await authedWPGQLRequest(introspectionQuery)

    const remoteWPGQLTypeNamesWithFieldNames = sortBy(
      data.__schema.types.map(type => {
        return {
          name: type.name,
          fields:
            type && type.fields ? type.fields.map(field => field.name) : null,
        }
      }),
      [`name`]
    )

    expect(remoteWPGQLTypeNamesWithFieldNames).toMatchSnapshot()
  })

  it(`hasn't altered the local Gatsby schema`, async () => {
    const result = await fetchGraphql({
      url: `http://localhost:8000/___graphql`,
      query: introspectionQuery,
    })

    const localWPTypeNamesWithFieldNames = sortBy(
      result.data.__schema.types
        .filter(({ name }) => name.startsWith(`Wp`))
        .map(type => {
          return {
            name: type.name,
            fields:
              type && type.fields ? type.fields.map(field => field.name) : null,
          }
        }),
      [`name`]
    )

    expect(localWPTypeNamesWithFieldNames).toMatchSnapshot()
  })
})
