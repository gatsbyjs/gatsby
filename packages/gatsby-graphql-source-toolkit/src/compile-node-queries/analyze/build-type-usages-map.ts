import {
  DocumentNode,
  FieldNode,
  FragmentDefinitionNode,
  GraphQLSchema,
  TypeInfo,
  visit,
  visitWithTypeInfo,
} from "graphql"
import { IGatsbyNodeConfig, RemoteTypeName } from "../../types"

type TypeUsagePath = string
type TypeUsages = Map<TypeUsagePath, FieldNode[]>
export type TypeUsagesMap = Map<RemoteTypeName, TypeUsages>

interface IBuildTypeUsagesMapArgs {
  schema: GraphQLSchema
  gatsbyNodeTypes: IGatsbyNodeConfig[]
  fragments: FragmentDefinitionNode[] // TODO: rename to userFragments
}

/**
 * Searches for references of all types inside fragments and constructs
 * a usage map from those references.
 *
 * For example:
 * fragment A on Foo {
 *   posts {
 *     author { firstname }
 *   }
 * }
 * fragment B on Post {
 *   myCategory: category {
 *     moderator { lastname }
 *   }
 * }
 *
 * Will end up with the following map:
 * {
 *   Foo: {
 *     A: [ { name: { value: "posts", selectionSet: {...} } } ]
 *   },
 *   Post: {
 *     A__posts: [ { name: {value: "author"}, selectionSet: {...} } ],
 *     B: [{ name: {value: "myCategory", selectionSet: {...}} }]
 *   },
 *   User: {
 *     A__posts__author: [ {name: {value: "firstname"} }],
 *     B__myCategory__moderator: [ {name: {value: "lastname"} }],
 *   },
 *   Category: {
 *     B_myCategory: [ {name: {value: "moderator"}, selectionSet: {...} } ]
 *   }
 * }
 */
export function buildTypeUsagesMap(
  args: IBuildTypeUsagesMapArgs
): TypeUsagesMap {
  const fullDocument: DocumentNode = {
    kind: `Document`,
    definitions: args.fragments,
  }

  const typeInfo = new TypeInfo(args.schema)
  const typeUsagesMap: TypeUsagesMap = new Map()
  const typeUsagePath: string[] = []

  visit(
    fullDocument,
    visitWithTypeInfo(typeInfo, {
      FragmentDefinition: {
        enter(node) {
          typeUsagePath.push(node.name.value)
        },
        leave() {
          typeUsagePath.pop()
        },
      },
      InlineFragment: {
        enter(_, key) {
          typeUsagePath.push(String(key))
        },
        leave() {
          typeUsagePath.pop()
        },
      },
      Field: {
        enter: node => {
          const parentType = typeInfo.getParentType()
          if (!parentType) {
            throw new Error(`Visited field is expected to have parent type`)
          }
          const typeUsageKey = typeUsagePath.join(`__`)

          if (!typeUsagesMap.has(parentType.name)) {
            typeUsagesMap.set(parentType.name, new Map() as TypeUsages)
          }
          const typeFragments = typeUsagesMap.get(parentType.name)!
          if (!typeFragments.has(typeUsageKey)) {
            typeFragments.set(typeUsageKey, [] as FieldNode[])
          }
          const fragmentFields = typeFragments.get(typeUsageKey)!
          fragmentFields.push(node)

          const alias = node.alias ? node.alias.value : node.name.value
          typeUsagePath.push(alias)
        },
        leave: () => {
          typeUsagePath.pop()
        },
      },
    })
  )

  return typeUsagesMap
}
