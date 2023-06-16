const { fetchGraphql } = require("./graphql")

exports.authedWPGQLRequest = async (query, { variables } = {}) => {
  if (!process.env.WPGRAPHQL_URL) {
    process.env.WPGRAPHQL_URL = `http://localhost:8001/graphql`
  }

  const { errors, data } = await fetchGraphql({
    query,
    variables,
    url: process.env.WPGRAPHQL_URL,
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.HTACCESS_USERNAME}:${process.env.HTACCESS_PASSWORD}`
      ).toString("base64")}`,
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
