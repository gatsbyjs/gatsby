const fs = require(`fs-extra`)

exports.onCreateNode = require(`./on-node-create`)
exports.createSchemaCustomization = require(`./customize-schema`)

exports.onPreExtractQueries = async ({ store }) => {
  const program = store.getState().program

  // Add fragments for ImageSharp to .cache/fragments.
  await fs.copy(
    require.resolve(`gatsby-transformer-sharp/src/fragments.js`),
    `${program.directory}/.cache/fragments/image-sharp-fragments.js`
  )
}
