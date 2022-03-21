import fetch from "node-fetch"

import { sourceNodes } from "../src/source-nodes"

import * as helpersModule from "../src/helpers"
import * as updateCacheModule from "../src/update-cache"
import * as createOperationsModule from "../src/create-operations"

import { mockGatsbyApi, mockPluginOptions, mockBulkResults } from "./fixtures"

jest.mock(`node-fetch`)

const execute = jest.fn(() => {
  return {
    bulkOperationRunQuery: {
      userErrors: [],
      bulkOperation: { id: `test-id` },
    },
  }
})

const getLastBuildTime = jest.spyOn(helpersModule, `getLastBuildTime`)
const setLastBuildTime = jest.spyOn(helpersModule, `setLastBuildTime`)

const updateCache = jest
  .spyOn(updateCacheModule, `updateCache`)
  .mockImplementation(() => undefined)

jest
  .spyOn(createOperationsModule, `createOperations`)
  .mockImplementation(() => {
    return {
      productsOperation: {
        execute,
        name: `products`,
      },
      productVariantsOperation: {
        execute,
        name: `variants`,
      },
      ordersOperation: {
        execute,
        name: `orders`,
      },
      collectionsOperation: {
        execute,
        name: `collections`,
      },
      locationsOperation: {
        execute,
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
  })

const connections = [`collections`, `orders`, `locations`]

const generateTestName = (
  prioritize,
  lastBuildTime,
  shopifyConnections
): string => {
  const modifiers = [
    lastBuildTime ? `fresh` : `incremental`,
    prioritize ? `priority` : `non-priority`,
    shopifyConnections.length > 0 ? `with` : `without`,
  ]
  return `successfully runs a ${modifiers[0]} ${modifiers[1]} build ${modifiers[2]} connections`
}

const gatsbyApi = mockGatsbyApi()
const pluginOptions = mockPluginOptions()

describe(`sourceNodes`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  for (const prioritize of [false, true]) {
    for (const lastBuildTime of [undefined, new Date(0)]) {
      for (const shopifyConnections of [[], connections]) {
        it(
          generateTestName(prioritize, lastBuildTime, shopifyConnections),
          async () => {
            getLastBuildTime.mockImplementationOnce(() => lastBuildTime)
            setLastBuildTime.mockImplementationOnce(() => undefined)

            for (const type of [
              `products`,
              `variants`,
              `collections`,
              `orders`,
              `locations`,
            ]) {
              fetch.mockImplementationOnce(() => {
                return {
                  body: mockBulkResults(type),
                }
              })
            }

            await sourceNodes(gatsbyApi, {
              ...pluginOptions,
              prioritize,
              shopifyConnections,
            })

            expect(setLastBuildTime.mock.calls.length).toEqual(1)
            expect(gatsbyApi.actions.createNode.mock.calls).toMatchSnapshot()
            expect(updateCache.mock.calls.length).toEqual(lastBuildTime ? 1 : 0)
          }
        )
      }
    }
  }
})
