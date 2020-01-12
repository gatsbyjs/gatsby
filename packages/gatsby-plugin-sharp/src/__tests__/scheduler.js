jest.mock(`lodash`, () => {
  return {
    throttle: cb => cb,
  }
})

jest.mock(`../worker`, () => {
  return {
    IMAGE_PROCESSING: jest.fn(),
  }
})
jest.mock(`../utils`, () => {
  return {
    createProgress: jest.fn(),
  }
})

describe(`scheduler`, () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it(`should schedule an image processing job`, async () => {
    const { createProgress } = require(`../utils`)
    const workerMock = require(`../worker`).IMAGE_PROCESSING
    workerMock.mockReturnValue(Promise.resolve())

    const { scheduleJob } = require(`../scheduler`)
    const boundActionCreators = {
      createJob: jest.fn(),
      endJob: jest.fn(),
    }
    const job = {
      inputPath: `/test-image[new].jpg`,
      outputPath: `/1234/test-image[new].jpg`,
      outputDir: `/public/static/`,
      args: {
        width: `100`,
      },
      contentDigest: `digest`,
    }
    await scheduleJob(job, boundActionCreators, `value`, {}, false)

    expect(createProgress).not.toHaveBeenCalled()
    expect(workerMock).toHaveBeenCalledWith([job.inputPath], job.outputDir, {
      contentDigest: job.contentDigest,
      operations: [
        {
          outputPath: job.outputPath,
          transforms: job.args,
        },
      ],
      pluginOptions: `value`,
    })
  })

  it(`should create a progressbar when enabled`, async () => {
    const { createProgress } = require(`../utils`)
    const barStart = jest.fn()
    const barTick = jest.fn()
    const barEnd = jest.fn()
    createProgress.mockReturnValue({
      start: barStart,
      tick: barTick,
      done: barEnd,
    })
    const workerMock = require(`../worker`).IMAGE_PROCESSING
    workerMock.mockReturnValue(Promise.resolve())

    const { scheduleJob } = require(`../scheduler`)
    const boundActionCreators = {
      createJob: jest.fn(),
      endJob: jest.fn(),
    }
    const job = {
      inputPath: `/test-image[new].jpg`,
      outputPath: `/1234/test-image[new].jpg`,
      outputDir: `/public/static/`,
      args: {
        width: `100`,
      },
      contentDigest: `digest`,
    }
    await scheduleJob(job, boundActionCreators)

    expect(createProgress).toHaveBeenCalledTimes(1)
    expect(barStart).toHaveBeenCalledTimes(1)
    expect(barTick).toHaveBeenCalledTimes(1)
    expect(barEnd).toHaveBeenCalledTimes(1)
  })

  it(`should fail the job when transform failed`, async () => {
    const workerMock = require(`../worker`).IMAGE_PROCESSING
    workerMock.mockReturnValue(Promise.reject(`failed transform`))
    const { scheduleJob } = require(`../scheduler`)
    const boundActionCreators = {
      createJob: jest.fn(),
      endJob: jest.fn(),
    }

    expect.assertions(1)
    try {
      await scheduleJob(
        {
          inputPath: `/test-image.jpg`,
          outputPath: `/1234/test-image.jpg`,
          outputDir: `/public/static/`,
          args: {},
        },
        boundActionCreators,
        {},
        {},
        false
      )
    } catch (err) {
      expect(err).toEqual(`failed transform`)
    }
  })

  it(`should schedule two operations when inputPath is the same`, async () => {
    const workerMock = require(`../worker`).IMAGE_PROCESSING
    workerMock.mockReturnValue(Promise.resolve())

    const throttledFn = jest
      .fn()
      .mockImplementationOnce(() => {})
      .mockImplementationOnce((cb, args) => cb(...args))
    jest.doMock(`lodash`, () => {
      return {
        throttle: cb => (...args) => throttledFn(cb, args),
      }
    })

    const { scheduleJob } = require(`../scheduler`)
    const boundActionCreators = {
      createJob: jest.fn(),
      setJob: jest.fn(),
      endJob: jest.fn(),
    }

    const job1 = {
      inputPath: `/test-image.jpg`,
      outputPath: `/1234/test-image.jpg`,
      outputDir: `/public/static/`,
      args: {
        width: `100`,
      },
      contentDigest: `digest`,
    }
    const job1Promise = scheduleJob(job1, boundActionCreators, {}, {}, false)

    const job2 = {
      inputPath: `/test-image.jpg`,
      outputPath: `/1234/test-image-2.jpg`,
      outputDir: `/public/static/`,
      args: {
        width: `200`,
      },
      contentDigest: `digest`,
    }
    const job2Promise = scheduleJob(job2, boundActionCreators, {}, {}, false)

    await Promise.all([job1Promise, job2Promise])

    expect(boundActionCreators.createJob).toHaveBeenCalledTimes(1)
    expect(boundActionCreators.setJob).toHaveBeenCalledTimes(1)
    expect(boundActionCreators.endJob).toHaveBeenCalledTimes(1)
    expect(workerMock).toHaveBeenCalledTimes(1)
    expect(workerMock).toHaveBeenCalledWith(
      [job1.inputPath],
      job1.outputDir,
      expect.objectContaining({
        operations: [
          {
            outputPath: job1.outputPath,
            transforms: job1.args,
          },
          {
            outputPath: job2.outputPath,
            transforms: job2.args,
          },
        ],
      })
    )
  })
})
