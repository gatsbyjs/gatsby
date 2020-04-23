import gqlPrettier from "graphql-prettier"
import axios from "axios"
import rateLimit from "axios-rate-limit"
import chalk from "chalk"
import { formatLogMessage } from "./format-log-message"
import store from "~/store"
import { getPluginOptions } from "./get-gatsby-api"

const http = rateLimit(axios.create(), {
  maxRPS: process.env.GATSBY_CONCURRENT_DOWNLOAD || 50,
})

const handleErrors = async ({
  variables,
  pluginOptions,
  reporter,
  responseJSON,
  query,
  panicOnError,
}) => {
  if (
    variables &&
    Object.keys(variables).length &&
    pluginOptions.debug.graphql.showQueryVarsOnError
  ) {
    reporter.error(
      formatLogMessage(`GraphQL vars: ${JSON.stringify(variables)}`)
    )
  }

  try {
    query = gqlPrettier(query)
  } catch (e) {
    // do nothing
  }

  if (pluginOptions.debug.graphql.showQueryOnError) {
    reporter.error(formatLogMessage(`GraphQL query: ${query}`))
  }

  if (pluginOptions.debug.graphql.copyQueryOnError) {
    try {
      await clipboardy.write(query)
    } catch (e) {
      // do nothing
    }
  }

  if (!responseJSON) {
    return
  }

  if (
    !responseJSON.data ||
    panicOnError ||
    pluginOptions.debug.graphql.panicOnError
  ) {
    reporter.panic(
      formatLogMessage(`Encountered errors. See above for details.`)
    )
  }
}

const handleGraphQLErrors = async ({
  query,
  variables,
  response,
  errorMap,
  panicOnError,
  reporter,
}) => {
  const pluginOptions = getPluginOptions()

  if (!response) {
    reporter.panic(response)
    return
  }

  const json = response.data
  const { errors } = json

  if (!errors) {
    return
  }

  // if we have json data, the error wasn't critical.
  if (
    json &&
    json.data &&
    pluginOptions.debug.graphql.onlyReportCriticalErrors
  ) {
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
        formatLogMessage(
          `Error category: ${error.category} \n\nError: \n  ${error.message} \n\n Debug message: \n  ${error.debugMessage}`
        )
      )
    } else {
      reporter.error(
        formatLogMessage(
          `${error.message} (${
            error.category
          }) \n\n If you haven't already, try adding ${chalk.bold(
            `define( 'GRAPHQL_DEBUG', true );`
          )} to your wp-config.php for more detailed error messages.`
        )
      )
    }
  }

  await handleErrors({
    responseJSON: json,
    variables,
    pluginOptions,
    reporter,
    query,
    panicOnError,
  })
}

const ensureStatementsAreTrue = `${chalk.bold(
  `Please ensure the following statements are true`
)} \n  - your WordPress URL is correct in gatsby-config.js\n  - your server is responding to requests \n  - WPGraphQL and WPGatsby are installed in your WordPress backend`

// @todo add a link to docs page for debugging
const genericError = ({ url }) =>
  `GraphQL request to ${chalk.bold(url)} failed.\n\n${ensureStatementsAreTrue}`

const handleFetchErrors = async ({
  e,
  reporter,
  url,
  timeout,
  variables,
  pluginOptions,
  query,
  response,
}) => {
  await handleErrors({
    panicOnError: false,
    reporter,
    variables,
    pluginOptions,
    query,
  })

  if (e.message.includes(`timeout of ${timeout}ms exceeded`)) {
    reporter.error(e)
    reporter.panic(
      formatLogMessage(
        `It took too long for ${url} to respond (longer than ${timeout /
          1000} seconds). Either your URL is wrong, you need to increase server resources, or you need to increase your timeout in the gatsby-source-wordpress options. \n${genericError(
          { url }
        )}`,
        { useVerboseStyle: true }
      )
    )
  }

  if (response?.headers[`content-type`].includes(`text/html;`)) {
    reporter.panic(
      formatLogMessage(
        `${e.message} \n\nReceived HTML as a response. Are you sure ${url} is the correct URL?\n\nIf that URL redirects to the correct URL via WordPress in the browser, or you've entered the wrong URL in settings, you might receive this error.\nVisit that URL in your browser, and if it looks good, copy/paste it from your URL bar to your config.\n\n${ensureStatementsAreTrue}`,
        {
          useVerboseStyle: true,
        }
      )
    )
  }

  reporter.panic(
    formatLogMessage(`${e.message} \n\n${genericError({ url })}`, {
      useVerboseStyle: true,
    })
  )
}

const fetchGraphql = async ({
  query,
  errorMap,
  ignoreGraphQLErrors = false,
  panicOnError = false,
  throwGqlErrors = false,
  throwFetchErrors = false,
  url = false,
  variables = {},
  headers = {},
}) => {
  const { helpers, pluginOptions } = store.getState().gatsbyApi

  const { url: pluginOptionsUrl } = pluginOptions
  let { reporter } = helpers

  if (!reporter || typeof reporter === `undefined`) {
    reporter = {
      panic: message => {
        throw new Error(message)
      },
      error: console.error,
    }
  }

  if (!url) {
    url = pluginOptionsUrl
  }

  const timeout = pluginOptions.schema.timeout

  let response

  try {
    response = await http.post(url, { query, variables }, { timeout, headers })

    const contentType = response.headers[`content-type`]

    if (!contentType.includes(`application/json;`)) {
      throw new Error(`Unable to connect to WPGraphQL.`)
    }
  } catch (e) {
    if (throwFetchErrors) {
      throw e
    }

    await handleFetchErrors({
      e,
      reporter,
      url,
      timeout,
      variables,
      pluginOptions,
      query,
      response,
    })
  }

  if (throwGqlErrors && response.data.errors) {
    const stringifiedErrors = response.data.errors
      .map(error => error.message)
      .join(`\n\n`)

    throw new Error(stringifiedErrors)
  }

  if (!ignoreGraphQLErrors) {
    await handleGraphQLErrors({
      query,
      variables,
      response,
      errorMap,
      panicOnError,
      reporter,
      url,
      timeout,
    })
  }

  return response.data
}

export default fetchGraphql
