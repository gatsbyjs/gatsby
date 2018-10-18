const nodePath = require(`path`)
const { store } = require(`../redux`)

const staticFolderName = `static`
const dataFolderName = `d`

const getAssetPath = path => {
  return {
    forData: forData(path),
    asOutputPath: asOutputPath(path),
    asRoute: asRoute(path),
  }
}

const asOutputPath = path => {
  const { assetPath } = store.getState().config
  return () => nodePath.join(assetPath, staticFolderName, path)
}

const asRoute = path => {
  const { assetPath, pathPrefix } = store.getState().config
  return () => nodePath.join(assetPath || pathPrefix || `/`, staticFolderName,  path)
}

const forData = path => () => {
  return {
    asOutputPath: asOutputPath(nodePath.join(dataFolderName, path)),
    asRoute: asRoute(nodePath.join(dataFolderName, path)),
  }
}

module.exports = getAssetPath
