const SOURCE_PLUGIN_NAME = `source-and-transformers-child-nodes/source-removed/gatsby-source`
const TRANSFORMER_PLUGIN_NAME = `source-and-transformers-child-nodes/source-removed/gatsby-transformer`
const plugins = [SOURCE_PLUGIN_NAME, TRANSFORMER_PLUGIN_NAME]

// Both plugins in first run. Only transformer plugin in second run.
const config = [
  {
    runs: [1],
    plugins,
  },
  {
    runs: [2],
    plugins: [TRANSFORMER_PLUGIN_NAME],
  },
]

const nodesTest = ({
  postBuildStateFromFirstRun,
  preBootstrapStateFromSecondRun,
  postBuildStateFromSecondRun,
  compareState,
}) => {
  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      preBootstrapStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([
      `parent_parentDeletionForTransformer`,
      `parent_parentDeletionForTransformer >>> Child`,
    ])

    expect(diff.deletions[`parent_parentDeletionForTransformer`]).toBeTruthy()
    expect(
      diff.deletions[`parent_parentDeletionForTransformer >>> Child`]
    ).toBeTruthy()
  }

  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([
      `parent_parentDeletionForTransformer`,
      `parent_parentDeletionForTransformer >>> Child`,
    ])

    expect(diff.deletions[`parent_parentDeletionForTransformer`]).toBeTruthy()
    expect(
      diff.deletions[`parent_parentDeletionForTransformer >>> Child`]
    ).toBeTruthy()
  }
}

module.exports = {
  config,
  plugins,
  nodesTest,
}
