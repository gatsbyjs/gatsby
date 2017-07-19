const fs = require(`fs`)
const path = require(`path`)
const { watchComponent } = require(`./query-watcher`)

let components = {}

exports.onCreateComponent = ({ component, store, boundActionCreators }) => {
  // if we haven't seen component before
  // - get corresponding pages + layouts
  // - ensure they have a json files
  // - watch component
  // - mark component
  const writeJsonFile = ({ jsonName }) => {
    // console.log(jsonName)
    const dest = path.join(
      store.getState().program.directory,
      `.cache`,
      `json`,
      jsonName
    )
    if (!fs.existsSync(dest)) {
      fs.writeFile(dest, `{}`, () => {})
    }
  }

  if (!components[component.componentPath]) {
    const state = store.getState()
    const pagesAndLayouts = [
      ...state.pages,
      ...state.layouts
    ]

    pagesAndLayouts
    .filter(pl => pl.componentPath === component.componentPath)
    .map(writeJsonFile)

    watchComponent(component.componentPath)
    components[component.componentPath] = component.componentPath
  }
}
