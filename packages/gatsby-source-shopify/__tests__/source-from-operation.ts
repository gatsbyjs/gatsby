// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../types/interface.d.ts" />

import fs from "fs"
import path from "path"
import os from "os"
import { graphql, rest } from "msw"
import { setupServer } from "msw/node"
import * as processBulkResultsModule from "../src/process-bulk-results"
import { makeSourceFromOperation } from "../src/source-from-operation"
import { createOperations } from "../src/create-operations"
import { mockGatsbyApi, mockPluginOptions } from "./fixtures"

const BULK_DATA_URL = `http://bulk-query-data.co`
const server = setupServer()
const nodeTypes = [`products`, `variants`, `collections`, `orders`, `locations`]

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

function resolve(data) {
  return (_req, res, ctx): void => res(ctx.data(data))
}

function resolveOnce(data) {
  return (_req, res, ctx): void => res.once(ctx.data(data))
}

function generateTestName(prioritize, type): string {
  const modifiers = [prioritize ? `priority` : `non-priority`]
  return `Returns the correct ${type} when running a ${modifiers[0]} build`
}

function countJsonLRows(s: string): number {
  const matches = s.match(/}$/gm) || []
  return matches.length
}

const testConfigs = [
  {
    bulkResults: [
      {
        id: `gid://shopify/Product/6950279086286`,
      },
      {
        id: `gid://shopify/MediaImage/22755647652046`,
      },
      {
        id: `gid://shopify/Metafield/21077562228942`,
        __parentId: `gid://shopify/Product/6950279086286`,
        ownerType: `PRODUCT`,
      },
      {
        id: `gid://shopify/Product/6966721052878`,
        ownerType: `PRODUCT`,
      },
      {
        id: `gid://shopify/Metafield/21078060335310`,
        __parentId: `gid://shopify/Product/6966721052878`,
        ownerType: `PRODUCT`,
      },
    ],
    prioritize: true,
    type: `products`,
  },
  {
    bulkResults: [
      {
        id: `gid://shopify/Product/6950279086286`,
      },
      {
        id: `gid://shopify/MediaImage/22755647652046`,
      },
      {
        id: `gid://shopify/Metafield/21077562228942`,
        __parentId: `gid://shopify/Product/6950279086286`,
        ownerType: `PRODUCT`,
      },
      {
        id: `gid://shopify/Product/6966721052878`,
        ownerType: `PRODUCT`,
      },
      {
        id: `gid://shopify/Metafield/21078060335310`,
        __parentId: `gid://shopify/Product/6966721052878`,
        ownerType: `PRODUCT`,
      },
    ],
    prioritize: false,
    type: `products`,
  },
]

describe(`makeSourceFromOperation`, () => {
  afterEach(() => {
    server.resetHandlers()
  })

  beforeEach(() => {
    server.use(
      graphql.query<ICurrentBulkOperationResponse>(
        `OPERATION_STATUS`,
        resolveOnce({
          currentBulkOperation: {
            id: `12345`,
            status: `COMPLETED`,
          },
        })
      ),
      graphql.mutation<IBulkOperationRunQueryResponse>(
        `INITIATE_BULK_OPERATION`,
        resolveOnce({
          bulkOperationRunQuery: {
            bulkOperation: {
              id: `12345`,
              objectCount: `0`,
              query: ``,
              status: `CREATED`,
              url: ``,
            },
            userErrors: [],
          },
        })
      ),
      graphql.query<{ node: IBulkOperationNode }>(
        `OPERATION_BY_ID`,
        resolveOnce({
          node: {
            status: `CREATED`,
            id: ``,
            objectCount: `0`,
            query: ``,
            url: ``,
          },
        })
      ),
      graphql.query<{ node: IBulkOperationNode }>(
        `OPERATION_BY_ID`,
        resolve({
          node: {
            status: `COMPLETED`,
            id: `12345`,
            objectCount: `1`,
            query: ``,
            url: BULK_DATA_URL,
          },
        })
      )
    )
  })

  testConfigs.forEach(({ bulkResults, prioritize, type }) => {
    it(`testing prioritize: ${prioritize}, type: ${type}`, async () => {
      const jsonLData = bulkResults.map(d => JSON.stringify(d)).join(os.EOL)
      server.use(
        rest.get(BULK_DATA_URL, (req, res, ctx) => res(ctx.text(jsonLData)))
      )
      const options = {
        password: ``,
        storeUrl: `my-shop.shopify.com`,
        downloadImages: true,
      }
      const operations = createOperations(mockGatsbyApi(), options)

      const finishLastOperation = jest.spyOn(operations, `finishLastOperation`)
      const completedOperation = jest.spyOn(operations, `completedOperation`)
      const cancelOperationInProgress = jest.spyOn(
        operations,
        `cancelOperationInProgress`
      )
      const gatsbyApi = mockGatsbyApi()
      const pluginOptions = mockPluginOptions()

      const sourceFromOperation = makeSourceFromOperation(
        finishLastOperation,
        completedOperation,
        cancelOperationInProgress,
        gatsbyApi,
        { ...pluginOptions, prioritize }
      )

      await sourceFromOperation(operations.productsOperation)

      const { createNode } = gatsbyApi.actions

      expect(createNode).toHaveBeenCalledTimes(bulkResults.length)
      expect(cancelOperationInProgress.mock.calls.length).toEqual(
        prioritize ? 1 : 0
      )
      expect(finishLastOperation.mock.calls.length).toEqual(prioritize ? 0 : 1)

      bulkResults.forEach(({ id }) => {
        expect(createNode).toHaveBeenCalledWith(
          expect.objectContaining({
            shopifyId: id,
          })
        )
      })
    })
  })

  for (const prioritize of [true, false]) {
    for (const type of nodeTypes) {
      it(generateTestName(prioritize, type), async () => {
        const fileContents = fs.readFileSync(
          path.join(__dirname, `fixtures`, `bulk-results`, `${type}.jsonl`),
          { encoding: `utf8` }
        )

        const lineCountInFile = countJsonLRows(fileContents)

        server.use(
          rest.get(BULK_DATA_URL, (req, res, ctx) =>
            res(ctx.text(fileContents))
          )
        )

        const options = {
          password: ``,
          storeUrl: `my-shop.shopify.com`,
          downloadImages: true,
        }
        const operations = createOperations(mockGatsbyApi(), options)

        const processBulkResults = jest.spyOn(
          processBulkResultsModule,
          `processBulkResults`
        )
        const finishLastOperation = jest.spyOn(
          operations,
          `finishLastOperation`
        )
        const completedOperation = jest.spyOn(operations, `completedOperation`)
        const cancelOperationInProgress = jest.spyOn(
          operations,
          `cancelOperationInProgress`
        )
        const gatsbyApi = mockGatsbyApi()
        const pluginOptions = mockPluginOptions()

        const sourceFromOperation = makeSourceFromOperation(
          finishLastOperation,
          completedOperation,
          cancelOperationInProgress,
          gatsbyApi,
          { ...pluginOptions, prioritize }
        )

        await sourceFromOperation(operations.productsOperation)

        const { createNode } = gatsbyApi.actions

        expect(createNode).toHaveBeenCalledTimes(lineCountInFile)
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
