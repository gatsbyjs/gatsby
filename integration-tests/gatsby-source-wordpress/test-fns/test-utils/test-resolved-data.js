const { fetchGraphql } = require("./graphql")
const { authedWPGQLRequest } = require("./authed-wpgql-request")

const normalizeResponse = data =>
  JSON.parse(
    JSON.stringify(data).replace(/https:\/\/gatsbyinttests.wpengine.com/gm, ``)
  )

exports.testResolvedData = ({
  url,
  title,
  gatsbyQuery,
  queryReplace: { from, to },
  variables = {},
  fields: { gatsby, wpgql },
}) => {
  it(title, async () => {
    const gatsbyResult = await fetchGraphql({
      url,
      query: gatsbyQuery,
      variables,
    })

    const wpGraphQLQuery = gatsbyQuery
      .replace(/Wp/gm, ``)
      .replace(from, to)
      .replace(`$id: String!`, `$id: ID!`)

    const WPGraphQLData = await authedWPGQLRequest(wpGraphQLQuery, {
      url: process.env.WPGRAPHQL_URL,
      variables,
    })

    const wpgqlNode = normalizeResponse(WPGraphQLData[wpgql])
    expect(wpgqlNode).toBeTruthy()

    const gatsbyNode = normalizeResponse(gatsbyResult.data[gatsby])

    expect(gatsbyNode).toBeTruthy()

    expect(wpgqlNode).toStrictEqual(gatsbyNode)
  })
}
