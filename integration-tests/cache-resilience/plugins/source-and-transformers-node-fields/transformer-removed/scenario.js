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

    if (process.env.GATSBY_EXPERIMENTAL_SELECTIVE_CACHE_INVALIDATION) {
      expect(
        diff.changes[`parent_childDeletionForFields`].newValue.fields
      ).toEqual({})
    } else {
      expect(
        diff.changes[`parent_childDeletionForFields`].newValue.fields
      ).toBeUndefined()
    }
  }
}

const graphql = require(`lodash/head`)

const queriesFixtures = [
  {
    runs: [1],
    type: `data`,
    query: graphql`
      {
        allParentChildDeletionForFields {
          nodes {
            id
            foo
            fields {
              foo
            }
          }
        }
      }
    `,
  },
  {
    runs: [2],
    type: `data`,
    query: graphql`
      {
        allParentChildDeletionForFields {
          nodes {
            id
            foo
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
        typeinfoParent: __type(name: "Parent_ChildDeletionForFields") {
          fields {
            name
          }
        }

        typeinfoChild: __type(name: "Parent_ChildDeletionForFieldsFields") {
          fields {
            name
          }
        }
      }
    `,
  },
]

const queriesTest = ({ typesDiff, dataDiff }) => {
  // fields and fields type are removed
  expect(typesDiff).toMatchInlineSnapshot(`
    "  Object {
    -   \\"typeinfoChild\\": Object {
    -     \\"fields\\": Array [
    -       Object {
    -         \\"name\\": \\"foo\\",
    -       },
    -     ],
    -   },
    +   \\"typeinfoChild\\": null,
        \\"typeinfoParent\\": Object {
          \\"fields\\": Array [
            Object {
              \\"name\\": \\"children\\",
    -       },
    -       Object {
    -         \\"name\\": \\"fields\\",
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

  // fields are removed
  expect(dataDiff).toMatchInlineSnapshot(`
    "  Object {
        \\"allParentChildDeletionForFields\\": Object {
          \\"nodes\\": Array [
            Object {
    -         \\"fields\\": Object {
    -           \\"foo\\": \\"bar\\",
    -         },
              \\"foo\\": \\"bar\\",
              \\"id\\": \\"parent_childDeletionForFields\\",
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
