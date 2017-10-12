const path = require(`path`)
const React = require(path.resolve(process.cwd(), `node_modules/react`))

exports.modifyWebpackConfig = ({ config, stage }) => {
  if (React.version.slice(0, 2) !== `16`) {
    config._config.resolve.alias = {
      react: `gatsby-plugin-react-next/node_modules/react`,
      "react-dom": `gatsby-plugin-react-next/node_modules/react-dom`,
    }
  }

  return config
}
