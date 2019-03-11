/* @flow */

const fs = require(`fs-extra`)

const apiRunnerNode = require(`../../utils/api-runner-node`)

exports.onPreBootstrap = async ({ cache, store }) => {
  const { browserslist } = store.getState().program

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

  const babelState = JSON.stringify(
    {
      ...store.getState().babelrc,
      browserslist,
    },
    null,
    2
  )

  await fs.writeFile(cache.rootPath(`babelState.json`), babelState)
}
