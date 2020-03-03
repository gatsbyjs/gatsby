const _ = require(`lodash`)

const SOURCE_PLUGIN_NAME = `source-and-transformers-node-fields/transformer-removed/gatsby-source`
const TRANSFORMER_PLUGIN_NAME = `source-and-transformers-node-fields/transformer-removed/gatsby-transformer`
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

    // source node was changed
    expect(diff.dirtyIds).toEqual([`parent_childDeletionForFields`])

    // just fields were invalidated
    expect(
      diff.changes[`parent_childDeletionForFields`].oldValue
    ).toHaveProperty(`fields`, { foo: `bar` })
    expect(
      diff.changes[`parent_childDeletionForFields`].newValue
    ).toHaveProperty(`fields`, {})
    expect(diff.changes[`parent_childDeletionForFields`].diff)
      .toMatchInlineSnapshot(`
      "  Object {
          \\"children\\": Array [],
      -   \\"fields\\": Object {
      -     \\"foo\\": \\"bar\\",
      -   },
      +   \\"fields\\": Object {},
          \\"foo\\": \\"bar\\",
          \\"id\\": \\"parent_childDeletionForFields\\",
          \\"internal\\": Object {
            \\"contentDigest\\": \\"2cc1ab4c3453055e4ee10c4105fba64c\\",
      -     \\"fieldOwners\\": Object {
      -       \\"foo\\": \\"source-and-transformers-node-fields/transformer-removed/gatsby-transformer\\",
      -     },
      +     \\"fieldOwners\\": Object {},
            \\"owner\\": \\"source-and-transformers-node-fields/transformer-removed/gatsby-source\\",
            \\"type\\": \\"Parent_ChildDeletionForFields\\",
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

    // source node was changed
    expect(diff.dirtyIds).toEqual([`parent_childDeletionForFields`])

    // just fields were invalidated
    expect(
      diff.changes[`parent_childDeletionForFields`].oldValue
    ).toHaveProperty(`fields`, { foo: `bar` })

    expect(
      _.isEmpty(diff.changes[`parent_childDeletionForFields`].newValue.fields)
    ).toBe(true)
  }
}

module.exports = {
  config,
  plugins,
  nodesTest,
}
