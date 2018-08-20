const fs = require(`fs`)
const path = require(`path`)

let didRunAlready = false
let absoluteComponentPath

exports.onPreInit = ({ store }, { component }) => {
  let userSpecifiedPath = true
  const defaultLayoutComponentPath = `src/layouts/index`
  if (!component) {
    // Default to `src/layouts/index.[js|jsx]` for drop-in replacement of v1 layouts
    component = path.join(
      store.getState().program.directory,
      defaultLayoutComponentPath
    )
    userSpecifiedPath = false
  }

  if (didRunAlready) {
    throw new Error(
      `You can only have single instance of gatsby-plugin-layout in your gatsby-config.js`
    )
  } else if (!fs.existsSync(component)) {
    if (userSpecifiedPath) {
      throw new Error(
        `Couldn't find layout component at specified path: "${component}".`
      )
    } else {
      throw new Error(
        `Couldn't find layout component at "${defaultLayoutComponentPath}.\n\n` +
          `Please create layout component in that location or specify path to layout component in gatsby-config.js`
      )
    }
  }

  didRunAlready = true
  absoluteComponentPath = component
}

exports.onCreateWebpackConfig = ({ actions, plugins }) => {
  actions.setWebpackConfig({
    plugins: [
      plugins.define({
        GATSBY_LAYOUT_COMPONENT_PATH: JSON.stringify(absoluteComponentPath),
      }),
    ],
  })
}
