import * as createOperations from "../src/create-operations"

import { makeMockGatsbyApi } from "./mocks"

const func = jest.spyOn(createOperations, `createOperationObject`)

beforeEach(() => {
  func.mockReset()
})

describe(`createOperations`, () => {
  const gatsbyApi = makeMockGatsbyApi()

  describe(`when creating operations for a fresh build`, () => {
    it(`creates the proper queries and operations`, () => {
      const result = createOperations.createOperations(gatsbyApi, {}, undefined)

      expect(func.mock.calls.length).toBe(5)
      expect(func.mock.calls).toMatchSnapshot()
      expect(result).toMatchSnapshot()
    })
  })

  describe(`when creating operations for an incremental build`, () => {
    it(`creates the proper queries and operations`, () => {
      const result = createOperations.createOperations(
        gatsbyApi,
        {},
        new Date(0)
      )

      expect(func.mock.calls.length).toBe(5)
      expect(func.mock.calls).toMatchSnapshot()
      expect(result).toMatchSnapshot()
    })
  })

  describe(`when creating operations with a sales channel`, () => {
    it(`creates the proper queries`, () => {
      const result = createOperations.createOperations(
        gatsbyApi,
        { salesChannel: `__TEST__` },
        undefined
      )

      expect(func.mock.calls.length).toBe(5)
      expect(func.mock.calls).toMatchSnapshot()
      expect(result).toMatchSnapshot()
    })
  })
})
