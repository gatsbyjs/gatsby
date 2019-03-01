const { store } = require(`../../redux`)
const { build } = require(`..`)
require(`../../db/__tests__/fixtures/ensure-loki`)()

const nodes = require(`./fixtures/node-model`)

describe(`Build schema`, () => {
  // let schema

  beforeEach(async () => {
    store.dispatch({ type: `DELETE_CACHE` })
    nodes.forEach(node =>
      store.dispatch({ type: `CREATE_NODE`, payload: node })
    )

    await build({})
    // schema = store.getState().schema
  })

  describe(`createTypes action`, () => {
    it.todo(`allows adding graphql-js types`)

    it.todo(`allows adding type in SDL`)

    it.todo(`allows adding array of types`)

    it.todo(`adds node interface fields`)

    it.todo(`allows adding abstract types in SDL`)

    it.todo(`adds type resolver to abstract types`)

    it.todo(`adds args to field`)

    it.todo(`handles being called multiple times`)
  })

  describe(`createResolvers API`, () => {
    it.todo(`allows adding resolver to field`)

    it.todo(`allows adding args to field`)

    it.todo(`disallows overriding field type on field`)

    it.todo(`allows overriding field type on field on third-party type`)

    it.todo(`allows adding new field`)

    it.todo(`warns if type does not exist`)

    it.todo(`makes original field resolver available on info`)

    it.todo(`handles being called multiple times`)
  })

  describe(`addThirdPartySchemas`, () => {
    it.todo(`makes third-party schema available on root Query type`)

    it.todo(`adds third-party types to schema`)
  })

  describe(`addSetFieldsOnGraphQLNodeTypeFields`, () => {
    it.todo(`allows adding fields`)

    it.todo(`allows adding nested fields`)
  })
})
