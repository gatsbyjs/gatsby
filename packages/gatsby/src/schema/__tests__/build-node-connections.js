const { graphql } = require(`graphql`)
const { createSchemaComposer } = require(`../schema-composer`)
const { buildSchema } = require(`../schema`)
const { LocalNodeModel } = require(`../node-model`)
const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)

jest.mock(`../../redux/actions/add-page-dependency`)
import { createPageDependency } from "../../redux/actions/add-page-dependency"

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    activityTimer: () => {
      return {
        start: jest.fn(),
        setStatus: jest.fn(),
        end: jest.fn(),
      }
    },
    phantomActivity: () => {
      return {
        start: jest.fn(),
        end: jest.fn(),
      }
    },
  }
})

const makeNodes = () => [
  {
    id: `p1`,
    internal: { type: `Parent`, contentDigest: `0` },
    hair: `red`,
    children: [`c1`, `c2`, `r1`],
  },
  {
    id: `r1`,
    internal: { type: `Relative`, contentDigest: `0` },
    hair: `black`,
    children: [],
    parent: `p1`,
  },
  {
    id: `c1`,
    internal: { type: `Child`, contentDigest: `0` },
    hair: `brown`,
    children: [],
    parent: `p1`,
  },
  {
    id: `c2`,
    internal: { type: `Child`, contentDigest: `0` },
    hair: `blonde`,
    children: [],
    parent: `p1`,
  },
]

describe(`build-node-connections`, () => {
  async function runQuery(query, nodes = makeNodes()) {
    store.dispatch({ type: `DELETE_CACHE` })
    store.dispatch({ type: `START_INCREMENTAL_INFERENCE` })
    nodes.forEach(node =>
      actions.createNode(node, { name: `test` })(store.dispatch)
    )

    const schemaComposer = createSchemaComposer()
    const schema = await buildSchema({
      schemaComposer,
      types: [],
      thirdPartySchemas: [],
      inferenceMetadata: store.getState().inferenceMetadata,
    })
    store.dispatch({ type: `SET_SCHEMA`, payload: schema })

    const context = { path: `foo` }
    const { data, errors } = await graphql({
      schema,
      source: query,
      rootValue: undefined,
      contextValue: {
        ...context,
        nodeModel: new LocalNodeModel({
          schemaComposer,
          schema,
          createPageDependency,
        }),
      },
    })
    expect(errors).not.toBeDefined()
    return data
  }

  afterEach(() => {
    createPageDependency.mockClear()
  })

  it(`should result in a valid queryable schema`, async () => {
    const { allParent, allChild, allRelative } = await runQuery(
      `
      {
        allParent(filter: { id: { eq: "p1" } }) {
          edges {
            node {
              hair
            }
          }
        }
        allChild(filter: { id: { eq: "c1" } }) {
          edges {
            node {
              hair
            }
          }
        }
        allRelative(filter: { id: { eq: "r1" } }) {
          edges {
            node {
              hair
            }
          }
        }
      }
    `
    )
    expect(allParent.edges[0].node.hair).toEqual(`red`)
    expect(allChild.edges[0].node.hair).toEqual(`brown`)
    expect(allRelative.edges[0].node.hair).toEqual(`black`)
  })

  it(`should link children automatically`, async () => {
    const { allParent } = await runQuery(
      `
      {
        allParent(filter: { id: { eq: "p1" } }) {
          edges {
            node {
              children {
                id
              }
            }
          }
        }
      }
    `
    )
    expect(allParent.edges[0].node.children).toBeDefined()
    expect(allParent.edges[0].node.children.map(c => c.id)).toEqual([
      `c1`,
      `c2`,
      `r1`,
    ])
  })

  it(`should create typed children fields`, async () => {
    const { allParent } = await runQuery(
      `
      {
        allParent(filter: { id: { eq: "p1" } }) {
          edges {
            node {
              childrenChild { # lol
                id
              }
            }
          }
        }
      }
    `
    )
    expect(allParent.edges[0].node.childrenChild).toBeDefined()
    expect(allParent.edges[0].node.childrenChild.map(c => c.id)).toEqual([
      `c1`,
      `c2`,
    ])
  })

  it(`should create typed child field for singular children`, async () => {
    const { allParent } = await runQuery(
      `
      {
        allParent(filter: { id: { eq: "p1" } }) {
          edges {
            node {
              childRelative { # lol
                id
              }
              childrenRelative {
                id
              }
            }
          }
        }
      }
    `
    )

    expect(allParent.edges[0].node.childRelative).toBeDefined()
    expect(allParent.edges[0].node.childRelative.id).toEqual(`r1`)

    expect(allParent.edges[0].node.childrenRelative).toBeDefined()
    expect(allParent.edges[0].node.childrenRelative).toEqual([{ id: `r1` }])
  })

  it(`should create page dependency`, async () => {
    await runQuery(
      `
      {
        allParent(filter: { id: { eq: "p1" } }) {
          edges {
            node {
              childRelative { # lol
                id
              }
            }
          }
        }
      }
    `
    )

    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      connection: `Parent`,
    })
  })
})
