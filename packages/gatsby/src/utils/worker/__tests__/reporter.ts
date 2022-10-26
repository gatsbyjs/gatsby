import { createTestWorker, GatsbyTestWorkerPool } from "./test-helpers"
import * as ActionCreators from "gatsby-cli/lib/reporter/redux/actions"

let worker: GatsbyTestWorkerPool | undefined
const spies: Record<keyof typeof ActionCreators, jest.SpyInstance> = (
  Object.keys(ActionCreators) as Array<keyof typeof ActionCreators>
).reduce((acc, key) => {
  if (typeof ActionCreators[key] === `function`) {
    acc[key] = jest.spyOn(ActionCreators, key)
  }
  return acc
}, {} as any)

afterEach(async () => {
  for (const spy of Object.values(spies)) {
    spy.mockClear()
  }
  if (worker) {
    await Promise.all(worker.end())
    worker = undefined
  }
})

it(`worker can use reporter without crashing`, async () => {
  expect.assertions(1)
  worker = createTestWorker()

  try {
    const result = await worker.single.log(`log`)
    expect(result).toEqual(true)
  } catch (e) {
    expect(e).toBeFalsy()
  }
})

describe(`log actions from workers are dispatched in main process`, () => {
  describe(`single log lines`, () => {
    type ActionCreateLogCreatorArgs = [
      "log" | "warn" | "info" | "success" | "verbose" | "error",
      "LOG" | "WARNING" | "INFO" | "SUCCESS" | "DEBUG" | "ERROR"
    ]

    test.each([
      [`log`, `LOG`],
      [`warn`, `WARNING`],
      [`info`, `INFO`],
      [`success`, `SUCCESS`],
      [`verbose`, `DEBUG`],
      [`error`, `ERROR`],
    ] as Array<ActionCreateLogCreatorArgs>)(
      `log type: %s`,
      async (method, level) => {
        expect.assertions(1)
        worker = createTestWorker()

        try {
          await worker.single.log(`foo`, method)
          expect(spies.createLog).toBeCalledWith(
            expect.objectContaining({
              level,
              text: `foo`,
            })
          )
        } catch (e) {
          expect(e).toBeFalsy()
        }
      }
    )
  })

  describe(`activities`, () => {
    it(`.activityTimer`, async () => {
      expect.assertions(3)
      worker = createTestWorker()

      try {
        await worker.single.activityTimer(`foo`)

        expect(spies.startActivity).toBeCalledWith(
          expect.objectContaining({
            id: `foo`,
            text: `foo`,
            type: `spinner`,
          })
        )

        expect(spies.setActivityStatusText).toBeCalledWith(
          expect.objectContaining({
            id: `foo`,
            statusText: `test`,
          })
        )

        expect(spies.endActivity).toBeCalledWith(
          expect.objectContaining({
            id: `foo`,
            status: `SUCCESS`,
          })
        )
      } catch (e) {
        expect(e).toBeFalsy()
      }
    })

    it(`.createProgress`, async () => {
      expect.assertions(6)
      worker = createTestWorker()

      try {
        await worker.single.progress(`foo`)

        expect(spies.startActivity).toBeCalledWith(
          expect.objectContaining({
            id: `foo`,
            text: `foo`,
            type: `progress`,
            current: 0,
            total: 50,
          })
        )

        expect(spies.activityTick).toBeCalledWith(
          expect.objectContaining({
            id: `foo`,
            increment: 25,
          })
        )

        expect(spies.activityTick).toBeCalledWith(
          expect.objectContaining({
            id: `foo`,
            increment: 75,
          })
        )

        expect(spies.setActivityTotal).toBeCalledWith(
          expect.objectContaining({
            id: `foo`,
            total: 100,
          })
        )

        expect(spies.setActivityStatusText).toBeCalledWith(
          expect.objectContaining({
            id: `foo`,
            statusText: `test`,
          })
        )

        expect(spies.endActivity).toBeCalledWith(
          expect.objectContaining({
            id: `foo`,
            status: `SUCCESS`,
          })
        )
      } catch (e) {
        expect(e).toBeFalsy()
      }
    })
  })
})
