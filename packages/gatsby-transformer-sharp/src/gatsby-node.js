const fs = require(`fs-extra`)

exports.onCreateNode = require(`./on-node-create`)
exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`)

exports.onPreExtractQueries = async ({ store, getNodes }) => {
  const program = store.getState().program

  // Check if there are any ImageSharp nodes and if gatsby-image is installed. If so
  // add fragments for ImageSharp and gatsby-image. The fragment will cause an error
  // if there's not ImageSharp nodes and without gatsby-image, the fragment is useless.
  const nodes = getNodes()

  if (!nodes.some(n => n.internal.type === `ImageSharp`)) {
    return
  }

  let gatsbyImageDoesNotExist = true
  try {
    require.resolve(`gatsby-image`)
    gatsbyImageDoesNotExist = false
  } catch (e) {
    // Ignore
  }

  if (gatsbyImageDoesNotExist) {
    return
  }

  // We have both gatsby-image installed as well as ImageSharp nodes so let's
  // add our fragments to .cache/fragments.
  await fs.copy(
    require.resolve(`gatsby-transformer-sharp/src/fragments.js`),
    `${program.directory}/.cache/fragments/image-sharp-fragments.js`
  )
}
