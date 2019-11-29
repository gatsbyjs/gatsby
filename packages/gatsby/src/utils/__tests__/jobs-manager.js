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
      await expect(enqueueJob(createMockJob())).resolves.toBe(`1`)
      expect(endActivity).toHaveBeenCalledTimes(1)
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

      const promises = []
      promises.push(enqueueJob(jobArgs))
      promises.push(enqueueJob(jobArgs2))
      promises.push(enqueueJob(jobArgs3))

      await expect(Promise.all(promises)).resolves.toStrictEqual([
        `1`,
        `1`,
        `1`,
      ])
      expect(pDefer).toHaveBeenCalledTimes(1) // this should be enough to check if our job is deterministic
      expect(endActivity).toHaveBeenCalledTimes(1)
    })
  })

  describe(`waitUntilAllJobsComplete`, () => {
    const { enqueueJob, waitUntilAllJobsComplete } = getJobsManager()

    // unsure how to test this yet without a real worker
    it.skip(`should have all tasks resolved when promise is resolved`, async () => {
      enqueueJob(createMockJob())

      await waitUntilAllJobsComplete()
      // worker has been called
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
