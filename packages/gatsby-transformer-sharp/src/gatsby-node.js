const fs = require(`fs-extra`)

exports.onCreateNode = require(`./on-node-create`)
exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`)

exports.onPreExtractQueries = async ({ store, getNodes }) => {
  const program = store.getState().program

  // Check if there are any ImageSharp nodes. If so add fragments for ImageSharp.
  // The fragment will cause an error if there are no ImageSharp nodes.
  const nodes = getNodes()

  if (!nodes.some(n => n.internal.type === `ImageSharp`)) {
    return
  }

  // We have ImageSharp nodes so let's add our fragments to .cache/fragments.
  await fs.copy(
    require.resolve(`gatsby-transformer-sharp/src/fragments.js`),
    `${program.directory}/.cache/fragments/image-sharp-fragments.js`
  )
}
