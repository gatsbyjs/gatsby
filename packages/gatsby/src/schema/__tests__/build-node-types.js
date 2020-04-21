const { graphql, GraphQLString } = require(`graphql`)
require(`../../db/__tests__/fixtures/ensure-loki`)()

const { createSchemaComposer } = require(`../schema-composer`)
const { buildSchema } = require(`../schema`)
const { LocalNodeModel } = require(`../node-model`)
const nodeStore = require(`../../db/nodes`)
const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)

jest.mock(`../../utils/api-runner-node`)
const apiRunnerNode = require(`../../utils/api-runner-node`)

jest.mock(`../../redux/actions/add-page-dependency`)
import { createPageDependency } from "../../redux/actions/add-page-dependency"

const { TypeConflictReporter } = require(`../infer/type-conflict-reporter`)
const typeConflictReporter = new TypeConflictReporter()
const addConflictSpy = jest.spyOn(typeConflictReporter, `addConflict`)

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
    pluginField: `string`,
  },
  {
    id: `c2`,
    internal: { type: `Child`, contentDigest: `0` },
    hair: `blonde`,
    children: [],
    parent: `p1`,
    pluginField: 5,
  },
]

describe(`build-node-types`, () => {
  async function runQuery(query, nodes = makeNodes()) {
    store.dispatch({ type: `DELETE_CACHE` })
    store.dispatch({ type: `START_INCREMENTAL_INFERENCE` })
    nodes.forEach(node =>
      actions.createNode(node, { name: `test` })(store.dispatch)
    )

    const schemaComposer = createSchemaComposer()
    const schema = await buildSchema({
      schemaComposer,
      nodeStore,
      types: [],
      typeConflictReporter,
      thirdPartySchemas: [],
      inferenceMetadata: store.getState().inferenceMetadata,
    })
    store.dispatch({ type: `SET_SCHEMA`, payload: schema })

    let context = { path: `foo` }
    let { data, errors } = await graphql(schema, query, undefined, {
      ...context,
      nodeModel: new LocalNodeModel({
        schemaComposer,
        schema,
        nodeStore,
        createPageDependency,
      }),
    })
    expect(errors).not.toBeDefined()
    return data
  }

  beforeEach(async () => {
    createPageDependency.mockClear()
    addConflictSpy.mockClear()
    const apiRunnerResponse = [
      {
        pluginField: {
          type: GraphQLString,
          description: `test description`,
          resolve: () => `pluginFieldValue`,
        },
      },
    ]
    apiRunnerNode.mockImplementation(() => apiRunnerResponse)
  })

  it(`should result in a valid queryable schema`, async () => {
    let { parent, child, relative } = await runQuery(
      `
      {
        parent(id: { eq: "p1" }) {
          hair
        }
        child(id: { eq: "c1" }) {
          hair
        }
        relative(id: { eq: "r1" }) {
          hair
        }
      }
    `
    )
    expect(parent.hair).toEqual(`red`)
    expect(child.hair).toEqual(`brown`)
    expect(relative.hair).toEqual(`black`)
  })

  it(`should link children automatically`, async () => {
    let { parent } = await runQuery(
      `
      {
        parent(id: { eq: "p1" }) {
          children {
            id
          }
        }
      }
    `
    )
    expect(parent.children).toBeDefined()
    expect(parent.children.map(c => c.id)).toEqual([`c1`, `c2`, `r1`])
  })

  it(`should create typed children fields`, async () => {
    let { parent } = await runQuery(
      `
      {
        parent(id: { eq: "p1" }) {
          childrenChild { # lol
            id
          }
        }
      }
    `
    )
    expect(parent.childrenChild).toBeDefined()
    expect(parent.childrenChild.map(c => c.id)).toEqual([`c1`, `c2`])
  })

  it(`should create typed child field for singular children`, async () => {
    let { parent } = await runQuery(
      `
      {
        parent(id: { eq: "p1" }) {
          childRelative { # lol
            id
          }
        }
      }
    `
    )

    expect(parent.childRelative).toBeDefined()
    expect(parent.childRelative.id).toEqual(`r1`)
  })

  it(`should handle plugin fields`, async () => {
    const result = await runQuery(
      `
      {
        parent(id: { eq: "p1" }) {
          pluginField
        }
      }
    `
    )
    expect(result.parent.pluginField).toEqual(`pluginFieldValue`)
  })

  it(`should allow filtering on plugin fields`, async () => {
    const result = await runQuery(
      `
      {
        parent(pluginField: { eq: "pluginFieldValue"}) {
          pluginField
        }
      }
    `
    )
    expect(result.parent.pluginField).toEqual(`pluginFieldValue`)
  })

  it(`should create root query type page dependency`, async () => {
    await runQuery(` { parent(id: { eq: "p1" }) { id } } `)

    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      nodeId: `p1`,
    })
  })

  it(`should create children page dependency`, async () => {
    await runQuery(
      `
        {
          parent {
            children { id }
          }
        }
      `
    )
    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      nodeId: `c1`,
    })
    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      nodeId: `c2`,
    })
    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      nodeId: `r1`,
    })
  })

  it(`should create parent page dependency`, async () => {
    await runQuery(
      `
        {
          child(id: { eq: "c1" }) {
            parent { id }
          }
        }
      `
    )
    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      nodeId: `p1`,
    })
  })

  it(`should create childX page dependency`, async () => {
    await runQuery(
      `
      {
        parent(id: { eq: "p1" }) {
          childRelative { # lol
            id
          }
        }
      }
    `
    )

    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      nodeId: `r1`,
    })
  })

  it(`should create childrenX page dependency`, async () => {
    await runQuery(
      `
      {
        parent(id: { eq: "p1" }) {
          childrenChild { # lol
            id
          }
        }
      }
    `
    )

    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      nodeId: `c1`,
    })
    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      nodeId: `c2`,
    })
  })

  it(`should not report conflicts on plugin fields`, () => {
    expect(typeConflictReporter.addConflict).not.toBeCalled()
  })
})
