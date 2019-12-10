jest.mock(`../process-file`)

const path = require(`path`)
const worker = require(`../gatsby-worker`).IMAGE_PROCESSING
const { processFile } = require(`../process-file`)

describe(`worker`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it(`should call processFile with the right arguments`, async () => {
    processFile.mockImplementation((file, transforms) =>
      transforms.map(transform => Promise.resolve(transform))
    )
    const job = {
      inputPaths: [
        {
          path: `inputpath/file.jpg`,
          contentDigest: `1234`,
        },
      ],
      outputDir: `/public/static/`,
      args: {
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
      },
    }

    await worker(job)

    expect(processFile).toHaveBeenCalledTimes(1)
    expect(processFile).toHaveBeenCalledWith(
      job.inputPaths[0].path,
      [
        {
          ...job.args.operations[0],
          outputPath: path.join(
            job.outputDir,
            job.args.operations[0].outputPath
          ),
        },
      ],
      job.args.pluginOptions
    )
  })

  it(`should fail a promise when image processing fails`, async () => {
    processFile.mockImplementation(() => [
      Promise.reject(new Error(`transform failed`)),
    ])

    const job = {
      inputPaths: [
        {
          path: `inputpath/file.jpg`,
          contentDigest: `1234`,
        },
      ],
      outputDir: `/public/static/`,
      args: {
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
      },
    }

    expect.assertions(1)
    try {
      await worker(job)
    } catch (err) {
      expect(err.message).toEqual(`transform failed`)
    }
  })
})
