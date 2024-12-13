import repl from "repl"
import { graphql } from "graphql"
import { bootstrap } from "../bootstrap"
import { getNodes, getNode, getNodesByType } from "../datastore"
import { loadNodeContent } from "../utils/nodes"
import { store } from "../redux"
import { IProgram } from "./types"

module.exports = async (program: IProgram): Promise<void> => {
  // run bootstrap
  await bootstrap({ program })

  // get all the goodies from the store
  const { schema, config, babelrc, pages, components, staticQueryComponents } =
    store.getState()

  const nodes = getNodes()

  const query = async (query: string): Promise<void> => {
    const result = await graphql({
      schema,
      source: query,
      rootValue: {},
      contextValue: {},
    })
    console.log(`query result: ${JSON.stringify(result)}`)
  }

  // init new repl
  const _ = repl.start({
    prompt: `gatsby > `,
  })

  // set some globals to make life easier
  _.context.babelrc = babelrc
  _.context.components = components
  _.context.getNode = getNode
  _.context.getNodes = getNodes
  _.context.getNodesByType = getNodesByType
  _.context.loadNodeContent = loadNodeContent
  _.context.nodes = [...nodes.entries()]
  _.context.pages = [...pages.entries()]
  _.context.graphql = query
  _.context.schema = schema
  _.context.siteConfig = config
  _.context.staticQueries = staticQueryComponents

  _.on(`exit`, () => {
    process.exit(0)
  })
}
