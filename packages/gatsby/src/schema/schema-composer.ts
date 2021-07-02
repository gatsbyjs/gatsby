import { SchemaComposer, GraphQLJSON } from "graphql-compose"
import { addDirectives, GraphQLFieldExtensionDefinition } from "./extensions"
import { GraphQLDate } from "./types/date"
import { IGatsbyResolverContext } from "./type-definitions"
import { getNodeInterface } from "./types/node-interface"

export const createSchemaComposer = <TSource, TArgs>({
  fieldExtensions,
}: GraphQLFieldExtensionDefinition = {}): SchemaComposer<
  IGatsbyResolverContext<TSource, TArgs>
> => {
  const schemaComposer: SchemaComposer<IGatsbyResolverContext<
    TSource,
    TArgs
  >> = new SchemaComposer()

  getNodeInterface({ schemaComposer })
  schemaComposer.add(GraphQLDate)
  schemaComposer.add(GraphQLJSON)
  addDirectives({ schemaComposer, fieldExtensions })
  return schemaComposer
}
