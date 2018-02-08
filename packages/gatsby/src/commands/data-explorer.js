/* @flow */

const express = require(`express`)
const graphqlHTTP = require(`express-graphql`)
const { store } = require(`../redux`)
const bootstrap = require(`../bootstrap`)
const { GraphQLSchema } = require(`graphql`)

module.exports = async (program: any) => {
  let { port, host } = program
  port = typeof port === `string` ? parseInt(port, 10) : port

  // bootstrap to ensure schema is in the store
  await bootstrap(program)

  const schema = store.getState().schema

  console.log(
    `Schema is instance of GraphQLSchema?`,
    schema instanceof GraphQLSchema
  )

  const app = express()
  app.use(
    `/`,
    graphqlHTTP({
      schema,
      graphiql: true,
    })
  )

  console.log(`Gatsby data explorer running at`, `http://${host}:${port}`)
  app.listen(port, host)
}
