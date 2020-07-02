import {
  GraphQLSchema,
  DocumentNode,
  TypeInfo,
  visit,
  visitWithTypeInfo,
  visitInParallel,
  FragmentDefinitionNode,
  FieldNode,
} from "graphql"
import * as GraphQLAST from "../utils/ast-nodes"
import { addVariableDefinitions } from "./ast-transformers/add-variable-definitions"
import { IGatsbyFieldAliases, IGatsbyNodeConfig } from "../types"

interface ICompileNodeDocumentArgs {
  gatsbyNodeType: IGatsbyNodeConfig
  gatsbyFieldAliases: IGatsbyFieldAliases
  schema: GraphQLSchema
  queries: DocumentNode
  fragments: FragmentDefinitionNode[]
}

export function compileNodeDocument(args: ICompileNodeDocumentArgs) {
  const fullDocument: DocumentNode = {
    ...args.queries,
    definitions: args.queries.definitions.concat(args.fragments),
  }

  // Expected query variants:
  //  1. { allUser }
  //  2. { allNode(type: "User") }
  //
  // We want them to be transformed to:
  //  1. { allUser { ...UserFragment1 ...UserFragment2 }}
  //  2. { allNode(type: "User") { ...UserFragment1 ...UserFragment2 }}
  //
  const typeInfo = new TypeInfo(args.schema)
  const aliases = args.gatsbyFieldAliases
  let didSpread = false

  return visit(
    fullDocument,
    visitWithTypeInfo(
      typeInfo,
      visitInParallel([
        {
          FragmentDefinition: () => false, // skip fragments
          OperationDefinition: () => {
            didSpread = false
          },
          Field: {
            leave: node => {
              if (didSpread) {
                return false // skip visiting this node
              }
              // Spreading in the very first leaf field
              didSpread = true
              const editedField: FieldNode = {
                ...node,
                selectionSet: GraphQLAST.selectionSet([
                  ...args.gatsbyNodeType.remoteIdFields.map(id =>
                    GraphQLAST.field(id, aliases[id])
                  ),
                  ...args.fragments.map(fragment =>
                    GraphQLAST.fragmentSpread(fragment.name.value)
                  ),
                ]),
              }
              return editedField
            },
          },
        },
        addVariableDefinitions({ typeInfo }),
      ])
    )
  )
}
