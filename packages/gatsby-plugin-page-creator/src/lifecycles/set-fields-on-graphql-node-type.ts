import { SetFieldsOnGraphQLNodeTypeArgs } from "gatsby"
import { GraphQLString } from "graphql"
import { derivePath } from "../collection-routes/derive-path"
import { validatePathQuery } from "../validate-path-query"
import knownCollections from "../known-collections"

export function setFieldsOnGraphQLNodeType({
  type,
  store,
  reporter,
}: SetFieldsOnGraphQLNodeTypeArgs): object {
  try {
    const extensions = store.getState().program.extensions
    const collectionQuery = `all${type.name}`
    if (knownCollections.has(collectionQuery)) {
      return {
        gatsbyPath: {
          type: GraphQLString,
          args: {
            filePath: {
              type: GraphQLString,
            },
          },
          resolve: (
            source: object,
            { filePath }: { filePath: string }
          ): string => {
            // This is a quick hack for attaching parents to the node.
            // This may be an incomprehensive fixed for the general use case
            // of connecting nodes together. However, I don't quite know how to
            // fully understand the use-cases. So this is a simple fix for this
            // one common-use, and we'll iterate as we understand.
            const sourceCopy = { ...source }
            // @ts-ignore
            if (typeof source.parent === `string`) {
              // @ts-ignore
              sourceCopy.parent = getNode(source.parent)
            }

            validatePathQuery(filePath, extensions)

            return derivePath(filePath, sourceCopy, reporter)
          },
        },
      }
    }

    return {}
  } catch (e) {
    reporter.panic(
      e.message.startsWith(`PageCreator`)
        ? e.message
        : `PageCreator: ${e.message}`
    )
    return {}
  }
}
