const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLBoolean,
  printType,
  printSchema,
} = require(`graphql`)
const { SchemaComposer } = require(`graphql-compose`)
jest.mock(`../../utils/api-runner-node`)
const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)
const { build } = require(`..`)
import {
  buildObjectType,
  buildUnionType,
  buildInterfaceType,
} from "../types/type-builders"
const withResolverContext = require(`../context`)

const itWhenV4 = _CFLAGS_.GATSBY_MAJOR !== `5` ? it : it.skip
const itWhenV5 = _CFLAGS_.GATSBY_MAJOR === `5` ? it : it.skip

/**
 * Helper identity function to trigger syntax highlighting in code editors.
 * (`gql` name serve as a hint)
 */
function gql(input) {
  return input
}

const nodes = require(`./fixtures/node-model`)

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    panic: jest.fn(console.error),
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

const report = require(`gatsby-cli/lib/reporter`)
afterEach(() => report.warn.mockClear())

describe(`Built-in types`, () => {
  beforeEach(async () => {
    store.dispatch({ type: `DELETE_CACHE` })
  })

  itWhenV4(`includes built-in types (v4)`, async () => {
    const schema = await buildSchema()
    expect(printSchema(schema)).toMatchSnapshot()
  })

  itWhenV5(`includes built-in types (v5)`, async () => {
    const schema = await buildSchema()
    expect(printSchema(schema)).toMatchSnapshot()
  })
})

describe(`Build schema`, () => {
  beforeAll(() => {
    addDefaultApiRunnerMock()
  })

  beforeEach(async () => {
    store.dispatch({ type: `DELETE_CACHE` })
    nodes.forEach(node =>
      actions.createNode(
        { ...node, internal: { ...node.internal } },
        { name: `test` }
      )(store.dispatch)
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
      expect(await fields[`withArgs`].resolve({}, { what: true }, {}, {})).toBe(
        true
      )
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
        interface Text {
          text: String
        }

        interface FooBar implements Text {
          text: String!
        }

        type Foo implements Node & Text & FooBar {
          text: String!
        }

        type Bar implements Node & Text & FooBar {
          text: String!
        }

        type Author implements Node & Text & FooBar {
          text: String!
        }

        union UFooBar = Foo | Bar | Author
      `)

      const schema = await buildSchema()

      const textType = schema.getType(`Text`)
      expect(textType).toBeInstanceOf(GraphQLInterfaceType)
      const fooBarType = schema.getType(`FooBar`)
      expect(fooBarType).toBeInstanceOf(GraphQLInterfaceType)
      expect(fooBarType.getInterfaces()).toEqual([schema.getType(`Text`)])
      const unionType = schema.getType(`UFooBar`)
      expect(unionType).toBeInstanceOf(GraphQLUnionType)
      ;[(`Foo`, `Bar`, `Author`)].forEach(typeName => {
        const type = schema.getType(typeName)
        const typeSample = { internal: { type: typeName } }
        expect(textType.resolveType(typeSample)).toBe(typeName)
        expect(fooBarType.resolveType(typeSample)).toBe(typeName)
        expect(unionType.resolveType(typeSample)).toBe(typeName)
        expect(new Set(type.getInterfaces())).toEqual(
          new Set([
            schema.getType(`Node`),
            schema.getType(`FooBar`),
            schema.getType(`Text`),
          ])
        )
      })
    })

    it(`allows adding abstract types in gatsby type def language`, async () => {
      createTypes([
        buildInterfaceType({
          name: `Text`,
          fields: {
            text: `String!`,
          },
        }),
        buildInterfaceType({
          name: `FooBar`,
          fields: {
            text: `String!`,
          },
          interfaces: [`Text`],
        }),
        buildObjectType({
          name: `Foo`,
          fields: {
            text: `String!`,
          },
          interfaces: [`Node`, `Text`, `FooBar`],
        }),
        buildObjectType({
          name: `Bar`,
          fields: {
            text: `String!`,
          },
          interfaces: [`Node`, `Text`, `FooBar`],
        }),
        buildObjectType({
          name: `Author`,
          fields: {
            text: `String!`,
          },
          interfaces: [`Node`, `Text`, `FooBar`],
        }),
        buildUnionType({
          name: `UFooBar`,
          types: [`Foo`, `Bar`, `Author`],
        }),
      ])

      const schema = await buildSchema()

      const textType = schema.getType(`Text`)
      expect(textType).toBeInstanceOf(GraphQLInterfaceType)
      const fooBarType = schema.getType(`FooBar`)
      expect(fooBarType).toBeInstanceOf(GraphQLInterfaceType)
      expect(fooBarType.getInterfaces()).toEqual([textType])
      const unionFooBarType = schema.getType(`UFooBar`)
      expect(unionFooBarType).toBeInstanceOf(GraphQLUnionType)
      expect(unionFooBarType.getTypes().length).toBe(3)
      ;[(`Foo`, `Bar`, `Author`)].forEach(typeName => {
        const type = schema.getType(typeName)
        const typeSample = { internal: { type: typeName } }
        expect(textType.resolveType(typeSample)).toBe(typeName)
        expect(fooBarType.resolveType(typeSample)).toBe(typeName)
        expect(unionFooBarType.resolveType(typeSample)).toBe(typeName)
        expect(new Set(type.getInterfaces())).toEqual(
          new Set([
            schema.getType(`Node`),
            schema.getType(`FooBar`),
            schema.getType(`Text`),
          ])
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

    it(`merges user-defined type with plugin-defined type`, async () => {
      createTypes(
        `type PluginDefined implements Node @infer { foo: Int, baz: PluginDefinedNested }
         type PluginDefinedNested { foo: Int }`,
        {
          name: `some-gatsby-plugin`,
        }
      )
      createTypes(
        `type PluginDefined implements Node @dontInfer { bar: Int, qux: PluginDefinedNested }
         type PluginDefinedNested { bar: Int }`,
        {
          name: `default-site-plugin`,
        }
      )
      const schema = await buildSchema()
      const PluginDefinedNested = schema.getType(`PluginDefinedNested`)
      const nestedFields = PluginDefinedNested.getFields()
      const PluginDefined = schema.getType(`PluginDefined`)
      const fields = PluginDefined.getFields()
      expect(Object.keys(nestedFields)).toEqual([`foo`, `bar`])
      expect(Object.keys(fields)).toEqual([
        `foo`,
        `baz`,
        `bar`,
        `qux`,
        `id`,
        `parent`,
        `children`,
        `internal`,
      ])

      expect(
        getSchemaComposer().getOTC(`PluginDefined`).getExtensions()
      ).toEqual(
        expect.objectContaining({
          createdFrom: `sdl`,
          plugin: `default-site-plugin`,
          infer: false,
        })
      )
    })

    it(`merges user-defined type (Gatsby type-builder) with plugin-defined type`, async () => {
      createTypes(
        `type PluginDefined implements Node @infer { foo: Int, baz: PluginDefinedNested }
         type PluginDefinedNested { foo: Int }`,
        {
          name: `some-gatsby-plugin`,
        }
      )
      createTypes(
        [
          buildObjectType({
            name: `PluginDefined`,
            interfaces: [`Node`],
            extensions: {
              infer: false,
            },
            fields: {
              bar: `Int`,
              qux: `PluginDefinedNested`,
            },
          }),
          buildObjectType({
            name: `PluginDefinedNested`,
            fields: {
              bar: `Int`,
            },
          }),
        ],
        {
          name: `default-site-plugin`,
        }
      )
      const schema = await buildSchema()
      const PluginDefinedNested = schema.getType(`PluginDefinedNested`)
      const nestedFields = PluginDefinedNested.getFields()
      const PluginDefined = schema.getType(`PluginDefined`)
      const fields = PluginDefined.getFields()
      expect(Object.keys(nestedFields)).toEqual([`foo`, `bar`])
      expect(Object.keys(fields)).toEqual([
        `foo`,
        `baz`,
        `bar`,
        `qux`,
        `id`,
        `parent`,
        `children`,
        `internal`,
      ])
      expect(
        getSchemaComposer().getOTC(`PluginDefined`).getExtensions()
      ).toEqual(
        expect.objectContaining({
          createdFrom: `typeBuilder`,
          plugin: `default-site-plugin`,
          infer: false,
        })
      )
    })

    it(`merges user-defined type with plugin-defined type (Gatsby type-builder)`, async () => {
      createTypes(
        [
          buildObjectType({
            name: `PluginDefined`,
            interfaces: [`Node`],
            extensions: {
              infer: true,
            },
            fields: {
              foo: `Int`,
              baz: `PluginDefinedNested`,
            },
          }),
          buildObjectType({
            name: `PluginDefinedNested`,
            fields: {
              foo: `Int`,
            },
          }),
        ],
        {
          name: `some-gatsby-plugin`,
        }
      )
      createTypes(
        `type PluginDefined implements Node @dontInfer {
           bar: Int
           qux: PluginDefinedNested
         }
         type PluginDefinedNested { bar: Int }`,
        {
          name: `default-site-plugin`,
        }
      )
      const schema = await buildSchema()
      const PluginDefinedNested = schema.getType(`PluginDefinedNested`)
      const nestedFields = PluginDefinedNested.getFields()
      const PluginDefined = schema.getType(`PluginDefined`)
      const fields = PluginDefined.getFields()
      expect(Object.keys(nestedFields)).toEqual([`foo`, `bar`])
      expect(Object.keys(fields)).toEqual([
        `foo`,
        `baz`,
        `bar`,
        `qux`,
        `id`,
        `parent`,
        `children`,
        `internal`,
      ])
      expect(
        getSchemaComposer().getOTC(`PluginDefined`).getExtensions()
      ).toEqual(
        expect.objectContaining({
          createdFrom: `sdl`,
          plugin: `default-site-plugin`,
          infer: false,
        })
      )
    })

    it(`merges user-defined type (Gatsby type-builder) with plugin-defined type (Gatsby type-builder)`, async () => {
      createTypes(
        [
          buildObjectType({
            name: `PluginDefined`,
            interfaces: [`Node`],
            extensions: {
              infer: true,
            },
            fields: {
              foo: `Int`,
              baz: `PluginDefinedNested`,
            },
          }),
          buildObjectType({
            name: `PluginDefinedNested`,
            fields: {
              foo: `Int`,
            },
          }),
        ],
        {
          name: `some-gatsby-plugin`,
        }
      )
      createTypes(
        [
          buildObjectType({
            name: `PluginDefined`,
            interfaces: [`Node`],
            extensions: {
              infer: false,
            },
            fields: {
              bar: `Int`,
              qux: `PluginDefinedNested`,
            },
          }),
          buildObjectType({
            name: `PluginDefinedNested`,
            fields: {
              bar: `Int`,
            },
          }),
        ],
        {
          name: `default-site-plugin`,
        }
      )
      const schema = await buildSchema()
      const PluginDefinedNested = schema.getType(`PluginDefinedNested`)
      const nestedFields = PluginDefinedNested.getFields()
      const PluginDefined = schema.getType(`PluginDefined`)
      const fields = PluginDefined.getFields()
      expect(Object.keys(nestedFields)).toEqual([`foo`, `bar`])
      expect(Object.keys(fields)).toEqual([
        `foo`,
        `baz`,
        `bar`,
        `qux`,
        `id`,
        `parent`,
        `children`,
        `internal`,
      ])
      expect(
        getSchemaComposer().getOTC(`PluginDefined`).getExtensions()
      ).toEqual(
        expect.objectContaining({
          createdFrom: `typeBuilder`,
          plugin: `default-site-plugin`,
          infer: false,
        })
      )
    })

    // FIXME: Fails for PluginDefined.qux with PluginDefinedNested
    it.skip(`merges user-defined type (graphql-js) with plugin-defined type`, async () => {
      createTypes(
        `type PluginDefined implements Node @infer { foo: Int, baz: PluginDefinedNested }
         type PluginDefinedNested { foo: Int }`,
        {
          name: `some-gatsby-plugin`,
        }
      )
      const PluginDefinedNestedType = new GraphQLObjectType({
        name: `PluginDefinedNested`,
        fields: {
          bar: { type: GraphQLString },
        },
      })
      const PluginDefinedType = new GraphQLObjectType({
        name: `PluginDefined`,
        fields: {
          bar: { type: GraphQLString },
          qux: { type: PluginDefinedNestedType },
        },
      })
      createTypes([PluginDefinedType, PluginDefinedNestedType], {
        name: `default-site-plugin`,
      })
      const schema = await buildSchema()
      const PluginDefinedNested = schema.getType(`PluginDefinedNested`)
      const nestedFields = PluginDefinedNested.getFields()
      const PluginDefined = schema.getType(`PluginDefined`)
      const fields = PluginDefined.getFields()
      expect(Object.keys(nestedFields)).toEqual([`foo`, `bar`])
      expect(Object.keys(fields)).toEqual([
        `foo`,
        `baz`,
        `bar`,
        `qux`,
        `id`,
        `parent`,
        `children`,
        `internal`,
      ])
      expect(PluginDefined._gqcExtensions).toEqual(
        expect.objectContaining({
          createdFrom: `graphql-js`,
          plugin: `default-site-plugin`,
          infer: true,
        })
      )
    })

    it(`merges user-defined type with plugin-defined type (graphql-js)`, async () => {
      const PluginDefinedNestedType = new GraphQLObjectType({
        name: `PluginDefinedNested`,
        fields: {
          foo: { type: GraphQLString },
        },
      })
      const PluginDefinedType = new GraphQLObjectType({
        name: `PluginDefined`,
        fields: {
          foo: { type: GraphQLString },
          baz: { type: PluginDefinedNestedType },
        },
      })
      createTypes([PluginDefinedType, PluginDefinedNestedType], {
        name: `some-gatsby-plugin`,
      })
      createTypes(
        `type PluginDefined implements Node @infer { bar: Int, qux: PluginDefinedNested }
         type PluginDefinedNested { bar: Int }`,
        {
          name: `default-site-plugin`,
        }
      )
      const schema = await buildSchema()
      const PluginDefinedNested = schema.getType(`PluginDefinedNested`)
      const nestedFields = PluginDefinedNested.getFields()
      const PluginDefined = schema.getType(`PluginDefined`)
      const fields = PluginDefined.getFields()
      expect(Object.keys(nestedFields)).toEqual([`foo`, `bar`])
      expect(Object.keys(fields)).toEqual([
        `foo`,
        `baz`,
        `bar`,
        `qux`,
        `id`,
        `parent`,
        `children`,
        `internal`,
      ])
      expect(
        getSchemaComposer().getOTC(`PluginDefined`).getExtensions()
      ).toEqual(
        expect.objectContaining({
          createdFrom: `sdl`,
          plugin: `default-site-plugin`,
          infer: true,
        })
      )
    })

    it(`merges types owned by same plugin`, async () => {
      createTypes(
        `type PluginDefined implements Node @infer { foo: Int, baz: PluginDefinedNested }
         type PluginDefinedNested { foo: Int }`,
        {
          name: `some-gatsby-plugin`,
        }
      )
      createTypes(
        `type PluginDefined implements Node @dontInfer { bar: Int, qux: PluginDefinedNested }
         type PluginDefinedNested { bar: Int }`,
        {
          name: `some-gatsby-plugin`,
        }
      )
      const schema = await buildSchema()
      const PluginDefinedNested = schema.getType(`PluginDefinedNested`)
      const nestedFields = PluginDefinedNested.getFields()
      const PluginDefined = schema.getType(`PluginDefined`)
      const fields = PluginDefined.getFields()
      expect(Object.keys(nestedFields)).toEqual([`foo`, `bar`])
      expect(Object.keys(fields)).toEqual([
        `foo`,
        `baz`,
        `bar`,
        `qux`,
        `id`,
        `parent`,
        `children`,
        `internal`,
      ])
      expect(
        getSchemaComposer().getOTC(`PluginDefined`).getExtensions()
      ).toEqual(
        expect.objectContaining({
          createdFrom: `sdl`,
          plugin: `some-gatsby-plugin`,
          infer: false,
        })
      )
    })

    it(`warns when merging plugin-defined type with type defined by other plugin`, async () => {
      createTypes(
        `type PluginDefined implements Node { foo: Int, baz: PluginDefinedNested }
         type PluginDefinedNested { foo: Int }`,
        {
          name: `some-gatsby-plugin`,
        }
      )
      createTypes(
        `type PluginDefined implements Node { bar: Int, qux: PluginDefinedNested }
         type PluginDefinedNested { bar: Int }`,
        {
          name: `some-other-gatsby-plugin`,
        }
      )
      const schema = await buildSchema()
      const nestedFields = schema.getType(`PluginDefinedNested`).getFields()
      const fields = schema.getType(`PluginDefined`).getFields()
      expect(Object.keys(nestedFields)).toEqual([`foo`, `bar`])
      expect(Object.keys(fields)).toEqual([
        `foo`,
        `baz`,
        `bar`,
        `qux`,
        `id`,
        `parent`,
        `children`,
        `internal`,
      ])
      expect(report.warn).toHaveBeenCalledWith(
        `Plugin \`some-other-gatsby-plugin\` has customized the GraphQL type ` +
          `\`PluginDefinedNested\`, which has already been defined by the plugin ` +
          `\`some-gatsby-plugin\`. ` +
          `This could potentially cause conflicts.`
      )
      expect(report.warn).toHaveBeenCalledWith(
        `Plugin \`some-other-gatsby-plugin\` has customized the GraphQL type ` +
          `\`PluginDefined\`, which has already been defined by the plugin ` +
          `\`some-gatsby-plugin\`. ` +
          `This could potentially cause conflicts.`
      )
    })

    it(`warns when merging plugin-defined type (Type Builder) with type defined by other plugin`, async () => {
      createTypes(
        `type PluginDefined implements Node { foo: Int, baz: PluginDefinedNested }
         type PluginDefinedNested { foo: Int }`,
        {
          name: `some-gatsby-plugin`,
        }
      )
      createTypes(
        [
          buildObjectType({
            name: `PluginDefined`,
            interfaces: [`Node`],
            extensions: {
              infer: false,
            },
            fields: {
              bar: `Int`,
              qux: `PluginDefinedNested`,
            },
          }),
          buildObjectType({
            name: `PluginDefinedNested`,
            fields: {
              bar: `Int`,
            },
          }),
        ],
        {
          name: `some-other-gatsby-plugin`,
        }
      )
      const schema = await buildSchema()
      const nestedFields = schema.getType(`PluginDefinedNested`).getFields()
      const fields = schema.getType(`PluginDefined`).getFields()
      expect(Object.keys(nestedFields)).toEqual([`foo`, `bar`])
      expect(Object.keys(fields)).toEqual([
        `foo`,
        `baz`,
        `bar`,
        `qux`,
        `id`,
        `parent`,
        `children`,
        `internal`,
      ])
      expect(report.warn).toHaveBeenCalledWith(
        `Plugin \`some-other-gatsby-plugin\` has customized the GraphQL type ` +
          `\`PluginDefinedNested\`, which has already been defined by the plugin ` +
          `\`some-gatsby-plugin\`. ` +
          `This could potentially cause conflicts.`
      )
      expect(report.warn).toHaveBeenCalledWith(
        `Plugin \`some-other-gatsby-plugin\` has customized the GraphQL type ` +
          `\`PluginDefined\`, which has already been defined by the plugin ` +
          `\`some-gatsby-plugin\`. ` +
          `This could potentially cause conflicts.`
      )
    })

    // FIXME: Fails with: Error: Cannot get field 'foo' from type 'PluginDefinedNested'. Field does not exist.
    //   same as "merges user-defined type (graphql-js) with plugin-defined type"
    it.skip(`warns when merging plugin-defined type (graphql-js) with type defined by other plugin`, async () => {
      createTypes(
        `type PluginDefined implements Node { foo: Int, baz: PluginDefinedNested }
         type PluginDefinedNested { foo: Int }`,
        {
          name: `some-gatsby-plugin`,
        }
      )
      const PluginDefinedNestedType = new GraphQLObjectType({
        name: `PluginDefinedNested`,
        fields: {
          bar: { type: GraphQLString },
        },
      })
      const PluginDefinedType = new GraphQLObjectType({
        name: `PluginDefined`,
        fields: {
          bar: { type: GraphQLString },
          qux: { type: PluginDefinedNestedType },
        },
      })
      createTypes([PluginDefinedType, PluginDefinedNestedType], {
        name: `some-other-gatsby-plugin`,
      })
      const schema = await buildSchema()
      const nestedFields = schema.getType(`PluginDefinedNested`).getFields()
      const fields = schema.getType(`PluginDefined`).getFields()
      expect(Object.keys(nestedFields)).toEqual([`foo`, `bar`])
      expect(Object.keys(fields)).toEqual([
        `foo`,
        `baz`,
        `bar`,
        `qux`,
        `id`,
        `parent`,
        `children`,
        `internal`,
      ])
      expect(report.warn).toHaveBeenCalledWith(
        `Plugin \`some-other-gatsby-plugin\` has customized the GraphQL type ` +
          `\`PluginDefinedNested\`, which has already been defined by the plugin ` +
          `\`some-gatsby-plugin\`.`
      )
      expect(report.warn).toHaveBeenCalledWith(
        `Plugin \`some-other-gatsby-plugin\` has customized the GraphQL type ` +
          `\`PluginDefined\`, which has already been defined by the plugin ` +
          `\`some-gatsby-plugin\`.`
      )
    })

    it(`merges plugin-defined type with overridable built-in type without warning`, async () => {
      createTypes(`type SiteSiteMetadata { bar: Int }`, {
        name: `some-gatsby-plugin`,
      })
      const schema = await buildSchema()
      const fields = schema.getType(`SiteSiteMetadata`).getFields()
      expect(Object.keys(fields)).toEqual([`title`, `description`, `bar`])
      expect(report.warn).not.toHaveBeenCalled()
    })

    it(`merges interfaces extending other interfaces`, async () => {
      createTypes(
        [
          `interface Foo { foo: String }`,
          `interface Bar { bar: String }`,
          `interface Baz implements Foo { foo: String }`,
          `interface Baz implements Bar & Node { bar: String, id: ID! }`,
        ],
        {
          name: `default-site-plugin`,
        }
      )
      const schema = await buildSchema()
      const Baz = schema.getType(`Baz`)
      const interfaces = Baz.getInterfaces().map(iface => iface.name)
      expect(interfaces).toEqual([`Foo`, `Bar`, `Node`])
    })

    it(`merges interfaces extending other interfaces (Type Builder)`, async () => {
      createTypes(
        [
          `interface Foo { foo: String }`,
          buildInterfaceType({
            name: `Bar`,
            fields: {
              bar: `String`,
            },
          }),
          buildInterfaceType({
            name: `Baz`,
            fields: {
              foo: `String`,
            },
            interfaces: [`Foo`],
          }),
          buildInterfaceType({
            name: `Baz`,
            fields: {
              id: `ID!`,
              bar: `String`,
            },
            interfaces: [`Bar`, `Node`],
          }),
        ],
        {
          name: `default-site-plugin`,
        }
      )
      const schema = await buildSchema()
      const Baz = schema.getType(`Baz`)
      const interfaces = Baz.getInterfaces().map(iface => iface.name)
      expect(interfaces).toEqual([`Foo`, `Bar`, `Node`])
    })

    it(`merges interfaces extending other interfaces (graphql-js)`, async () => {
      const Foo = new GraphQLInterfaceType({
        name: `Foo`,
        fields: {
          foo: { type: GraphQLString },
        },
      })
      const Bar = new GraphQLInterfaceType({
        name: `Bar`,
        fields: {
          bar: { type: GraphQLString },
        },
      })
      const Baz1 = new GraphQLInterfaceType({
        name: `Baz`,
        fields: {
          foo: { type: GraphQLString },
        },
        interfaces: [Foo],
      })
      const Baz2 = new GraphQLInterfaceType({
        name: `Baz`,
        fields: {
          bar: { type: GraphQLString },
        },
        interfaces: [Bar],
      })

      createTypes([Foo, Bar, Baz1, Baz2], { name: `default-site-plugin` })
      const schema = await buildSchema()
      const Baz = schema.getType(`Baz`)
      const interfaces = Baz.getInterfaces().map(iface => iface.name)
      expect(interfaces).toEqual([`Foo`, `Bar`])
    })

    it(`merges resolveType for abstract types (Type Builder)`, async () => {
      createTypes(
        [
          `interface Foo { foo: String }`,
          `
            type Fizz { id: ID! }
            type Buzz { id: ID! }
            union FizzBuzz = Fizz | Buzz
          `,
          buildInterfaceType({
            name: `Foo`,
            fields: { id: `ID!` },
            resolveType: source => source.expectedType,
          }),
          buildUnionType({
            name: `FizzBuzz`,
            resolveType: source => (source.isFizz ? `Fizz` : `Buzz`),
          }),
        ],
        {
          name: `default-site-plugin`,
        }
      )
      const schema = await buildSchema()
      const Foo = schema.getType(`Foo`)
      expect(Foo.resolveType({ expectedType: `Bar` })).toEqual(`Bar`)

      const FizzBuzz = schema.getType(`FizzBuzz`)
      expect(FizzBuzz.resolveType({ isFizz: true })).toEqual(`Fizz`)
      expect(FizzBuzz.resolveType({ isFizz: false })).toEqual(`Buzz`)
    })

    it(`merges resolveType for abstract types (graphql-js)`, async () => {
      createTypes(
        [
          `interface Foo { foo: String }`,
          `
            type Fizz { id: ID! }
            type Buzz { id: ID! }
            union FizzBuzz = Fizz | Buzz
          `,
          new GraphQLInterfaceType({
            name: `Foo`,
            fields: { foo: { type: GraphQLString } },
            resolveType: source => source.expectedType,
          }),
          new GraphQLUnionType({
            name: `FizzBuzz`,
            resolveType: source => (source.isFizz ? `Fizz` : `Buzz`),
          }),
        ],
        {
          name: `default-site-plugin`,
        }
      )
      const schema = await buildSchema()
      const Foo = schema.getType(`Foo`)
      expect(Foo.resolveType({ expectedType: `Bar` })).toEqual(`Bar`)

      const FizzBuzz = schema.getType(`FizzBuzz`)
      expect(FizzBuzz.resolveType({ isFizz: true })).toEqual(`Fizz`)
      expect(FizzBuzz.resolveType({ isFizz: false })).toEqual(`Buzz`)
    })

    it(`falls back to default resolveType when merging with placeholder `, async () => {
      createTypes(
        [
          buildObjectType({
            name: `Foo`,
            fields: { id: `ID!` },
            interfaces: [`Bar`],
          }),
          `interface Bar { id: ID! }`,
        ],
        {
          name: `default-site-plugin`,
        }
      )
      const schema = await buildSchema()
      const Bar = schema.getType(`Bar`)
      expect(Bar.resolveType({ internal: { type: `Foo` } })).toEqual(`Foo`)
    })

    it(`merges plugin-defined type (Type Builder) with overridable built-in type without warning`, async () => {
      createTypes(
        [
          buildObjectType({
            name: `SiteSiteMetadata`,
            fields: {
              bar: `Int`,
            },
          }),
        ],
        {
          name: `some-gatsby-plugin`,
        }
      )
      const schema = await buildSchema()
      const fields = schema.getType(`SiteSiteMetadata`).getFields()
      expect(Object.keys(fields)).toEqual([`title`, `description`, `bar`])
      expect(report.warn).not.toHaveBeenCalled()
    })

    it(`warns when merging plugin-defined type with previously overridden built-in type`, async () => {
      createTypes(`type SiteSiteMetadata { bar: Int }`, {
        name: `some-gatsby-plugin`,
      })
      createTypes(`type SiteSiteMetadata { foo: String }`, {
        name: `some-other-gatsby-plugin`,
      })
      const schema = await buildSchema()
      const fields = schema.getType(`SiteSiteMetadata`).getFields()
      expect(Object.keys(fields)).toEqual([
        `title`,
        `description`,
        `bar`,
        `foo`,
      ])
      expect(report.warn).toHaveBeenCalledWith(
        `Plugin \`some-other-gatsby-plugin\` has customized the GraphQL type \`SiteSiteMetadata\`, ` +
          `which has already been defined by the plugin \`some-gatsby-plugin\`. ` +
          `This could potentially cause conflicts.`
      )
    })

    it(`warns when merging plugin-defined type with built-in type`, async () => {
      createTypes(`type SitePage implements Node { bar: Int }`, {
        name: `some-gatsby-plugin`,
      })
      const schema = await buildSchema()
      const fields = schema.getType(`SitePage`).getFields()
      expect(Object.keys(fields)).toEqual([
        `path`,
        `component`,
        `internalComponentName`,
        `componentChunkName`,
        `matchPath`,
        `pageContext`,
        `pluginCreator`,
        `bar`,
        `id`,
        `parent`,
        `children`,
        `internal`,
      ])
      expect(report.warn).toHaveBeenCalledWith(
        `Plugin \`some-gatsby-plugin\` has customized the built-in Gatsby GraphQL type ` +
          `\`SitePage\`. This is allowed, but could potentially cause conflicts.`
      )
    })

    it(`warns when merging plugin-defined type (Type Builder) with built-in type`, async () => {
      createTypes(
        [
          buildObjectType({
            name: `SitePage`,
            interfaces: [`Node`],
            extensions: {
              infer: false,
            },
            fields: {
              bar: `Int`,
            },
          }),
        ],
        {
          name: `some-gatsby-plugin`,
        }
      )
      const schema = await buildSchema()
      const fields = schema.getType(`SitePage`).getFields()
      expect(Object.keys(fields)).toEqual([
        `path`,
        `component`,
        `internalComponentName`,
        `componentChunkName`,
        `matchPath`,
        `pageContext`,
        `pluginCreator`,
        `bar`,
        `id`,
        `parent`,
        `children`,
        `internal`,
      ])
      expect(report.warn).toHaveBeenCalledWith(
        `Plugin \`some-gatsby-plugin\` has customized the built-in Gatsby GraphQL type ` +
          `\`SitePage\`. This is allowed, but could potentially cause conflicts.`
      )
    })

    it.todo(
      `warns when merging plugin-defined type (graphql-js) with built-in type`
    )

    it(`extends fieldconfigs when merging types`, async () => {
      createTypes(
        buildObjectType({
          name: `Mdx`,
          interfaces: [`Node`],
          fields: {
            body: {
              type: `String`,
              resolve: () => `Mdx!`,
            },
          },
        })
      )
      createTypes(`
        type Mdx implements Node {
          body: String!
        }
      `)

      const schema = await buildSchema()
      const fields = schema.getType(`Mdx`).getFields()

      expect(fields.body.type.toString()).toBe(`String!`)
      expect(typeof fields.body.resolve).toBe(`function`)
      expect(await fields.body.resolve({}, {}, {}, { fieldName: `body` })).toBe(
        `Mdx!`
      )
    })

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

    it(`displays error message for reserved type names`, async () => {
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
      expect.assertions(4)
      for (const [name, def] of typeDefs) {
        store.dispatch({ type: `DELETE_CACHE` })
        createTypes(def)
        try {
          await buildSchema()
        } catch (error) {
          expect(error.message).toBe(
            `GraphQL type names ending with "FilterInput" or "SortInput" are ` +
              `reserved for internal use. Please rename \`${name}\`.`
          )
        }
      }
    })

    it(`displays error message for reserved built-in type names`, async () => {
      const typeDefs = [
        [`JSON`, `type JSON { foo: Boolean }`],
        [`Date`, new GraphQLObjectType({ name: `Date`, fields: {} })],
        [`Float`, buildObjectType({ name: `Float`, fields: {} })],
      ]
      expect.assertions(3)
      for (const [name, def] of typeDefs) {
        store.dispatch({ type: `DELETE_CACHE` })
        createTypes(def)
        try {
          await buildSchema()
        } catch (error) {
          expect(error.message).toBe(
            `The GraphQL type \`${name}\` is reserved for internal use by ` +
              `built-in scalar types.`
          )
        }
      }
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

    it(`allows modifying deeply nested inferred types`, async () => {
      createTypes(`
        type Nested implements Node @infer {
          name: String
        }

        type NestedNestedFoo {
          bar: Int
        }
      `)
      const node = {
        id: `nested1`,
        parent: null,
        children: [],
        internal: { type: `Nested`, contentDigest: `0` },
        name: `nested1`,
        nested: {
          foo: {
            bar: `str`,
            baz: 5,
          },
        },
      }
      store.dispatch(actions.createNode(node, { name: `test` }))
      const schema = await buildSchema()
      const print = type => printType(schema.getType(type))

      expect(print(`Nested`)).toMatchInlineSnapshot(`
        "type Nested implements Node {
          name: String
          nested: NestedNested
          id: ID!
          parent: Node
          children: [Node!]!
          internal: Internal!
        }"
      `)
      expect(print(`NestedNested`)).toMatchInlineSnapshot(`
        "type NestedNested {
          foo: NestedNestedFoo
        }"
      `)
      expect(print(`NestedNestedFoo`)).toMatchInlineSnapshot(`
        "type NestedNestedFoo {
          bar: Int
          baz: Int
        }"
      `)
    })

    it(`handles merging types when implemented interface wasn't defined yet`, async () => {
      createTypes(gql`
        # create initial type composer
        type TypeThatWillImplementInterface {
          sharedField: String
          originalField: String
        }

        # adjust type to implement not yet defined interface
        # this will trigger type merging
        type TypeThatWillImplementInterface implements CustomInterface {
          sharedField: String
          newField: String
        }

        # actually define interface (last)
        interface CustomInterface {
          sharedField: String
        }
      `)
      // implicit assertion is that building schema doesn't throw in the process
      const schema = await buildSchema()
      expect(printType(schema.getType(`CustomInterface`)))
        .toMatchInlineSnapshot(`
        "interface CustomInterface {
          sharedField: String
        }"
      `)

      expect(printType(schema.getType(`TypeThatWillImplementInterface`)))
        .toMatchInlineSnapshot(`
        "type TypeThatWillImplementInterface implements CustomInterface {
          sharedField: String
          originalField: String
          newField: String
        }"
      `)
    })

    itWhenV4(
      `Can reference derived types when merging types (v4)`,
      async () => {
        createTypes(gql`
          # create initial type composer
          type TypeCreatedBySourcePlugin implements Node {
            id: ID!
            someField: String
          }
        `)
        createTypes([
          buildInterfaceType({
            name: `SharedInterface`,
            fields: {
              id: `ID!`,
              child_items: {
                type: `[SharedInterface]`,
                args: {
                  // referencing derived type
                  sort: `SharedInterfaceSortInput`,
                },
              },
            },
            interfaces: [`Node`],
          }),
          buildObjectType({
            name: `TypeCreatedBySourcePlugin`,
            fields: {
              id: `ID!`,
              child_items: {
                type: `[SharedInterface]`,
                args: {
                  sort: `SharedInterfaceSortInput`,
                },
                resolve: (_, args) => [],
              },
            },
            interfaces: [`Node`, `SharedInterface`],
          }),
        ])

        // implicit assertion is that building schema doesn't throw in the process
        const schema = await buildSchema()
        expect(printType(schema.getType(`TypeCreatedBySourcePlugin`)))
          .toMatchInlineSnapshot(`
                  "type TypeCreatedBySourcePlugin implements Node & SharedInterface {
                    id: ID!
                    someField: String
                    child_items(sort: SharedInterfaceSortInput): [SharedInterface]
                    parent: Node
                    children: [Node!]!
                    internal: Internal!
                  }"
              `)

        expect(printType(schema.getType(`SharedInterfaceSortInput`)))
          .toMatchInlineSnapshot(`
                  "input SharedInterfaceSortInput {
                    fields: [SharedInterfaceFieldsEnum]
                    order: [SortOrderEnum] = [ASC]
                  }"
              `)
      }
    )

    itWhenV5(
      `Can reference derived types when merging types (v5)`,
      async () => {
        createTypes(gql`
          # create initial type composer
          type TypeCreatedBySourcePlugin implements Node {
            id: ID!
            someField: String
          }
        `)
        createTypes([
          buildInterfaceType({
            name: `SharedInterface`,
            fields: {
              id: `ID!`,
              child_items: {
                type: `[SharedInterface]`,
                args: {
                  // referencing derived type
                  sort: `SharedInterfaceSortInput`,
                },
              },
            },
            interfaces: [`Node`],
          }),
          buildObjectType({
            name: `TypeCreatedBySourcePlugin`,
            fields: {
              id: `ID!`,
              child_items: {
                type: `[SharedInterface]`,
                args: {
                  sort: `SharedInterfaceSortInput`,
                },
                resolve: (_, args) => [],
              },
            },
            interfaces: [`Node`, `SharedInterface`],
          }),
        ])

        // implicit assertion is that building schema doesn't throw in the process
        const schema = await buildSchema()
        expect(printType(schema.getType(`TypeCreatedBySourcePlugin`)))
          .toMatchInlineSnapshot(`
                  "type TypeCreatedBySourcePlugin implements Node & SharedInterface {
                    id: ID!
                    someField: String
                    child_items(sort: SharedInterfaceSortInput): [SharedInterface]
                    parent: Node
                    children: [Node!]!
                    internal: Internal!
                  }"
              `)

        expect(printType(schema.getType(`SharedInterfaceSortInput`)))
          .toMatchInlineSnapshot(`
          "input SharedInterfaceSortInput {
            id: SortOrderEnum
            child_items: SharedInterfaceSortInput
            parent: NodeSortInput
            children: NodeSortInput
            internal: InternalSortInput
          }"
        `)
      }
    )
  })

  it(`allows renaming and merging nested types`, async () => {
    createTypes(`
      type Nested implements Node {
        nested: SomeNewNameForNested
      }

      type SomeNewNameForNested {
        foo: String
      }
    `)
    const node = {
      id: `nested1`,
      parent: null,
      children: [],
      internal: { type: `Nested`, contentDigest: `0` },
      name: `nested1`,
      nested: {
        foo: {
          bar: `str`,
          baz: 5,
        },
        bar: `str`,
      },
    }
    store.dispatch(actions.createNode(node, { name: `test` }))
    const schema = await buildSchema()
    const print = type => printType(schema.getType(type))

    expect(print(`SomeNewNameForNested`)).toMatchInlineSnapshot(`
      "type SomeNewNameForNested {
        foo: String
        bar: String
      }"
    `)
    expect(schema.getType(`NestedNested`)).not.toBeDefined()
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
        await fields[`name`].resolve(
          { name: `Mikhail` },
          { withHello: true },
          withResolverContext({}, schema),
          {
            fieldName: `name`,
          }
        )
      ).toEqual(`Hello Mikhail`)
      expect(
        await fields[`name`].resolve(
          { name: `Mikhail` },
          { withHello: false },
          withResolverContext({}, schema),
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
        await fields[`name`].resolve(
          { name: `Mikhail` },
          { withHello: true },
          withResolverContext({}, schema),
          {
            fieldName: `name`,
          }
        )
      ).toEqual(`Hello Mikhail`)
      expect(
        await fields[`name`].resolve(
          { name: `Mikhail` },
          { withHello: false },
          withResolverContext({}, schema),
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
        await fields[`date`].resolve(
          { date: new Date(2019, 10, 10) },
          { formatString: `YYYY` },
          withResolverContext({}, schema),
          {
            fieldName: `date`,
          }
        )
      ).toEqual(`2019`)
      expect(
        await fields[`date`].resolve(
          { date: new Date(2010, 10, 10) },
          { formatString: `YYYY` },
          withResolverContext({}, schema),
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

const createTypes = (types, plugin) => {
  store.dispatch({ type: `CREATE_TYPES`, payload: types, plugin })
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

const getSchemaComposer = () => store.getState().schemaCustomization.composer

const addThirdPartySchema = async typeDefs => {
  const schemaComposer = new SchemaComposer()
  schemaComposer.addTypeDefs(typeDefs)
  const schema = schemaComposer.buildSchema()
  store.dispatch({ type: `ADD_THIRD_PARTY_SCHEMA`, payload: schema })
}
