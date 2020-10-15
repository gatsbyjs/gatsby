jest.mock(`gatsby-cli/lib/reporter`)
jest.mock(`progress`)
const {
  createGatsbyProgressOrFallbackToExternalProgressBar,
  calculateImageSizes,
} = require(`../utils`)
const reporter = require(`gatsby-cli/lib/reporter`)
const progress = require(`progress`)
const path = require(`path`)

describe.skip(`createGatsbyProgressOrFallbackToExternalProgressBar`, () => {
  beforeEach(() => {
    progress.mockClear()
  })

  it(`should use createProgress from gatsby-cli when available`, () => {
    createGatsbyProgressOrFallbackToExternalProgressBar(`test`, reporter)
    expect(reporter.createProgress).toBeCalled()
    expect(progress).not.toBeCalled()
  })

  it(`should fallback to a local implementation when createProgress does not exists on reporter`, () => {
    reporter.createProgress = null
    const bar = createGatsbyProgressOrFallbackToExternalProgressBar(
      `test`,
      reporter
    )
    expect(progress).toHaveBeenCalledTimes(1)
    expect(bar).toHaveProperty(`start`, expect.any(Function))
    expect(bar).toHaveProperty(`tick`, expect.any(Function))
    expect(bar).toHaveProperty(`done`, expect.any(Function))
    expect(bar).toHaveProperty(`total`)
  })

  it(`should fallback to a local implementation when no reporter is present`, () => {
    const bar = createGatsbyProgressOrFallbackToExternalProgressBar(`test`)
    expect(progress).toHaveBeenCalledTimes(1)
    expect(bar).toHaveProperty(`start`, expect.any(Function))
    expect(bar).toHaveProperty(`tick`, expect.any(Function))
    expect(bar).toHaveProperty(`done`, expect.any(Function))
    expect(bar).toHaveProperty(`total`)
  })
})

function getFileObject(absolutePath, name = `test`, contentDigest = `1234`) {
  const parsedPath = path.parse(absolutePath)
  return {
    id: `${absolutePath} absPath of file`,
    name: name,
    base: parsedPath.base,
    absolutePath,
    extension: `png`,
    internal: {
      contentDigest,
    },
  }
}
const smallFile = getFileObject(path.join(__dirname, `images/144-density.png`))
const largeFile = getFileObject(
  path.join(__dirname, `images/padding-bytes.jpg`)
)

describe.only(`calculateImageSizes (fixed)`, () => {
  it(`should throw if width is less than 1`, () => {
    const args = {
      layout: `fixed`,
      width: 0,
      file: smallFile,
    }
    const getSizes = () => calculateImageSizes(args)
    expect(getSizes).toThrow()
  })

  it(`should always return the original width of the image when only width is provided`, () => {
    const args = {
      layout: `fixed`,
      width: 600,
      file: largeFile,
    }
    const sizes = calculateImageSizes(args)
    console.log(sizes)
    expect(sizes).toContain(600)
  })

  it(`should always return the original width of the image when only height is provided`, () => {
    const args = {
      layout: `fixed`,
      height: 500,
      file: largeFile,
    }
    const sizes = calculateImageSizes(args)
    console.log(sizes)
    expect(sizes).toContain(373)
  })

  // it(`should create images of different sizes (1x, 2x, and 3x)`, () => {
  //   const sizes = calculateImageSizes()
  //   return
  // })
})

describe(`calculateImageSizes (fluid)`, () => {
  it(`should throw if maxWidth is less than 1`, () => {
    const sizes = calculateImageSizes()
    return
  })

  it(`should include the original size of the image`, () => {
    const sizes = calculateImageSizes()
    return
  })

  it(`should create images of different sizes (1/4, 1/2, 1, 1.5, 2)`, () => {
    const sizes = calculateImageSizes()
    return
  })
})

describe(`calculateImageSizes (constrained)`, () => {
  it(`should throw if maxWidth is less than 1`, () => {
    const sizes = calculateImageSizes()
    return
  })
})
