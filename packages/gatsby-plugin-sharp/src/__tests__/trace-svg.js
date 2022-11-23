jest.mock(`os`, () => {
  const path = require(`path`)

  return {
    ...jest.requireActual(`os`),
    tmpdir: () => path.join(__dirname, `.cache`),
  }
})

const path = require(`path`)
const fs = require(`fs-extra`)

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
      contentDigest: `2022-01-13T13:27:56.654Z`,
    },
  }
}

describe(`traceSVG memoization`, () => {
  const file = getFileObject(path.join(__dirname, `images/test.png`))
  const differentFile = getFileObject(
    path.join(__dirname, `images/144-density.png`)
  )
  differentFile.internal.contentDigest = `4321`

  beforeAll(async () => {
    await fs.ensureDir(path.join(__dirname, `.cache`))
  })

  afterAll(async () => {
    await fs.remove(path.join(__dirname, `.cache`))
  })

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

  it(`should memoizing results for same args`, async () => {
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

  it(
    `should call functions with same input file when params change`,
    async () => {
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

      const usedTmpFilePaths =
        notMemoizedPrepareTraceSVGInputFile.mock.calls.map(
          args => args[0].tmpFilePath
        )

      // tmpFilePath was always unique
      expect(usedTmpFilePaths.length).toBe(new Set(usedTmpFilePaths).size)
    },
    10 * 1000
  )

  it(`Use memoized results for file copies`, async () => {
    const copyPath = path.join(__dirname, `images/test-copy.png`)
    await fs.copy(path.join(__dirname, `images/test.png`), copyPath)

    try {
      const copyOfFile = getFileObject(copyPath)
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
    } finally {
      await fs.remove(copyPath)
    }

    expect(memoizedTraceSVG).toBeCalledTimes(2)
    expect(notMemoizedtraceSVG).toBeCalledTimes(1)
    expect(memoizedPrepareTraceSVGInputFile).toBeCalledTimes(1)
    expect(notMemoizedPrepareTraceSVGInputFile).toBeCalledTimes(1)
  })

  it(`should work with long filenames`, async () => {
    const copyPath = path.join(
      __dirname,
      `images/${`a`.repeat(10)} (1) ${`a`.repeat(100)}.png`
    )
    await fs.copy(path.join(__dirname, `images/test.png`), copyPath)
    expect.assertions(1)

    try {
      const copyOfFile = getFileObject(copyPath)
      await traceSVG({
        file: copyOfFile,
        args: {
          color: `red`,
        },
        fileArgs: {
          width: 400,
        },
      })
      expect(true).toBe(true)
    } finally {
      await fs.remove(copyPath)
    }
  })

  it(`should work with long filenames that end with a dot`, async () => {
    const copyPath = path.join(__dirname, `images/test${`.`.repeat(100)}.png`)
    await fs.copy(path.join(__dirname, `images/test.png`), copyPath)
    expect.assertions(1)

    try {
      const copyOfFile = getFileObject(copyPath)
      await traceSVG({
        file: copyOfFile,
        args: {
          color: `red`,
        },
        fileArgs: {
          width: 400,
        },
      })
      expect(true).toBe(true)
    } catch (err) {
      await fs.remove(copyPath)
    } finally {
      await fs.remove(copyPath)
    }
  })
})
