import gqlPrettier from "graphql-prettier"
import axios from "axios"
import rateLimit from "axios-rate-limit"
import formatLogMessage from "./format-log-message"
import store from "~/store"
import { getPluginOptions } from "./get-gatsby-api"

const http = rateLimit(axios.create(), {
  maxRPS: 50,
})

const timeout = 30 * 1000

const handleGraphQLErrors = async ({
  query,
  variables,
  response,
  errorMap,
  panicOnError,
  reporter,
}) => {
  const pluginOptions = getPluginOptions()

  const json = response.data
  const { errors } = json

  if (!errors) {
    return
  }

  for (const error of errors) {
    const errorWasMapped =
      errorMap &&
      errorMap.from &&
      errorMap.to &&
      error.message === errorMap.from

    if (errorWasMapped && panicOnError) {
      reporter.panic(formatLogMessage(errorMap.to))
    } else if (errorWasMapped) {
      reporter.error(formatLogMessage(errorMap.to))
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
    } else {
      reporter.error(formatLogMessage(`${error.message} (${error.category})`))
    }
  }

  if (panicOnError) {
    reporter.panic(
      formatLogMessage(`Encountered errors. See above for details.`)
    )
  }

  if (variables && Object.keys(variables).length) {
    reporter.error(
      formatLogMessage(`GraphQL vars: ${JSON.stringify(variables)}`)
    )
  }

  if (pluginOptions.debug.graphql.showQueryOnError) {
    reporter.error(formatLogMessage(`GraphQL query: ${gqlPrettier(query)}`))
  } else {
    await clipboardy.write(gqlPrettier(query))
  }

  if (!json.data) {
    reporter.panic(
      formatLogMessage(`Encountered errors. See above for details.`)
    )
  }
}

// @todo add a link to docs page for debugging
const genericError = `Take a moment to check that \n  - your WordPress URL is correct in gatsby-config.js \n  - your server is responding to requests \n  - WPGraphQL and WPGatsby are installed in your WordPress site`

const handleFetchErrors = ({ e, reporter, url }) => {
  if (e.message.includes(`timeout of ${timeout}ms exceeded`)) {
    reporter.error(e)
    reporter.panic(
      formatLogMessage(
        `It took too long for ${url} to respond (longer than ${timeout /
          1000} seconds). \n${genericError}`,
        { useVerboseStyle: true }
      )
    )
  } else if (
    e.message.includes(`ECONNREFUSED`) ||
    e.message === `Request failed with status code 405`
  ) {
    reporter.panic(
      formatLogMessage(`${e.message} \n\n${genericError}`, {
        useVerboseStyle: true,
      })
    )
  } else {
    reporter.panic(formatLogMessage(e.toString(), { useVerboseStyle: true }))
  }
}

const fetchGraphql = async ({
  query,
  errorMap,
  ignoreGraphQLErrors = false,
  panicOnError = false,
  variables = {},
}) => {
  const {
    helpers,
    pluginOptions: { url },
  } = store.getState().gatsbyApi
  const { reporter } = helpers

  let response

  try {
    response = await http.post(url, { query, variables }, { timeout })

    const contentType = response.headers[`content-type`]

    if (!contentType.includes(`application/json;`)) {
      throw new Error(`Unable to connect to WPGraphQL. \n\n${genericError}`)
    }
  } catch (e) {
    handleFetchErrors({ e, reporter, url })
  }

  if (!ignoreGraphQLErrors) {
    await handleGraphQLErrors({
      query,
      variables,
      response,
      errorMap,
      panicOnError,
      reporter,
    })
  }

  return response.data
}

export default fetchGraphql
