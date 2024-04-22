import { SORTABLE_ENUM } from "./sort"
import { SEARCHABLE_ENUM } from "./filter"
import {
  SchemaComposer,
  InterfaceTypeComposer,
  ObjectTypeComposer,
} from "graphql-compose"
import type { IGatsbyResolverContext } from "../type-definitions"
import type { IGatsbyNode } from "../../internal"

export const NodeInterfaceFields = [`id`, `parent`, `children`, `internal`]

const getOrCreateNodeInterface = <TSource, TArgs>(
  schemaComposer: SchemaComposer<IGatsbyResolverContext<TSource, TArgs>>,
): InterfaceTypeComposer => {
  // TODO: why is `mediaType` on Internal? Applies only to File!?
  // `fieldOwners` is an object
  // Should we drop ignoreType?
  const internalTC = schemaComposer.getOrCreateOTC(`Internal`, (tc) => {
    tc.addFields({
      content: `String`,
      contentDigest: `String!`,
      description: `String`,
      fieldOwners: [`String`],
      ignoreType: `Boolean`,
      mediaType: `String`,
      owner: `String!`,
      type: `String!`,
      contentFilePath: `String`,
    })
    // TODO: Can be removed with graphql-compose 5.11
    tc.getInputTypeComposer()
  })

  const nodeInterfaceTC = schemaComposer.getOrCreateIFTC(`Node`, (tc) => {
    tc.setDescription(`Node Interface`)
    tc.addFields({
      id: `ID!`,
      parent: {
        type: `Node`,
        resolve: (source, _args, context): IGatsbyNode | null => {
          const { path } = context
          return context.nodeModel.getNodeById({ id: source.parent }, { path })
        },
        extensions: {
          searchable: SEARCHABLE_ENUM.SEARCHABLE,
          sortable: SORTABLE_ENUM.SORTABLE,
          needsResolve: true,
        },
      },
      children: {
        type: `[Node!]!`,
        resolve: (source, _args, context): Array<IGatsbyNode> => {
          const { path } = context
          return context.nodeModel.getNodesByIds(
            { ids: source.children },
            { path },
          )
        },
        extensions: {
          searchable: SEARCHABLE_ENUM.SEARCHABLE,
          sortable: SORTABLE_ENUM.SORTABLE,
          needsResolve: true,
        },
      },
      internal: internalTC.getTypeNonNull(),
    })

    const nodeInputTC = tc.getInputTypeComposer()
    nodeInputTC.extendField(`id`, { type: `String` })
  })

  return nodeInterfaceTC
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addNodeInterfaceFields<TSource = any, TArgs = any>({
  schemaComposer,
  typeComposer,
}: {
  schemaComposer: SchemaComposer<IGatsbyResolverContext<TSource, TArgs>>
  typeComposer: ObjectTypeComposer
}): void {
  const nodeInterfaceTC = getOrCreateNodeInterface(schemaComposer)
  typeComposer.addFields(nodeInterfaceTC.getFields())
  nodeInterfaceTC.setResolveType((node) => node.internal.type)
  schemaComposer.addSchemaMustHaveType(typeComposer)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addNodeInterface<TSource = any, TArgs = any>({
  schemaComposer,
  typeComposer,
}: {
  schemaComposer: SchemaComposer<IGatsbyResolverContext<TSource, TArgs>>
  typeComposer: ObjectTypeComposer
}): void {
  const nodeInterfaceTC = getOrCreateNodeInterface(schemaComposer)
  typeComposer.addInterface(nodeInterfaceTC)
  addNodeInterfaceFields({ schemaComposer, typeComposer })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNodeInterface<TSource = any, TContext = any, TArgs = any>({
  schemaComposer,
}: {
  schemaComposer: SchemaComposer<IGatsbyResolverContext<TSource, TArgs>>
}): InterfaceTypeComposer<TSource, TContext> {
  return getOrCreateNodeInterface(schemaComposer)
}
