/* @flow */

const fs = require(`fs-extra`)
const path = require(`path`)
const json5 = require(`json5`)
const report = require(`gatsby-cli/lib/reporter`)
const { actionifyBabelrc, addDefaultPluginsPresets } = require(`./utils`)
const existsSync = require(`fs-exists-cached`).sync

const apiRunnerNode = require(`../../utils/api-runner-node`)
const testRequireError = require(`../../utils/test-require-error`).default
const { withBasePath } = require(`../../utils/path`)

/**
 * Creates a normalized Babel config to use with babel-loader. Loads a local
 * babelrc config if one exists or sets a backup default.
 */
exports.onCreateBabelConfig = ({ stage, store, actions }) => {
  const program = store.getState().program
  const { directory } = program

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
