const SOURCE_PLUGIN_NAME = `source-and-transformers-child-nodes/transformer-added/gatsby-source`
const TRANSFORMER_PLUGIN_NAME = `source-and-transformers-child-nodes/transformer-added/gatsby-transformer`
const plugins = [SOURCE_PLUGIN_NAME, TRANSFORMER_PLUGIN_NAME]

// Only source plugin in first run. Both plugins in second run
const config = [
  {
    runs: [1],
    plugins: [SOURCE_PLUGIN_NAME],
  },
  {
    runs: [2],
    plugins,
  },
]

const nodesTest = ({
  postBuildStateFromFirstRun,
  preBootstrapStateFromSecondRun,
  postBuildStateFromSecondRun,
  compareState,
}) => {
  if (process.env.GATSBY_EXPERIMENTAL_SELECTIVE_CACHE_INVALIDATION) {
    const diff = compareState(
      postBuildStateFromFirstRun,
      preBootstrapStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([])
  }

  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )

    expect(diff.dirtyIds).toEqual([
      `parent_childAdditionForTransformer`,
      `parent_childAdditionForTransformer >>> Child`,
    ])

    expect(
      diff.additions[`parent_childAdditionForTransformer >>> Child`]
    ).toBeTruthy()

    expect(diff.changes[`parent_childAdditionForTransformer`].diff)
      .toMatchInlineSnapshot(`
      "  Object {
      -   \\"children\\": Array [],
      +   \\"children\\": Array [
      +     \\"parent_childAdditionForTransformer >>> Child\\",
      +   ],
          \\"foo\\": \\"run-1\\",
          \\"id\\": \\"parent_childAdditionForTransformer\\",
          \\"internal\\": Object {
            \\"contentDigest\\": \\"f85e860f002547e9da9e893e3e44e162\\",
            \\"owner\\": \\"source-and-transformers-child-nodes/transformer-added/gatsby-source\\",
            \\"type\\": \\"Parent_ChildAdditionForTransformer\\",
          },
          \\"parent\\": null,
        }"
    `)
  }
}

module.exports = {
  config,
  plugins,
  nodesTest,
}
