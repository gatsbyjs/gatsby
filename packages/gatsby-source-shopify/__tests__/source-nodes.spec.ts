import fetch from "node-fetch"

import { sourceNodes } from "../src/source-nodes"

import * as helpersModule from "../src/helpers"
import * as updateCacheModule from "../src/update-cache"
import * as createOperationsModule from "../src/create-operations"

import { makeMockGatsbyApi, mockBulkResults } from "./mocks"

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

const createOperations = jest
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

const gatsbyApi = makeMockGatsbyApi()

describe(`sourceNodes`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  for (const shopifyConnections of [
    [],
    [`collections`, `orders`, `locations`],
  ]) {
    for (const prioritize of [true, false]) {
      for (const lastBuildTime of [new Date(), undefined]) {
        it(`successfully runs a ${lastBuildTime ? `fresh` : `incremental`} ${
          prioritize ? `` : `non-`
        }priority build ${
          shopifyConnections.length ? `with` : `without`
        } connections`, async () => {
          getLastBuildTime.mockImplementationOnce(() => lastBuildTime)

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

          await sourceNodes(gatsbyApi, { prioritize, shopifyConnections })

          expect(setLastBuildTime.mock.calls.length).toEqual(1)
          expect(gatsbyApi.actions.createNode.mock.calls).toMatchSnapshot()
          expect(updateCache.mock.calls.length).toEqual(lastBuildTime ? 1 : 0)
        })
      }
    }
  }
})
