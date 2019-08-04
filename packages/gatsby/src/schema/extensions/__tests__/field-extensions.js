const { GraphQLString, graphql, defaultFieldResolver } = require(`graphql`)
const { build } = require(`../..`)
const withResolverContext = require(`../../context`)
const { buildObjectType } = require(`../../types/type-builders`)
const { store } = require(`../../../redux`)
const { dispatch } = store
const { actions } = require(`../../../redux/actions/restricted`)
const { createFieldExtension, createTypes } = actions
require(`../../../db/__tests__/fixtures/ensure-loki`)()

const report = require(`gatsby-cli/lib/reporter`)
report.error = jest.fn()
report.panic = jest.fn()
afterEach(() => {
  report.error.mockClear()
  report.panic.mockClear()
})

describe(`GraphQL field extensions`, () => {
  beforeEach(() => {
    dispatch({ type: `DELETE_CACHE` })
    const nodes = [
      {
        id: `test1`,
        internal: { type: `Test` },
        somedate: `2019-09-01`,
        otherdate: `2019-09-01`,
      },
      {
        id: `test2`,
        internal: { type: `Test` },
        somedate: `2019-09-13`,
        otherdate: `2019-09-13`,
      },
      {
        id: `test3`,
        internal: { type: `Test` },
        somedate: `2019-09-26`,
        otherdate: `2019-09-26`,
      },
      {
        id: `test4`,
        internal: { type: `Test` },
        olleh: `world`,
      },
      {
        id: `test5`,
        internal: { type: `AnotherTest` },
        date: `2019-01-01`,
      },
      {
        id: `test6`,
        internal: { type: `AnotherTest` },
        date: 0,
      },
    ]
    nodes.forEach(node => {
      dispatch({ type: `CREATE_NODE`, payload: { ...node } })
    })
  })

  it(`allows creating a custom field extension`, async () => {
    dispatch(
      createFieldExtension({
        name: `birthday`,
        args: {
          greeting: {
            type: GraphQLString,
          },
        },
        extend(options, prevFieldConfig) {
          return {
            type: `String`,
            args: {
              emoji: {
                type: `Boolean`,
              },
            },
            resolve(source, args, context, info) {
              const fieldValue = source[info.fieldName]
              const date = new Date(fieldValue)
              if (date.getUTCMonth() === 8 && date.getUTCDate() === 26) {
                return args.emoji
                  ? `:cake:`
                  : options.greeting || `Happy birthday!`
              }
              return fieldValue
            },
          }
        },
      })
    )
    dispatch(
      createTypes(`
        type Test implements Node @dontInfer {
          somedate: Date @birthday(greeting: "Cheers!")
          otherdate: Date @birthday
        }
      `)
    )
    const query = `
      {
        test(id: { eq: "test3" }) {
          withDefaultArgs: somedate
          withQueryArg: somedate(emoji: true)
          withoutArgs: otherdate
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      test: {
        withQueryArg: `:cake:`,
        withDefaultArgs: `Cheers!`,
        withoutArgs: `Happy birthday!`,
      },
    }
    expect(results).toEqual(expected)
  })

  it(`allows creating a custom field extension (used in type builder)`, async () => {
    dispatch(
      createFieldExtension({
        name: `birthday`,
        args: {
          greeting: {
            type: GraphQLString,
          },
        },
        extend(options, prevFieldConfig) {
          return {
            type: `String`,
            args: {
              emoji: {
                type: `Boolean`,
              },
            },
            resolve(source, args, context, info) {
              const fieldValue = source[info.fieldName]
              const date = new Date(fieldValue)
              if (date.getUTCMonth() === 8 && date.getUTCDate() === 26) {
                return args.emoji
                  ? `:cake:`
                  : options.greeting || `Happy birthday!`
              }
              return fieldValue
            },
          }
        },
      })
    )
    dispatch(
      createTypes(
        buildObjectType({
          name: `Test`,
          fields: {
            somedate: {
              type: `Date`,
              extensions: {
                birthday: {
                  greeting: `Cheers!`,
                },
              },
            },
            otherdate: {
              type: `Date`,
              extensions: {
                birthday: {},
              },
            },
          },
          interfaces: [`Node`],
          extensions: { infer: false },
        })
      )
    )
    const query = `
      {
        test(id: { eq: "test3" }) {
          withDefaultArgs: somedate
          withQueryArg: somedate(emoji: true)
          withoutArgs: otherdate
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      test: {
        withQueryArg: `:cake:`,
        withDefaultArgs: `Cheers!`,
        withoutArgs: `Happy birthday!`,
      },
    }
    expect(results).toEqual(expected)
  })

  it(`creates built-in field extensions`, async () => {
    dispatch(
      createTypes(`
        type Test implements Node @dontInfer {
          somedate: Date @dateformat
          proxy: Date @proxy(from: "somedate")
        }
      `)
    )
    const query = `
      {
        test(id: { eq: "test3" }) {
          somedate(formatString: "YYYY")
          proxy
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      test: {
        proxy: `2019-09-26`,
        somedate: `2019`,
      },
    }
    expect(results).toEqual(expected)
  })

  it(`allows specifying extension options with type string`, async () => {
    dispatch(
      createFieldExtension({
        name: `hello`,
        args: {
          planet: {
            // type provided as string
            type: `String`,
          },
        },
        extend(options) {
          return {
            resolve() {
              return options.planet || `world`
            },
          }
        },
      })
    )
    dispatch(
      createTypes(
        `type Test implements Node {
          hello: String @hello
          hi: String @hello(planet: "mars")
        }`
      )
    )
    const query = `
      {
        test {
          hello
          hi
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      test: {
        hello: `world`,
        hi: `mars`,
      },
    }
    expect(results).toEqual(expected)
  })

  it(`allows specifying extension options with flat type string`, async () => {
    dispatch(
      createFieldExtension({
        name: `hello`,
        args: {
          // type provided as flat string
          planet: `String`,
        },
        extend(options) {
          return {
            resolve() {
              return options.planet || `world`
            },
          }
        },
      })
    )
    dispatch(
      createTypes(
        `type Test implements Node {
          hello: String @hello
          hi: String @hello(planet: "mars")
        }`
      )
    )
    const query = `
      {
        test {
          hello
          hi
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      test: {
        hello: `world`,
        hi: `mars`,
      },
    }
    expect(results).toEqual(expected)
  })

  it(`allows specifying extension options with default value`, async () => {
    dispatch(
      createFieldExtension({
        name: `hello`,
        args: {
          planet: {
            type: `String!`,
            defaultValue: `world`,
          },
        },
        extend(options) {
          return {
            resolve() {
              return options.planet
            },
          }
        },
      })
    )
    dispatch(
      createTypes(
        `type Test implements Node {
          hello: String @hello
          hi: String @hello(planet: "mars")
        }`
      )
    )
    const query = `
      {
        test {
          hello
          hi
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      test: {
        hello: `world`,
        hi: `mars`,
      },
    }
    expect(results).toEqual(expected)
  })

  it(`allows specifying extension options with default value (type builder)`, async () => {
    dispatch(
      createFieldExtension({
        name: `hello`,
        args: {
          planet: {
            type: `String!`,
            defaultValue: `world`,
          },
        },
        extend(options) {
          return {
            resolve() {
              return options.planet
            },
          }
        },
      })
    )
    dispatch(
      createTypes(
        buildObjectType({
          name: `Test`,
          interfaces: [`Node`],
          fields: {
            hello: {
              type: `String`,
              extensions: {
                hello: {},
              },
            },
            hi: {
              type: `String`,
              extensions: {
                hello: { planet: `mars` },
              },
            },
          },
        })
      )
    )
    const query = `
      {
        test {
          hello
          hi
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      test: {
        hello: `world`,
        hi: `mars`,
      },
    }
    expect(results).toEqual(expected)
  })

  it(`allows List and NonNull type modifiers in extension type`, async () => {
    dispatch(
      createFieldExtension({
        name: `hello`,
        args: {
          planets: {
            type: `[String!]`,
            defaultValue: [`world`],
          },
        },
        extend(options) {
          return {
            resolve() {
              return options.planets
            },
          }
        },
      })
    )
    dispatch(
      createTypes(
        `type Test implements Node {
          hello: [String] @hello
          hi: [String] @hello(planets: ["mars", "venus"])
        }`
      )
    )
    const query = `
      {
        test {
          hello
          hi
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      test: {
        hello: [`world`],
        hi: [`mars`, `venus`],
      },
    }
    expect(results).toEqual(expected)
  })

  it(`allows wrapping existing field resolver`, async () => {
    dispatch(
      createFieldExtension({
        name: `hello`,
        args: {
          planet: `String`,
        },
        extend(options, prevFieldConfig) {
          const { resolve } = prevFieldConfig
          return {
            resolve(...rp) {
              const planet = resolve(...rp)
              return options.planet
                ? [planet, options.planet].join(`, `)
                : planet
            },
          }
        },
      })
    )
    dispatch(
      createTypes(
        buildObjectType({
          name: `Test`,
          interfaces: [`Node`],
          fields: {
            hello: {
              type: `String`,
              resolve: () => `world`,
              extensions: { hello: {} },
            },
            hi: {
              type: `String`,
              resolve: () => `world`,
              extensions: { hello: { planet: `mars` } },
            },
          },
        })
      )
    )
    const query = `
      {
        test {
          hello
          hi
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      test: {
        hello: `world`,
        hi: `world, mars`,
      },
    }
    expect(results).toEqual(expected)
  })

  // TODO: Decide on intended behavior
  it(`input type reflects changed type when extension changes field type`, async () => {
    dispatch(
      createFieldExtension({
        name: `hello`,
        extend(options) {
          return {
            type: `String`,
            resolve: () => `world`,
          }
        },
      })
    )
    dispatch(
      createTypes(
        `type Test implements Node {
          hello: Boolean @hello
        }`
      )
    )
    const query = `
      {
        test {
          hello
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      test: {
        hello: `world`,
      },
    }
    expect(results).toEqual(expected)
    const { hello } = store
      .getState()
      .schema.getType(`TestFilterInput`)
      .getFields()
    expect(hello.type.toString()).toBe(`StringQueryOperatorInput`)
  })

  it(`handles multiple extensions per field`, async () => {
    dispatch(
      createFieldExtension({
        name: `uppercase`,
        extend(options, prevFieldConfig) {
          const originalResolver =
            prevFieldConfig.resolve || defaultFieldResolver
          return {
            type: `String`,
            async resolve(...rp) {
              const resolved = await originalResolver(...rp)
              return String(resolved).toUpperCase()
            },
          }
        },
      })
    )
    dispatch(
      createFieldExtension({
        name: `reverse`,
        extend(options, prevFieldConfig) {
          const originalResolver =
            prevFieldConfig.resolve || defaultFieldResolver
          return {
            type: `String`,
            async resolve(...rp) {
              const resolved = await originalResolver(...rp)
              return [...String(resolved)].reverse().join(``)
            },
          }
        },
      })
    )
    dispatch(
      createTypes(
        `type Test implements Node {
          olleh: String @uppercase @reverse
        }`
      )
    )
    const query = `
      {
        test(id: { eq: "test4" }) {
          olleh
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      test: {
        olleh: `DLROW`,
      },
    }
    expect(results).toEqual(expected)
  })

  it(`shows error message when extension name is reserved`, async () => {
    dispatch(
      createFieldExtension({
        name: `dateformat`,
        extend: () => {
          return {}
        },
      })
    )
    const schema = await buildSchema()
    expect(report.error).toBeCalledWith(
      `The field extension name \`dateformat\` is reserved for internal use.`
    )
    const directive = schema.getDirective(`dateformat`)
    expect(directive).toBeDefined()
    expect(directive.args).toHaveLength(4)
  })

  it(`shows error message when extension is already defined`, async () => {
    dispatch(
      createFieldExtension({
        name: `hello`,
        args: {},
        extend: () => {
          return {
            resolve: () => `world`,
          }
        },
      })
    )
    dispatch(
      createFieldExtension({
        name: `hello`,
        args: {
          planet: `String`,
        },
        extend: () => {
          return {
            resolve: () => `again`,
          }
        },
      })
    )
    const schema = await buildSchema()
    expect(report.error).toBeCalledWith(
      `A field extension with the name \`hello\` has already been registered.`
    )
    const directive = schema.getDirective(`hello`)
    expect(directive).toBeDefined()
    expect(directive.args).toHaveLength(0)
  })

  it(`shows error message when no extension name provided`, () => {
    dispatch(
      createFieldExtension({
        args: {},
        extend: () => {
          return {
            resolve: () => `world`,
          }
        },
      })
    )
    expect(report.error).toBeCalledWith(
      `The provided field extension must have a \`name\` property.`
    )
  })

  // FIXME: error message for directive is different from extension error,
  // because directive is checked before by graphql-compose. also: we get
  // parsing panics, not error messages.
  // we get an extension option with a wrong type
  it(`validates type of extension options`, async () => {
    dispatch(
      createFieldExtension({
        name: `hello`,
        args: {
          planet: `String`,
        },
        extend(options) {
          return {
            resolve() {
              return options.planet || `world`
            },
          }
        },
      })
    )
    dispatch(
      createTypes(
        `type Test implements Node {
          hi: String @hello(planet: 2)
        }`
      )
    )
    await buildSchema({})
    expect(report.panic).toBeCalledWith(
      expect.stringContaining(
        `Encountered an error parsing the provided GraphQL type definitions:\n` +
          `Argument "planet" has invalid value 2.`
      )
    )
  })

  // we get an extension option with a wrong type
  it(`validates type of extension options (type builder)`, async () => {
    dispatch(
      createFieldExtension({
        name: `hello`,
        args: {
          planet: `String`,
        },
        extend(options) {
          return {
            resolve() {
              return options.planet || `world`
            },
          }
        },
      })
    )
    dispatch(
      createTypes(
        buildObjectType({
          name: `Test`,
          interfaces: [`Node`],
          fields: {
            hi: {
              type: `String`,
              extensions: {
                hello: {
                  planet: 2,
                },
              },
            },
          },
        })
      )
    )
    await buildSchema({})
    expect(report.error).toBeCalledWith(
      `Field extension \`hello\` on \`Test.hi\` has argument \`planet\` with ` +
        `invalid value "2". String cannot represent a non string value: 2`
    )
  })

  // FIXME: See above (directive error messages different than with extensions,
  // because they are reported as parsing errors (which are panics, not errors))
  it(`validates non-null and list types of extension options`, async () => {
    dispatch(
      createFieldExtension({
        name: `test`,
        args: {
          one: `Int!`,
          two: `[Int]`,
          three: `[Int!]!`,
        },
        extend(options) {
          return {
            resolve() {
              return options.planet || `world`
            },
          }
        },
      })
    )
    dispatch(
      createTypes([
        `type Test implements Node {
          first: String @test(one: 1, two: [1], three: [1])
          second: String @test(one: "1", two: [1], three: [1])
        }`,
        `type Test implements Node {
          third: String @test(two: [1], one: 1, three: [1])
          fourth: String @test(two: ["1"], one: 1, three: [1])
        }`,
        `type Test implements Node {
          fifth: String @test(three: [1], one: 1, two: [1])
          sixth: String @test(three: [], one: 1, two: [1])
          seventh: String @test(three: [null], one: 1, two: [1])
        }`,
      ])
    )
    await buildSchema({})
    expect(report.panic).toBeCalledWith(
      expect.stringContaining(
        `Encountered an error parsing the provided GraphQL type definitions:\n` +
          `Argument "one" has invalid value "1".`
      )
    )
    expect(report.panic).toBeCalledWith(
      expect.stringContaining(
        `Encountered an error parsing the provided GraphQL type definitions:\n` +
          `Argument "two" has invalid value ["1"].`
      )
    )
    expect(report.panic).toBeCalledWith(
      expect.stringContaining(
        `Encountered an error parsing the provided GraphQL type definitions:\n` +
          `Argument "three" has invalid value [null].`
      )
    )
  })

  it(`validates non-null and list types of extension options (type builder)`, async () => {
    dispatch(
      createFieldExtension({
        name: `test`,
        args: {
          one: `Int!`,
          two: `[Int]`,
          three: `[Int!]!`,
        },
        extend(options) {
          return {
            resolve() {
              return options.planet || `world`
            },
          }
        },
      })
    )
    dispatch(
      createTypes([
        buildObjectType({
          name: `Test`,
          interfaces: [`Node`],
          fields: {
            first: {
              type: `String`,
              extensions: {
                test: {
                  one: 1,
                  two: [1],
                  three: [1],
                },
              },
            },
            second: {
              type: `String`,
              extensions: {
                test: {
                  one: `1`,
                  two: [1],
                  three: [1],
                },
              },
            },
          },
        }),
        buildObjectType({
          name: `Test`,
          interfaces: [`Node`],
          fields: {
            third: {
              type: `String`,
              extensions: {
                test: {
                  two: [1],
                  one: 1,
                  three: [1],
                },
              },
            },
            fourth: {
              type: `String`,
              extensions: {
                test: {
                  two: [`1`],
                  one: 1,
                  three: [1],
                },
              },
            },
          },
        }),
        buildObjectType({
          name: `Test`,
          interfaces: [`Node`],
          fields: {
            fifth: {
              type: `String`,
              extensions: {
                test: {
                  three: [1],
                  one: 1,
                  two: [1],
                },
              },
            },
            sixth: {
              type: `String`,
              extensions: {
                test: {
                  three: [],
                  one: 1,
                  two: [1],
                },
              },
            },
            seventh: {
              type: `String`,
              extensions: {
                test: {
                  three: [null],
                  one: 1,
                  two: [1],
                },
              },
            },
          },
        }),
      ])
    )
    await buildSchema({})
    expect(report.error).toBeCalledWith(
      `Field extension \`test\` on \`Test.second\` has argument \`one\` with ` +
        `invalid value "1". Int cannot represent non-integer value: "1"`
    )
    expect(report.error).toBeCalledWith(
      `Field extension \`test\` on \`Test.fourth\` has argument \`two\` with ` +
        `invalid value "1". Int cannot represent non-integer value: "1"`
    )
    expect(report.error).toBeCalledWith(
      `Field extension \`test\` on \`Test.seventh\` has argument \`three\` with ` +
        `invalid value "". Expected non-null field value.`
    )
  })

  // FIXME: `graphql-compose` (in `parseDirectives`) silently omits invalid extension options.
  // we get an extension option that has not been defined.
  it.skip(`validates non-existing extension options`, async () => {
    dispatch(
      createFieldExtension({
        name: `hello`,
        args: {
          planet: `String`,
        },
        extend(options) {
          return {
            resolve() {
              return options.planet || `world`
            },
          }
        },
      })
    )
    dispatch(
      createTypes(
        `type Test implements Node {
          hi: String @hello(what: 2)
        }`
      )
    )
    await buildSchema({})
    expect(report.error).toBeCalledWith(`Some error message`)
  })

  // we get an extension option that has not been defined.
  it(`validates non-existing extension options (type builder)`, async () => {
    dispatch(
      createFieldExtension({
        name: `hello`,
        args: {
          planet: `String`,
        },
        extend(options) {
          return {
            resolve() {
              return options.planet || `world`
            },
          }
        },
      })
    )
    dispatch(
      createTypes(
        buildObjectType({
          name: `Test`,
          interfaces: [`Node`],
          fields: {
            hi: {
              type: `String`,
              extensions: {
                hello: {
                  what: 2,
                },
              },
            },
          },
        })
      )
    )
    await buildSchema({})
    expect(report.error).toBeCalledWith(
      `Field extension \`hello\` on \`Test.hi\` has invalid argument \`what\`.`
    )
  })

  // we get an extension that has not been defined
  it(`validates non-existing extension`, async () => {
    dispatch(
      createTypes(
        `type Test implements Node {
          hi: String @what(what: 2)
        }`
      )
    )
    await buildSchema({})
    expect(report.error).toBeCalledWith(
      `Field extension \`what\` on \`Test.hi\` is not available.`
    )
  })

  // we get an extension that has not been defined
  it(`validates non-existing extension (type builder)`, async () => {
    dispatch(
      createTypes(
        buildObjectType({
          name: `Test`,
          interfaces: [`Node`],
          fields: {
            hi: {
              type: `String`,
              extensions: {
                what: {
                  what: 2,
                },
              },
            },
          },
        })
      )
    )
    await buildSchema({})
    expect(report.error).toBeCalledWith(
      `Field extension \`what\` on \`Test.hi\` is not available.`
    )
  })

  it(`built-in extensions wrap resolver`, async () => {
    dispatch(
      createFieldExtension({
        name: `zeroToNull`,
        extend(options, prevFieldConfig) {
          const originalResolver =
            prevFieldConfig.resolve || defaultFieldResolver
          return {
            async resolve(...rp) {
              const fieldValue = await originalResolver(...rp)
              if (fieldValue === 0) {
                return null
              }
              return fieldValue
            },
          }
        },
      })
    )
    dispatch(
      createTypes(`
        type AnotherTest implements Node {
          date: Date @zeroToNull @dateformat
          reverse: Date @dateformat @zeroToNull @proxy(from: "date")
        }
      `)
    )
    const query = `
      {
        allAnotherTest {
          nodes {
            date(formatString: "MM/DD/YYYY")
            reverse(formatString: "MM/DD/YYYY")
          }
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      allAnotherTest: {
        nodes: [
          {
            date: `01/01/2019`,
            reverse: `01/01/2019`,
          },
          {
            date: null,
            reverse: `Invalid date`,
          },
        ],
      },
    }
    expect(results).toEqual(expected)
  })

  it(`built-in extensions merge extension args`, async () => {
    dispatch(
      createFieldExtension({
        name: `replace`,
        extend(options, prevFieldConfig) {
          const originalResolver =
            prevFieldConfig.resolve || defaultFieldResolver
          return {
            args: {
              ...prevFieldConfig.args,
              match: `String!`,
              replaceWith: `String!`,
            },
            async resolve(source, args, context, info) {
              const fieldValue = await originalResolver(
                source,
                args,
                context,
                info
              )
              if (fieldValue == args.match) {
                return args.replaceWith
              }
              return fieldValue
            },
          }
        },
      })
    )
    dispatch(
      createTypes(`
        type AnotherTest implements Node {
          date: Date @replace @dateformat
          reverse: Date @dateformat @replace @proxy(from: "date")
        }
      `)
    )
    const query = `
      {
        allAnotherTest {
          nodes {
            date(formatString: "MM/DD/YYYY", match: "0", replaceWith: "1978-09-26")
            reverse(formatString: "MM/DD/YYYY", match: "Invalid date", replaceWith: "WRONG!")
          }
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      allAnotherTest: {
        nodes: [
          {
            date: `01/01/2019`,
            reverse: `01/01/2019`,
          },
          {
            date: `09/26/1978`,
            reverse: `WRONG!`,
          },
        ],
      },
    }
    expect(results).toEqual(expected)
  })

  it(`built-in extensions wraps custom resolver`, async () => {
    dispatch(
      createTypes(
        buildObjectType({
          name: `AnotherTest`,
          interfaces: [`Node`],
          fields: {
            date: {
              type: `Date`,
              extensions: {
                dateformat: true,
              },
              args: {
                replaceZeroWith: `String!`,
              },
              resolve(source, args, context, info) {
                const fieldValue = source[info.fieldName]
                if (fieldValue === 0) {
                  return args.alt
                }
                return fieldValue
              },
            },
          },
        })
      )
    )
    const query = `
      {
        allAnotherTest {
          nodes {
            date(formatString: "MM/DD/YYYY", replaceZeroWith: "1978-09-26")
          }
        }
      }
    `
    const results = await runQuery(query)
    const expected = {
      allAnotherTest: {
        nodes: [
          {
            date: `01/01/2019`,
          },
          {
            date: null,
          },
        ],
      },
    }
    expect(results).toEqual(expected)
  })
})

const buildSchema = async () => {
  await build({})
  return store.getState().schema
}

const runQuery = async query => {
  const schema = await buildSchema()
  const results = await graphql(
    schema,
    query,
    undefined,
    withResolverContext({})
  )
  expect(results.errors).toBeUndefined()
  return results.data
}
