import { GraphQLSchema, DocumentNode, parse } from "graphql"
import { flatMap } from "lodash"
import { defaultGatsbyFieldAliases } from "../config/default-gatsby-field-aliases"
import { compileNodeDocument } from "./compile-node-document"
import { compileNodeFragments } from "./compile-node-fragments"
import {
  IGatsbyNodeConfig,
  RemoteTypeName,
  GraphQLSource,
  IGatsbyFieldAliases,
} from "../types"
import * as GraphQLAST from "../utils/ast-nodes"

interface ICompileNodeDocumentsArgs {
  schema: GraphQLSchema
  gatsbyNodeTypes: IGatsbyNodeConfig[]
  gatsbyFieldAliases?: IGatsbyFieldAliases
  customFragments:
    | Array<GraphQLSource | string>
    | Map<RemoteTypeName, GraphQLSource | string>
}

/**
 * Combines `queries` from node types config with any user-defined
 * fragments and produces final queries used for node sourcing.
 */
export function compileNodeQueries({
  schema,
  gatsbyNodeTypes,
  gatsbyFieldAliases = defaultGatsbyFieldAliases,
  customFragments,
}: ICompileNodeDocumentsArgs): Map<RemoteTypeName, DocumentNode> {
  const documents = new Map<RemoteTypeName, DocumentNode>()
  const allFragmentDocs: DocumentNode[] = []
  customFragments.forEach(fragmentString => {
    allFragmentDocs.push(parse(fragmentString))
  })
  const fragments = flatMap(allFragmentDocs, doc =>
    doc.definitions.filter(GraphQLAST.isFragment)
  )

  const nodeFragmentMap = compileNodeFragments({
    schema,
    gatsbyNodeTypes,
    gatsbyFieldAliases,
    fragments,
  })

  gatsbyNodeTypes.forEach(config => {
    const def = compileNodeDocument({
      schema,
      gatsbyNodeType: config,
      gatsbyFieldAliases,
      queries: parse(config.queries),
      fragments: nodeFragmentMap.get(config.remoteTypeName)!, // FIXME
    })
    documents.set(config.remoteTypeName, def)
  })

  return documents
}
