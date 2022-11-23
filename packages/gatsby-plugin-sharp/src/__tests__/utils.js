jest.mock(`gatsby/reporter`)
const { calculateImageSizes } = require(`../utils`)
const reporter = require(`gatsby/reporter`)
const sharp = require(`sharp`)

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

  it(`should throw if height is less than 1`, () => {
    const args = {
      layout: `fixed`,
      height: -50,
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
    const { sizes } = calculateImageSizes(args)
    expect(sizes).toContain(600)
  })

  it(`should return the original width of the image when only height is provided`, () => {
    const args = {
      layout: `fixed`,
      height: 500,
      file,
      imgDimensions,
    }
    const { sizes } = calculateImageSizes(args)
    expect(sizes).toContain(500 * (imgDimensions.width / imgDimensions.height))
  })

  it(`should create images of different sizes based on pixel densities with a given width`, () => {
    const args = {
      layout: `fixed`,
      width: 120,
      file,
      imgDimensions,
    }
    const { sizes } = calculateImageSizes(args)
    expect(sizes).toEqual([120, 240])
  })

  it(`should create images of different sizes based on pixel densities with a given height`, () => {
    const args = {
      layout: `fixed`,
      height: 80,
      file,
      imgDimensions,
    }
    const { sizes } = calculateImageSizes(args)
    expect(sizes).toEqual([120, 240])
  })
})

describe(`calculateImageSizes (fullWidth & constrained)`, () => {
  it(`should throw if width is less than 1`, () => {
    const args = {
      layout: `constrained`,
      width: 0,
      file,
      imgDimensions,
    }
    const getSizes = () => calculateImageSizes(args)
    expect(getSizes).toThrow()
  })

  it(`should throw if height is less than 1`, () => {
    const args = {
      layout: `constrained`,
      height: -50,
      file,
      imgDimensions,
    }
    const getSizes = () => calculateImageSizes(args)
    expect(getSizes).toThrow()
  })

  it(`should include the original size of the image when width is passed`, () => {
    const args = {
      layout: `constrained`,
      width: 400,
      file,
      imgDimensions,
      reporter,
    }
    const { sizes } = calculateImageSizes(args)
    expect(sizes).toContain(400)
  })

  it(`should include the original size of the image when height is passed`, () => {
    const args = {
      layout: `fullWidth`,
      height: 300,
      file,
      imgDimensions,
    }
    const { sizes } = calculateImageSizes(args)
    expect(sizes).toContain(450)
  })

  it(`should create images of different sizes (0.25x, 0.5x, 1x, 2x) from a width`, () => {
    const args = {
      layout: `fullWidth`,
      width: 320,
      file,
      imgDimensions,
    }
    const { sizes } = calculateImageSizes(args)
    expect(sizes).toEqual([80, 160, 320, 640])
  })

  it(`should create images of different sizes (0.25x, 0.5x, 1x) without any defined size provided`, () => {
    const args = {
      layout: `fullWidth`,
      file,
      imgDimensions,
    }
    const { sizes } = calculateImageSizes(args)
    expect(sizes).toEqual([200, 400, 800])
  })

  it(`should return sizes of provided breakpoints in fullWidth`, () => {
    const breakpoints = [50, 70, 150, 250, 300]
    const width = 500
    const args = {
      layout: `fullWidth`,
      width,
      breakpoints,
      file,
      imgDimensions,
      reporter,
    }

    const { sizes } = calculateImageSizes(args)
    expect(sizes).toEqual([50, 70, 150, 250, 300])
  })

  it(`should include provided width along with breakpoints in constrained`, () => {
    const breakpoints = [50, 70, 150, 250, 300]
    const width = 500
    const args = {
      layout: `constrained`,
      width,
      breakpoints,
      file,
      imgDimensions,
      reporter,
    }

    const { sizes } = calculateImageSizes(args)
    expect(sizes).toEqual([50, 70, 150, 250, 300, 500])
  })

  it(`should reject any breakpoints larger than the original width`, () => {
    const breakpoints = [
      50,
      70,
      150,
      250,
      1200,
      1800, // shouldn't be included, larger than original width
    ]
    const width = 1500 // also shouldn't be included
    const args = {
      layout: `fullWidth`,
      width,
      breakpoints,
      file,
      imgDimensions,
      reporter,
    }

    const { sizes } = calculateImageSizes(args)
    expect(sizes).toEqual([50, 70, 150, 250, 1200])
  })

  it(`should add the original width instead of larger breakpoints`, () => {
    const breakpoints = [
      50,
      70,
      150,
      250,
      1800, // shouldn't be included, larger than original width
    ]
    const width = 1300
    const args = {
      layout: `fullWidth`,
      width,
      breakpoints,
      file,
      imgDimensions,
      reporter,
    }

    const { sizes } = calculateImageSizes(args)
    expect(sizes).toEqual([50, 70, 150, 250, 1200])
  })

  it(`should ignore outputPixelDensities when breakpoints are passed in`, () => {
    const breakpoints = [400, 800] // should find these
    const width = 500
    const args = {
      layout: `fullWidth`,
      width,
      outputPixelDensities: [2, 4], // and ignore these, ie [1000, 2000]
      breakpoints,
      file,
      imgDimensions,
      reporter,
    }

    const { sizes } = calculateImageSizes(args)
    expect(sizes).toEqual([400, 800])
  })

  it(`should adjust fullWidth sizes according to fit type`, () => {
    const imgDimensions = {
      width: 2810,
      height: 1360,
    }

    const outputPixelDensities = [1]

    const testsCases = [
      { args: { width: 20, height: 20 }, result: [20, 20] },
      {
        args: {
          width: 20,
          height: 20,
          transformOptions: { fit: sharp.fit.fill },
        },
        result: [20, 20],
      },
      {
        args: {
          width: 20,
          height: 20,
          transformOptions: { fit: sharp.fit.inside },
        },
        result: [20, 10],
      },
      {
        args: {
          width: 20,
          height: 20,
          transformOptions: { fit: sharp.fit.outside },
        },
        result: [41, 20],
      },
      { args: { width: 200, height: 200 }, result: [200, 200] },
      {
        args: {
          width: 200,
          height: 200,
          transformOptions: { fit: sharp.fit.fill },
        },
        result: [200, 200],
      },
      {
        args: {
          width: 200,
          height: 200,
          transformOptions: { fit: sharp.fit.inside },
        },
        result: [200, 97],
      },
      {
        args: {
          width: 200,
          height: 200,
          transformOptions: { fit: sharp.fit.outside },
        },
        result: [413, 200],
      },
    ]
    testsCases.forEach(({ args, result }) => {
      const { presentationWidth, presentationHeight } = calculateImageSizes({
        ...args,
        file,
        outputPixelDensities,
        reporter,
        imgDimensions,
        layout: `fullWidth`,
      })
      expect([presentationWidth, presentationHeight]).toEqual(result)
    })
  })

  it(`should adjust fixed sizes according to fit type`, () => {
    const imgDimensions = {
      width: 2810,
      height: 1360,
    }

    const outputPixelDensities = [1]

    const testsCases = [
      { args: { width: 20, height: 20 }, result: [20, 20] },
      {
        args: {
          width: 20,
          height: 20,
          transformOptions: { fit: sharp.fit.fill },
        },
        result: [20, 20],
      },
      {
        args: {
          width: 20,
          height: 20,
          transformOptions: { fit: sharp.fit.inside },
        },
        result: [20, 10],
      },
      {
        args: {
          width: 20,
          height: 20,
          transformOptions: { fit: sharp.fit.outside },
        },
        result: [41, 20],
      },
      { args: { width: 200, height: 200 }, result: [200, 200] },
      {
        args: {
          width: 200,
          height: 200,
          transformOptions: { fit: sharp.fit.fill },
        },
        result: [200, 200],
      },
      {
        args: {
          width: 200,
          height: 200,
          transformOptions: { fit: sharp.fit.inside },
        },
        result: [200, 97],
      },
      {
        args: {
          width: 200,
          height: 200,
          transformOptions: { fit: sharp.fit.outside },
        },
        result: [413, 200],
      },
    ]
    testsCases.forEach(({ args, result }) => {
      const { presentationWidth, presentationHeight } = calculateImageSizes({
        ...args,
        file,
        outputPixelDensities,
        reporter,
        imgDimensions,
        layout: `fixed`,
      })
      expect([presentationWidth, presentationHeight]).toEqual(result)
    })
  })
})
