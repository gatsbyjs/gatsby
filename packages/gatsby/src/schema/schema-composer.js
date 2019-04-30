const { SchemaComposer, GraphQLJSON } = require(`graphql-compose`)
const { getNodeInterface } = require(`./types/node-interface`)
const { GraphQLDate } = require(`./types/date`)
const {
  InferDirective,
  DontInferDirective,
  AddResolver,
} = require(`./types/directives`)

const createSchemaComposer = () => {
  const schemaComposer = new SchemaComposer()
  getNodeInterface({ schemaComposer })
  schemaComposer.addAsComposer(GraphQLDate)
  schemaComposer.addAsComposer(GraphQLJSON)
  schemaComposer.addDirective(InferDirective)
  schemaComposer.addDirective(DontInferDirective)
  schemaComposer.addDirective(AddResolver)
  return schemaComposer
}

module.exports = { createSchemaComposer }
