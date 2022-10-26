import { SchemaComposer, GraphQLJSON } from "graphql-compose"
import { addDirectives, GraphQLFieldExtensionDefinition } from "./extensions"
import { GraphQLDate } from "./types/date"
import { IGatsbyResolverContext } from "./type-definitions"
import { GatsbyImageDataScalar } from "./types/media"
import { getNodeInterface } from "./types/node-interface"
import { getOrCreateRemoteFileInterface } from "./types/remote-file-interface"

export const createSchemaComposer = <TSource, TArgs>({
  fieldExtensions,
}: GraphQLFieldExtensionDefinition = {}): SchemaComposer<
  IGatsbyResolverContext<TSource, TArgs>
> => {
  const schemaComposer: SchemaComposer<IGatsbyResolverContext<TSource, TArgs>> =
    new SchemaComposer()

  // set default interfaces so plugins can use them
  getNodeInterface({ schemaComposer })
  getOrCreateRemoteFileInterface(schemaComposer)

  schemaComposer.add(GraphQLDate)
  schemaComposer.add(GraphQLJSON)
  schemaComposer.add(GatsbyImageDataScalar)
  addDirectives({ schemaComposer, fieldExtensions })
  return schemaComposer
}
