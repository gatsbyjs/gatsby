import fetchGraphql from "gatsby-source-wordpress-experimental/utils/fetch-graphql"
import path from "path"

// require .env.development or .env.production
require(`dotenv`).config({
  path: path.resolve(process.cwd(), `.test-runtime/.env.test`),
})

require(`dotenv`).config({
  path: path.resolve(process.cwd(), `.test-runtime/.env.WORDPRESS_BASIC_AUTH`),
})

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
