// @flow

const { SchemaComposer } = require(`graphql-compose`)
const {
  graphql,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLList,
  GraphQLObjectType,
  getNamedType,
  parse,
  print,
} = require(`graphql`)
const { store } = require(`../../redux`)
const { actions } = require(`../../redux/actions`)
const { build } = require(`../index`)
const fs = require(`fs-extra`)
const path = require(`path`)
const { slash } = require(`gatsby-core-utils`)
const withResolverContext = require(`../context`)
const { tranformDocument } = require(`../../query/transform-document`)

jest.mock(`../../utils/api-runner-node`)
const apiRunnerNode = require(`../../utils/api-runner-node`)

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

// XXX(freiksenet): Expand
describe(`Kitchen sink schema test`, () => {
  let schema
  let schemaComposer

  const runQuery = query => {
    if (_CFLAGS_.GATSBY_MAJOR === `5`) {
      const inputAst = typeof query === `string` ? parse(query) : query
      const { ast } = tranformDocument(inputAst)
      query = print(ast)
    }

    return graphql({
      schema,
      source: query,
      rootValue: undefined,
      contextValue: withResolverContext({
        schema,
        schemaComposer,
        context: {},
        customContext: {},
      }),
    })
  }

  beforeAll(async () => {
    apiRunnerNode.mockImplementation((api, ...args) => {
      if (api === `setFieldsOnGraphQLNodeType`) {
        return mockSetFieldsOnGraphQLNodeType(...args)
      } else if (api === `createResolvers`) {
        return mockCreateResolvers(...args)
      } else {
        return []
      }
    })

    const nodes = JSON.parse(
      fs
        .readFileSync(
          path.join(__dirname, `./fixtures/kitchen-sink.json`),
          `utf-8`
        )
        .replace(/<PROJECT_ROOT>/g, slash(process.cwd()))
    )

    store.dispatch({ type: `DELETE_CACHE` })
    nodes.forEach(node =>
      actions.createNode(node, { name: `test` })(store.dispatch)
    )

    store.dispatch({
      type: `CREATE_TYPES`,
      payload: `
        interface Post implements Node {
          id: ID!
          code: String
        }
        type PostsJson implements Node & Post @infer {
          id: ID!
          time: Date @dateformat(locale: "fi", formatString: "DD MMMM")
          code: String
          image: File @fileByRelativePath
        }

      `,
    })
    buildThirdPartySchemas().forEach(schema =>
      store.dispatch({
        type: `ADD_THIRD_PARTY_SCHEMA`,
        payload: schema,
      })
    )
    await build({})
    schema = store.getState().schema
    schemaComposer = store.getState().schemaCustomization.composer
  })

  it(`passes kitchen sink query`, async () => {
    expect(
      await runQuery(`
        {
          interface: allPost(sort: { fields: id }, limit: 1) {
            nodes {
              id
              code
              ... on PostsJson {
                time
                image {
                  childImageSharp {
                    id
                  }
                  childrenImageSharp {
                    id
                  }
                }
              }
            }
          }
          sort: allPostsJson(sort: { fields: likes, order: ASC }, limit: 2) {
            edges {
              node {
                id
                idWithDecoration
                time(formatString: "DD.MM.YYYY")
                localeString: time(locale: "ru")
                localeFormat: time(formatString: "DD MMMM YYYY")
                defaultTime: time
                code
                likes
                comment
                image {
                  childImageSharp {
                    id
                  }
                  childrenImageSharp {
                    id
                  }
                }
                _3invalidKey
              }
            }
          }
          filter: allPostsJson(filter: { likes: { eq: null } }, limit: 2) {
            edges {
              node {
                id
                comment
              }
            }
          }
          resolveFilter: postsJson(
            idWithDecoration: { eq: "decoration-1601601194425654597" }
          ) {
            id
            idWithDecoration
            likes
          }
          createResolvers: likedEnough {
            id
            likes
            code
          }
          thirdPartyStuff {
            text
            child {
              ... on ThirdPartyStuff {
                text
              }
              ... on ThirdPartyStuff2 {
                foo
              }
            }
          }
          thirdPartyUnion {
            ... on ThirdPartyStuff {
              text
            }
            ... on ThirdPartyStuff2 {
              foo
            }
          }
          thirdPartyInterface {
            ... on ThirdPartyStuff3 {
              text
            }
          }
          builtIntPage: sitePage(id: { eq: "SitePage /1685001452849004065/" }) {
            pageContext
          }
        }
      `)
    ).toMatchSnapshot()
  }, 30000)

  it(`correctly resolves nested Query types from third-party types`, () => {
    const queryFields = schema.getQueryType().getFields()
    ;[`relay`, `relay2`, `query`, `manyQueries`].forEach(fieldName =>
      expect(getNamedType(queryFields[fieldName].type)).toBe(
        schema.getQueryType()
      )
    )
    expect(schema.getType(`Nested`).getFields().query.type).toBe(
      schema.getQueryType()
    )
  })
})

const buildThirdPartySchemas = () => {
  const schemaComposer = new SchemaComposer()
  schemaComposer.addTypeDefs(`
    type ThirdPartyStuff {
      text: String
      child: ThirdPartyUnion2
    }

    type ThirdPartyStuff2 {
      foo: String
    }

    union ThirdPartyUnion = ThirdPartyStuff | ThirdPartyStuff2

    interface ThirdPartyInterface {
      text: String
      relay: Query
    }

    type ThirdPartyStuff3 implements ThirdPartyInterface {
      text: String
      relay: Query
    }

    union ThirdPartyUnion2 = ThirdPartyStuff | ThirdPartyStuff2

    type Query {
      thirdPartyStuff: ThirdPartyStuff
      thirdPartyUnion: ThirdPartyUnion
      thirdPartyInterface: ThirdPartyInterface
      relay: Query
      relay2: [Query]!
    }
  `)
  schemaComposer
    .getUTC(`ThirdPartyUnion`)
    .setResolveType(() => `ThirdPartyStuff`)
  schemaComposer
    .getUTC(`ThirdPartyUnion2`)
    .setResolveType(() => `ThirdPartyStuff`)
  schemaComposer
    .getIFTC(`ThirdPartyInterface`)
    .setResolveType(() => `ThirdPartyStuff3`)
  schemaComposer.Query.extendField(`thirdPartyStuff`, {
    resolve() {
      return {
        text: `Hello third-party schema!`,
        child: {
          text: `Hello from children!`,
        },
      }
    },
  })
  schemaComposer.Query.extendField(`thirdPartyUnion`, {
    resolve() {
      return {
        text: `Hello third-party schema!`,
        child: {
          text: `Hello from children!`,
        },
      }
    },
  })
  schemaComposer.Query.extendField(`thirdPartyInterface`, {
    resolve() {
      return {
        text: `Hello third-party schema!`,
      }
    },
  })
  schemaComposer.addSchemaMustHaveType(
    schemaComposer.getOTC(`ThirdPartyStuff3`)
  )

  // Query type with non-default name
  const RootQueryType = new GraphQLObjectType({
    name: `RootQueryType`,
    fields: () => {
      return {
        query: { type: RootQueryType },
        manyQueries: {
          type: new GraphQLNonNull(new GraphQLList(RootQueryType)),
        },
        nested: { type: Nested },
      }
    },
  })
  const Nested = new GraphQLObjectType({
    name: `Nested`,
    fields: () => {
      return {
        query: { type: RootQueryType },
      }
    },
  })
  const schema = new GraphQLSchema({ query: RootQueryType })

  return [schemaComposer.buildSchema(), schema]
}

const mockSetFieldsOnGraphQLNodeType = async ({ type: { name } }) => {
  if (name === `PostsJson`) {
    return [
      {
        idWithDecoration: {
          type: `String`,
          resolve(parent) {
            return `decoration-${parent.id}`
          },
        },
      },
    ]
  } else {
    return []
  }
}

const mockCreateResolvers = ({ createResolvers }) => {
  createResolvers({
    Query: {
      likedEnough: {
        type: `[PostsJson]`,
        async resolve(parent, args, context) {
          const { entries } = await context.nodeModel.findAll({
            type: `PostsJson`,
            query: {
              limit: 2,
              skip: 0,
              filter: {
                likes: {
                  ne: null,
                  gt: 5,
                },
              },
              sort: {
                fields: [`likes`],
                order: [`DESC`],
              },
            },
          })
          return entries
        },
      },
    },
  })
}
