import axios from "axios"
import rateLimit from "axios-rate-limit"

const http = rateLimit(axios.create(), {
  maxRPS: 50,
})

const fetchGraphql = async ({ url, query, errorMap, variables = {} }) => {
  const response = await http.post(url, { query, variables })

  if (response.status !== 200) {
    console.error(`[gatsby-source-wordpress] Couldn't connect to ${url}`)
    process.exit()
  }

  const contentType = response.headers[`content-type`]

  if (!contentType.includes(`application/json;`)) {
    console.error(
      `[gatsby-source-wordpress] Unable to connect to WPGraphQL.
        Double check that your WordPress URL is correct and WPGraphQL is installed.
        ${url}`
    )
    process.exit()
  }

  const json = response.data

  if (json.errors) {
    json.errors.forEach(error => {
      if (
        errorMap &&
        errorMap.from &&
        errorMap.to &&
        error.message === errorMap.from
      ) {
        return console.error(`[gatsby-source-wordpress] ${errorMap.to}`)
      }

      if (error.debugMessage) {
        console.error(`[gatsby-source-wordpress] Error category: ${
          error.category
        }
${error.message}
${
  error.debugMessage
    ? error.debugMessage
    : `If you haven't already, try enabling GRAPHQL_DEBUG in wp-config.php for more detailed error messages`
}`)
      }

      if (!error.debugMessage) {
        console.error(
          `[gatsby-source-wordpress] ${error.message} (${error.category})`
        )
      }
    })

    if (Object.keys(variables).length) {
      console.error(`[gatsby-source-wordpress] GraphQL vars:`, variables)
    }

    console.error(`[gatsby-source-wordpress] GraphQL query: ${query}`)

    if (json.data) {
      console.error(`[gatsby-source-wordpress] GraphQL data:`)
      console.log(json.data)
    }

    if (!json.data) {
      process.exit()
    }
  }

  return json
}

export default fetchGraphql
