const fs = require(`fs`)

let didRunAlready = false

exports.onPreInit = (_, { component }) => {
  if (didRunAlready) {
    throw new Error(`You can only have single instance of gatsby-plugin-layout`)
  } else if (!component) {
    throw new Error(`Component option is required`)
  } else if (!fs.existsSync(component)) {
    throw new Error(
      `Path to component isn't valid. Please use require.resolve with path relative to gatsby-config`
    )
  }

  didRunAlready = true
}

exports.onCreateWebpackConfig = ({ actions, plugins }, { component }) => {
  actions.setWebpackConfig({
    plugins: [
      plugins.define({
        GATSBY_LAYOUT_COMPONENT_PATH: JSON.stringify(component),
      }),
    ],
  })
}
