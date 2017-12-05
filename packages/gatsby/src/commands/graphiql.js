/* @flow */

const express = require(`express`)
const graphqlHTTP = require(`express-graphql`)
const { store } = require(`../redux`)
const bootstrap = require(`../bootstrap`)

module.exports = async (program: any) => {
  let { port } = program
  port = typeof port === `string` ? parseInt(port, 10) : port

  // bootstrap to ensure schema is in the store
  await bootstrap(program)

  const app = express()
  app.use(
    `/`,
    graphqlHTTP({
      schema: store.getState().schema,
      graphiql: true,
    })
  )

  console.log(`GraphiQL running at`, `http://${program.host}:${port}`)
  app.listen(port)
}

