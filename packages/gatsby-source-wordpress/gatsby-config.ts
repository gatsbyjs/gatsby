import { GatsbyConfig } from "gatsby"

function createConfig(config: { catchLinks?: boolean } = {}): GatsbyConfig {
  const plugins = [`gatsby-plugin-image`, `gatsby-plugin-sharp`]

  if (config.catchLinks) {
    plugins.push(`gatsby-plugin-catch-links`)
  }

  return {
    plugins,
  }
}

const config = createConfig()

module.exports = config
