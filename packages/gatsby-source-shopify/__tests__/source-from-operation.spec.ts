import fetch from "node-fetch"

import { makeSourceFromOperation } from "../src/source-from-operation"
import * as processBulkResultsModule from "../src/process-bulk-results"

import { makeMockGatsbyApi, mockBulkResults } from "./mocks"

jest.mock(`node-fetch`)

const processBulkResults = jest.spyOn(
  processBulkResultsModule,
  `processBulkResults`
)

const gatsbyApi = makeMockGatsbyApi()

const finishLastOperation = jest.fn()

const completedOperation = jest.fn(() => {
  return {
    node: {
      objectCount: `1`,
    },
  }
})

const operation = {
  execute: jest.fn(() => {
    return {
      bulkOperationRunQuery: {
        userErrors: [],
        bulkOperation: { id: `test-id` },
      },
    }
  }),
  name: `Test Operation`,
}

const cancelOperationInProgress = jest.fn()

const lastBuildTime = undefined

describe(`makeSourceFromOperation`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  for (const priority of [true, false]) {
    const pluginOptions = { prioritize: priority }
    for (const type of [
      `products`,
      `variants`,
      `collections`,
      `orders`,
      `locations`,
    ]) {
      it(`Returns the correct ${type} when running a ${
        priority ? `` : `non-`
      }priority build`, async () => {
        fetch.mockImplementationOnce(() => {
          return {
            body: mockBulkResults(type),
          }
        })

        const sourceFromOperation = makeSourceFromOperation(
          finishLastOperation,
          completedOperation,
          cancelOperationInProgress,
          gatsbyApi,
          pluginOptions,
          lastBuildTime
        )

        await sourceFromOperation(operation)

        expect(cancelOperationInProgress.mock.calls.length).toEqual(
          priority ? 1 : 0
        )
        expect(finishLastOperation.mock.calls.length).toEqual(priority ? 0 : 1)
        expect(gatsbyApi.actions.createNode.mock.calls[0]).toMatchSnapshot()
        expect(processBulkResults.mock.calls[0][2]).toEqual(
          require(`./__data__/${type}.json`)
        )
      })
    }
  }
})
