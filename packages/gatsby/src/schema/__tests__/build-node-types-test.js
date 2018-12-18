const {
  graphql,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} = require(`graphql`)
const _ = require(`lodash`)
require(`../../db/__tests__/fixtures/ensure-loki`)()

jest.mock(`../../utils/api-runner-node`)
const apiRunnerNode = require(`../../utils/api-runner-node`)

const createPageDependency = require(`../../redux/actions/add-page-dependency`)
jest.mock(`../../redux/actions/add-page-dependency`)
const nodeTypes = require(`../build-node-types`)

const { typeConflictReporter } = require(`../type-conflict-reporter`)
const addConflictSpy = jest.spyOn(typeConflictReporter, `addConflict`)

describe(`build-node-types`, () => {
  let schema, store, types

  async function runQuery(query) {
    let context = { path: `foo` }
    let { data, errors } = await graphql(schema, query, context, context)
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
          resolve: parent => `pluginFieldValue`,
        },
      },
    ]
    apiRunnerNode.mockImplementation(() => apiRunnerResponse)
    ;({ store } = require(`../../redux`))
    store.dispatch({ type: `DELETE_CACHE` })
    ;[
      {
        id: `p1`,
        internal: { type: `Parent` },
        hair: `red`,
        children: [`c1`, `c2`, `r1`],
      },
      {
        id: `r1`,
        internal: { type: `Relative` },
        hair: `black`,
        children: [],
        parent: `p1`,
      },
      {
        id: `c1`,
        internal: { type: `Child` },
        hair: `brown`,
        children: [],
        parent: `p1`,
        pluginField: `string`,
      },
      {
        id: `c2`,
        internal: { type: `Child` },
        hair: `blonde`,
        children: [],
        parent: `p1`,
        pluginField: 5,
      },
    ].forEach(n => store.dispatch({ type: `CREATE_NODE`, payload: n }))

    types = await nodeTypes.buildAll({})
    schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: `RootQueryType`,
        fields: _.mapValues(types, `node`),
      }),
    })
  })

  it(`should build types`, () => {
    expect(Object.keys(types)).toHaveLength(3)
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
