jest.mock(`../process-file`)

const path = require(`path`)
const worker = require(`../worker`).IMAGE_PROCESSING
const { processFile } = require(`../process-file`)

describe(`worker`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it(`should call processFile with the right arguments`, async () => {
    processFile.mockImplementation((file, contentDigest, transforms) =>
      transforms.map(transform => Promise.resolve(transform))
    )
    const job = {
      inputPath: `inputpath/file.jpg`,
      outputDir: `/public/static/`,
      contentDigest: `1234`,
      operations: [
        {
          outputPath: `myoutputpath/1234/file.jpg`,
          transforms: {
            width: 100,
            height: 100,
          },
        },
      ],
      pluginOptions: {},
    }

    await worker([job.inputPath], job.outputDir, {
      pluginOptions: job.pluginOptions,
      contentDigest: job.contentDigest,
      operations: job.operations,
    })

    expect(processFile).toHaveBeenCalledTimes(1)
    expect(processFile).toHaveBeenCalledWith(
      job.inputPath,
      job.contentDigest,
      job.operations.map(operation => {
        return {
          outputPath: path.join(job.outputDir, operation.outputPath),
          args: operation.transforms,
        }
      }),
      job.pluginOptions
    )
  })

  it(`should fail a promise when image processing fails`, async () => {
    processFile.mockImplementation(() => [
      Promise.reject(new Error(`transform failed`)),
    ])

    const job = {
      inputPath: `inputpath/file.jpg`,
      outputDir: `/public/static/`,
      contentDigest: `1234`,
      operations: [
        {
          outputPath: `myoutputpath/1234/file.jpg`,
          args: {
            width: 100,
            height: 100,
          },
        },
      ],
      pluginOptions: {},
    }

    expect.assertions(1)
    try {
      await worker([job.inputPath], job.outputDir, {
        pluginOptions: job.pluginOptions,
        contentDigest: job.contentDigest,
        operations: job.operations,
      })
    } catch (err) {
      expect(err.message).toEqual(`transform failed`)
    }
  })
})
