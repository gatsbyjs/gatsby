const fs = require(`fs-extra`)
const path = require(`path`)

const {
  getAllPlugins,
  getPluginsForRun,
  getQueriesForRun,
} = require(`./collect-scenarios`)

const useGatsbyNode = run => {
  const r = getAllPlugins()
  r.forEach(pluginName => {
    const inputPath = path.join(`plugins`, pluginName, `gatsby-node-${run}.js`)
    if (fs.existsSync(inputPath)) {
      fs.copyFileSync(
        inputPath,
        path.join(`plugins`, pluginName, `gatsby-node.js`)
      )
    }
  })
}

const useGatsbyQuery = run => {
  // remove ones from previous run
  fs.removeSync(path.join(__dirname, `..`, `src`, `pages`, `scenarios`))

  const queries = getQueriesForRun(run)

  Object.entries(queries).forEach(([name, queriesForScenario]) => {
    Object.entries(queriesForScenario).forEach(([type, queryText]) => {
      const pagePath = path.join(
        __dirname,
        `..`,
        `src`,
        `pages`,
        `scenarios`,
        name,
        type,
        `index.js`
      )

      const content = `
      import { graphql } from "gatsby"
      export default () => null

      export const query = graphql\`
        ${queryText}
      \`
    `

      fs.outputFileSync(pagePath, content)
    })
  })
}

const useGatsbyConfig = run => {
  const plugins = getPluginsForRun(run)
  const configPath = path.resolve(
    path.join(__dirname, `..`, `gatsby-config.js`)
  )
  const configContent = `module.exports = { siteMetadata: { run: ${run} }, plugins: ${JSON.stringify(
    plugins
  )}}`
  fs.writeFileSync(configPath, configContent)
}

const selectConfiguration = run => {
  if ([1, 2].includes(run)) {
    useGatsbyConfig(run)

    // if use run===2, make sure we do run=1 first, because some plugins will have only "=1" specific files
    for (let i = 1; i <= run; i++) {
      useGatsbyNode(i)
    }

    useGatsbyQuery(run)

    return run
  } else {
    throw new Error(`Possible arguments: <1|2>. Was called with ${run}`)
  }
}

module.exports = {
  selectConfiguration,
}

// if file was called directly
if (require.resolve(__filename) === require.resolve(process.argv[1])) {
  const run = parseInt(process.argv[2])
  selectConfiguration(run)
}
