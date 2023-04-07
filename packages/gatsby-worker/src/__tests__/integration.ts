import "jest-extended"
import { WorkerPool } from "../"
import { isPromise, isRunning } from "../utils"
import { MessagesFromChild, MessagesFromParent } from "./fixtures/test-child"

jest.setTimeout(15000)

describe(`gatsby-worker`, () => {
  let workerPool:
    | WorkerPool<
        typeof import("./fixtures/test-child"),
        MessagesFromParent,
        MessagesFromChild
      >
    | undefined
  const numWorkers = 2

  async function endWorkerPool(): Promise<void> {
    if (workerPool) {
      await Promise.all(workerPool.end())
      workerPool = undefined
    }
  }

  beforeEach(() => {
    workerPool = new WorkerPool(require.resolve(`./fixtures/test-child`), {
      numWorkers,
      env: {
        NODE_OPTIONS: `--require ${require.resolve(`./fixtures/ts-register`)}`,
      },
    })
  })

  afterEach(endWorkerPool)

  it(`discovers exported functions`, () => {
    if (!workerPool) {
      fail(`worker pool not created`)
    }

    const exposedMethodsSingle = Object.keys(workerPool.single).sort()
    const exposedMethodsAll = Object.keys(workerPool.all).sort()
    // we expect that `notAFunction` even tho is exported in child module is not exposed
    // as it's not a function
    expect(exposedMethodsSingle).toMatchInlineSnapshot(`
      Array [
        "async",
        "async100ms",
        "asyncThrow",
        "getWasPonged",
        "lotOfMessagesAndExit",
        "neverEnding",
        "pid",
        "setupPingPongMessages",
        "sync",
        "syncThrow",
      ]
    `)
    // .all and .single should have same methods
    expect(exposedMethodsSingle).toEqual(exposedMethodsAll)
  })

  describe(`.single`, () => {
    it(`exported sync function`, async () => {
      if (!workerPool) {
        fail(`worker pool not created`)
      }

      const returnValue = workerPool.single.sync(`.single sync`)
      // turns sync function into async
      expect(isPromise(returnValue)).toEqual(true)

      const resolvedValue = await returnValue
      expect(resolvedValue).toMatchInlineSnapshot(`"foo .single sync"`)
    })

    it(`exported async function`, async () => {
      if (!workerPool) {
        fail(`worker pool not created`)
      }

      const returnValue = workerPool.single.async(`.single async`)
      // promise is preserved
      expect(isPromise(returnValue)).toEqual(true)

      const resolvedValue = await returnValue
      expect(resolvedValue).toMatchInlineSnapshot(`"foo .single async"`)
    })

    it(`exported sync function that throws`, async () => {
      if (!workerPool) {
        fail(`worker pool not created`)
      }

      expect.assertions(2)

      const returnValue = workerPool.single.syncThrow(`.single syncThrow`)
      // turns sync function into async
      expect(isPromise(returnValue)).toEqual(true)

      try {
        await returnValue
        fail(`promise should reject`)
      } catch (e) {
        expect(e).toMatchInlineSnapshot(`[Error: sync throw]`)
      }
    })

    it(`exported async function that throws`, async () => {
      if (!workerPool) {
        fail(`worker pool not created`)
      }

      expect.assertions(2)

      const returnValue = workerPool.single.asyncThrow(`.single asyncThrow`)
      // promise is preserved
      expect(isPromise(returnValue)).toEqual(true)

      try {
        await returnValue
        fail(`promise should reject`)
      } catch (e) {
        expect(e).toMatchInlineSnapshot(`[Error: async throw]`)
      }
    })
  })

  describe(`.all`, () => {
    it(`exported sync function`, async () => {
      if (!workerPool) {
        fail(`worker pool not created`)
      }

      const returnValue = workerPool.all.sync(`.single sync`, {
        addWorkerId: true,
      })

      expect(returnValue).toBeArrayOfSize(numWorkers)
      // turns sync function into async
      expect(returnValue).toSatisfyAll(isPromise)

      const resolvedValue = await Promise.all(returnValue)
      expect(resolvedValue).toMatchInlineSnapshot(`
        Array [
          "foo .single sync (worker #1)",
          "foo .single sync (worker #2)",
        ]
      `)
    })

    it(`exported async function`, async () => {
      if (!workerPool) {
        fail(`worker pool not created`)
      }

      const returnValue = workerPool.all.async(`.single async`, {
        addWorkerId: true,
      })

      expect(returnValue).toBeArrayOfSize(numWorkers)
      // promise is preserved
      expect(returnValue).toSatisfyAll(isPromise)

      const resolvedValue = await Promise.all(returnValue)
      expect(resolvedValue).toMatchInlineSnapshot(`
        Array [
          "foo .single async (worker #1)",
          "foo .single async (worker #2)",
        ]
      `)
    })

    it(`exported sync function that throws`, async () => {
      if (!workerPool) {
        fail(`worker pool not created`)
      }

      expect.assertions(3)

      const returnValue = workerPool.all.syncThrow(`.single syncThrow`, {
        addWorkerId: true,
        throwOnWorker: 2,
      })
      expect(returnValue).toBeArrayOfSize(numWorkers)
      // turns sync function into async
      expect(returnValue).toSatisfyAll(isPromise)

      try {
        await Promise.all(returnValue)
        fail(`promise should reject`)
      } catch (e) {
        expect(e).toMatchInlineSnapshot(`[Error: sync throw (worker #2)]`)
      }
    })

    it(`exported async function that throws`, async () => {
      if (!workerPool) {
        fail(`worker pool not created`)
      }

      expect.assertions(3)

      const returnValue = workerPool.all.asyncThrow(`.single asyncThrow`, {
        addWorkerId: true,
        throwOnWorker: 2,
      })
      expect(returnValue).toBeArrayOfSize(numWorkers)
      // promise is preserved
      expect(returnValue).toSatisfyAll(isPromise)

      try {
        await Promise.all(returnValue)
        fail(`promise should reject`)
      } catch (e) {
        expect(e).toMatchInlineSnapshot(`[Error: async throw (worker #2)]`)
      }
    })
  })

  describe(`.end`, () => {
    it(`fails currently executed and pending tasks when worker is closed`, async () => {
      if (!workerPool) {
        fail(`worker pool not created`)
      }

      expect.assertions(numWorkers * 2)

      // queueing 2 * numWorkers task, so that currently executed tasks reject
      // as well as pending tasks
      for (let i = 0; i < numWorkers * 2; i++) {
        workerPool.single
          .neverEnding()
          .then(() => {
            fail(`promise should reject`)
          })
          .catch(e => {
            expect(e).toMatchInlineSnapshot(
              `[Error: Worker exited before finishing task]`
            )
          })
      }

      await endWorkerPool()
    })
  })

  describe(`.restart`, () => {
    it(`spawns new processes on restart`, async () => {
      if (!workerPool) {
        fail(`worker pool not created`)
      }

      const initialPids = await Promise.all(workerPool.all.pid())

      // sanity checks:
      expect(initialPids).toBeArrayOfSize(numWorkers)
      expect(initialPids).toSatisfyAll(value => typeof value === `number`)

      await workerPool.restart()
      const newPids = await Promise.all(workerPool.all.pid())
      expect(newPids).toBeArrayOfSize(numWorkers)
      expect(newPids).toSatisfyAll(value => !initialPids.includes(value))
    })

    it(`kills old processes on restart`, async () => {
      if (!workerPool) {
        fail(`worker pool not created`)
      }

      const initialPids = await Promise.all(workerPool.all.pid())

      // sanity checks:
      expect(initialPids).toBeArrayOfSize(numWorkers)
      expect(initialPids).toSatisfyAll(pid => isRunning(pid))

      await workerPool.restart()
      expect(initialPids).toSatisfyAll(pid => !isRunning(pid))
    })

    it(`.single works after restart`, async () => {
      if (!workerPool) {
        fail(`worker pool not created`)
      }

      const returnValue = workerPool.single.async(`.single async`)
      // promise is preserved
      expect(isPromise(returnValue)).toEqual(true)

      const resolvedValue = await returnValue
      expect(resolvedValue).toMatchInlineSnapshot(`"foo .single async"`)
    })

    it(`.all works after restart`, async () => {
      if (!workerPool) {
        fail(`worker pool not created`)
      }

      const returnValue = workerPool.all.async(`.single async`, {
        addWorkerId: true,
      })

      expect(returnValue).toBeArrayOfSize(numWorkers)
      // promise is preserved
      expect(returnValue).toSatisfyAll(isPromise)

      const resolvedValue = await Promise.all(returnValue)
      expect(resolvedValue).toMatchInlineSnapshot(`
        Array [
          "foo .single async (worker #1)",
          "foo .single async (worker #2)",
        ]
      `)
    })

    it(`fails currently executed and pending tasks when worker is restarted`, async () => {
      if (!workerPool) {
        fail(`worker pool not created`)
      }

      expect.assertions(numWorkers * 2)

      // queueing 2 * numWorkers task, so that currently executed tasks reject
      // as well as pending tasks
      for (let i = 0; i < numWorkers * 2; i++) {
        workerPool.single
          .neverEnding()
          .then(() => {
            fail(`promise should reject`)
          })
          .catch(e => {
            expect(e).toMatchInlineSnapshot(
              `[Error: Worker exited before finishing task]`
            )
          })
      }

      await workerPool.restart()
    })
  })

  describe(`task queue`, () => {
    it(`distributes task between workers when using .single`, async () => {
      if (!workerPool) {
        fail(`worker pool not created`)
      }

      interface IReturnOfasync100ms {
        taskId: number
        workerId: string
      }

      const promises: Array<Promise<IReturnOfasync100ms>> = []
      const resultsOrder: Array<IReturnOfasync100ms> = []
      const numTask = numWorkers * 10
      for (let taskId = 1; taskId <= numTask; taskId++) {
        const promise = workerPool.single.async100ms(taskId, {
          addWorkerId: true,
        })
        promise.then(res => {
          resultsOrder.push(res)
        })
        promises.push(promise)
      }

      await Promise.all(promises)

      expect(resultsOrder).toBeArrayOfSize(numTask)

      const executedOnWorker1 = resultsOrder.filter(res => res.workerId === `1`)
      const executedOnWorker2 = resultsOrder.filter(res => res.workerId === `2`)

      // each worker executed some tasks - we can't ensure that task are evenly split
      // so just making sure there are some tasks executed in each worker
      expect(executedOnWorker1.length).toBeGreaterThan(0)
      expect(executedOnWorker2.length).toBeGreaterThan(0)

      // results from each worker came in order of being called
      expect(executedOnWorker1).toEqual(
        executedOnWorker1.sort((a, b) => a.taskId - b.taskId)
      )
      expect(executedOnWorker2).toEqual(
        executedOnWorker2.sort((a, b) => a.taskId - b.taskId)
      )
    })
  })

  describe(`messaging`, () => {
    it(`worker can receive and send messages`, async () => {
      if (!workerPool) {
        fail(`worker pool not created`)
      }

      workerPool.onMessage((msg, workerId) => {
        if (msg.type === `PING`) {
          if (!workerPool) {
            fail(`worker pool not created`)
          }
          workerPool.sendMessage({ type: `PONG` }, workerId)
        }
      })

      // baseline - workers shouldn't be PONGed yet
      expect(await Promise.all(workerPool.all.getWasPonged()))
        .toMatchInlineSnapshot(`
        Array [
          false,
          false,
        ]
      `)

      await Promise.all(workerPool.all.setupPingPongMessages())

      expect(await Promise.all(workerPool.all.getWasPonged()))
        .toMatchInlineSnapshot(`
        Array [
          true,
          true,
        ]
      `)
    })

    it(`sending message to worker that doesn't exist throws error`, async () => {
      expect(() => {
        if (!workerPool) {
          fail(`worker pool not created`)
        }

        workerPool.sendMessage({ type: `PONG` }, 9001)
      }).toThrowError(`There is no worker with "9001" id.`)
    })

    it(`messages are not lost if worker exits soon after sending a message`, async () => {
      if (!workerPool) {
        fail(`worker pool not created`)
      }
      const COUNT = 10000

      let counter = 0
      workerPool.onMessage(msg => {
        if (msg.type === `LOT_OF_MESSAGES_TEST`) {
          counter++
        }
      })

      try {
        await workerPool.single.lotOfMessagesAndExit(COUNT)
      } catch (e) {
        console.log(e)
      }

      expect(counter).toEqual(COUNT)
    })
  })
})
