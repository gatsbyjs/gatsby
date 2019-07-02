"use strict"

const express = require(`express`)
const graphqlHTTP = require(`express-graphql`)
const graphqlPlayground = require(`graphql-playground-middleware-express`)
  .default
const graphiqlExplorer = require(`gatsby-graphiql-explorer`)
const { formatError } = require(`graphql`)
const { store } = require(`../redux`)
const bootstrap = require(`../bootstrap`)
const cors = require(`cors`)

const withResolverContext = require(`../schema/context`)

module.exports = async program => {
  let { port, host } = program
  port = typeof port === `string` ? parseInt(port, 10) : port // bootstrap to ensure schema is in the store

  await bootstrap(program)

  /**
   * Set up the express app.
   **/
  const app = express()

  app.use(cors())

  /**
   * Pattern matching all endpoints with graphql or graphiql with 1 or more leading underscores
   */
  const graphqlEndpoint = `/_+graphi?ql`

  if (process.env.GATSBY_GRAPHQL_IDE === `playground`) {
    app.get(
      graphqlEndpoint,
      graphqlPlayground({
        endpoint: `/___graphql`,
      }),
      () => {}
    )
  } else {
    graphiqlExplorer(app, {
      graphqlEndpoint,
    })
  }

  app.use(
    graphqlEndpoint,
    graphqlHTTP(() => {
      const schema = store.getState().schema
      return {
        schema,
        graphiql: true,
        context: withResolverContext({}, schema),
        formatError(err) {
          return {
            ...formatError(err),
            stack: err.stack ? err.stack.split(`\n`) : [],
          }
        },
      }
    })
  )
  console.log(`Gatsby data explorer running at`, `http://${host}:${port}`)
  app.listen(port, host)
}
//# sourceMappingURL=data-explorer.js.map
