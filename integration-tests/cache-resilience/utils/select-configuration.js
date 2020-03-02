const fs = require(`fs-extra`)
const path = require(`path`)

const { getAllPlugins, getPluginsForRun } = require(`./collect-scenarios`)

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

// const useGatsbyQuery = run => {
//   const r = fs.readdirSync(`plugins`)
//   return r.reduce((acc, pluginName) => {
//     const inputPath = path.join(`plugins`, pluginName, `query-${run}.js`)
//     if (fs.existsSync(inputPath)) {
//       const pagePath = path.join(
//         `plugins`,
//         pluginName,
//         `src`,
//         `pages`,
//         `${pluginName}.js`
//       )

//       const { query, expectedResult } = require(path.join(
//         process.cwd(),
//         inputPath
//       ))

//       const content = query
//         ? `
//       import { graphql } from "gatsby"
// export default () => null

// export const query = graphql\`
//   ${query}
// \`
//       `
//         : `export default () => null`

//       fs.outputFileSync(pagePath, content)

//       acc[pluginName] = expectedResult
//     }
//     return acc
//   }, {})
// }

const useGatsbyConfig = run => {
  const plugins = getPluginsForRun(run)
  const configPath = path.resolve(
    path.join(__dirname, `..`, `gatsby-config.js`)
  )
  const configContent = `module.exports = { plugins: ${JSON.stringify(
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
