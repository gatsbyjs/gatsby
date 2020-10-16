jest.mock(`gatsby-cli/lib/reporter`)
jest.mock(`progress`)
const {
  createGatsbyProgressOrFallbackToExternalProgressBar,
  calculateImageSizes,
} = require(`../utils`)
const reporter = require(`gatsby-cli/lib/reporter`)
const progress = require(`progress`)
const path = require(`path`)

describe(`createGatsbyProgressOrFallbackToExternalProgressBar`, () => {
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

const file = {
  absolutePath: `~/Usr/gatsby-sites/src/img/photo.png`,
}
const imgDimensions = {
  width: 1200,
  height: 800,
}

describe(`calculateImageSizes (fixed)`, () => {
  it(`should throw if width is less than 1`, () => {
    const args = {
      layout: `fixed`,
      width: 0,
      file,
      imgDimensions,
    }
    const getSizes = () => calculateImageSizes(args)
    expect(getSizes).toThrow()
  })

  it(`should return the original width of the image when only width is provided`, () => {
    const args = {
      layout: `fixed`,
      width: 600,
      file,
      imgDimensions,
    }
    const sizes = calculateImageSizes(args)
    expect(sizes).toContain(600)
  })

  it(`should return the original width of the image when only height is provided`, () => {
    const args = {
      layout: `fixed`,
      height: 500,
      file,
      imgDimensions,
    }
    const sizes = calculateImageSizes(args)
    expect(sizes).toContain(500 * (imgDimensions.width / imgDimensions.height))
  })

  // TODO: should fixed create more than the one image?
  it.only(`should create images of different sizes (1x, 1.5x, and 2x)`, () => {
    const args = {
      layout: `fixed`,
      width: 120,
      file,
      imgDimensions,
    }
    const sizes = calculateImageSizes(args)
    expect(sizes).toEqual(expect.arrayContaining([120, 240, 360]))
  })
})

describe(`calculateImageSizes (fluid)`, () => {
  it(`should throw if maxWidth is less than 1`, () => {
    const args = {
      layout: `fluid`,
      maxWidth: 0,
      file,
      imgDimensions,
    }
    const getSizes = () => calculateImageSizes(args)
    expect(getSizes).toThrow()
  })

  it(`should include the original size of the image`, () => {
    const args = {
      layout: `fluid`,
      maxWidth: 400,
      file,
      imgDimensions,
    }
    const sizes = calculateImageSizes(args)
    expect(sizes).toContain(400)
  })

  // TODO: this seems incorrect, wouldn't we want larger sizes than the maxWidth provided?
  // and what scale instead? (vs 1x, 2x, 3x)
  it(`should create images of different sizes (1x, 2x, and 3x) based off of the provided pixel densities with no srcSetBreakpoints provided`, () => {
    const args = {
      layout: `fluid`,
      maxWidth: 320,
      file,
      imgDimensions,
    }
    const sizes = calculateImageSizes(args)
    expect(sizes).toEqual(expect.arrayContaining([320]))
  })

  it(`should return provided srcSetBreakpoints`, () => {
    const srcSetBreakpoints = [50, 70, 150, 250, 300]
    const maxWidth = 500
    const args = {
      layout: `fluid`,
      maxWidth,
      srcSetBreakpoints,
      file,
      imgDimensions,
    }

    const sizes = calculateImageSizes(args)
    expect(sizes).toEqual(expect.arrayContaining([50, 70, 150, 250, 300, 500]))
  })

  it(`should reject any srcSetBreakpoints larger than the original width`, () => {
    const srcSetBreakpoints = [
      50,
      70,
      150,
      250,
      1000, // shouldn't be included, larger than original width
    ]
    const maxWidth = 1200 // also shouldn't be included
    const args = {
      layout: `fluid`,
      maxWidth,
      srcSetBreakpoints,
      file,
      imgDimensions,
    }

    const sizes = calculateImageSizes(args)
    expect(sizes).toEqual(expect.arrayContaining([50, 70, 150, 250]))
  })
})

describe(`calculateImageSizes (constrained)`, () => {
  it(`should throw if maxWidth is less than 1`, () => {
    return
  })
})
