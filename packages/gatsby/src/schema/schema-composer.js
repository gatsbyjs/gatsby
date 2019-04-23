const { SchemaComposer, GraphQLJSON } = require(`graphql-compose`)
const { getNodeInterface } = require(`./types/node-interface`)
const { GraphQLDate } = require(`./types/date`)
const { addDirectives } = require(`./extensions`)

const createSchemaComposer = () => {
  const schemaComposer = new SchemaComposer()
  getNodeInterface({ schemaComposer })
  schemaComposer.addAsComposer(GraphQLDate)
  schemaComposer.addAsComposer(GraphQLJSON)
  addDirectives({ schemaComposer })
  return schemaComposer
}

module.exports = { createSchemaComposer }
