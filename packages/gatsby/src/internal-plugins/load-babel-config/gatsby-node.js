/* @flow */

const fs = require(`fs-extra`)

const apiRunnerNode = require(`../../utils/api-runner-node`)
const { withBasePath } = require(`../../utils/path`)

exports.onPreBootstrap = async ({ store }) => {
  const { directory, browserslist } = store.getState().program
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
  babelrcState.browserslist = browserslist
  const babelState = JSON.stringify(babelrcState.stages, null, 4)
  await fs.writeFile(directoryPath(`.cache/babelState.json`), babelState)
}
