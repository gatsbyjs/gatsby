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

  // Addition of a transformer plugin results in the new child Node and a changed parent Node
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
            \\"contentDigest\\": \\"f99c0539a6bb6061b072fe782a8e441f\\",
            \\"owner\\": \\"source-and-transformers-child-nodes/transformer-added/gatsby-source\\",
            \\"type\\": \\"Parent_ChildAdditionForTransformer\\",
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
        allParentChildAdditionForTransformer {
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
        typeinfoParent: __type(name: "Parent_ChildAdditionForTransformer") {
          fields {
            name
          }
        }

        typeinfoChild: __type(
          name: "ChildOfParent_ChildAdditionForTransformer"
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
  // type of transformer is added
  expect(typesDiff).toMatchInlineSnapshot(`
    "  Object {
    -   \\"typeinfoChild\\": null,
    +   \\"typeinfoChild\\": Object {
    +     \\"fields\\": Array [
    +       Object {
    +         \\"name\\": \\"children\\",
    +       },
    +       Object {
    +         \\"name\\": \\"foo\\",
    +       },
    +       Object {
    +         \\"name\\": \\"id\\",
    +       },
    +       Object {
    +         \\"name\\": \\"internal\\",
    +       },
    +       Object {
    +         \\"name\\": \\"parent\\",
    +       },
    +     ],
    +   },
        \\"typeinfoParent\\": Object {
          \\"fields\\": Array [
    +       Object {
    +         \\"name\\": \\"childChildOfParentChildAdditionForTransformer\\",
    +       },
            Object {
              \\"name\\": \\"children\\",
    +       },
    +       Object {
    +         \\"name\\": \\"childrenChildOfParentChildAdditionForTransformer\\",
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

  // child is added
  expect(dataDiff).toMatchInlineSnapshot(`
    "  Object {
        \\"allParentChildAdditionForTransformer\\": Object {
          \\"nodes\\": Array [
            Object {
    -         \\"children\\": Array [],
    +         \\"children\\": Array [
    +           Object {
    +             \\"__typename\\": \\"ChildOfParent_ChildAdditionForTransformer\\",
    +             \\"id\\": \\"parent_childAdditionForTransformer >>> Child\\",
    +           },
    +         ],
              \\"foo\\": \\"run-1\\",
              \\"id\\": \\"parent_childAdditionForTransformer\\",
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
