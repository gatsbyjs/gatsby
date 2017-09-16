exports.modifyWebpackConfig = ({ config, stage }) => {
  config._config.resolve.alias = {
    react: `gatsby-plugin-react-next/node_modules/react`,
    "react-dom": `gatsby-plugin-react-next/node_modules/react-dom`,
  }

  return config
}
