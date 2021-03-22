const {
  default: fetchGraphql,
} = require("gatsby-source-wordpress/dist/utils/fetch-graphql")

exports.authedWPGQLRequest = async (query, { variables } = {}) => {
  if (!process.env.WPGRAPHQL_URL) {
    process.env.WPGRAPHQL_URL = `http://localhost:8001/graphql`
  }

  const { errors, data } = await fetchGraphql({
    query,
    variables,
    url: process.env.WPGRAPHQL_URL,
    headers: {
      Authorization: `Basic ${process.env.WORDPRESS_BASIC_AUTH}`,
    },
  })

  if (errors && errors.length) {
    console.error(errors)
    await new Promise(resolve => setTimeout(resolve, 1000))
    process.exit(
      `There were some problems making a request to WPGQL. See above for more info`
    )
  }

  return data
}
