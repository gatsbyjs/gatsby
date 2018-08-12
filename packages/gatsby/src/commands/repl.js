const repl = require(`repl`)
const { graphql } = require(`graphql`)
const bootstrap = require(`../bootstrap`)
const { store } = require(`../redux`)

module.exports = async program => {
  // run bootstrap
  await bootstrap(program)

  // get all the goodies from the store
  const {
    schema,
    config,
    babelrc,
    jsonDataPaths,
    pages,
    components,
    staticQueryComponents,
    nodes,
  } = store.getState()

  // init new repl
  const _ = repl.start({
    prompt: `gatsby > `,
  })

  // set some globals to make life easier
  _.context.babelrc = babelrc
  _.context.components = components
  _.context.dataPaths = jsonDataPaths
  _.context.nodes = [...nodes.entries()]
  _.context.pages = [...pages.entries()]
  _.context.schema = schema
  _.context.siteConfig = config
  _.context.staticQueries = staticQueryComponents

  // add custom repl commands, used in repl lik: `.query "{ site { ... } }"`
  _.defineCommand(`query`, {
    action: async query => {
      const result = await graphql(schema, query, {}, {}, {})
      return result
    },
  })

  _.on(`exit`, () => process.exit(0))
}
