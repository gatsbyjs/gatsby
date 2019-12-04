import axios from "axios"
import rateLimit from "axios-rate-limit"
import formatLogMessage from "./format-log-message"

const http = rateLimit(axios.create(), {
  maxRPS: 50,
})

const fetchGraphql = async ({
  url,
  query,
  errorMap,
  exitOnError = false,
  variables = {},
}) => {
  const response = await http.post(url, { query, variables })

  if (response.status !== 200) {
    console.error(formatLogMessage(`Couldn't connect to ${url}`))
    process.exit()
  }

  const contentType = response.headers[`content-type`]

  if (!contentType.includes(`application/json;`)) {
    console.error(
      formatLogMessage(`Unable to connect to WPGraphQL.
        Double check that your WordPress URL is correct and WPGraphQL is installed.
        ${url}`)
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
        return console.error(formatLogMessage(errorMap.to))
      }

      if (error.debugMessage) {
        console.error(
          formatLogMessage(`Error category: ${error.category}
${error.message}
${
  error.debugMessage
    ? error.debugMessage
    : `If you haven't already, try enabling GRAPHQL_DEBUG in wp-config.php for more detailed error messages`
}`)
        )
      }

      if (!error.debugMessage) {
        console.error(formatLogMessage(`${error.message} (${error.category})`))
      }
    })

    if (exitOnError) {
      process.exit()
    }

    if (Object.keys(variables).length) {
      console.error(formatLogMessage(`GraphQL vars:`, variables))
    }

    console.error(formatLogMessage(`GraphQL query: ${query}`))

    if (json.data) {
      console.error(formatLogMessage`GraphQL data:`)
      console.log(json.data)
    }

    if (!json.data) {
      process.exit()
    }
  }

  return json
}

export default fetchGraphql
