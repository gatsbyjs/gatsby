const path = require(`path`)
const _ = require(`lodash`)

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
  `gatsby-plugin-test/worker.js`,
  () => {
    return {
      TEST_JOB: jest.fn(),
    }
  },
  { virtual: true }
)

const worker = require(`gatsby-plugin-test/worker.js`)
const reporter = require(`gatsby-cli/lib/reporter`)
const getJobsManager = () => {
  let jobManager
  jest.isolateModules(() => {
    jobManager = require(`../jobs-manager`)
  })

  return jobManager
}

const pDefer = require(`p-defer`)
const ROOT_DIR = __dirname

const createMockJob = () => {
  return {
    name: `TEST_JOB`,
    inputPaths: [
      path.join(ROOT_DIR, `fixtures/input1.jpg`),
      path.join(ROOT_DIR, `fixtures/input2.jpg`),
    ],
    outputDir: path.join(`ROOT_DIR`, `public/outputDir`),
    args: {
      param1: `param1`,
      param2: `param2`,
    },
    plugin: {
      name: `gatsby-plugin-test`,
      version: `1.0.0`,
    },
  }
}

describe(`Jobs manager`, () => {
  const endActivity = jest.fn()
  beforeEach(() => {
    worker.TEST_JOB.mockReset()
    endActivity.mockClear()
    pDefer.mockClear()
    reporter.phantomActivity.mockImplementation(() => {
      return {
        start: jest.fn(),
        end: endActivity,
      }
    })
  })

  describe(`enqueueJob`, () => {
    it(`should schedule a job`, async () => {
      const { enqueueJob } = getJobsManager()
      worker.TEST_JOB.mockReturnValue(`myresult`)
      worker.NEXT_JOB = jest.fn().mockReturnValue(`another result`)

      const job1 = enqueueJob(createMockJob())
      const job2 = enqueueJob({
        ...createMockJob(),
        inputPaths: [],
        name: `NEXT_JOB`,
      })

      await Promise.all([
        expect(job1).resolves.toBe(`myresult`),
        expect(job2).resolves.toBe(`another result`),
      ])

      expect(endActivity).toHaveBeenCalledTimes(1)
      expect(worker.TEST_JOB).toHaveBeenCalledTimes(1)
      expect(worker.NEXT_JOB).toHaveBeenCalledTimes(1)
    })

    it(`should only enqueue a job once`, async () => {
      const { enqueueJob } = getJobsManager()
      const jobArgs = createMockJob()
      const jobArgs2 = _.cloneDeep(jobArgs)
      const jobArgs3 = {
        name: `TEST_JOB`,
        plugin: {
          name: `gatsby-plugin-test`,
          version: `1.0.0`,
        },
        inputPaths: [
          path.join(ROOT_DIR, `fixtures/input1.jpg`),
          path.join(ROOT_DIR, `fixtures/input2.jpg`),
        ],
        outputDir: path.join(`ROOT_DIR`, `public/outputDir`),
        args: {
          param1: `param1`,
          param2: `param2`,
        },
      }

      worker.TEST_JOB.mockReturnValue(`myresult`)

      const promises = []
      promises.push(enqueueJob(jobArgs))
      promises.push(enqueueJob(jobArgs2))
      promises.push(enqueueJob(jobArgs3))

      await expect(Promise.all(promises)).resolves.toStrictEqual([
        `myresult`,
        `myresult`,
        `myresult`,
      ])
      expect(pDefer).toHaveBeenCalledTimes(1) // this should be enough to check if our job is deterministic
      expect(endActivity).toHaveBeenCalledTimes(1)
      expect(worker.TEST_JOB).toHaveBeenCalledTimes(1)
    })

    it(`should fail when the worker throws an error`, async () => {
      const { enqueueJob } = getJobsManager()
      const jobArgs = createMockJob()
      const jobArgs2 = { ...createMockJob(), inputPaths: [] }

      worker.TEST_JOB.mockImplementationOnce(() => {
        throw new Error(`An error occured`)
      }).mockImplementationOnce(() =>
        Promise.reject(new Error(`An error occured`))
      )

      await expect(enqueueJob(jobArgs)).rejects.toEqual(
        new Error(`An error occured`)
      )
      await expect(enqueueJob(jobArgs2)).rejects.toEqual(
        new Error(`An error occured`)
      )
      expect(endActivity).toHaveBeenCalledTimes(2)
      expect(worker.TEST_JOB).toHaveBeenCalledTimes(2)
    })
  })

  describe(`waitUntilAllJobsComplete`, () => {
    const { enqueueJob, waitUntilAllJobsComplete } = getJobsManager()

    // unsure how to test this yet without a real worker
    it(`should have all tasks resolved when promise is resolved`, async () => {
      worker.TEST_JOB.mockReturnValue(`myresult`)
      const promise = enqueueJob(createMockJob())

      await waitUntilAllJobsComplete()
      expect(worker.TEST_JOB).toHaveBeenCalledTimes(1)
      await expect(promise).resolves.toBe(`myresult`)
    })
  })

  describe(`resolveWorker`, () => {
    const { resolveWorker } = getJobsManager()
    it(`should throw if the worker can't be found`, () => {
      const plugin = {
        name: `test-plugin`,
        version: `1.0.0`,
      }

      expect(() => {
        resolveWorker(plugin)
      }).toThrow(`We couldn't find a worker.js`)
    })
  })
})
