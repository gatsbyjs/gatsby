import { definitionsReducer } from "../reducers/definitions"
import { print, DocumentNode } from "graphql"
import gql from "graphql-tag"
import { IDefinitionMeta } from "../types"

import { actions } from "../actions"

const parsedExample = gql`
  type DummyType {
    nothing: String
  }
  fragment Example on Query {
    example
  }
`

const parsedExample2 = gql`
  type DummyType {
    nothing: String
  }
  fragment Example2 on Query {
    example2
  }
`

const getMockDefinitions = (
  ast: DocumentNode
): Map<string, IDefinitionMeta> => {
  const definitions = new Map<string, IDefinitionMeta>()

  ast.definitions.map(d => {
    if (!(`name` in d) || d.name === undefined) {
      return
    }
    definitions.set(d?.name.toString(), {
      name: d?.name.toString(),
      filePath: `uri/example`,
      isFragment: Boolean(d.kind === `FragmentDefinition`),
      printedAst: print(d),
      def: d,
      isHook: false,
      isStaticQuery: true,
      hash: `234234`,
      text: ``,
      templateLoc: 0,
    } as IDefinitionMeta)
  })
  return definitions
}

const mockDefinitions = getMockDefinitions(parsedExample)
const mockDefinitions2 = getMockDefinitions(parsedExample2)

describe(`Definitions actions/reducer`, () => {
  it(`allows setting definitionsByName Map`, () => {
    expect(actions.setGraphQLDefinitions(mockDefinitions)).toMatchSnapshot()
  })
  it(`allows updating status`, () => {
    let state = definitionsReducer(
      undefined,
      actions.setGraphQLDefinitions(mockDefinitions)
    )
    state = definitionsReducer(
      state,
      actions.setGraphQLDefinitions(mockDefinitions2)
    )
    expect(state).toEqual(mockDefinitions2)
  })
})
