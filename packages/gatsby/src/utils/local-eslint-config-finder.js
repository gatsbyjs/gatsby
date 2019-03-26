const path = require(`path`)
const glob = require(`glob`)
const debug = require(`debug`)(`gatsby:webpack-eslint-config`)
const { store } = require(`../redux`)
const { actions } = require(`../redux/actions`)

const { dispatch } = store
const { log } = actions

module.exports = directory => {
  try {
    debug(`Attempting to load package.json for eslint config check`)

    const pkg = require(path.resolve(directory, `package.json`))
    if (pkg.eslintConfig) {
      return true
    }
  } catch (err) {
    const message =
      `There was a problem processing the package.json file.\n` + err
    dispatch(log({ message, type: `error` }))
  }

  debug(`Checking for eslint config file`)
  const eslintFiles = glob.sync(`.eslintrc?(.js|.json|.yaml|.yml)`, {
    cwd: directory,
  })

  if (eslintFiles.length) {
    return true
  }

  return false
}
