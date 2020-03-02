const SOURCE_PLUGIN_NAME = `source-and-transformers-node-fields/transformer-added/gatsby-source`
const TRANSFORMER_PLUGIN_NAME = `source-and-transformers-node-fields/transformer-added/gatsby-transformer`
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

    // there was nothing to invalidate
    expect(diff.dirtyIds).toEqual([])
  }

  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )

    // source node was changed
    expect(diff.dirtyIds).toEqual([`parent_childAdditionForFields`])

    // field and fieldOwner was added to source node
    expect(diff.changes[`parent_childAdditionForFields`].diff)
      .toMatchInlineSnapshot(`
      "  Object {
          \\"children\\": Array [],
      +   \\"fields\\": Object {
      +     \\"foo1\\": \\"bar\\",
      +   },
          \\"foo\\": \\"run-1\\",
          \\"id\\": \\"parent_childAdditionForFields\\",
          \\"internal\\": Object {
            \\"contentDigest\\": \\"bdf44fdce30b104b4f290d66c2dc3ca1\\",
      +     \\"fieldOwners\\": Object {
      +       \\"foo1\\": \\"source-and-transformers-node-fields/transformer-added/gatsby-transformer\\",
      +     },
            \\"owner\\": \\"source-and-transformers-node-fields/transformer-added/gatsby-source\\",
            \\"type\\": \\"Parent_ChildAdditionForFields\\",
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
