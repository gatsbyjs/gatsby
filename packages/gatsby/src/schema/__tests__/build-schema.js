const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInterfaceType,
  GraphQLUnionType,
} = require(`graphql`)
const { store } = require(`../../redux`)
const { build } = require(`..`)
require(`../../db/__tests__/fixtures/ensure-loki`)()

const nodes = require(`./fixtures/node-model`)

describe(`Build schema`, () => {
  beforeEach(async () => {
    store.dispatch({ type: `DELETE_CACHE` })
    nodes.forEach(node =>
      store.dispatch({ type: `CREATE_NODE`, payload: node })
    )
  })

  describe(`createTypes`, () => {
    it(`allows adding graphql-js types`, async () => {
      createTypes(
        new GraphQLObjectType({
          name: `Foo`,
          fields: {
            text: {
              type: GraphQLString,
            },
          },
        })
      )
      const schema = await buildSchema()
      const fooType = schema.getType(`Foo`)
      expect(fooType).toBeInstanceOf(GraphQLObjectType)
      const fields = fooType.getFields()
      expect(fields[`text`]).toBeDefined()
      expect(fields[`text`].type).toBe(GraphQLString)
    })

    it(`allows adding type in SDL`, async () => {
      createTypes(`type Foo implements Node { text: String! }`)
      const schema = await buildSchema()
      const fooType = schema.getType(`Foo`)
      expect(fooType).toBeInstanceOf(GraphQLObjectType)
      const fields = fooType.getFields()
      expect(fields[`text`]).toBeDefined()
      expect(fields[`text`].type).toBeInstanceOf(GraphQLNonNull)
      expect(fields[`text`].type.ofType).toBe(GraphQLString)
    })

    it(`allows adding array of types`, async () => {
      createTypes([
        new GraphQLObjectType({
          name: `Foo`,
          fields: {
            text: {
              type: GraphQLString,
            },
          },
        }),
        new GraphQLObjectType({
          name: `Bar`,
          fields: {
            text: {
              type: GraphQLString,
            },
          },
        }),
        `type Baz implements Node { text: String }`,
        `type Author implements Node { text: String }`,
      ])
      const schema = await buildSchema()

      ;[(`Foo`, `Bar`, `Baz`, `Author`)].forEach(typeName => {
        const type = schema.getType(typeName)
        expect(type).toBeInstanceOf(GraphQLObjectType)
        const fields = type.getFields()
        expect(fields[`text`]).toBeDefined()
        expect(fields[`text`].type).toBe(GraphQLString)
      })
    })

    it(`adds node interface fields`, async () => {
      createTypes(`
        type Foo implements Node { text: String! }

        type Bar implements Node {
          id: ID!
          parent: Node
          children: [Node!]!
          internal: Internal!
        }
      `)

      const schema = await buildSchema()
      ;[(`Foo`, `Bar`)].forEach(typeName => {
        const type = schema.getType(typeName)
        expect(type).toBeInstanceOf(GraphQLObjectType)
        expect(type.getInterfaces()).toEqual([schema.getType(`Node`)])
        const fields = type.getFields()
        expect(fields[`id`]).toBeDefined()
        expect(fields[`id`].type.toString()).toEqual(`ID!`)
        expect(fields[`parent`]).toBeDefined()
        expect(fields[`parent`].type.toString()).toEqual(`Node`)
        expect(fields[`children`]).toBeDefined()
        expect(fields[`children`].type.toString()).toEqual(`[Node!]!`)
        expect(fields[`internal`]).toBeDefined()
        expect(fields[`internal`].type.toString()).toEqual(`Internal!`)
      })
    })

    it(`allows adding abstract types in SDL`, async () => {
      createTypes(`
        interface FooBar {
          text: String!
        }

        type Foo implements Node & FooBar {
          text: String!
        }

        type Bar implements Node & FooBar {
          text: String!
        }

        type Author implements Node & FooBar {
          text: String!
        }

        union UFooBar = Foo | Bar | Author
      `)

      const schema = await buildSchema()

      const interfaceType = schema.getType(`FooBar`)
      expect(interfaceType).toBeInstanceOf(GraphQLInterfaceType)
      const unionType = schema.getType(`UFooBar`)
      expect(unionType).toBeInstanceOf(GraphQLUnionType)
      ;[(`Foo`, `Bar`, `Author`)].forEach(typeName => {
        const type = schema.getType(typeName)
        const typeSample = { internal: { type: typeName } }
        expect(interfaceType.resolveType(typeSample)).toBe(typeName)
        expect(unionType.resolveType(typeSample)).toBe(typeName)
        expect(new Set(type.getInterfaces())).toEqual(
          new Set([schema.getType(`Node`), schema.getType(`FooBar`)])
        )
      })
    })

    it(`adds args to field`, async () => {
      createTypes(`
        type Author implements Node {
          name(withHello: Boolean = false): String!
        }
      `)
      const schema = await buildSchema()
      const type = schema.getType(`Author`)
      const fields = type.getFields()
      const arg = fields[`name`].args.find(arg => arg.name === `withHello`)
      expect(arg).toBeDefined()
      expect(arg.type.toString()).toEqual(`Boolean`)
      expect(arg.defaultValue).toEqual(false)
    })

    // TODO: Define what "handles being called multiple times mean"
    it.todo(`handles being called multiple times`)
  })

  describe(`createResolvers`, () => {
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

const createTypes = types => {
  store.dispatch({ type: `CREATE_TYPES`, payload: types })
}

const buildSchema = async () => {
  await build({})
  return store.getState().schema
}
