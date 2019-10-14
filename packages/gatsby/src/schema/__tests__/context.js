const { graphql } = require(`graphql`)
const { build } = require(`..`)
const withResolverContext = require(`../context`)
const { buildObjectType } = require(`../types/type-builders`)
const { store } = require(`../../redux`)
const { dispatch } = store
const { actions } = require(`../../redux/actions/restricted`)
const { createTypes, createFieldExtension, createResolverContext } = actions
require(`../../db/__tests__/fixtures/ensure-loki`)()

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
const report = require(`gatsby-cli/lib/reporter`)
afterEach(() => {
  report.error.mockClear()
})

describe(`Resolver context`, () => {
  beforeEach(() => {
    dispatch({ type: `DELETE_CACHE` })
    const nodes = [
      {
        id: `test1`,
        internal: {
          type: `Test`,
          contentDigest: `test1`,
        },
      },
    ]
    nodes.forEach(node => {
      dispatch({ type: `CREATE_NODE`, payload: { ...node } })
    })
  })

  describe(`createResolverContext action`, () => {
    it(`allows extending resolver context`, async () => {
      dispatch(
        createResolverContext({
          hello(planet) {
            return `Hello ${planet}!`
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
                type: `String!`,
                args: {
                  planet: {
                    type: `String!`,
                    defaultValue: `World`,
                  },
                },
                resolve(source, args, context, info) {
                  return context.hello(args.planet)
                },
              },
            },
          })
        )
      )
      const query = `
        {
          test {
            world: hello
            mars: hello(planet: "Mars")
          }
        }
      `
      const results = await runQuery(query)
      const expected = {
        test: {
          world: `Hello World!`,
          mars: `Hello Mars!`,
        },
      }
      expect(results).toEqual(expected)
    })

    it(`custom resolver context is avalable in custom field extension`, async () => {
      dispatch(
        createResolverContext({
          hello(planet) {
            return `Hello ${planet}!`
          },
        })
      )
      dispatch(
        createFieldExtension({
          name: `hello`,
          extend() {
            return {
              args: {
                planet: {
                  type: `String!`,
                  defaultValue: `World`,
                },
              },
              resolve(source, args, context, info) {
                return context.hello(args.planet)
              },
            }
          },
        })
      )
      dispatch(
        createTypes(`
          type Test implements Node {
            hello: String @hello
          }
        `)
      )
      const query = `
        {
          test {
            world: hello
            mars: hello(planet: "Mars")
          }
        }
      `
      const results = await runQuery(query)
      const expected = {
        test: {
          world: `Hello World!`,
          mars: `Hello Mars!`,
        },
      }
      expect(results).toEqual(expected)
    })

    it(`correctly namespaces context value by plugin name`, async () => {
      const plugin = { name: `gatsby-transformer-hello` }
      dispatch(
        createResolverContext(
          {
            hello(planet) {
              return `Hello ${planet}!`
            },
          },
          plugin
        )
      )
      dispatch(
        createTypes(
          buildObjectType({
            name: `Test`,
            interfaces: [`Node`],
            fields: {
              hello: {
                type: `String!`,
                args: {
                  planet: {
                    type: `String!`,
                    defaultValue: `World`,
                  },
                },
                resolve(source, args, context, info) {
                  // Custom context value under namespace
                  return context.transformerHello.hello(args.planet)
                },
              },
            },
          }),
          plugin
        )
      )
      const query = `
        {
          test {
            world: hello
            mars: hello(planet: "Mars")
          }
        }
      `
      const results = await runQuery(query)
      const expected = {
        test: {
          world: `Hello World!`,
          mars: `Hello Mars!`,
        },
      }
      expect(results).toEqual(expected)
    })

    it(`shows error when no context value passed`, () => {
      dispatch(createResolverContext())
      expect(report.error).toBeCalledWith(
        `Expected context value passed to \`createResolverContext\` to be an ` +
          `object. Received "undefined".`
      )
    })

    it(`shows error when context value is not an object`, () => {
      dispatch(createResolverContext(() => {}))
      expect(report.error).toBeCalledWith(
        `Expected context value passed to \`createResolverContext\` to be an ` +
          `object. Received "() => {}".`
      )
    })
  })
})

const runQuery = async query => {
  await build({})
  const { schema, schemaCustomization } = store.getState()
  const results = await graphql(
    schema,
    query,
    undefined,
    withResolverContext({
      schema,
      schemaComposer: schemaCustomization.composer,
      customContext: schemaCustomization.context,
    })
  )
  expect(results.errors).toBeUndefined()
  return results.data
}
