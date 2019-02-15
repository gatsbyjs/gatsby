const { SchemaComposer } = require(`graphql-compose`)
const { GraphQLDate } = require(`./types/date`)
const { InferDirective, DontInferDirective } = require(`./types/directives`)

const createSchemaComposer = () => {
  const schemaComposer = new SchemaComposer()
  schemaComposer.add(GraphQLDate)
  schemaComposer.addDirective(InferDirective)
  schemaComposer.addDirective(DontInferDirective)
  return schemaComposer
}

module.exports = { createSchemaComposer }
