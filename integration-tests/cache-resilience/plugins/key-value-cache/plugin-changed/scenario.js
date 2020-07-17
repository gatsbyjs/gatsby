const PLUGIN_NAME = `key-value-cache/plugin-changed/gatsby-cache`
const plugins = [PLUGIN_NAME]

const config = [
  {
    runs: [1, 2],
    plugins,
  },
]

const persistedKeyValueStoreTest = ({
  postBuildStateFromFirstRun,
  preBootstrapStateFromSecondRun,
  postBuildStateFromSecondRun,
}) => {
  // cache was existing after first run
  expect(postBuildStateFromFirstRun[PLUGIN_NAME].length).toEqual(1)

  // cache was cleared during cache invalidation
  expect(preBootstrapStateFromSecondRun[PLUGIN_NAME].length).toEqual(0)

  // cache was re-created after second run
  expect(postBuildStateFromSecondRun[PLUGIN_NAME].length).toEqual(1)

  // cache is not the same in first and second run
  expect(postBuildStateFromFirstRun[PLUGIN_NAME]).not.toEqual(
    postBuildStateFromSecondRun[PLUGIN_NAME]
  )
}

module.exports = {
  config,
  plugins,
  persistedKeyValueStoreTest,
}
