import fs from "fs"
import path from "path"

import { NodePluginArgs } from "gatsby"
import { createContentDigest } from "gatsby-core-utils"

import ids from "./ids.json"

export function mockGatsbyApi(): NodePluginArgs {
  return {
    actions: {
      createFieldExtension: jest.fn(),
      createTypes: jest.fn(),
      createNode: jest.fn(),
      touchNode: jest.fn(),
      deleteNode: jest.fn(),
      setPluginStatus: jest.fn(),
    },
    store: {
      getState: jest.fn(),
    },
    reporter: {
      info: jest.fn(),
      panic: jest.fn(e => {
        throw e
      }),
      activityTimer: jest.fn(() => {
        return {
          start: jest.fn(),
          end: jest.fn(),
          setStatus: jest.fn(),
        }
      }),
      setErrorMap: jest.fn(),
    },
    createContentDigest,
    createNodeId: jest.fn(id => ids[id]),
    createResolvers: jest.fn(),
    cache: new Map(),
    getNodesByType: jest.fn((type: string) =>
      require(`../fixtures/shopify-nodes/${type}.json`)
    ),
    getNode: jest.fn((nodeId: string) => {
      const fixtureFiles = fs.readdirSync(path.join(__dirname, `../fixtures/shopify-nodes`))
      for (const fixtureFile of fixtureFiles) {
        const nodes = require(`../fixtures/shopify-nodes/${fixtureFile}`)
        const node = nodes.find((n: any) => n.id === nodeId)
        if (node) {
          return node
        }
      }

        return null
    })
  } as unknown as NodePluginArgs
}

export function mockPluginOptions() {
  return {
    password: `test-password`,
    storeUrl: `test.myshopify.com`,
    downloadImages: false,
    shopifyConnections: [],
    typePrefix: ``,
    salesChannel: ``,
    prioritize: undefined,
  }
}

export function mockExecute() {
  return jest.fn(() => {
    return {
      bulkOperationRunQuery: {
        userErrors: [],
        bulkOperation: { id: `test-id` },
      },
    }
  })
}

export function mockOperations() {
  return {
    productsOperation: {
      execute: mockExecute(),
      name: `products`,
    },
    productVariantsOperation: {
      execute: mockExecute(),
      name: `variants`,
    },
    ordersOperation: {
      execute: mockExecute(),
      name: `orders`,
    },
    collectionsOperation: {
      execute: mockExecute(),
      name: `collections`,
    },
    locationsOperation: {
      execute: mockExecute(),
      name: `locations`,
    },
    cancelOperationInProgress: jest.fn(),
    cancelOperation: jest.fn(),
    finishLastOperation: jest.fn(),
    completedOperation: jest.fn(async () => {
      return {
        node: {
          objectCount: `1`,
        },
      }
    }),
  }
}

export function makeMockEnvironment(): (
  variables: "all" | "gatsby" | "netlify" | "none"
) => void {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { ...OLD_ENV }
    jest.resetModules()
  })

  afterAll(() => {
    process.env = { ...OLD_ENV }
  })

  return function mockEnvironment(
    variables: "all" | "gatsby" | "netlify" | "none"
  ): void {
    switch (variables) {
      case `none`:
        process.env.CI = undefined
        process.env.GATSBY_CLOUD = undefined
        process.env.GATSBY_IS_PR_BUILD = undefined
        process.env.NETLIFY = undefined
        process.env.CONTEXT = undefined
        break
      case `gatsby`:
        process.env.CI = `true`
        process.env.GATSBY_CLOUD = `true`
        process.env.GATSBY_IS_PR_BUILD = `false`
        process.env.NETLIFY = undefined
        process.env.CONTEXT = undefined
        break
      case `netlify`:
        process.env.CI = `true`
        process.env.GATSBY_CLOUD = undefined
        process.env.GATSBY_IS_PR_BUILD = undefined
        process.env.NETLIFY = `true`
        process.env.CONTEXT = `production`
        break
      case `all`:
        process.env.CI = `true`
        process.env.GATSBY_CLOUD = `true`
        process.env.GATSBY_IS_PR_BUILD = `false`
        process.env.NETLIFY = `true`
        process.env.CONTEXT = `production`
        break
    }
  }
}

export function mockBulkResults(type: string): ReadableStream {
  return fs.createReadStream(
    path.join(__dirname, `../fixtures/bulk-results/${type}.jsonl`)
  )
}

export function mockShopifyEvents(type: string): Array<IEvent> {
  return require(`../fixtures/shopify-events/${type}.json`)
}
