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
    await build({})
    schema = store.getState().schema
  })

  it(`passes kitchen sink query`, async () => {
    expect(
      await runQuery(`
        {
          allPostsJson(sort: { fields: likes, order:DESC}) {
            edges {
              node {
                id
                time
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
        }
    `)
    ).toMatchSnapshot()
  })
})

const mockSetFieldsOnGraphQLNodeType = ({ type: { name } }) => []

const mockAddResolvers = ({ addResolvers }) => {}
