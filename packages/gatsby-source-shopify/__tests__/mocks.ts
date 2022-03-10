import { NodePluginArgs } from "gatsby"
import { createContentDigest } from "gatsby-core-utils"

interface IMakeMockGatsbyApiArgs {
  mockStoreValue: {
    status: {
      plugins: { [key: string]: any }
    }
  }
}

export function makeMockGatsbyApi({
  mockStoreValue = { status: { plugins: {} } },
}: IMakeMockGatsbyApiArgs): NodePluginArgs {
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
  } as unknown as NodePluginArgs
}
