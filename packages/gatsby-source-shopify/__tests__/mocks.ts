import { SourceNodesArgs } from "gatsby"
import { createContentDigest } from "gatsby-core-utils"

export function makeMockGatsbyApi({
  mockStoreValue = { status: { plugins: {} } },
}): SourceNodesArgs {
  return {
    actions: {
      createTypes: jest.fn(),
      createNode: jest.fn(),
      touchNode: jest.fn(),
      deleteNode: jest.fn(),
      setPluginStatus: jest.fn(),
    },
    store: {
      getState: jest.fn().mockReturnValue(mockStoreValue),
    },
    reporter: {
      info: jest.fn(),
      panic: jest.fn(),
      activityTimer: jest.fn(),
      setErrorMap: jest.fn(),
    },
    createContentDigest,
    createNodeId: jest.fn(),
    cache: new Map(),
  } as unknown as SourceNodesArgs
}
