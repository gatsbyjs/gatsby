// This gives a guaranteed way to get a string path to a nodes key within any graphql query.
// when we build collections the goal is get a list of nodes, but the nodes key could be a various depths
// this ensures we can get a proper object lookup path that we can use with lodash
import { parse, OperationDefinitionNode, FieldNode } from "graphql"

export function pullNodesPathFromQuery(queryString: string): string {
  const path: string[] = []
  const parsedQueryAst = parse(queryString)

  // guaranteed to only ever have 1 query
  function grabNameAndDrillDown(selection: FieldNode): void {
    path.push(selection.name.value)
    if (selection.name.value === `nodes`) return

    if (selection.selectionSet && selection.selectionSet.selections.length) {
      const fieldNode = selection.selectionSet?.selections[0] as FieldNode
      grabNameAndDrillDown(fieldNode)
    }
  }

  // Based on how we've coded this, these should remain true.
  // But to be prudent maybe we should consider confirming the types via code.
  // If we ever run into bugs here that would be a good solution.
  const operation = parsedQueryAst.definitions[0] as OperationDefinitionNode
  const fieldNode = operation.selectionSet?.selections[0] as FieldNode

  grabNameAndDrillDown(fieldNode)

  return path.join(`.`)
}
