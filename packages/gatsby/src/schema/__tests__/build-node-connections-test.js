const { graphql, GraphQLObjectType, GraphQLSchema } = require(`graphql`)
const _ = require(`lodash`)
const createPageDependency = require(`../../redux/actions/add-page-dependency`)
jest.mock(`../../redux/actions/add-page-dependency`)
const nodeTypes = require(`../build-node-types`)
const nodeConnections = require(`../build-node-connections`)
require(`../../db/__tests__/fixtures/ensure-loki`)()

describe(`build-node-connections`, () => {
  let schema, store, types, connections

  async function runQuery(query) {
    let context = { path: `foo` }
    let { data, errors } = await graphql(schema, query, context, context)
    expect(errors).not.toBeDefined()
    return data
  }

  beforeEach(async () => {
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
      },
      {
        id: `c2`,
        internal: { type: `Child` },
        hair: `blonde`,
        children: [],
        parent: `p1`,
      },
    ].forEach(n => store.dispatch({ type: `CREATE_NODE`, payload: n }))

    types = await nodeTypes.buildAll({})
    connections = await nodeConnections.buildAll(_.values(types))

    schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: `RootQueryType`,
        fields: { ...connections, ..._.mapValues(types, `node`) },
      }),
    })
  })

  it(`should build connections`, () => {
    expect(Object.keys(connections)).toHaveLength(3)
  })

  it(`should result in a valid queryable schema`, async () => {
    let { allParent, allChild, allRelative } = await runQuery(
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
    let { allParent } = await runQuery(
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
    let { allParent } = await runQuery(
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
    let { allParent } = await runQuery(
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

    expect(allParent.edges[0].node.childRelative).toBeDefined()
    expect(allParent.edges[0].node.childRelative.id).toEqual(`r1`)
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
