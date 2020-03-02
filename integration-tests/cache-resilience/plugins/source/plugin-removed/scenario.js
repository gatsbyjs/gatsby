const SOURCE_PLUGIN_NAME = `source/plugin-removed/gatsby-source`
const plugins = [SOURCE_PLUGIN_NAME]

const config = [
  {
    runs: [1],
    plugins,
  },
]

const nodesTest = ({
  postBuildStateFromFirstRun,
  preBootstrapStateFromSecondRun,
  postBuildStateFromSecondRun,
  compareState,
}) => {
  // node created by removed plugin is no longer in nodes store
  // after cache invalidation
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      preBootstrapStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([`DELETION_NODE_1`])
    expect(diff.deletions.DELETION_NODE_1).toBeTruthy()
  }

  // node created by removed plugin is no longer in nodes store
  // after second data sourcing
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([`DELETION_NODE_1`])
    expect(diff.deletions.DELETION_NODE_1).toBeTruthy()
  }
}

module.exports = {
  config,
  plugins,
  nodesTest,
}
