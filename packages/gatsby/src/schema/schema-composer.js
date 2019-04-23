const { SchemaComposer } = require(`graphql-compose`)
const { getNodeInterface } = require(`./types/node-interface`)
const { GraphQLDate } = require(`./types/date`)
const { InferDirective, DontInferDirective } = require(`./types/directives`)

const createSchemaComposer = () => {
  const schemaComposer = new SchemaComposer()
  getNodeInterface({ schemaComposer })
  schemaComposer.addAsComposer(GraphQLDate)
  schemaComposer.addDirective(InferDirective)
  schemaComposer.addDirective(DontInferDirective)
  return schemaComposer
}

module.exports = { createSchemaComposer }
