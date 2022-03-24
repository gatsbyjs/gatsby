import { sourceNodes } from "../src/source-nodes"
import * as helpersModule from "../src/helpers"
import * as updateCacheModule from "../src/update-cache"
import * as createOperationsModule from "../src/create-operations"
import * as sourceFromOperationModule from "../src/source-from-operation"
import { mockGatsbyApi, mockPluginOptions, mockOperations } from "./fixtures"

const getLastBuildTime = jest.spyOn(helpersModule, `getLastBuildTime`)

jest
  .spyOn(createOperationsModule, `createOperations`)
  .mockImplementation(mockOperations)

const sourceFromOperation = jest.fn()

const makeSourceFromOperation = jest
  .spyOn(sourceFromOperationModule, `makeSourceFromOperation`)
  .mockImplementation(() => sourceFromOperation)

const updateCache = jest
  .spyOn(updateCacheModule, `updateCache`)
  .mockReturnValue(undefined)

const setLastBuildTime = jest
  .spyOn(helpersModule, `setLastBuildTime`)
  .mockReturnValue(undefined)

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

            await sourceNodes(gatsbyApi, {
              ...pluginOptions,
              prioritize,
              shopifyConnections,
            })

            expect(makeSourceFromOperation.mock.calls.length).toEqual(1)
            expect(sourceFromOperation.mock.calls.length).toEqual(
              shopifyConnections.length > 0 ? 5 : 2
            )
            expect(updateCache.mock.calls.length).toEqual(lastBuildTime ? 1 : 0)
            expect(setLastBuildTime.mock.calls.length).toEqual(1)
          }
        )
      }
    }
  }
})
