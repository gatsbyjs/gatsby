import fetchGraphql from "gatsby-source-wordpress-experimental/utils/fetch-graphql"

export const authedWPGQLRequest = async query => {
  if (!process.env.WPGRAPHQL_URL) {
    console.error(`No process.env.WPGRAPHQL_URL url found`)
    process.exit(1)
  }
  const { errors, data } = await fetchGraphql({
    url: process.env.WPGRAPHQL_URL,
    query,
    headers: {
      Authorization: `Basic ${process.env.WORDPRESS_BASIC_AUTH}`,
    },
  })

  if (errors && errors.length) {
    errors.forEach(error => console.error(error))
    throw new Error(
      `There were some problems making a request to WPGQL. See above for more info`
    )
  }

  return data
}
