import { NodePluginArgs } from "gatsby"

export function mockGatsbyApi(): NodePluginArgs {
  return {
    actions: {
      createTypes: jest.fn(),
      createNode: jest.fn(),
      touchNode: jest.fn(),
      deleteNode: jest.fn(),
      setPluginStatus: jest.fn(),
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
      verbose: jest.fn(),
      warn: jest.fn(),
      panicOnBuild: jest.fn(e => {
        throw e
      }),
    },
    createResolvers: jest.fn(),
    cache: new Map(),
    pathPrefix: ``,
    getNode: jest.fn(() => {}),
    getNodesByType: () => [],
    schema: {
      buildObjectType: jest.fn(() => {
        return {
          config: {
            interfaces: [],
          },
        }
      }),
      buildInterfaceType: jest.fn(),
    },
    store: {
      getState: jest.fn(() => {
        return { program: { directory: process.cwd() }, status: {} }
      }),
    },
  } as unknown as NodePluginArgs
}
