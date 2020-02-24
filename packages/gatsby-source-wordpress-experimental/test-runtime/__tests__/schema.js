import fetchGraphql from "../../src/utils/fetch-graphql"
import { introspectionQuery } from "../../src/utils/graphql-queries"
import { getPluginOptions } from "../../src/utils/get-gatsby-api"

describe(`gatsby-source-wordpress-experimental`, () => {
  it(`remote schema hasn't changed`, async () => {
    const result = await fetchGraphql({
      query: introspectionQuery,
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

    const pluginTypes = result.data.__schema.type.filter(type =>
      type.name.startsWith(typePrefix)
    )

    expect(pluginTypes).toMatchSnapshot()
  })
})
