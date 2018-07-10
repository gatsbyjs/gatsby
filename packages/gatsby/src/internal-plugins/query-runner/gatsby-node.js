const { watchComponent } = require(`./query-watcher`)

let components = {}

exports.onCreatePage = ({ page, store }) => {
  // In development, watch the component to detect query changes.
  if (process.env.NODE_ENV !== `production`) {
    const component = store.getState().components.get(page.componentPath)

    if (!component) {
      process.exit()
    }

    if (components[component.componentPath]) {
      return
    }

    watchComponent(component.componentPath)
  }
}
