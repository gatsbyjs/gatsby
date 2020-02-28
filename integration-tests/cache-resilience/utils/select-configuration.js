const fs = require(`fs-extra`)
const path = require(`path`)

const useGatsbyNode = run => {
  const r = fs.readdirSync(`plugins`)
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

const useGatsbyConfig = run => {
  fs.copyFileSync(`gatsby-config-${run}.js`, path.join(`gatsby-config.js`))
}

const useGatsbyQuery = run => {
  const r = fs.readdirSync(`plugins`)
  return r.reduce((acc, pluginName) => {
    const inputPath = path.join(`plugins`, pluginName, `query-${run}.js`)
    if (fs.existsSync(inputPath)) {
      const pagePath = path.join(
        `plugins`,
        pluginName,
        `src`,
        `pages`,
        `${pluginName}.js`
      )

      const { query, expectedResult } = require(path.join(
        process.cwd(),
        inputPath
      ))

      const content = query
        ? `
      import { graphql } from "gatsby"
export default () => null

export const query = graphql\`
  ${query}
\`
      `
        : `export default () => null`

      fs.outputFileSync(pagePath, content)

      acc[pluginName] = expectedResult
    }
    return acc
  }, {})
}

const useGatsbyNodeAndConfigAndQuery = (run = 1) => {
  useGatsbyNode(run)
  useGatsbyConfig(run)
  return useGatsbyQuery(run)
}

exports.useGatsbyNodeAndConfigAndQuery = useGatsbyNodeAndConfigAndQuery

// if file was called directly
if (require.resolve(__filename) === require.resolve(process.argv[1])) {
  const run = parseInt(process.argv[2])
  if ([1, 2].includes(run)) {
    useGatsbyNodeAndConfigAndQuery(run)
    console.log(`Prepared setup #${run}`)
  } else {
    console.error(
      `Possible arguments: "1", "2". Was called with ${process.argv[2]}`
    )
    process.exit(1)
  }
}
