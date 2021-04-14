jest.mock(`sharp`, () => {
  const sharp = path => {
    const pipeline = {
      rotate: () => pipeline,
      resize: () => pipeline,
      png: () => pipeline,
      jpeg: () => pipeline,
      toFile: (_, cb) => cb(),
    }
    return pipeline
  }

  sharp.simd = jest.fn()
  sharp.concurrency = jest.fn()

  return sharp
})

jest.mock(`potrace`, () => {
  const circleSvgString = `<svg height="100" width="100"><circle cx="50" cy="50" r="40" /></svg>`
  return {
    trace: (_, _2, cb) => cb(null, circleSvgString),
    Potrace: {
      TURNPOLICY_MAJORITY: `wat`,
    },
  }
})

const path = require(`path`)

const traceSVGHelpers = require(`../trace-svg`)

const notMemoizedtraceSVG = jest.spyOn(traceSVGHelpers, `notMemoizedtraceSVG`)
const notMemoizedPrepareTraceSVGInputFile = jest.spyOn(
  traceSVGHelpers,
  `notMemoizedPrepareTraceSVGInputFile`
)
// note that we started spying on not memoized functions first
// now we recreate memoized functions that will use function we just started
// spying on
traceSVGHelpers.createMemoizedFunctions()
const memoizedTraceSVG = jest.spyOn(traceSVGHelpers, `memoizedTraceSVG`)
const memoizedPrepareTraceSVGInputFile = jest.spyOn(
  traceSVGHelpers,
  `memoizedPrepareTraceSVGInputFile`
)

const { traceSVG } = require(`../`)

function getFileObject(absolutePath, name = path.parse(absolutePath).name) {
  return {
    id: `${absolutePath} absPath of file`,
    name: name,
    absolutePath,
    extension: `png`,
    internal: {
      contentDigest: `1234`,
    },
  }
}

describe(`traceSVG memoization`, () => {
  const file = getFileObject(path.join(__dirname, `images/test.png`))
  const copyOfFile = getFileObject(path.join(__dirname, `images/test-copy.png`))
  const differentFile = getFileObject(
    path.join(__dirname, `images/different.png`)
  )
  differentFile.internal.contentDigest = `4321`

  beforeEach(() => {
    traceSVGHelpers.clearMemoizeCaches()
    memoizedTraceSVG.mockClear()
    notMemoizedtraceSVG.mockClear()
    memoizedPrepareTraceSVGInputFile.mockClear()
    notMemoizedPrepareTraceSVGInputFile.mockClear()
  })

  it(`Baseline`, async () => {
    await traceSVG({
      file,
    })

    expect(memoizedTraceSVG).toBeCalledTimes(1)
    expect(notMemoizedtraceSVG).toBeCalledTimes(1)
    expect(memoizedPrepareTraceSVGInputFile).toBeCalledTimes(1)
    expect(notMemoizedPrepareTraceSVGInputFile).toBeCalledTimes(1)
  })

  it(`Is memoizing results for same args`, async () => {
    await traceSVG({
      file,
    })

    await traceSVG({
      file,
    })

    expect(memoizedTraceSVG).toBeCalledTimes(2)
    expect(notMemoizedtraceSVG).toBeCalledTimes(1)
    expect(memoizedPrepareTraceSVGInputFile).toBeCalledTimes(1)
    expect(notMemoizedPrepareTraceSVGInputFile).toBeCalledTimes(1)
  })

  it(`Is calling functions with same input file when params change`, async () => {
    await traceSVG({
      file,
      args: {
        color: `red`,
      },
      fileArgs: {
        width: 400,
      },
    })
    await traceSVG({
      file,
      args: {
        color: `blue`,
      },
      fileArgs: {
        width: 400,
      },
    })
    await traceSVG({
      file,
      args: {
        color: `red`,
      },
      fileArgs: {
        width: 200,
      },
    })
    await traceSVG({
      file,
      args: {
        color: `blue`,
      },
      fileArgs: {
        width: 200,
      },
    })
    await traceSVG({
      file: differentFile,
      args: {
        color: `red`,
      },
      fileArgs: {
        width: 400,
      },
    })

    expect(memoizedTraceSVG).toBeCalledTimes(5)
    expect(notMemoizedtraceSVG).toBeCalledTimes(5)
    expect(memoizedPrepareTraceSVGInputFile).toBeCalledTimes(5)
    // trace svg should be actually created just 3 times
    // because it's affected just by `fileArgs`, and not `args`
    // this makes sure we don't try to write to same input file multiple times
    expect(notMemoizedPrepareTraceSVGInputFile).toBeCalledTimes(3)
    expect(notMemoizedPrepareTraceSVGInputFile).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        file,
        options: expect.objectContaining({
          width: 400,
        }),
      })
    )
    expect(notMemoizedPrepareTraceSVGInputFile).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        file,
        options: expect.objectContaining({
          width: 200,
        }),
      })
    )
    expect(notMemoizedPrepareTraceSVGInputFile).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        file: differentFile,
        options: expect.objectContaining({
          width: 400,
        }),
      })
    )

    const usedTmpFilePaths = notMemoizedPrepareTraceSVGInputFile.mock.calls.map(
      args => args[0].tmpFilePath
    )

    // tmpFilePath was always unique
    expect(usedTmpFilePaths.length).toBe(new Set(usedTmpFilePaths).size)
  })

  it(`Use memoized results for file copies`, async () => {
    await traceSVG({
      file,
      args: {
        color: `red`,
      },
      fileArgs: {
        width: 400,
      },
    })
    await traceSVG({
      file: copyOfFile,
      args: {
        color: `red`,
      },
      fileArgs: {
        width: 400,
      },
    })

    expect(memoizedTraceSVG).toBeCalledTimes(2)
    expect(notMemoizedtraceSVG).toBeCalledTimes(1)
    expect(memoizedPrepareTraceSVGInputFile).toBeCalledTimes(1)
    expect(notMemoizedPrepareTraceSVGInputFile).toBeCalledTimes(1)
  })
})
