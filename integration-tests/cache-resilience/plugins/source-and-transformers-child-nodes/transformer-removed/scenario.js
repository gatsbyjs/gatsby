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
            \\"contentDigest\\": \\"6140f27e9454bda710ae6da2cda698f0\\",
            \\"owner\\": \\"source-and-transformers-child-nodes/transformer-removed/gatsby-source\\",
            \\"type\\": \\"Parent_ChildDeletionForTransformer\\",
          },
          \\"parent\\": null,
        }"
    `)
  }
}

const graphql = require(`lodash/head`)

const queriesFixtures = [
  {
    runs: [1, 2],
    type: `data`,
    query: graphql`
      {
        allParentChildDeletionForTransformer {
          nodes {
            id
            foo
            children {
              __typename
              id
            }
          }
        }
      }
    `,
  },
  {
    runs: [1, 2],
    type: `types`,
    query: graphql`
      {
        typeinfoParent: __type(name: "Parent_ChildDeletionForTransformer") {
          fields {
            name
          }
        }

        typeinfoChild: __type(
          name: "ChildOfParent_ChildDeletionForTransformer"
        ) {
          fields {
            name
          }
        }
      }
    `,
  },
]

const queriesTest = ({ typesDiff, dataDiff }) => {
  // type of transformer is removed
  expect(typesDiff).toMatchInlineSnapshot(`
    "  Object {
    -   \\"typeinfoChild\\": Object {
    -     \\"fields\\": Array [
    -       Object {
    -         \\"name\\": \\"children\\",
    -       },
    -       Object {
    -         \\"name\\": \\"foo\\",
    -       },
    -       Object {
    -         \\"name\\": \\"id\\",
    -       },
    -       Object {
    -         \\"name\\": \\"internal\\",
    -       },
    -       Object {
    -         \\"name\\": \\"parent\\",
    -       },
    -     ],
    -   },
    +   \\"typeinfoChild\\": null,
        \\"typeinfoParent\\": Object {
          \\"fields\\": Array [
    -       Object {
    -         \\"name\\": \\"childChildOfParentChildDeletionForTransformer\\",
    -       },
            Object {
              \\"name\\": \\"children\\",
    -       },
    -       Object {
    -         \\"name\\": \\"childrenChildOfParentChildDeletionForTransformer\\",
            },
            Object {
              \\"name\\": \\"foo\\",
            },
            Object {
              \\"name\\": \\"id\\",
            },
            Object {
              \\"name\\": \\"internal\\",
            },
            Object {
              \\"name\\": \\"parent\\",
            },
          ],
        },
      }"
  `)

  // child is removed
  expect(dataDiff).toMatchInlineSnapshot(`
    "  Object {
        \\"allParentChildDeletionForTransformer\\": Object {
          \\"nodes\\": Array [
            Object {
    -         \\"children\\": Array [
    -           Object {
    -             \\"__typename\\": \\"ChildOfParent_ChildDeletionForTransformer\\",
    -             \\"id\\": \\"parent_childDeletionForTransformer >>> Child\\",
    -           },
    -         ],
    +         \\"children\\": Array [],
              \\"foo\\": \\"run-1\\",
              \\"id\\": \\"parent_childDeletionForTransformer\\",
            },
          ],
        },
      }"
  `)
}

module.exports = {
  config,
  queriesFixtures,
  queriesTest,
  plugins,
  nodesTest,
}
