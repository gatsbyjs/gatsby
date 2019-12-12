const path = require(`path`)
const _ = require(`lodash`)
const ROOT_DIR = __dirname
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

jest.mock(`../../redux`, () => {
  return {
    store: {
      getState: jest.fn(),
    },
  }
})
jest.mock(`uuid/v4`, () =>
  jest.fn().mockImplementation(jest.requireActual(`uuid/v4`))
)

const worker = require(`/node_modules/gatsby-plugin-test/gatsby-worker.js`)
const reporter = require(`gatsby-cli/lib/reporter`)
const { store } = require(`../../redux`)
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
      path.join(ROOT_DIR, `fixtures/input1.jpg`),
      path.join(ROOT_DIR, `fixtures/input2.jpg`),
    ],
    outputDir: path.join(ROOT_DIR, `public/outputDir`),
    args: {
      param1: `param1`,
      param2: `param2`,
    },
    ...overrides,
  }
}

const createInternalMockJob = (overrides = {}) => {
  const { createInternalJob } = jobManager

  return createInternalJob(createMockJob(overrides), plugin, ROOT_DIR)
}

describe(`Jobs manager`, () => {
  const endActivity = jest.fn()

  beforeEach(() => {
    worker.TEST_JOB.mockReset()
    endActivity.mockClear()
    pDefer.mockClear()
    uuid.mockClear()
    store.getState.mockClear()
    store.getState.mockImplementation(() => {
      return {
        program: {
          directory: ROOT_DIR,
        },
      }
    })
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
      const job = createInternalJob(mockedJob, plugin, ROOT_DIR)

      expect(job).toStrictEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: mockedJob.name,
          contentDigest: expect.any(String),
          inputPaths: [
            {
              path: `fixtures/input1.jpg`,
              contentDigest: expect.any(String),
            },
            {
              path: `fixtures/input2.jpg`,
              contentDigest: expect.any(String),
            },
          ],
          outputDir: `public/outputDir`,
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

    it(`should fail when paths are outside of gatsby`, async () => {
      const { createInternalJob } = jobManager
      const jobArgs = createMockJob({
        inputPaths: [`/anotherdir/files/image.jpg`],
      })

      expect.assertions(1)
      try {
        createInternalJob(jobArgs, plugin, ROOT_DIR)
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[Error: /anotherdir/files/image.jpg is not inside <PROJECT_ROOT>/packages/gatsby/src/utils/__tests__. Make sure your files are inside your gatsby project.]`
        )
      }
    })

    it(`shouldn't augument a job twice`, () => {
      const { createInternalJob } = jobManager

      const internalJob = createInternalJob(createMockJob(), plugin, ROOT_DIR)
      createInternalJob(internalJob, plugin, ROOT_DIR)

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
      expect(pDefer).toHaveBeenCalledTimes(1) // this should be enough to check if our job is deterministic
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
        expect(err).toMatchInlineSnapshot(`[Error: An error occured]`)
      }
      try {
        await enqueueJob(jobArgs2)
      } catch (err) {
        expect(err).toMatchInlineSnapshot(`[Error: An error occured]`)
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
          `[Error: Result of a worker should be an object, type of "string" was given]`
        )
      }
      await expect(enqueueJob(jobArgs2)).resolves.toBeNull()
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
          path: `unknown-file.jpg`,
          contentDigest: `1234`,
        },
      ]

      expect(isJobStale({ inputPaths }, ROOT_DIR)).toBe(true)
    })

    it(`should mark a job as stale if contentDigest isn't equal`, () => {
      const { isJobStale } = jobManager
      const inputPaths = [
        {
          path: `fixtures/input1.jpg`,
          contentDigest: `1234`,
        },
      ]

      expect(isJobStale({ inputPaths }, ROOT_DIR)).toBe(true)
    })

    it(`shouldn't mark a job as stale if file is the same`, () => {
      hasha.fromFileSync = jest.fn().mockReturnValue(`1234`)

      const { isJobStale } = jobManager
      const inputPaths = [
        {
          path: `fixtures/input1.jpg`,
          contentDigest: `1234`,
        },
      ]

      expect(isJobStale({ inputPaths }, ROOT_DIR)).toBe(false)
    })
  })
})
