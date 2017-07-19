const fs = require(`fs`)
const path = require(`path`)

const { watchComponent } = require(`./query-watcher`)

let components = {}
exports.onCreatePage = ({ page, store, boundActionCreators }) => {
  const component = page.component
  if (!components[component]) {
    // We haven't seen this component before so we:
    // - Ensure it has a JSON file.
    // - Add it to Redux
    // - Watch the component to detect query changes
    const pathToJSONFile = path.join(
      store.getState().program.directory,
      `.cache`,
      `json`,
      page.jsonName
    )
    if (!fs.existsSync(pathToJSONFile)) {
      fs.writeFile(pathToJSONFile, `{}`, () => {})
    }
    boundActionCreators.createPageComponent(component)

    // Make sure we're watching this component.
    watchComponent(component)
  }

  // Mark we've seen this page component.
  components[component] = component
}

exports.onCreateLayout = ({ layout, store, boundActionCreators }) => {
  const component = layout.component
  if (!components[component]) {
    // We haven't seen this component before so we:
    // - Ensure it has a JSON file.
    // - Add it to Redux
    // - Watch the component to detect query changes
    const pathToJSONFile = path.join(
      store.getState().program.directory,
      `.cache`,
      `json`,
      layout.jsonName
    )
    if (!fs.existsSync(pathToJSONFile)) {
      fs.writeFile(pathToJSONFile, `{}`, () => {})
    }
    boundActionCreators.createPageComponent(component)

    // Make sure we're watching this component.
    watchComponent(component)
  }

  // Mark we've seen this page component.
  components[component] = component
}
