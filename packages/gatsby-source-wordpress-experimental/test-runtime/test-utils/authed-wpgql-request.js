import fetchGraphql from "gatsby-source-wordpress-experimental/utils/fetch-graphql"

require(`dotenv`).config({
  path: `./test-runtime/.env.WORDPRESS_BASIC_AUTH`,
})

export const authedWPGQLRequest = async query =>
  await fetchGraphql({
    url: process.env.WPGRAPHQL_URL,
    query,
    headers: {
      Authorization: process.env.WORDPRESS_BASIC_AUTH,
    },
  })
