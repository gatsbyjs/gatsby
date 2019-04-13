const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLBoolean,
} = require(`graphql`)
const { SchemaComposer } = require(`graphql-compose`)
jest.mock(`../../utils/api-runner-node`)
const { store } = require(`../../redux`)
const { build } = require(`..`)
const {
  buildObjectType,
  buildUnionType,
  buildInterfaceType,
} = require(`../types/type-builders`)
require(`../../db/__tests__/fixtures/ensure-loki`)()

const nodes = require(`./fixtures/node-model`)

describe(`Build schema`, () => {
  beforeAll(() => {
    addDefaultApiRunnerMock()
  })

  beforeEach(async () => {
    store.dispatch({ type: `DELETE_CACHE` })
    nodes.forEach(node =>
      store.dispatch({ type: `CREATE_NODE`, payload: { ...node } })
    )
  })

  afterEach(() => {
    addDefaultApiRunnerMock()
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
      expect(fooType.getInterfaces()).toEqual([schema.getType(`Node`)])
      const fields = fooType.getFields()
      expect(fields[`text`]).toBeDefined()
      expect(fields[`text`].type).toBeInstanceOf(GraphQLNonNull)
      expect(fields[`text`].type.ofType).toBe(GraphQLString)
    })

    it(`allows adding type in gatsby type def language`, async () => {
      createTypes(
        buildObjectType({
          name: `Foo`,
          fields: {
            text: `String!`,
            withArgs: {
              type: `Boolean`,
              args: {
                what: {
                  type: `Boolean`,
                },
              },
              resolve(parent, args) {
                return Boolean(args.what)
              },
            },
          },
          interfaces: [`Node`],
        })
      )
      const schema = await buildSchema()
      const fooType = schema.getType(`Foo`)
      expect(fooType).toBeInstanceOf(GraphQLObjectType)
      expect(fooType.getInterfaces()).toEqual([schema.getType(`Node`)])
      const fields = fooType.getFields()
      expect(fields[`text`]).toBeDefined()
      expect(fields[`text`].type).toBeInstanceOf(GraphQLNonNull)
      expect(fields[`text`].type.ofType).toBe(GraphQLString)
      expect(fields[`withArgs`]).toBeDefined()
      expect(fields[`withArgs`].type).toBe(GraphQLBoolean)
      expect(fields[`withArgs`].args[0]).toBeDefined()
      expect(fields[`withArgs`].args[0].name).toEqual(`what`)
      expect(fields[`withArgs`].args[0].type).toBe(GraphQLBoolean)
      expect(fields[`withArgs`].resolve({}, { what: true })).toBe(true)
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

    it(`allows adding abstract types in gatsby type def language`, async () => {
      createTypes([
        buildInterfaceType({
          name: `FooBar`,
          fields: {
            text: `String!`,
          },
        }),
        buildObjectType({
          name: `Foo`,
          fields: {
            text: `String!`,
          },
          interfaces: [`Node`, `FooBar`],
        }),
        buildObjectType({
          name: `Bar`,
          fields: {
            text: `String!`,
          },
          interfaces: [`Node`, `FooBar`],
        }),
        buildObjectType({
          name: `Author`,
          fields: {
            text: `String!`,
          },
          interfaces: [`Node`, `FooBar`],
        }),
        buildUnionType({
          name: `UFooBar`,
          types: [`Foo`, `Bar`, `Author`],
        }),
      ])

      const schema = await buildSchema()

      const interfaceType = schema.getType(`FooBar`)
      expect(interfaceType).toBeInstanceOf(GraphQLInterfaceType)
      const unionType = schema.getType(`UFooBar`)
      expect(unionType).toBeInstanceOf(GraphQLUnionType)
      expect(unionType.getTypes().length).toBe(3)
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

    it(`displays error message for reserved Node interface`, () => {
      const typeDefs = [
        `interface Node { foo: Boolean }`,
        `type Node { foo: Boolean }`,
        new GraphQLInterfaceType({ name: `Node`, fields: {} }),
        buildInterfaceType({ name: `Node`, fields: {} }),
      ]
      return Promise.all(
        typeDefs.map(def => {
          store.dispatch({ type: `DELETE_CACHE` })
          createTypes(def)
          return expect(buildSchema()).rejects.toThrow(
            `The GraphQL type \`Node\` is reserved for internal use.`
          )
        })
      )
    })

    it(`displays error message for reserved type names`, () => {
      const typeDefs = [
        [`TestSortInput`, `type TestSortInput { foo: Boolean }`],
        [
          `TestFilterInput`,
          `type TestFilterInput implements Node { foo: Boolean }`,
        ],
        [
          `TestSortInput`,
          new GraphQLObjectType({ name: `TestSortInput`, fields: {} }),
        ],
        [
          `TestFilterInput`,
          buildObjectType({ name: `TestFilterInput`, fields: {} }),
        ],
      ]
      return Promise.all(
        typeDefs.map(([name, def]) => {
          store.dispatch({ type: `DELETE_CACHE` })
          createTypes(def)
          return expect(buildSchema()).rejects.toThrow(
            `GraphQL type names ending with "FilterInput" or "SortInput" are ` +
              `reserved for internal use. Please rename \`${name}\`.`
          )
        })
      )
    })

    it(`displays error message for reserved type names`, () => {
      const typeDefs = [
        [`JSON`, `type JSON { foo: Boolean }`],
        [`Date`, new GraphQLObjectType({ name: `Date`, fields: {} })],
        [`Float`, buildObjectType({ name: `Float`, fields: {} })],
      ]
      return Promise.all(
        typeDefs.map(([name, def]) => {
          store.dispatch({ type: `DELETE_CACHE` })
          createTypes(def)
          return expect(buildSchema()).rejects.toThrow(
            `The GraphQL type \`${name}\` is reserved for internal use by ` +
              `built-in scalar types.`
          )
        })
      )
    })

    it(`allows modifying nested types`, async () => {
      createTypes(`
        type PostFrontmatter {
          published: Boolean!
          newField: String
        }

        type Post implements Node {
          frontmatter: PostFrontmatter
        }
      `)

      const schema = await buildSchema()

      const type = schema.getType(`Post`)
      const fields = type.getFields()
      expect(fields[`frontmatter`].type.toString()).toEqual(`PostFrontmatter`)
      const nestedType = schema.getType(`PostFrontmatter`)
      const nestedFields = nestedType.getFields()
      expect(nestedFields[`authors`].type.toString()).toEqual(`[String]`)
      expect(nestedFields[`reviewers`].type.toString()).toEqual(`[String]`)
      expect(nestedFields[`published`].type.toString()).toEqual(`Boolean!`)
      expect(nestedFields[`date`].type.toString()).toEqual(`Date`)
      expect(nestedFields[`newField`].type.toString()).toEqual(`String`)
    })
  })

  describe(`createResolvers`, () => {
    it(`allows adding resolver to field`, async () => {
      createTypes(`
        type Author implements Node {
          name(withHello: Boolean = false): String!
        }
      `)
      createCreateResolversMock({
        Author: {
          name: {
            resolve(parent, args, context, info) {
              if (args.withHello) {
                return `Hello ${parent.name}`
              } else {
                return info.originalResolver(parent, args, context, info)
              }
            },
          },
        },
      })
      const schema = await buildSchema()
      const type = schema.getType(`Author`)
      const fields = type.getFields()
      expect(fields[`name`].resolve).toBeDefined()
      expect(
        fields[`name`].resolve(
          { name: `Mikhail` },
          { withHello: true },
          {},
          {
            fieldName: `name`,
          }
        )
      ).toEqual(`Hello Mikhail`)
      expect(
        fields[`name`].resolve(
          { name: `Mikhail` },
          { withHello: false },
          {},
          {
            fieldName: `name`,
          }
        )
      ).toEqual(`Mikhail`)
    })

    it(`allows adding args to field`, async () => {
      createCreateResolversMock({
        Author: {
          name: {
            args: {
              withHello: {
                type: `Boolean`,
                defaultValue: false,
              },
            },
            resolve(parent, args, context, info) {
              if (args.withHello) {
                return `Hello ${parent.name}`
              } else {
                return info.originalResolver(parent, args, context, info)
              }
            },
          },
        },
      })
      const schema = await buildSchema()
      const type = schema.getType(`Author`)
      const fields = type.getFields()
      expect(fields[`name`].resolve).toBeDefined()
      expect(
        fields[`name`].resolve(
          { name: `Mikhail` },
          { withHello: true },
          {},
          {
            fieldName: `name`,
          }
        )
      ).toEqual(`Hello Mikhail`)
      expect(
        fields[`name`].resolve(
          { name: `Mikhail` },
          { withHello: false },
          {},
          {
            fieldName: `name`,
          }
        )
      ).toEqual(`Mikhail`)
    })

    it(`disallows overriding field type on field`, async () => {
      createCreateResolversMock({
        Author: {
          name: {
            type: `Boolean`,
          },
        },
      })
      const schema = await buildSchema()
      const type = schema.getType(`Author`)
      const fields = type.getFields()
      expect(fields[`name`].type).toEqual(GraphQLString)
    })

    it(`allows setting field type nullability on field`, async () => {
      createTypes(`
        type Post implements Node {
          tags: [String!]!
          categories: [String]
        }
      `)
      createCreateResolversMock({
        Post: {
          tags: {
            type: `[String]`,
            resolve() {
              return [`All good`]
            },
          },
          categories: {
            type: `[String!]!`,
            resolve() {
              return [`Even better`]
            },
          },
        },
      })
      const schema = await buildSchema()
      const type = schema.getType(`Post`)
      const fields = type.getFields()
      expect(fields[`tags`].type.toString()).toBe(`[String]`)
      expect(fields[`tags`].resolve).toBeDefined()
      expect(fields[`categories`].type.toString()).toBe(`[String!]!`)
      expect(fields[`categories`].resolve).toBeDefined()
    })

    it(`allows overriding field type on field on third-party type`, async () => {
      addThirdPartySchema(`
        type ThirdPartyFoo {
          text: String
        }

        type Query {
          foo: ThirdPartyFoo
        }
      `)
      createCreateResolversMock({
        ThirdPartyFoo: {
          text: {
            type: `Boolean`,
          },
        },
      })

      const schema = await buildSchema()
      const type = schema.getType(`ThirdPartyFoo`)
      const fields = type.getFields()
      expect(fields[`text`].type).toEqual(GraphQLBoolean)
    })

    it(`allows adding new field`, async () => {
      createCreateResolversMock({
        Author: {
          newField: {
            type: `String`,
          },
        },
      })

      const schema = await buildSchema()
      const type = schema.getType(`Author`)
      const fields = type.getFields()
      expect(fields[`newField`]).toBeDefined()
      expect(fields[`newField`].type).toEqual(GraphQLString)
    })

    it(`disallows adding if type does not exist`, async () => {
      createCreateResolversMock({
        FakeType: {
          newField: {
            type: `String`,
          },
        },
      })
      const schema = await buildSchema()
      const type = schema.getType(`FakeType`)
      expect(type).not.toBeDefined()
    })

    it(`makes original field resolver available on info`, async () => {
      createCreateResolversMock({
        PostFrontmatter: {
          date: {
            resolve(parent, args, context, info) {
              if (parent.date.getFullYear() < 2018) {
                return info.originalResolver(
                  {
                    ...parent,
                    date: new Date(2018, 10, 10),
                  },
                  args,
                  context,
                  info
                )
              } else {
                return info.originalResolver(parent, args, context, info)
              }
            },
          },
        },
      })
      const schema = await buildSchema()
      const type = schema.getType(`PostFrontmatter`)
      const fields = type.getFields()
      expect(
        fields[`date`].resolve(
          { date: new Date(2019, 10, 10) },
          { formatString: `YYYY` },
          {},
          {
            fieldName: `date`,
          }
        )
      ).toEqual(`2019`)
      expect(
        fields[`date`].resolve(
          { date: new Date(2010, 10, 10) },
          { formatString: `YYYY` },
          {},
          {
            fieldName: `date`,
          }
        )
      ).toEqual(`2018`)
    })

    // TODO: Define what "handles being called multiple times mean"
    it.todo(`handles being called multiple times`)
  })

  describe(`addThirdPartySchemas`, () => {
    it(`makes third-party schema available on root Query type`, async () => {
      addThirdPartySchema(`
        type ThirdPartyFoo {
          text: String
        }

        type Query {
          foo: ThirdPartyFoo
          foos: [ThirdPartyFoo]
          query: Query
          relay: [Query!]!
        }
      `)
      createCreateResolversMock({
        ThirdPartyFoo: {
          text: {
            type: `Boolean`,
          },
        },
      })

      const schema = await buildSchema()
      const type = schema.getType(`Query`)
      const fields = type.getFields()
      expect(fields[`foo`].type.toString()).toEqual(`ThirdPartyFoo`)
      expect(fields[`foos`].type.toString()).toEqual(`[ThirdPartyFoo]`)
      expect(fields[`query`].type.toString()).toEqual(`Query`)
      expect(fields[`relay`].type.toString()).toEqual(`[Query!]!`)
    })

    it(`adds third-party types to schema`, async () => {
      addThirdPartySchema(`
        type ThirdPartyFoo {
          text: String
        }

        type ThirdPartyBar {
          baz: String
        }

        union ThirdPartyUnion = ThirdPartyFoo | ThirdPartyBar

        type Query {
          union: ThirdPartyUnion
        }
      `)

      const schema = await buildSchema()
      ;[`ThirdPartyFoo`, `ThirdPartyBar`, `ThirdPartyUnion`].forEach(
        typeName => {
          const type = schema.getType(typeName)
          expect(type).toBeDefined()
        }
      )
    })
  })

  describe(`setFieldsOnGraphQLNodeType`, () => {
    it(`allows adding fields`, async () => {
      createSetFieldsOnNodeTypeMock(({ type: { name } }) => {
        if (name === `Author`) {
          return [
            {
              newField: {
                type: GraphQLString,
              },
            },
          ]
        } else {
          return []
        }
      })

      const schema = await buildSchema()
      const type = schema.getType(`Author`)
      const fields = type.getFields()
      expect(fields[`newField`]).toBeDefined()
      expect(fields[`newField`].type).toBe(GraphQLString)
    })

    it(`allows adding nested fields`, async () => {
      createSetFieldsOnNodeTypeMock(({ type: { name } }) => {
        if (name === `Post`) {
          return [
            {
              newField: {
                type: GraphQLString,
              },
              "frontmatter.newField": {
                type: GraphQLString,
              },
            },
          ]
        } else {
          return []
        }
      })

      const schema = await buildSchema()
      const type = schema.getType(`Post`)
      const fields = type.getFields()
      expect(fields[`newField`]).toBeDefined()
      expect(fields[`newField`].type).toBe(GraphQLString)
      const frontmatterType = fields[`frontmatter`].type
      const frontmatterFields = frontmatterType.getFields()
      expect(frontmatterFields[`newField`]).toBeDefined()
      expect(frontmatterFields[`newField`].type).toBe(GraphQLString)
    })
  })
})

const createTypes = types => {
  store.dispatch({ type: `CREATE_TYPES`, payload: types })
}

const createCreateResolversMock = resolvers => {
  const apiRunnerNode = require(`../../utils/api-runner-node`)
  apiRunnerNode.mockImplementation((api, { createResolvers }) => {
    if (api === `createResolvers`) {
      return createResolvers(resolvers)
    }
    return []
  })
}

const createSetFieldsOnNodeTypeMock = mock => {
  const apiRunnerNode = require(`../../utils/api-runner-node`)
  apiRunnerNode.mockImplementation((api, ...args) => {
    if (api === `setFieldsOnGraphQLNodeType`) {
      return mock(...args)
    }
    return []
  })
}

const addDefaultApiRunnerMock = () => {
  const apiRunnerNode = require(`../../utils/api-runner-node`)
  apiRunnerNode.mockImplementation(() => [])
}

const buildSchema = async () => {
  await build({})
  return store.getState().schema
}

const addThirdPartySchema = async typeDefs => {
  const schemaComposer = new SchemaComposer()
  schemaComposer.addTypeDefs(typeDefs)
  const schema = schemaComposer.buildSchema()
  store.dispatch({ type: `ADD_THIRD_PARTY_SCHEMA`, payload: schema })
}
