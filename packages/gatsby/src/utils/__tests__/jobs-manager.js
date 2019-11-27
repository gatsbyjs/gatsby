const path = require(`path`)
const _ = require(`lodash`)
const { enqueueJob } = require(`../jobs-manager`)

// I need a mock to spy on
jest.mock(`p-defer`, () =>
  jest.fn().mockImplementation(jest.requireActual(`p-defer`))
)

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
  describe(`enqueueJob`, () => {
    it(`should schedule a job`, async () => {
      await expect(enqueueJob(createMockJob())).resolves.toBe(`1`)
    })

    it(`should only enqueue a job once`, async () => {
      const jobArgs = createMockJob()
      const jobArgs2 = _.cloneDeep(jobArgs)
      jobArgs2.inputPaths = jobArgs2.inputPaths.reverse()

      const promises = []
      promises.push(enqueueJob(jobArgs))
      promises.push(enqueueJob(jobArgs2))

      await expect(Promise.all(promises)).resolves.toStrictEqual([`1`, `1`])
      expect(pDefer).toHaveBeenCalledTimes(1) // this should be enough to check if our job is deterministic
    })
  })
})
