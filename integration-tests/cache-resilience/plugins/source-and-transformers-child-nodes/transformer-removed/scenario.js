const SOURCE_PLUGIN_NAME = `source-and-transformers-child-nodes/transformer-removed/gatsby-source`
const TRANSFORMER_PLUGIN_NAME = `source-and-transformers-child-nodes/transformer-removed/gatsby-transformer`
const plugins = [SOURCE_PLUGIN_NAME, TRANSFORMER_PLUGIN_NAME]

// Both plugins in first run. Only source plugin in second run.
const config = [
  {
    runs: [1],
    plugins,
  },
  {
    runs: [2],
    plugins: [SOURCE_PLUGIN_NAME],
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

    // we expect both parent and child node to change
    expect(diff.dirtyIds).toEqual([
      `parent_childDeletionForTransformer`,
      `parent_childDeletionForTransformer >>> Child`,
    ])

    // we expect child node to be removed
    expect(
      diff.deletions[`parent_childDeletionForTransformer >>> Child`]
    ).toBeTruthy()

    // we expect parent node to no longer have child node
    expect(diff.changes[`parent_childDeletionForTransformer`].diff)
      .toMatchInlineSnapshot(`
      "  Object {
      -   \\"children\\": Array [
      -     \\"parent_childDeletionForTransformer >>> Child\\",
      -   ],
      +   \\"children\\": Array [],
          \\"foo\\": \\"run-1\\",
          \\"id\\": \\"parent_childDeletionForTransformer\\",
          \\"internal\\": Object {
            \\"contentDigest\\": \\"872081fdfb66891ee6ccdcd13716a5ce\\",
            \\"owner\\": \\"source-and-transformers-child-nodes/transformer-removed/gatsby-source\\",
            \\"type\\": \\"Parent_ChildDeletionForTransformer\\",
          },
          \\"parent\\": null,
        }"
    `)
  }

  {
    const diff = compareState(
      postBuildStateFromFirstRun,
      postBuildStateFromSecondRun
    )

    // we expect both parent and child node to change
    expect(diff.dirtyIds).toEqual([
      `parent_childDeletionForTransformer`,
      `parent_childDeletionForTransformer >>> Child`,
    ])

    // we expect child node to be removed
    expect(
      diff.deletions[`parent_childDeletionForTransformer >>> Child`]
    ).toBeTruthy()

    // we expect parent node to no longer have child node
    expect(diff.changes[`parent_childDeletionForTransformer`].diff)
      .toMatchInlineSnapshot(`
      "  Object {
      -   \\"children\\": Array [
      -     \\"parent_childDeletionForTransformer >>> Child\\",
      -   ],
      +   \\"children\\": Array [],
          \\"foo\\": \\"run-1\\",
          \\"id\\": \\"parent_childDeletionForTransformer\\",
          \\"internal\\": Object {
            \\"contentDigest\\": \\"872081fdfb66891ee6ccdcd13716a5ce\\",
            \\"owner\\": \\"source-and-transformers-child-nodes/transformer-removed/gatsby-source\\",
            \\"type\\": \\"Parent_ChildDeletionForTransformer\\",
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
