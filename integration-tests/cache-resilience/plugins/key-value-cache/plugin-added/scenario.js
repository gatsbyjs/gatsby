const PLUGIN_NAME = `key-value-cache/plugin-added/gatsby-cache`
const plugins = [PLUGIN_NAME]

const config = [
  {
    runs: [2],
    plugins,
  },
]

const persistedKeyValueStoreTest = ({
  postBuildStateFromFirstRun,
  preBootstrapStateFromSecondRun,
  postBuildStateFromSecondRun,
}) => {
  // cache was not existing after first run
  expect(postBuildStateFromFirstRun[PLUGIN_NAME].length).toEqual(0)

  // cache was cleared during cache invalidation
  expect(preBootstrapStateFromSecondRun[PLUGIN_NAME].length).toEqual(0)

  // cache was created after second run
  expect(postBuildStateFromSecondRun[PLUGIN_NAME].length).toEqual(1)
}

module.exports = {
  config,
  plugins,
  persistedKeyValueStoreTest,
}
