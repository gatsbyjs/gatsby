// @flow

const { SchemaComposer } = require(`graphql-compose`)
const { graphql } = require(`graphql`)
const { store } = require(`../../redux`)
const { build } = require(`../index`)
const fs = require(`fs-extra`)
const path = require(`path`)
const slash = require(`slash`)
const withResolverContext = require(`../context`)
require(`../../db/__tests__/fixtures/ensure-loki`)()

jest.mock(`../../utils/api-runner-node`)
const apiRunnerNode = require(`../../utils/api-runner-node`)

// XXX(freiksenet): Expand
describe(`Kichen sink schema test`, () => {
  let schema

  const runQuery = query =>
    graphql(schema, query, undefined, withResolverContext({}, schema))

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
      store.dispatch({ type: `CREATE_NODE`, payload: node })
    )
    store.dispatch({
      type: `CREATE_TYPES`,
      payload: `
        type PostsJson implements Node {
          id: String!
          time: Date
          code: String
        }
      `,
    })
    store.dispatch({
      type: `ADD_THIRD_PARTY_SCHEMA`,
      payload: buildThirdPartySchema(),
    })
    await build({})
    schema = store.getState().schema
  })

  it(`passes kitchen sink query`, async () => {
    expect(
      await runQuery(`
        {
          sort: allPostsJson(sort: { fields: likes, order: ASC }, limit: 2) {
            edges {
              node {
                id
                idWithDecoration
                time(formatString: "DD.MM.YYYY")
                code
                likes
                comment
                image {
                  childImageSharp {
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
          resolveFilter: postsJson(idWithDecoration: { eq: "decoration-1601601194425654597"}) {
            id
            idWithDecoration
            likes
          }
          addResolvers: likedEnough {
            id
            likes
            code
          }
          thirdPartyStuff {
            text
          }
        }
    `)
    ).toMatchSnapshot()
  })
})

const buildThirdPartySchema = () => {
  const schemaComposer = new SchemaComposer()
  schemaComposer.addTypeDefs(`
    type ThirdPartyStuff {
      text: String
    }

    type Query {
      thirdPartyStuff: ThirdPartyStuff
    }
  `)
  schemaComposer.Query.extendField(`thirdPartyStuff`, {
    resolve() {
      return {
        text: `Hello third-party schema!`,
      }
    },
  })
  return schemaComposer.buildSchema()
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
        resolve(parent, args, context) {
          return context.nodeModel
            .getAllNodes({ type: `PostsJson` })
            .filter(post => post.likes != null && post.likes > 5)
            .slice(0, 2)
        },
      },
    },
  })
}
