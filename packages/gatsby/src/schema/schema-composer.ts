import { SchemaComposer, GraphQLJSON } from "graphql-compose"
import { getNodeInterface } from "./types/node-interface"
import { GraphQLDate } from "./types/date"
const {
  addDirectives,
  GraphQLFieldExtensionDefinition,
} = require(`./extensions`)

export const createSchemaComposer = (
  { fieldExtensions } = { fieldExtensions: GraphQLFieldExtensionDefinition }
): SchemaComposer<unknown> => {
  const schemaComposer = new SchemaComposer()

  // Workaround, mainly relevant in testing
  // See https://github.com/graphql-compose/graphql-compose/commit/70995f7f4a07996cfbe92ebf19cae5ee4fa74ea2
  // This is fixed in v7, so can be removed once we upgrade
  const { BUILT_IN_DIRECTIVES } = require(`graphql-compose/lib/SchemaComposer`)
  schemaComposer.buildSchema({
    directives: [...BUILT_IN_DIRECTIVES],
  })

  getNodeInterface({ schemaComposer })
  schemaComposer.addAsComposer(GraphQLDate)
  schemaComposer.addAsComposer(GraphQLJSON)
  addDirectives({ schemaComposer, fieldExtensions })
  return schemaComposer
}
