import fetchGraphql from "gatsby-source-wordpress-experimental/utils/fetch-graphql"

require(`dotenv`).config({
  path: `./test-runtime/.env.WORDPRESS_BASIC_AUTH`,
})

export const authedWPGQLRequest = async query => {
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
