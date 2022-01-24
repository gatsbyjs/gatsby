/**  @jest-environment node */
import { exec } from "child_process"

jest.mock(`child_process`, () => {
  return {
    exec: jest.fn(async (command, options, cb) => {
      setImmediate(() => {
        try {
          return cb(
            null,
            `> sharp@0.29.3 install C:\\Users\\Ward\\projects\\gatsby\\gatsby\\node_modules\\sharp\n`,
            ``
          )
        } catch (err) {
          return cb(true, ``, err.message)
        }
      })
    }),
  }
})

function getSharpInstance(): typeof import("../index") {
  let getSharpInstance
  jest.isolateModules(() => {
    getSharpInstance = require(`../index`)
  })

  return getSharpInstance()
}

describe(`getSharpInstance`, () => {
  beforeEach(() => {
    exec.mockClear()
  })

  // jest mocking is making this impossible to test
  it(`should give you the bare sharp module`, async () => {
    const sharpInstance = await getSharpInstance()

    expect(exec).not.toHaveBeenCalled()
    expect(sharpInstance).toBeDefined()
    expect(sharpInstance.versions).toBeDefined()
  })

  it(
    `should rebuild sharp when binaries not found for current arch`,
    async () => {
      expect.assertions(3)

      let called = false
      jest.doMock(`sharp`, () => {
        if (!called) {
          called = true
          throw new Error(`sharp failed to load`)
        }

        return jest.requireActual(`sharp`)
      })

      try {
        const sharpInstance = await getSharpInstance()
        expect(sharpInstance).toBeDefined()
        expect(sharpInstance.versions).toBeDefined()
      } catch (err) {
        // ignore
      }

      expect(exec).toHaveBeenCalledWith(
        `npm rebuild sharp`,
        expect.anything(),
        expect.anything()
      )
    },
    60 * 1000
  )
})
