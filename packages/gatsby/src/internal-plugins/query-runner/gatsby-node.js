const { watchComponent } = require(`./query-watcher`)

let components = {}

const handlePageOrLayout = store => pageOrLayout => {
  const component = store.getState().components[pageOrLayout.componentPath]

  if (components[component.componentPath]) {
    return
  }

  // Watch the component to detect query changes.
  watchComponent(component.componentPath)
}

exports.onCreatePage = ({ page, store }) => {
  handlePageOrLayout(store)(page)
}

exports.onCreateLayout = ({ layout, store }) => {
  handlePageOrLayout(store)(layout)
}
