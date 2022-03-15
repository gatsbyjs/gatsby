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

const nodeTypes = [`products`, `variants`, `collections`, `orders`, `locations`]

const generateTestName = (prioritize, type): string => {
  const modifiers = [prioritize ? `priority` : `non-priority`]
  return `Returns the correct ${type} when running a ${modifiers[0]} build`
}

describe(`makeSourceFromOperation`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  for (const prioritize of [true, false]) {
    for (const type of nodeTypes) {
      it(generateTestName(prioritize, type), async () => {
        fetch.mockImplementationOnce(() => {
          return {
            body: mockBulkResults(type),
          }
        })

        const pluginOptions = { prioritize }

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
          prioritize ? 1 : 0
        )
        expect(finishLastOperation.mock.calls.length).toEqual(
          prioritize ? 0 : 1
        )
        expect(processBulkResults.mock.calls[0][2]).toMatchSnapshot()
        expect(gatsbyApi.actions.createNode.mock.calls).toMatchSnapshot()
      })
    }
  }
})
