const fs = require(`fs`)
const path = require(`path`)
const { watchComponent } = require(`./query-watcher`)

let components = {}

const handlePageOrLayout = store => pageOrLayout => {
  // - Ensure page/layout component has a JSON file.
  const jsonDest = path.join(
    store.getState().program.directory,
    `.cache`,
    `json`,
    pageOrLayout.jsonName
  )
  if (!fs.existsSync(jsonDest)) {
    fs.writeFile(jsonDest, `{}`, () => {})
  }

  // - Ensure layout component has a wrapper entry component file (which
  // requires its JSON file so the data + code are one bundle).
  if (pageOrLayout.isLayout) {
    const wrapperComponent = `
  import React from "react"
  import Component from "${pageOrLayout.component}"
  import data from "${jsonDest}"

  export default (props) => <Component {...props} {...data} />
  `
    fs.writeFileSync(pageOrLayout.componentWrapperPath, wrapperComponent)
  }

  const component = store.getState().components[pageOrLayout.componentPath]

  if (components[component.componentPath]) {
    return
  }

  // - Watch the component to detect query changes.
  watchComponent(component.componentPath)
}

exports.onCreatePage = ({ page, store, boundActionCreators }) => {
  handlePageOrLayout(store)(page)
}

exports.onCreateLayout = ({ layout, store, boundActionCreators }) => {
  handlePageOrLayout(store)(layout)
}
