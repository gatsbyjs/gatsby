const { build } = require(`../..`)
const { store } = require(`../../../redux`)
const { actions } = require(`../../../redux/actions`)
require(`../../../db/__tests__/fixtures/ensure-loki`)()

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

  it(`removes empty input filter fields`, async () => {
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
