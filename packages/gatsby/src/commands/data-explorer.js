/* @flow */

const express = require(`express`)
const graphqlHTTP = require(`express-graphql`)
const { store } = require(`../redux`)

// Note: the store must exist already. Create it with `gatsby build`.
module.exports = async (program: any) => {
  let { port, host } = program
  port = typeof port === `string` ? parseInt(port, 10) : port

  const app = express()
  app.use(
    `/`,
    graphqlHTTP({
      schema: store.getState().schema,
      graphiql: true,
    })
  )

  console.log(`Gatsby data explorer running at`, `http://${host}:${port}`)
  app.listen(port, host)
}
