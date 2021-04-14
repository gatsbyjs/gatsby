const PLUGIN_NAME = `key-value-cache/plugin-removed/gatsby-cache`
const plugins = [PLUGIN_NAME]

const config = [
  {
    runs: [1],
    plugins,
  },
]

const persistedKeyValueStoreTest = ({
  postBuildStateFromFirstRun,
  preBootstrapStateFromSecondRun,
  postBuildStateFromSecondRun,
}) => {
  // plugin had something in disk cache after first run
  expect(postBuildStateFromFirstRun[PLUGIN_NAME].length).toEqual(1)

  // cache was cleared during cache invalidation
  expect(preBootstrapStateFromSecondRun[PLUGIN_NAME].length).toEqual(0)

  // cache is not recreated after second run
  expect(postBuildStateFromSecondRun[PLUGIN_NAME].length).toEqual(0)
}

module.exports = {
  config,
  plugins,
  persistedKeyValueStoreTest,
}
