/* @flow */

const fs = require(`fs-extra`)
const { addDefaultPluginsPresets } = require(`./utils`)

const apiRunnerNode = require(`../../utils/api-runner-node`)
const { withBasePath } = require(`../../utils/path`)

/**
 * Creates a normalized Babel config to use with babel-loader. Loads a local
 * babelrc config if one exists or sets a backup default.
 */
exports.onCreateBabelConfig = ({ stage, store, actions }) => {
  const program = store.getState().program

  addDefaultPluginsPresets(actions, {
    stage,
    browserslist: program.browserslist,
  })
}

exports.onPreBootstrap = async ({ store }) => {
  const directory = store.getState().program.directory
  const directoryPath = withBasePath(directory)

  await apiRunnerNode(`onCreateBabelConfig`, {
    stage: `develop`,
  })
  await apiRunnerNode(`onCreateBabelConfig`, {
    stage: `develop-html`,
  })
  await apiRunnerNode(`onCreateBabelConfig`, {
    stage: `build-javascript`,
  })
  await apiRunnerNode(`onCreateBabelConfig`, {
    stage: `build-html`,
  })
  const babelrcState = store.getState().babelrc
  const babelState = JSON.stringify(babelrcState.stages, null, 4)
  await fs.writeFile(directoryPath(`.cache/babelState.json`), babelState)
}
