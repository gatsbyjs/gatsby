const path = require(`path`)
const _ = require(`lodash`)
const slash = require(`slash`)
let jobManager = null

// I need a mock to spy on
jest.mock(`p-defer`, () =>
  jest.fn().mockImplementation(jest.requireActual(`p-defer`))
)

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    phantomActivity: jest.fn(),
  }
})

jest.mock(
  `/node_modules/gatsby-plugin-test/gatsby-worker.js`,
  () => {
    return {
      TEST_JOB: jest.fn(),
    }
  },
  { virtual: true }
)

jest.mock(`uuid/v4`, () =>
  jest.fn().mockImplementation(jest.requireActual(`uuid/v4`))
)

const worker = require(`/node_modules/gatsby-plugin-test/gatsby-worker.js`)
const reporter = require(`gatsby-cli/lib/reporter`)
const hasha = require(`hasha`)
const fs = require(`fs-extra`)
const pDefer = require(`p-defer`)
const uuid = require(`uuid/v4`)

fs.ensureDir = jest.fn().mockResolvedValue(true)

const plugin = {
  name: `gatsby-plugin-test`,
  version: `1.0.0`,
  resolve: `/node_modules/gatsby-plugin-test`,
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
    endActivity.mockClear()
    pDefer.mockClear()
    uuid.mockClear()
    reporter.phantomActivity.mockImplementation(() => {
      return {
        start: jest.fn(),
        end: endActivity,
      }
    })

    jest.isolateModules(() => {
      jobManager = require(`../jobs-manager`)
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
            resolve: `/node_modules/gatsby-plugin-test`,
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

      expect(uuid).toHaveBeenCalledTimes(1)
    })
  })

  describe(`enqueueJob`, () => {
    it(`should schedule a job`, async () => {
      const { enqueueJob } = jobManager
      worker.TEST_JOB.mockReturnValue({ output: `myresult` })
      worker.NEXT_JOB = jest.fn().mockReturnValue({ output: `another result` })
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

      worker.TEST_JOB.mockImplementationOnce(() => {
        throw new Error(`An error occured`)
      }).mockImplementationOnce(() =>
        Promise.reject(new Error(`An error occured`))
      )

      expect.assertions(4)
      try {
        await enqueueJob(jobArgs)
      } catch (err) {
        expect(err).toMatchInlineSnapshot(`[WorkerError: An error occured]`)
      }
      try {
        await enqueueJob(jobArgs2)
      } catch (err) {
        expect(err).toMatchInlineSnapshot(`[WorkerError: An error occured]`)
      }
      expect(endActivity).toHaveBeenCalledTimes(2)
      expect(worker.TEST_JOB).toHaveBeenCalledTimes(2)
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
})
