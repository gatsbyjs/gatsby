const { graphql, GraphQLObjectType, GraphQLSchema } = require(`graphql`)
const _ = require(`lodash`)
const buildNodeTypes = require(`../build-node-types`)

describe(`build-node-types`, () => {
  let schema, store, types

  async function runQuery(query) {
    let context = { path: `foo` }
    let { data, errors } = await graphql(schema, query, context, context)
    expect(errors).not.toBeDefined()
    return data
  }

  beforeEach(async () => {
    ;({ store } = require(`../../redux`))
    ;[
      { id: `p1`, type: `Parent`, hair: `red`, children: [`c1`, `c2`, `r1`] },
      { id: `r1`, type: `Relative`, hair: `black`, children: [], parent: `p1` },
      { id: `c1`, type: `Child`, hair: `brown`, children: [], parent: `p1` },
      { id: `c2`, type: `Child`, hair: `blonde`, children: [], parent: `p1` },
    ].forEach(n => store.dispatch({ type: `CREATE_NODE`, payload: n }))

    types = await buildNodeTypes()
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
})
