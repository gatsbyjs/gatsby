// This gives a guaranteed way to get a string path to a nodes key within any graphql query.
// when we build collections the goal is get a list of nodes, but the nodes key could be a various depths
// this ensures we can get a proper object lookup path that we can use with lodash
import { parse } from "graphql"

export function pullNodesPathFromQuery(queryString: string): string {
  const path = []
  const parsedQueryAst = parse(queryString)

  // guaranteed to only ever have 1 query
  function grabNameAndDrillDown(selection): void {
    path.push(selection.name.value)
    if (selection.name.value === `nodes`) return

    if (selection.selectionSet && selection.selectionSet.selections.length) {
      grabNameAndDrillDown(selection.selectionSet.selections[0])
    }
  }
  console.log(parsedQueryAst.definitions[0])
  grabNameAndDrillDown(parsedQueryAst.definitions[0].selectionSet.selections[0])

  return path.join(`.`)
}
