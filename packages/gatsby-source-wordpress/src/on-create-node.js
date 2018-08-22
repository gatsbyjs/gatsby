const { runHastTransformations } = require(`./hast-functions`);

module.exports = async (
  nodeOptions,
  pluginOptions,
) => {
  if (pluginOptions.hastOptions) {
    runHastTransformations(
      nodeOptions,
      pluginOptions,
    )
  }
}
