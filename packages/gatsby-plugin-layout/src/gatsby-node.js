const path = require(`path`)

let didRunAlready = false
let absoluteComponentPath

exports.onPreInit = ({ store }, { component }) => {
  const defaultLayoutComponentPath = `src/layouts/index`
  if (!component) {
    // Default to `src/layouts/index.[js|jsx]` for drop-in replacement of v1 layouts
    component = path.join(
      store.getState().program.directory,
      defaultLayoutComponentPath
    )
  }

  if (didRunAlready) {
    throw new Error(
      `You can only have single instance of gatsby-plugin-layout in your gatsby-config.js`
    )
  }

  didRunAlready = true
  absoluteComponentPath = component
}

exports.onCreateWebpackConfig = ({ stage, actions, plugins }) => {
  const isDevelop = stage.startsWith(`develop`)
  actions.setWebpackConfig({
    ...(isDevelop && {
      module: {
        rules: [
          {
            test: input => input === absoluteComponentPath,
            use: [
              {
                loader: require.resolve(`react-hot-loader-loader`),
              },
            ],
          },
        ],
      },
    }),
    plugins: [
      plugins.define({
        GATSBY_LAYOUT_COMPONENT_PATH: JSON.stringify(absoluteComponentPath),
      }),
    ],
  })
}
