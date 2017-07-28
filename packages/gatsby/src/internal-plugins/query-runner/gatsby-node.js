const fs = require(`fs`)
const path = require(`path`)
const { watchComponent } = require(`./query-watcher`)

let components = {}

const handlePageOrLayout = store => pageOrLayout => {
  // - ensure corresponding page or layout has json files.
  // - get corresponding component
  // - watch component
  // - mark component
  const writeJsonFile = ({ jsonName }) => {
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

  writeJsonFile(pageOrLayout)

  const component = store.getState().components[pageOrLayout.componentPath]

  if (components[component.componentPath]) {
    return
  }

  watchComponent(component.componentPath)
  components[component.componentPath] = component.componentPath
}

exports.onCreatePage = ({ page, store, boundActionCreators }) => {
  handlePageOrLayout(store)(page)
}

exports.onCreateLayout = ({ layout, store, boundActionCreators }) => {
  handlePageOrLayout(store)(layout)
}
