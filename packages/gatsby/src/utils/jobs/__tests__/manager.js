const path = require(`path`)
const _ = require(`lodash`)
const { slash } = require(`gatsby-core-utils`)
const worker = require(`./fixtures/node_modules/gatsby-plugin-test/gatsby-worker`)
const reporter = require(`gatsby-cli/lib/reporter`)
const hasha = require(`hasha`)
const fs = require(`fs-extra`)
const pDefer = require(`p-defer`)
const { uuid } = require(`gatsby-core-utils`)
const timers = require(`timers`)
const { MESSAGE_TYPES } = require(`../types`)

let WorkerError
let jobManager = null

// I need a mock to spy on
jest.mock(`p-defer`, () =>
  jest.fn().mockImplementation(jest.requireActual(`p-defer`))
)

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    phantomActivity: jest.fn(),
    createProgress: jest.fn(),
    warn: jest.fn(),
  }
})

jest.mock(`gatsby-core-utils`, () => {
  const realCoreUtils = jest.requireActual(`gatsby-core-utils`)

  return {
    ...realCoreUtils,
    uuid: {
      ...realCoreUtils.uuid,
      v4: jest.fn(realCoreUtils.uuid.v4),
    },
  }
})

jest.mock(`hasha`, () => jest.requireActual(`hasha`))

fs.ensureDir = jest.fn().mockResolvedValue(true)

const nodeModulesPluginPath = slash(
  path.resolve(__dirname, `fixtures`, `node_modules`, `gatsby-plugin-test`)
)

const plugin = {
  name: `gatsby-plugin-test`,
  version: `1.0.0`,
  resolve: nodeModulesPluginPath,
}

const createMockJob = (overrides = {}) => {
  return {
    name: `TEST_JOB`,
    inputPaths: [
      path.resolve(__dirname, `fixtures/input1.jpg`),
      path.resolve(__dirname, `fixtures/input2.jpg`),
    ],
    outputDir: path.resolve(__dirname, `public/outputDir`),
    args: {
      param1: `param1`,
      param2: `param2`,
    },
    ...overrides,
  }
}

const createInternalMockJob = (overrides = {}) => {
  const { createInternalJob } = jobManager

  return createInternalJob(createMockJob(overrides), plugin)
}

describe(`Jobs manager`, () => {
  const endActivity = jest.fn()

  beforeEach(() => {
    worker.TEST_JOB.mockReset()
    worker.NEXT_JOB.mockReset()
    endActivity.mockClear()
    pDefer.mockClear()
    uuid.v4.mockClear()
    reporter.phantomActivity.mockImplementation(() => {
      return {
        start: jest.fn(),
        end: endActivity,
      }
    })
    reporter.createProgress.mockImplementation(() => {
      return {
        start: jest.fn(),
        tick: jest.fn(),
        end: jest.fn(),
      }
    })

    jest.isolateModules(() => {
      jobManager = require(`../manager`)
      WorkerError = require(`../types`).WorkerError
    })
  })

  describe(`createInternalJob`, () => {
    it(`should return the correct format`, async () => {
      const { createInternalJob } = jobManager
      const mockedJob = createMockJob()
      const job = createInternalJob(mockedJob, plugin)

      expect(job).toStrictEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: mockedJob.name,
          contentDigest: expect.any(String),
          inputPaths: [
            {
              path: slash(mockedJob.inputPaths[0]),
              contentDigest: expect.any(String),
            },
            {
              path: slash(mockedJob.inputPaths[1]),
              contentDigest: expect.any(String),
            },
          ],
          outputDir: slash(mockedJob.outputDir),
          args: mockedJob.args,
          plugin: {
            name: `gatsby-plugin-test`,
            version: `1.0.0`,
            resolve: nodeModulesPluginPath,
            isLocal: false,
          },
        })
      )
    })

    it(`should fail when path is relative`, async () => {
      const { createInternalJob } = jobManager
      const jobArgs = createMockJob({
        inputPaths: [`./files/image.jpg`],
      })

      expect.assertions(1)
      try {
        createInternalJob(jobArgs, plugin)
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[Error: ./files/image.jpg should be an absolute path.]`
        )
      }
    })

    it(`shouldn't augument a job twice`, () => {
      const { createInternalJob } = jobManager

      const internalJob = createInternalJob(createMockJob(), plugin)
      createInternalJob(internalJob, plugin)

      expect(uuid.v4).toHaveBeenCalledTimes(1)
    })
  })

  describe(`enqueueJob`, () => {
    it(`should schedule a job`, async () => {
      const { enqueueJob } = jobManager
      worker.TEST_JOB.mockReturnValue({ output: `myresult` })
      worker.NEXT_JOB.mockReturnValue({ output: `another result` })
      const mockedJob = createInternalMockJob()
      const job1 = enqueueJob(mockedJob)
      const job2 = enqueueJob(
        createInternalMockJob({
          inputPaths: [],
          name: `NEXT_JOB`,
        })
      )
      await Promise.all([
        expect(job1).resolves.toStrictEqual({ output: `myresult` }),
        expect(job2).resolves.toStrictEqual({ output: `another result` }),
      ])
      expect(endActivity).toHaveBeenCalledTimes(1)
      expect(worker.TEST_JOB).toHaveBeenCalledTimes(1)
      expect(worker.TEST_JOB).toHaveBeenCalledWith({
        inputPaths: mockedJob.inputPaths,
        outputDir: mockedJob.outputDir,
        args: mockedJob.args,
      })
      expect(worker.NEXT_JOB).toHaveBeenCalledTimes(1)
    })

    it(`should only enqueue a job once`, async () => {
      const { enqueueJob } = jobManager
      const jobArgs = createInternalMockJob()
      const jobArgs2 = _.cloneDeep(jobArgs)
      const jobArgs3 = createInternalMockJob({
        args: {
          param2: `param2`,
          param1: `param1`,
        },
      })

      worker.TEST_JOB.mockReturnValue({ output: `myresult` })

      const promises = []
      promises.push(enqueueJob(jobArgs))
      promises.push(enqueueJob(jobArgs2))
      promises.push(enqueueJob(jobArgs3))

      await expect(Promise.all(promises)).resolves.toStrictEqual([
        { output: `myresult` },
        { output: `myresult` },
        { output: `myresult` },
      ])

      // we have 1 pdefer for the job & 1 for the wait until all jobs are done
      expect(pDefer).toHaveBeenCalledTimes(2) // this should be enough to check if our job is deterministic
      expect(endActivity).toHaveBeenCalledTimes(1)
      expect(worker.TEST_JOB).toHaveBeenCalledTimes(1)
    })

    it(`should fail when the worker throws an error`, async () => {
      const { enqueueJob } = jobManager
      const jobArgs = createInternalMockJob()
      const jobArgs2 = createInternalMockJob({ inputPaths: [] })
      const jobArgs3 = createInternalMockJob({ args: { key: `value` } })
      const jobArgs4 = createInternalMockJob({ args: { key: `value2` } })

      worker.TEST_JOB.mockImplementationOnce(() => {
        throw new Error(`An error occurred`)
      })
        .mockImplementationOnce(() =>
          Promise.reject(new Error(`An error occurred`))
        )
        .mockImplementationOnce(() =>
          Promise.reject({ message: `An error occurred` })
        )
        .mockImplementationOnce(() =>
          Promise.reject({ key: `weird error object` })
        )

      expect.assertions(6)
      try {
        await enqueueJob(jobArgs)
      } catch (err) {
        expect(err).toMatchInlineSnapshot(`[WorkerError: An error occurred]`)
      }
      try {
        await enqueueJob(jobArgs2)
      } catch (err) {
        expect(err).toMatchInlineSnapshot(`[WorkerError: An error occurred]`)
      }

      try {
        await enqueueJob(jobArgs3)
      } catch (err) {
        expect(err).toMatchInlineSnapshot(`[WorkerError: An error occurred]`)
      }

      try {
        await enqueueJob(jobArgs4)
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[WorkerError: {"key":"weird error object"}]`
        )
      }
      expect(endActivity).toHaveBeenCalledTimes(4)
      expect(worker.TEST_JOB).toHaveBeenCalledTimes(4)
    })

    it(`should fail when the worker returns a non object result`, async () => {
      const { enqueueJob } = jobManager
      const jobArgs = createInternalMockJob()
      const jobArgs2 = createInternalMockJob({ inputPaths: [] })

      worker.TEST_JOB.mockResolvedValueOnce(`my result`)
      worker.TEST_JOB.mockResolvedValueOnce(null)

      expect.assertions(2)
      try {
        await enqueueJob(jobArgs)
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[WorkerError: Result of a worker should be an object, type of "string" was given]`
        )
      }
      await expect(enqueueJob(jobArgs2)).resolves.toBeNull()
    })
  })

  // getInProcessJobPromise
  describe(`getInProcessJobPromise`, () => {
    // unsure how to test this yet without a real worker
    it(`should get a promise when set`, async () => {
      worker.TEST_JOB.mockReturnValue({ output: `myresult` })
      const { enqueueJob, getInProcessJobPromise } = jobManager
      const internalJob = createInternalMockJob()
      const promise = enqueueJob(internalJob)

      expect(getInProcessJobPromise(internalJob.contentDigest)).toStrictEqual(
        promise
      )
    })
  })

  describe(`removeInProgressJob`, () => {
    // unsure how to test this yet without a real worker
    it(`should have all tasks resolved when promise is resolved`, async () => {
      worker.TEST_JOB.mockReturnValue({ output: `myresult` })
      const { enqueueJob, removeInProgressJob } = jobManager
      const internalJob = createInternalMockJob()
      await enqueueJob(internalJob)

      expect(
        jobManager.getInProcessJobPromise(internalJob.contentDigest)
      ).not.toBeUndefined()

      removeInProgressJob(internalJob.contentDigest)

      expect(
        jobManager.getInProcessJobPromise(internalJob.contentDigest)
      ).toBeUndefined()
    })
  })

  describe(`waitUntilAllJobsComplete`, () => {
    // unsure how to test this yet without a real worker
    it(`should have all tasks resolved when promise is resolved`, async () => {
      worker.TEST_JOB.mockReturnValue({ output: `myresult` })
      const { enqueueJob, waitUntilAllJobsComplete } = jobManager
      const promise = enqueueJob(createInternalMockJob())

      await waitUntilAllJobsComplete()
      expect(worker.TEST_JOB).toHaveBeenCalledTimes(1)
      await expect(promise).resolves.toStrictEqual({ output: `myresult` })
    })
  })

  describe(`isJobStale`, () => {
    it(`should mark a job as stale if file does not exists`, () => {
      const { isJobStale } = jobManager
      const inputPaths = [
        {
          path: `/tmp/unknown-file.jpg`,
          contentDigest: `1234`,
        },
      ]

      expect(isJobStale({ inputPaths })).toBe(true)
    })

    it(`should mark a job as stale if contentDigest isn't equal`, () => {
      const { isJobStale } = jobManager
      const inputPaths = [
        {
          path: path.resolve(__dirname, `fixtures/input1.jpg`),
          contentDigest: `1234`,
        },
      ]

      expect(isJobStale({ inputPaths })).toBe(true)
    })

    it(`shouldn't mark a job as stale if file is the same`, () => {
      hasha.fromFileSync = jest.fn().mockReturnValue(`1234`)

      const { isJobStale } = jobManager
      const inputPaths = [
        {
          path: path.resolve(__dirname, `fixtures/input1.jpg`),
          contentDigest: `1234`,
        },
      ]

      expect(isJobStale({ inputPaths })).toBe(false)
    })
  })

  describe(`IPC jobs`, () => {
    let listeners = []

    let originalProcessOn
    let originalSend
    /**
     * enqueueJob will run some async code before it sends IPC JOB_CREATED message
     * This promise allow to await until that moment, to make assertions or execute more code
     */
    let waitForJobCreatedIPCSend
    beforeEach(() => {
      process.env.ENABLE_GATSBY_EXTERNAL_JOBS = `true`
      listeners = []
      originalProcessOn = process.on
      originalSend = process.send
      process.on = (type, cb) => {
        listeners.push(cb)
      }

      waitForJobCreatedIPCSend = new Promise(resolve => {
        process.send = jest.fn(msg => {
          if (msg?.type === MESSAGE_TYPES.JOB_CREATED) {
            resolve(msg.payload)
          }
        })
      })

      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.runOnlyPendingTimers()
    })

    afterAll(() => {
      delete process.env.ENABLE_GATSBY_EXTERNAL_JOBS
      jest.useRealTimers()
      process.on = originalProcessOn
      process.send = originalSend
    })

    it(`should schedule a remote job when ipc and env variable are enabled`, async () => {
      const { enqueueJob } = jobManager
      const jobArgs = createInternalMockJob()

      enqueueJob(jobArgs)

      await waitForJobCreatedIPCSend

      jest.runAllTimers()

      expect(process.send).toHaveBeenCalled()
      expect(process.send).toHaveBeenCalledWith({
        type: `JOB_CREATED`,
        payload: jobArgs,
      })

      expect(listeners.length).toBe(1)
      expect(worker.TEST_JOB).not.toHaveBeenCalled()
    })

    it(`should resolve a job when complete message is received`, async () => {
      const { enqueueJob } = jobManager
      const jobArgs = createInternalMockJob()

      const promise = enqueueJob(jobArgs)

      await waitForJobCreatedIPCSend

      jest.runAllTimers()

      listeners[0]({
        type: `JOB_COMPLETED`,
        payload: {
          id: jobArgs.id,
          result: {
            output: `hello`,
          },
        },
      })

      jest.runAllTimers()

      await expect(promise).resolves.toStrictEqual({
        output: `hello`,
      })
      expect(worker.TEST_JOB).not.toHaveBeenCalled()
    })

    it(`should reject a job when failed message is received`, async () => {
      const { enqueueJob } = jobManager
      const jobArgs = createInternalMockJob()

      const promise = enqueueJob(jobArgs)

      await waitForJobCreatedIPCSend

      jest.runAllTimers()

      listeners[0]({
        type: `JOB_FAILED`,
        payload: {
          id: jobArgs.id,
          error: `JOB failed...`,
        },
      })

      jest.runAllTimers()

      await expect(promise).rejects.toStrictEqual(
        new WorkerError(`JOB failed...`)
      )
      expect(worker.TEST_JOB).not.toHaveBeenCalled()
    })

    it(`should run the worker locally when it's not available externally`, async () => {
      worker.TEST_JOB.mockReturnValue({ output: `myresult` })
      const { enqueueJob } = jobManager
      const jobArgs = createInternalMockJob()
      const promise = enqueueJob(jobArgs)

      await waitForJobCreatedIPCSend

      listeners[0]({
        type: `JOB_NOT_WHITELISTED`,
        payload: {
          id: jobArgs.id,
        },
      })

      // Make sure that all the promises get resolved
      await new Promise(resolve => {
        // If this gets flaky, maybe a waitFor?
        timers.setTimeout(resolve, 500)
      })
      jest.runOnlyPendingTimers()

      await expect(promise).resolves.toStrictEqual({ output: `myresult` })
      expect(worker.TEST_JOB).toHaveBeenCalledTimes(1)
    })

    it(`should run the worker locally when it's a local plugin`, async () => {
      jest.useRealTimers()
      const localPluginPath = slash(
        path.resolve(__dirname, `fixtures`, `gatsby-plugin-local`)
      )
      const localPluginWorkerPath = path.join(localPluginPath, `gatsby-worker`)
      const worker = require(localPluginWorkerPath)
      const { enqueueJob, createInternalJob } = jobManager
      const jobArgs = createInternalJob(createMockJob(), {
        name: `gatsby-plugin-local`,
        version: `1.0.0`,
        resolve: localPluginPath,
      })

      await expect(enqueueJob(jobArgs)).resolves.toBeUndefined()
      expect(process.send).not.toHaveBeenCalled()
      expect(worker.TEST_JOB).toHaveBeenCalledTimes(1)
      jest.useFakeTimers()
    })

    it(`shouldn't schedule a remote job when ipc is enabled and env variable is false`, async () => {
      process.env.ENABLE_GATSBY_EXTERNAL_JOBS = `false`
      jest.useRealTimers()
      const { enqueueJob } = jobManager
      const jobArgs = createInternalMockJob()

      await enqueueJob(jobArgs)

      expect(process.send).not.toHaveBeenCalled()
      expect(worker.TEST_JOB).toHaveBeenCalled()
      jest.useFakeTimers()
    })

    it(`should warn when external jobs are enabled but ipc isn't used`, async () => {
      process.env.ENABLE_GATSBY_EXTERNAL_JOBS = `true`
      process.send = null
      jest.useRealTimers()
      const { enqueueJob } = jobManager
      const jobArgs = createInternalMockJob()
      const jobArgs2 = createInternalMockJob({
        args: { key: `val` },
      })

      await enqueueJob(jobArgs)
      await enqueueJob(jobArgs2)

      expect(reporter.warn).toHaveBeenCalledTimes(1)
      expect(worker.TEST_JOB).toHaveBeenCalled()
      jest.useFakeTimers()
    })
  })
})
