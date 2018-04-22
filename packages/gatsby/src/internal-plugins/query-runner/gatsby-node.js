const { watchComponent } = require(`./query-watcher`)

let components = {}

exports.onCreatePage = ({ page, store }) => {
  const component = store.getState().components[page.componentPath]

  if (components[component.componentPath]) {
    return
  }

  // Watch the component to detect query changes.
  watchComponent(component.componentPath)
}
