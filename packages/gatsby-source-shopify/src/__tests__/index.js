jest.mock(`gatsby-source-filesystem`, () => {
  return {
    createRemoteFileNode: jest.fn(),
  }
})

import * as mockQueries from "../queries"
jest.mock(`../create-client`, () => {
  return {
    createClient: jest.fn(() => {
      return {
        request: async query => {
          // Hack alert. match query text, from that get query name (like SHOP_POLICIES_QUERY) and convert to filename like policies.json
          const fixturePathFromQuery = (query, mockQueries) => {
            const [queryName] = Object.entries(mockQueries).find(
              ([queryName, queryString]) => queryString === query
            )
            const jsonFile = queryName
              .split(`_`)
              .map(el => el.toLowerCase())
              .filter(el => el !== `query`)
              .join(`-`)
            return jsonFile + `.json`
          }
          const jsonFile = fixturePathFromQuery(query, mockQueries)
          return require(`./fixtures/${jsonFile}`)
        },
      }
    }),
  }
})

const { sourceNodes } = require(`../gatsby-node`)

describe(`gatsby-source-shopify`, () => {
  /**
   * This test is pretty bare-bones. Among other things:
   *
   * - Some of the fixtures are empty responses
   * - There's no pagination testing
   * - There's no validation that nodes are created correctly, other than a snapshot
   * - There's no way to test different responses for the same query
   *
   * TODO: more and better tests
   *
   * Mocking setup is borrowed from gatsby-source-drupal
   */
  const nodes = {}
  const actions = {
    createNode: jest.fn(node => (nodes[node.id] = node)),
  }

  const activity = {
    start: jest.fn(),
    end: jest.fn(),
  }

  const reporter = {
    info: jest.fn(),
    activityTimer: jest.fn(() => activity),
    log: jest.fn(),
  }

  const cache = {
    get: jest.fn(),
  }

  const args = {
    actions,
    reporter,
    cache,
    // getNode: id => nodes[id],
  }

  beforeAll(async () => {
    await sourceNodes(args, { shopName: `test-shop` })
  })

  it(`Generates nodes`, () => {
    expect(Object.keys(nodes).length).not.toEqual(0)
    // better than no tests?  ¯\_(ツ)_/¯
    expect(nodes).toMatchSnapshot()
  })
})
