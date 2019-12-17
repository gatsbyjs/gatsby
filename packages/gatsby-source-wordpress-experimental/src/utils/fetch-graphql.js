import axios from "axios"
import rateLimit from "axios-rate-limit"
import formatLogMessage from "./format-log-message"
import store from "../store"

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
  const { helpers } = store.getState().gatsbyApi
  const { reporter } = helpers

  let response
  const timeout = 30 * 1000

  const genericError = `
Make sure your site is reachable and that you have the right URL set in plugin options.`

  try {
    response = await http.post(url, { query, variables }, { timeout })
  } catch (e) {
    if (e.message.includes(`timeout of ${timeout}ms exceeded`)) {
      reporter.error(e)
      reporter.panic(
        formatLogMessage(
          `It took too long for ${url} to respond (longer than ${timeout /
            1000} seconds). ${genericError}`
        )
      )
    } else if (e.message.includes(`ECONNREFUSED`)) {
      reporter.panic(
        formatLogMessage(`${url} refused to connect. ${genericError}`)
      )
    } else {
      reporter.error(
        formatLogMessage(`Couldn't connect to ${url}. ${genericError}`)
      )
      reporter.panic(e)
    }
  }

  const contentType = response.headers[`content-type`]

  if (!contentType.includes(`application/json;`)) {
    reporter.panic(
      formatLogMessage(`Unable to connect to WPGraphQL.
        Double check that your WordPress URL is correct and WPGraphQL is installed.
        ${url}`)
    )
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
        return reporter.error(formatLogMessage(errorMap.to))
      }

      if (error.debugMessage) {
        reporter.error(
          formatLogMessage(`Error category: ${error.category}
${error.message}
${
  error.debugMessage
    ? error.debugMessage
    : `If you haven't already, try adding define("GRAPHQL_DEBUG", true); to your wp-config.php for more detailed error messages.`
}`)
        )
      }

      if (!error.debugMessage) {
        reporter.error(formatLogMessage(`${error.message} (${error.category})`))
      }
    })

    if (exitOnError) {
      reporter.panic(
        formatLogMessage(`Encountered errors. See above for more info.`)
      )
    }

    if (Object.keys(variables).length) {
      reporter.error(formatLogMessage(`GraphQL vars:`, variables))
    }

    reporter.error(formatLogMessage(`GraphQL query: ${query}`))

    if (json.data) {
      reporter.error(formatLogMessage`GraphQL data:`)
      reporter.info(json.data)
    }

    if (!json.data) {
      reporter.panic(
        formatLogMessage(`Encountered errors. See above for more info.`)
      )
    }
  }

  return json
}

export default fetchGraphql
