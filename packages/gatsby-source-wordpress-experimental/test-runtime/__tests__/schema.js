import fetchGraphql from "gatsby-source-wordpress-experimental/utils/fetch-graphql"
import { introspectionQuery } from "gatsby-source-wordpress-experimental/utils/graphql-queries"
import { getPluginOptions } from "gatsby-source-wordpress-experimental/utils/get-gatsby-api"

require(`dotenv`).config({
  path: `./test-runtime/.env.test`,
})

describe(`gatsby-source-wordpress-experimental`, () => {
  it(`remote schema hasn't changed`, async () => {
    const result = await fetchGraphql({
      query: introspectionQuery,
      url: process.env.WPGRAPHQL_URL,
    })

    expect(result.data.__schema).toMatchSnapshot()
  })

  it(`local schema hasn't changed`, async () => {
    const result = await fetchGraphql({
      url: `http://localhost:8000/___graphql`,
      query: introspectionQuery,
    })

    const {
      schema: { typePrefix },
    } = getPluginOptions()

    const pluginTypes = result.data.__schema.types.filter(type =>
      type.name.startsWith(typePrefix)
    )

    expect(pluginTypes).toMatchSnapshot()
  })
})
