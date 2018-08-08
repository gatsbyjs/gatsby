const fs = require(`fs`)

const fileFinder = require(`./file-finder`)
const fileWatcher = require(`./file-watcher`)

const { createFileNode } = require(`./create-file-node`)

exports.sourceNodes = async (gatsby, pluginOptions) => {
  const { actions, createNodeId, reporter } = gatsby
  const { createNode } = actions

  // Validate that the path exists.
  if (!fs.existsSync(pluginOptions.path)) {
    reporter.panic(`
The path passed to gatsby-source-filesystem does not exist on your file system:

${pluginOptions.path}

Please pick a path to an existing directory.

See docs here - https://www.gatsbyjs.org/packages/gatsby-source-filesystem/
      `)
  }

  if (process.env.NODE_ENV === `production`) {
    const pathQueue = await fileFinder(pluginOptions.path)
    const createAndProcessNode = path =>
      createFileNode(path, createNodeId, pluginOptions).then(createNode)

    return new Promise((resolve, reject) =>
      Promise.all(pathQueue.map(createAndProcessNode)).then(resolve, reject)
    )
  }
  return fileWatcher(gatsby, pluginOptions)
}

exports.setFieldsOnGraphQLNodeType = require(`./extend-file-node`)
