const path = require(`path`)

const { store } = require(`../../redux`)

const getComponentDir = source => {
  const componentPath =
    source.componentPath ||
    // TODO: Easier way?
    store.getState().staticQueryComponents.get(source.path).componentPath
  return componentPath && path.dirname(componentPath)
}

module.exports = getComponentDir
