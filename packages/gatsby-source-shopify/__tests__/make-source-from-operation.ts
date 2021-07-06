import { graphql, rest } from "msw"
import { setupServer } from "msw/node"
import { SourceNodesArgs } from "gatsby"
import { shiftLeft } from "shift-left"

import { makeSourceFromOperation } from "../src/make-source-from-operation"
import { createOperations } from "../src/operations"
import { pluginErrorCodes } from "../src/errors"

import {
  resolve,
  resolveOnce,
  currentBulkOperation,
  startOperation,
} from "./fixtures"

const server = setupServer()

// @ts-ignore because these types will never match
global.setTimeout = (fn: Promise<void>): Promise<void> => fn()

jest.mock(`gatsby-source-filesystem`, () => {
  return {
    createRemoteFileNode: jest.fn().mockResolvedValue({ id: `12345` }),
  }
})

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe(`The collections operation`, () => {
  const firstId = `gid://shopify/Collection/12345`
  const secondId = `gid://shopify/Collection/54321`
  const firstProductId = `gid://shopify/Product/22345`
  const secondProductId = `gid://shopify/Product/32345`
  const thirdProductId = `gid://shopify/Product/64321`

  const bulkResults = [
    {
      id: firstId,
    },
    {
      id: firstProductId,
      __parentId: firstId,
    },
    {
      id: secondId,
    },
    {
      id: secondProductId,
      __parentId: firstId,
    },
    {
      id: thirdProductId,
      __parentId: secondId,
    },
  ]

  beforeEach(() => {
    server.use(
      graphql.query<CurrentBulkOperationResponse>(
        `OPERATION_STATUS`,
        resolveOnce<CurrentBulkOperationResponse>(
          currentBulkOperation(`COMPLETED`)
        )
      ),
      startOperation(),
      graphql.query<{ node: BulkOperationNode }>(
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
      graphql.query<{ node: BulkOperationNode }>(
        `OPERATION_BY_ID`,
        resolve({
          node: {
            status: `COMPLETED`,
            id: `12345`,
            objectCount: `1`,
            query: ``,
            url: `http://results.url`,
          },
        })
      ),
      rest.get(`http://results.url`, (_req, res, ctx) =>
        res(ctx.text(bulkResults.map(r => JSON.stringify(r)).join(`\n`)))
      )
    )
  })

  it(`attaches product IDs to collection nodes`, async () => {
    const createNode = jest.fn()
    const createNodeId = jest.fn().mockImplementation(id => id)

    const gatsbyApiMock = jest.fn().mockImplementation(() => {
      return {
        cache: {
          set: jest.fn(),
        },
        actions: {
          createNode,
        },
        createContentDigest: jest.fn(),
        createNodeId,
        reporter: {
          info: jest.fn(),
          error: jest.fn(),
          panic: jest.fn(),
          activityTimer: (): Record<string, unknown> => {
            return {
              start: jest.fn(),
              end: jest.fn(),
              setStatus: jest.fn(),
            }
          },
        },
      }
    })

    const gatsbyApi = gatsbyApiMock as jest.Mock<SourceNodesArgs>
    const options = {
      password: ``,
      storeUrl: `my-shop.shopify.com`,
      downloadImages: true,
    }
    const operations = createOperations(options, gatsbyApi())

    const sourceFromOperation = makeSourceFromOperation(
      operations.finishLastOperation,
      operations.completedOperation,
      operations.cancelOperationInProgress,
      gatsbyApi(),
      options
    )

    await sourceFromOperation(operations.createCollectionsOperation)

    expect(createNode).toHaveBeenCalledTimes(2)
    expect(createNode).toHaveBeenCalledWith(
      expect.objectContaining({
        id: firstId,
        productIds: expect.arrayContaining([firstProductId, secondProductId]),
      })
    )

    expect(createNode).toHaveBeenCalledWith(
      expect.objectContaining({
        id: secondId,
        productIds: expect.arrayContaining([thirdProductId]),
      })
    )
  })
})

describe(`When polling an operation`, () => {
  const id = `54321`

  beforeEach(() => {
    server.use(
      graphql.query<CurrentBulkOperationResponse>(
        `OPERATION_STATUS`,
        resolveOnce(currentBulkOperation(`COMPLETED`))
      ),
      startOperation({ id }),
      graphql.query<{ node: BulkOperationNode }>(
        `OPERATION_BY_ID`,
        resolveOnce({
          node: {
            status: `CREATED`,
            id,
            objectCount: `0`,
            query: ``,
            url: ``,
          },
        })
      ),
      graphql.query<{ node: BulkOperationNode }>(
        `OPERATION_BY_ID`,
        resolveOnce({
          node: {
            status: `RUNNING`,
            id,
            objectCount: `1`,
            query: ``,
            url: `http://results.url`,
          },
        })
      ),
      graphql.query<{ node: BulkOperationNode }>(
        `OPERATION_BY_ID`,
        resolve({
          node: {
            status: `COMPLETED`,
            id,
            objectCount: `1`,
            query: ``,
            url: `http://results.url`,
          },
        })
      ),
      rest.get(`http://results.url`, (_req, res, ctx) =>
        res(ctx.text(JSON.stringify({ id: `gid://shopify/Product/12345` })))
      )
    )
  })

  it(`reports status changes`, async () => {
    const setStatus = jest.fn()
    const gatsbyApiMock = jest.fn().mockImplementation(() => {
      return {
        cache: {
          set: jest.fn(),
        },
        actions: {
          createNode: jest.fn(),
        },
        createContentDigest: jest.fn(),
        createNodeId: jest.fn(),
        reporter: {
          info: jest.fn(),
          error: jest.fn(),
          panic: jest.fn(),
          activityTimer: (): Record<string, unknown> => {
            return {
              start: jest.fn(),
              end: jest.fn(),
              setStatus,
            }
          },
        },
      }
    })

    const gatsbyApi = gatsbyApiMock as jest.Mock<SourceNodesArgs>
    const options = {
      password: ``,
      storeUrl: `my-shop.shopify.com`,
      downloadImages: true,
    }
    const operations = createOperations(options, gatsbyApi())

    const sourceFromOperation = makeSourceFromOperation(
      operations.finishLastOperation,
      operations.completedOperation,
      operations.cancelOperationInProgress,
      gatsbyApi(),
      options
    )

    await sourceFromOperation(operations.createProductsOperation)

    expect(setStatus).toHaveBeenCalledWith(shiftLeft`
      Polling bulk operation: ${id}
      Status: RUNNING
      Object count: 1
    `)
  })
})

describe(`When downloading images`, () => {
  const bulkResult = {
    id: `gid://shopify/Product/12345`,
    featuredMedia: {
      preview: {
        image: {
          originalSrc: `http://www.example.com/some-image.jpg`,
        },
      },
    },
  }

  beforeEach(() => {
    server.use(
      graphql.query<CurrentBulkOperationResponse>(
        `OPERATION_STATUS`,
        resolveOnce(currentBulkOperation(`COMPLETED`))
      ),
      startOperation(),
      graphql.query<{ node: BulkOperationNode }>(
        `OPERATION_BY_ID`,
        resolve({
          node: {
            status: `COMPLETED`,
            id: ``,
            objectCount: `1`,
            query: ``,
            url: `http://results.url`,
          },
        })
      ),
      rest.get(`http://results.url`, (_req, res, ctx) =>
        res(ctx.text(JSON.stringify(bulkResult)))
      )
    )
  })

  it(`links a local file to the featured media`, async () => {
    const createNode = jest.fn()
    const gatsbyApiMock = jest.fn().mockImplementation(() => {
      return {
        cache: {
          set: jest.fn(),
        },
        actions: {
          createNode,
        },
        createContentDigest: jest.fn(),
        createNodeId: jest.fn(),
        reporter: {
          info: jest.fn(),
          error: jest.fn(),
          panic: jest.fn(),
          activityTimer: (): Record<string, unknown> => {
            return {
              start: jest.fn(),
              end: jest.fn(),
              setStatus: jest.fn(),
            }
          },
        },
      }
    })

    const gatsbyApi = gatsbyApiMock as jest.Mock<SourceNodesArgs>
    const options = {
      password: ``,
      storeUrl: `my-shop.shopify.com`,
      downloadImages: true,
    }
    const operations = createOperations(options, gatsbyApi())

    const sourceFromOperation = makeSourceFromOperation(
      operations.finishLastOperation,
      operations.completedOperation,
      operations.cancelOperationInProgress,
      gatsbyApi(),
      options
    )

    await sourceFromOperation(operations.createProductsOperation, true)

    expect(createNode).toHaveBeenCalledWith(
      expect.objectContaining({
        shopifyId: bulkResult.id,
        featuredMedia: {
          preview: {
            image: expect.objectContaining({
              localFile: `12345`,
            }),
          },
        },
      })
    )
  })
})

describe(`A production build`, () => {
  const bulkResult = { id: `gid://shopify/Product/12345` }

  beforeEach(() => {
    server.use(
      graphql.query<CurrentBulkOperationResponse>(
        `OPERATION_STATUS`,
        resolveOnce(currentBulkOperation(`RUNNING`))
      ),
      graphql.mutation<BulkOperationCancelResponse>(
        `CANCEL_OPERATION`,
        resolve({
          bulkOperationCancel: {
            bulkOperation: {
              id: ``,
              status: `CANCELING`,
              objectCount: `0`,
              url: ``,
              query: ``,
            },
            userErrors: [],
          },
        })
      ),
      graphql.query<CurrentBulkOperationResponse>(
        `OPERATION_STATUS`,
        resolve(currentBulkOperation(`CANCELED`))
      ),
      startOperation()
    )
  })

  it(`panics if it finds itself canceled`, async () => {
    server.use(
      graphql.query<{ node: BulkOperationNode }>(
        `OPERATION_BY_ID`,
        resolve({
          node: {
            status: `CANCELED`,
            id: ``,
            objectCount: `0`,
            query: ``,
            url: ``,
          },
        })
      )
    )
    const panic = jest.fn()
    const gatsbyApiMock = jest.fn().mockImplementation(() => {
      return {
        cache: {
          set: jest.fn(),
        },
        actions: {
          createNode: jest.fn(),
        },
        createContentDigest: jest.fn(),
        createNodeId: jest.fn(),
        reporter: {
          info: jest.fn(),
          error: jest.fn(),
          panic,
          activityTimer: (): Record<string, unknown> => {
            return {
              start: jest.fn(),
              end: jest.fn(),
              setStatus: jest.fn(),
            }
          },
        },
      }
    })

    const gatsbyApi = gatsbyApiMock as jest.Mock<SourceNodesArgs>
    const options = {
      password: ``,
      storeUrl: `my-shop.shopify.com`,
    }
    const operations = createOperations(options, gatsbyApi())

    const sourceFromOperation = makeSourceFromOperation(
      operations.finishLastOperation,
      operations.completedOperation,
      operations.cancelOperationInProgress,
      gatsbyApi(),
      options
    )

    await sourceFromOperation(operations.createProductsOperation, true)

    expect(panic).toHaveBeenCalledWith(
      expect.objectContaining({ id: pluginErrorCodes.apiConflict })
    )
  })

  it(`cancels other operations in progress`, async () => {
    server.use(
      graphql.query<{ node: BulkOperationNode }>(
        `OPERATION_BY_ID`,
        resolve({
          node: {
            status: `COMPLETED`,
            id: ``,
            objectCount: `1`,
            query: ``,
            url: `http://results.url`,
          },
        })
      ),
      rest.get(`http://results.url`, (_req, res, ctx) =>
        res(ctx.text(JSON.stringify(bulkResult)))
      )
    )
    const createNode = jest.fn()
    const gatsbyApiMock = jest.fn().mockImplementation(() => {
      return {
        cache: {
          set: jest.fn(),
        },
        actions: {
          createNode,
        },
        createContentDigest: jest.fn(),
        createNodeId: jest.fn(),
        reporter: {
          info: jest.fn(),
          error: jest.fn(),
          panic: jest.fn(),
          activityTimer: (): Record<string, unknown> => {
            return {
              start: jest.fn(),
              end: jest.fn(),
              setStatus: jest.fn(),
            }
          },
        },
      }
    })

    const gatsbyApi = gatsbyApiMock as jest.Mock<SourceNodesArgs>
    const options = {
      password: ``,
      storeUrl: `my-shop.shopify.com`,
    }
    const operations = createOperations(options, gatsbyApi())

    const sourceFromOperation = makeSourceFromOperation(
      operations.finishLastOperation,
      operations.completedOperation,
      operations.cancelOperationInProgress,
      gatsbyApi(),
      options
    )

    await sourceFromOperation(operations.createProductsOperation, true)

    expect(createNode).toHaveBeenCalledWith(
      expect.objectContaining({ shopifyId: bulkResult.id })
    )
  })
})

describe(`When an operation gets canceled`, () => {
  const bulkResult = { id: `gid://shopify/Product/12345` }

  beforeEach(() => {
    server.use(
      graphql.query<CurrentBulkOperationResponse>(
        `OPERATION_STATUS`,
        resolve(currentBulkOperation(`COMPLETED`))
      ),
      startOperation(),
      graphql.query<{ node: BulkOperationNode }>(
        `OPERATION_BY_ID`,
        resolveOnce({
          node: {
            status: `CANCELED`,
            id: ``,
            objectCount: `0`,
            query: ``,
            url: ``,
          },
        })
      ),
      graphql.query<{ node: BulkOperationNode }>(
        `OPERATION_BY_ID`,
        resolve({
          node: {
            status: `COMPLETED`,
            id: ``,
            objectCount: `1`,
            query: ``,
            url: `http://results.url`,
          },
        })
      ),
      rest.get(`http://results.url`, (_req, res, ctx) =>
        res(ctx.text(JSON.stringify(bulkResult)))
      )
    )
  })

  it(`tries again`, async () => {
    const createNode = jest.fn()
    const gatsbyApiMock = jest.fn().mockImplementation(() => {
      return {
        cache: {
          set: jest.fn(),
        },
        actions: {
          createNode,
        },
        createContentDigest: jest.fn(),
        createNodeId: jest.fn(),
        reporter: {
          info: jest.fn(),
          error: jest.fn(),
          panic: jest.fn(),
          activityTimer: (): Record<string, unknown> => {
            return {
              start: jest.fn(),
              end: jest.fn(),
              setStatus: jest.fn(),
            }
          },
        },
      }
    })

    const gatsbyApi = gatsbyApiMock as jest.Mock<SourceNodesArgs>
    const options = {
      password: ``,
      storeUrl: `my-shop.shopify.com`,
    }
    const operations = createOperations(options, gatsbyApi())

    const sourceFromOperation = makeSourceFromOperation(
      operations.finishLastOperation,
      operations.completedOperation,
      operations.cancelOperationInProgress,
      gatsbyApi(),
      options
    )

    await sourceFromOperation(operations.createProductsOperation)

    expect(createNode).toHaveBeenCalledWith(
      expect.objectContaining({ shopifyId: bulkResult.id })
    )
  })
})

describe(`When an operation fails with bad credentials`, () => {
  beforeEach(() => {
    server.use(
      graphql.query<CurrentBulkOperationResponse>(
        `OPERATION_STATUS`,
        resolve(currentBulkOperation(`COMPLETED`))
      ),
      startOperation(),
      graphql.query<{ node: BulkOperationNode }>(
        `OPERATION_BY_ID`,
        resolve({
          node: {
            status: `FAILED`,
            id: ``,
            objectCount: `0`,
            query: ``,
            url: ``,
            errorCode: `ACCESS_DENIED`,
          },
        })
      )
    )
  })

  it(`panics and reports the error code`, async () => {
    const panic = jest.fn()
    const gatsbyApiMock = jest.fn().mockImplementation(() => {
      return {
        cache: {
          set: jest.fn(),
        },
        actions: {
          createNode: jest.fn(),
        },
        reporter: {
          info: jest.fn(),
          error: jest.fn(),
          panic,
          activityTimer: (): Record<string, unknown> => {
            return {
              start: jest.fn(),
              end: jest.fn(),
              setStatus: jest.fn(),
            }
          },
        },
      }
    })

    const gatsbyApi = gatsbyApiMock as jest.Mock<SourceNodesArgs>
    const options = {
      password: ``,
      storeUrl: `my-shop.shopify.com`,
    }
    const operations = createOperations(options, gatsbyApi())

    const sourceFromOperation = makeSourceFromOperation(
      operations.finishLastOperation,
      operations.completedOperation,
      operations.cancelOperationInProgress,
      gatsbyApi(),
      options
    )

    await sourceFromOperation(operations.createProductsOperation)
    expect(panic).toHaveBeenCalledWith(
      expect.objectContaining({
        id: pluginErrorCodes.unknownSourcingFailure,
        context: {
          sourceMessage: expect.stringContaining(`ACCESS_DENIED`),
        },
      })
    )
  })
})

describe(`The incremental products processor`, () => {
  const firstProductId = `gid://shopify/Product/22345`
  const firstImageId = `gid://shopify/ProductImage/33333`
  const secondImageId = `gid://shopify/ProductImage/44444`
  const firstVariantId = `gid://shopify/ProductVariant/11111`
  const secondVariantId = `gid://shopify/ProductVariant/22222`
  const firstMetadataId = `gid://shopify/Metafield/12345`
  const secondMetadataId = `gid://shopify/Metafield/12346`

  const bulkResults = [
    {
      id: firstProductId,
    },
    {
      id: firstImageId,
      __parentId: firstProductId,
    },
  ]

  beforeEach(() => {
    server.use(
      graphql.query<CurrentBulkOperationResponse>(
        `OPERATION_STATUS`,
        resolveOnce(currentBulkOperation(`COMPLETED`))
      ),
      startOperation(),
      graphql.query<{ node: BulkOperationNode }>(
        `OPERATION_BY_ID`,
        resolve({
          node: {
            status: `COMPLETED`,
            id: `12345`,
            objectCount: `2`,
            query: ``,
            url: `http://results.url`,
          },
        })
      ),
      rest.get(`http://results.url`, (_req, res, ctx) =>
        res(ctx.text(bulkResults.map(r => JSON.stringify(r)).join(`\n`)))
      )
    )
  })

  it(`deletes variants belonging to the products`, async () => {
    const createNode = jest.fn()
    const deleteNode = jest.fn()
    const createNodeId = jest.fn().mockImplementation(id => id)

    const gatsbyApiMock = jest.fn().mockImplementation(() => {
      return {
        cache: {
          set: jest.fn(),
        },
        actions: {
          createNode,
          deleteNode,
        },
        createContentDigest: jest.fn(),
        createNodeId,
        reporter: {
          info: jest.fn(),
          error: jest.fn(),
          panic: jest.fn(),
          activityTimer: (): Record<string, unknown> => {
            return {
              start: jest.fn(),
              end: jest.fn(),
              setStatus: jest.fn(),
            }
          },
        },
        getNodesByType: jest.fn().mockImplementation((nodeType: string) => {
          switch (nodeType) {
            case `ShopifyProductVariant`:
              return [
                {
                  id: firstVariantId,
                  productId: firstProductId,
                },
                {
                  id: secondVariantId,
                  productId: firstProductId,
                },
              ]
            case `ShopifyProductVariantMetafield`:
              return [
                {
                  id: firstMetadataId,
                  productVariantId: firstVariantId,
                },
                {
                  id: secondMetadataId,
                  productVariantId: secondVariantId,
                },
              ]
            case `ShopifyProductImage`:
              return [
                {
                  id: firstImageId,
                  productId: firstProductId,
                },
                {
                  id: secondImageId,
                  productId: firstProductId,
                },
              ]
            default:
              return []
          }
        }),
      }
    })

    const gatsbyApi = gatsbyApiMock as jest.Mock<SourceNodesArgs>
    const options = {
      password: ``,
      storeUrl: `my-shop.shopify.com`,
      downloadImages: true,
    }
    const operations = createOperations(options, gatsbyApi())

    const sourceFromOperation = makeSourceFromOperation(
      operations.finishLastOperation,
      operations.completedOperation,
      operations.cancelOperationInProgress,
      gatsbyApi(),
      options
    )

    await sourceFromOperation(operations.incrementalProducts(new Date()))

    expect(createNode).toHaveBeenCalledTimes(2)
    expect(deleteNode).toHaveBeenCalledTimes(6)

    expect(deleteNode).toHaveBeenCalledWith(
      expect.objectContaining({
        id: firstVariantId,
        productId: firstProductId,
      })
    )

    expect(deleteNode).toHaveBeenCalledWith(
      expect.objectContaining({
        id: secondVariantId,
        productId: firstProductId,
      })
    )

    expect(deleteNode).toHaveBeenCalledWith(
      expect.objectContaining({
        id: firstMetadataId,
        productVariantId: firstVariantId,
      })
    )

    expect(deleteNode).toHaveBeenCalledWith(
      expect.objectContaining({
        id: secondMetadataId,
        productVariantId: secondVariantId,
      })
    )

    expect(deleteNode).toHaveBeenCalledWith(
      expect.objectContaining({
        id: firstImageId,
        productId: firstProductId,
      })
    )

    expect(deleteNode).toHaveBeenCalledWith(
      expect.objectContaining({
        id: secondImageId,
        productId: firstProductId,
      })
    )

    expect(createNode).toHaveBeenCalledWith(
      expect.objectContaining({
        id: firstImageId,
        productId: firstProductId,
      })
    )

    expect(createNode).toHaveBeenCalledWith(
      expect.objectContaining({
        id: firstProductId,
      })
    )
  })
})
