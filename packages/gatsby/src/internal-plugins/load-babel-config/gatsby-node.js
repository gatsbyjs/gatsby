/* @flow */

const fs = require(`fs-extra`)

const apiRunnerNode = require(`../../utils/api-runner-node`)
import { withBasePath } from "../../utils/path"

exports.onPreBootstrap = async ({ store, parentSpan }) => {
  const { directory, browserslist } = store.getState().program
  const directoryPath = withBasePath(directory)

  await apiRunnerNode(`onCreateBabelConfig`, {
    stage: `develop`,
    parentSpan,
  })
  await apiRunnerNode(`onCreateBabelConfig`, {
    stage: `develop-html`,
    parentSpan,
  })
  await apiRunnerNode(`onCreateBabelConfig`, {
    stage: `build-javascript`,
    parentSpan,
  })
  await apiRunnerNode(`onCreateBabelConfig`, {
    stage: `build-html`,
    parentSpan,
  })

  const babelState = JSON.stringify(
    {
      ...store.getState().babelrc,
      browserslist,
    },
    null,
    2
  )

  await fs.writeFile(directoryPath(`.cache/babelState.json`), babelState)
}
