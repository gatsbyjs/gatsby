/* eslint-disable one-var */
/* eslint-disable no-debugger */
/* eslint-disable no-unused-vars */
let preBootstrapStateFromFirstRun, postBuildStateFromFirstRun

{
  const inspector = require(`inspector`)

  const {
    ON_PRE_BOOTSTRAP_FILE_PATH,
    ON_POST_BUILD_FILE_PATH,
  } = require(`./constants`)
  const { loadState } = require(`./load-state`)

  preBootstrapStateFromFirstRun = loadState(ON_PRE_BOOTSTRAP_FILE_PATH)
  postBuildStateFromFirstRun = loadState(ON_POST_BUILD_FILE_PATH)
  inspector.open(9229, `localhost`, true)
}

debugger
