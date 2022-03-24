import * as createOperationsModule from "../src/create-operations"
import { mockGatsbyApi, mockPluginOptions } from "./fixtures"

const createOperations = jest.spyOn(
  createOperationsModule,
  `createOperationObject`
)

const generateTestName = (salesChannel, lastBuildTime): string => {
  const modifiers = [
    salesChannel ? `with` : `without`,
    lastBuildTime ? `with` : `without`,
  ]

  return `creates the proper queries and operations ${modifiers[0]} sales channel and ${modifiers[1]} lastBuildTime`
}

const gatsbyApi = mockGatsbyApi()
const pluginOptions = mockPluginOptions()

describe(`createOperations`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  for (const salesChannel of [undefined, `__TEST__`]) {
    for (const lastBuildTime of [undefined, new Date(0)]) {
      it(generateTestName(salesChannel, lastBuildTime), () => {
        const result = createOperationsModule.createOperations(
          gatsbyApi,
          { ...pluginOptions, salesChannel },
          lastBuildTime
        )

        expect(createOperations.mock.calls.length).toBe(5)
        expect(createOperations.mock.calls).toMatchSnapshot()
        expect(result).toMatchSnapshot()
      })
    }
  }
})
