jest.mock(`../worker`, () => {
  return {
    IMAGE_PROCESSING: jest.fn(),
  }
})
jest.mock(`got`)
const got = require(`got`)
const fs = require(`fs-extra`)

const getScheduler = () => {
  let scheduler
  jest.isolateModules(() => {
    scheduler = require(`../scheduler`)
  })

  return scheduler
}

const workerMock = require(`../worker`).IMAGE_PROCESSING

describe(`scheduler`, () => {
  let boundActionCreators = {}
  beforeEach(() => {
    workerMock.mockReset()
    boundActionCreators = {
      createJob: jest.fn(),
      endJob: jest.fn(),
    }
  })

  it(`should schedule an image processing job`, async () => {
    workerMock.mockReturnValue(Promise.resolve())
    const { scheduleJob } = getScheduler()

    const job = {
      inputPaths: [`/test-image[new].jpg`],
      outputDir: `/public/static/`,
      args: {
        operations: [
          {
            outputPath: `/1234/test-image[new].jpg`,
            args: {
              width: `100`,
            },
          },
        ],
        pluginOptions: {},
      },
    }
    await scheduleJob(job, boundActionCreators)

    expect(workerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        inputPaths: job.inputPaths.map(inputPath => {
          return {
            path: inputPath,
            contentDigest: expect.any(String),
          }
        }),
        outputDir: job.outputDir,
        args: job.args,
      })
    )
  })

  it(`should fail the job when transform failed`, async () => {
    workerMock.mockReturnValue(Promise.reject(`failed transform`))
    const { scheduleJob } = getScheduler()

    expect.assertions(1)
    try {
      await scheduleJob(
        {
          inputPaths: [`/test-image.jpg`],
          outputDir: `/public/static/`,
          args: {
            operations: [
              {
                outputPath: `/1234/test-image.jpg`,
                args: {},
              },
            ],
            pluginOptions: {},
          },
        },
        boundActionCreators
      )
    } catch (err) {
      expect(err).toEqual(`failed transform`)
    }
  })

  it(`Shouldn't schedule a job when outputFile already exists`, async () => {
    workerMock.mockReturnValue(Promise.resolve())
    const orignalSync = fs.existsSync
    fs.existsSync = jest.fn().mockReturnValue(true)
    const { scheduleJob } = getScheduler()
    const job = {
      inputPaths: [`/test-image.jpg`],
      outputDir: `/public/static/`,
      args: {
        operations: [
          {
            outputPath: `/1234/test-image.jpg`,
            args: {},
          },
        ],
        pluginOptions: {},
      },
    }
    await scheduleJob(job, boundActionCreators)

    expect(workerMock).not.toHaveBeenCalled()
    fs.existsSync = orignalSync
  })

  it(`Shouldn't schedule a job when with same outputFile is already being queued`, async () => {
    workerMock.mockReturnValue(Promise.resolve())
    const { scheduleJob } = getScheduler()
    const job = {
      inputPaths: [`/test-image.jpg`],
      outputDir: `/public/static/`,
      args: {
        operations: [
          {
            outputPath: `/1234/test-image.jpg`,
            args: {},
          },
        ],
        pluginOptions: {},
      },
    }
    const jobPromise = scheduleJob(job, boundActionCreators)
    const job2Promise = scheduleJob(job, boundActionCreators)
    expect(jobPromise).toStrictEqual(job2Promise)

    await Promise.all([jobPromise, job2Promise])

    expect(workerMock).toHaveBeenCalledTimes(1)
  })

  describe(`Gatsby cloud`, () => {
    beforeAll(() => {
      process.env.GATSBY_CLOUD_IMAGE_SERVICE_URL = `https://example.com/image-service`
    })

    beforeEach(() => {
      got.post.mockReset()
      got.post.mockResolvedValueOnce({})
    })

    afterAll(() => {
      delete process.env.GATSBY_CLOUD_IMAGE_SERVICE_URL
    })

    it(`should offload sharp transforms to the cloud`, async () => {
      const { scheduleJob } = getScheduler()
      const job = {
        inputPaths: [`/test-image.jpg`],
        outputDir: `/public/static/`,
        args: {
          operations: [
            {
              outputPath: `/1234/test-image3.jpg`,
              args: {},
            },
          ],
          pluginOptions: {},
        },
      }

      await scheduleJob(job, boundActionCreators)

      expect(got.post).toHaveBeenCalledWith(
        process.env.GATSBY_CLOUD_IMAGE_SERVICE_URL,
        {
          body: {
            file: job.inputPaths[0],
            hash: expect.any(String),
            transforms: job.args.operations,
            options: job.args.pluginOptions,
          },
          json: true,
        }
      )
    })
  })
})
