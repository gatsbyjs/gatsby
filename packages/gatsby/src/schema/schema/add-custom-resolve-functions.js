const { schemaComposer } = require(`graphql-compose`)

const apiRunner = require(`../../utils/api-runner-node`)
const withContext = require(`./with-context`)

// UPSTREAM: addResolveMethods should accept arg for wrapper fn
const addResolvers = resolvers => {
  Object.entries(resolvers).forEach(([typeName, fields]) => {
    if (schemaComposer.has(typeName)) {
      const tc = schemaComposer.getTC(typeName)
      Object.entries(fields).forEach(([fieldName, resolve]) => {
        if (tc.hasField(fieldName)) {
          tc.extendField(fieldName, { resolve: withContext(resolve) })
        }
      })
    }
  })
}

const addCustomResolveFunctions = () =>
  apiRunner(`addResolvers`, { addResolvers })

module.exports = addCustomResolveFunctions
