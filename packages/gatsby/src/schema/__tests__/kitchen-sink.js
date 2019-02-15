// @flow

// Children
// childX
// childrenX
// NODE__ connections
// addTypeDefs and corner cases
// addResolvers

const fs = require(`fs`)
const path = require(`path`)

const { graphql } = require(`graphql`)
const { store } = require(`../../redux`)
const { build } = require(`../index`)
const withResolverContext = require(`../context`)

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
      } else if (api === `addResolvers`) {
        return mockAddResolvers(...args)
      } else {
        return []
      }
    })
    const nodes = JSON.parse(
      fs.readFileSync(path.join(__dirname, `./fixtures/kitchen-sink.json`))
    )
    store.dispatch({ type: `DELETE_CACHE` })
    nodes.forEach(node =>
      store.dispatch({ type: `CREATE_NODE`, payload: node })
    )
    store.dispatch({
      type: `ADD_TYPE_DEFS`,
      payload: `
        type PostsJson implements Node {
          id: String!
          time: Date
          code: String
        }
      `,
    })
    await build({})
    schema = store.getState().schema
  })

  it(`passes kitchen sink query`, async () => {
    expect(
      await runQuery(`
        {
          sort: allPostsJson(sort: { fields: likes, order:DESC}, limit: 2) {
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
        }
    `)
    ).toMatchSnapshot()
  })
})

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

const mockAddResolvers = ({ addResolvers }) => {}
