const { build } = require(`../..`)
const { store } = require(`../../../redux`)
const { actions } = require(`../../../redux/actions`)

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

const nodes = [
  {
    id: `parent`,
    nested: {
      union___NODE: [`union1`, `union2`],
    },
    internal: {
      type: `Parent`,
      contentDigest: `a`,
    },
  },
  {
    id: `union1`,
    foo: `bar`,
    internal: {
      type: `Union1`,
      contentDigest: `bar`,
    },
  },
  {
    id: `union2`,
    foo: `baz`,
    internal: {
      type: `Union2`,
      contentDigest: `baz`,
    },
  },
]

describe(`Filter input`, () => {
  beforeEach(async () => {
    store.dispatch({ type: `DELETE_CACHE` })
    nodes.forEach(node =>
      actions.createNode({ ...node }, { name: `test` })(store.dispatch)
    )
  })

  // FIXME: this test breaks because of https://github.com/gatsbyjs/gatsby/pull/29090/commits/126b7ec1ee168fefc6884b1dfaad96c12272f302
  //  Need to figure out good approach for the fallback type for unions to make it work again :/
  it.skip(`removes empty input filter fields`, async () => {
    // This can happen when a type has only one GraphQLUnion type field,
    // which will be skipped by `toInputObjectType`
    const schema = await buildSchema()
    const parentFilterInput = schema.getType(`ParentFilterInput`)
    const fields = parentFilterInput.getFields()
    expect(fields.id).toBeDefined()
    expect(fields.nested).toBeUndefined()
  })
})

const buildSchema = async () => {
  await build({})
  return store.getState().schema
}
