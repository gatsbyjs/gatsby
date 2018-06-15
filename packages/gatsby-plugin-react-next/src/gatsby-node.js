const resolve = require(`resolve`)

const rootReact = resolve.sync(`react`, {
  basedir: process.cwd(),
  preserveSymlinks: true,
})
const React = require(rootReact)

exports.onCreateWebpackConfig = ({ actions, plugins }) => {
  if (React.version.slice(0, 2) === `16`) return

  actions.setWebpackConfig({
    resolve: {
      alias: {
        react: `gatsby-plugin-react-next/node_modules/react`,
        "react-dom": `gatsby-plugin-react-next/node_modules/react-dom`,
      },
    },
  })
}
