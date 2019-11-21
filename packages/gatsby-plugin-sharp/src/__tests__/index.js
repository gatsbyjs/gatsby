const path = require(`path`)
const sharp = require(`sharp`)
const fs = require(`fs-extra`)
jest.mock(`../scheduler`)

jest.mock(`async/queue`, () => () => {
  return {
    push: jest.fn(),
  }
})

fs.ensureDirSync = jest.fn()
fs.existsSync = jest.fn().mockReturnValue(false)

const {
  base64,
  fluid,
  fixed,
  queueImageResizing,
  getImageSize,
  stats,
} = require(`../`)
const { scheduleJob } = require(`../scheduler`)
scheduleJob.mockResolvedValue(Promise.resolve())

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    activityTimer: () => {
      return {
        start: jest.fn(),
        setStatus: jest.fn(),
        end: jest.fn(),
      }
    },
  }
})

describe(`gatsby-plugin-sharp`, () => {
  const args = {
    duotone: false,
    grayscale: false,
    rotate: false,
  }
  const absolutePath = path.join(__dirname, `images/test.png`)
  const file = getFileObject(absolutePath)

  // used to find all breakpoints in a srcSet string
  const findAllBreakpoints = srcSet => {
    // RegEx to find all occurrences of 'Xw', where 'X' can be any int
    const regEx = /[0-9]+w/g
    return srcSet.match(regEx)
  }

  describe(`queueImageResizing`, () => {
    it(`should round height when auto-calculated`, () => {
      // Resize 144-density.png (281x136) with a 3px width
      const result = queueImageResizing({
        file: getFileObject(path.join(__dirname, `images/144-density.png`)),
        args: { width: 3 },
      })

      // Width should be: w = (3 * 136) / 281 = 1.451957295
      // We expect value to be rounded to 1
      expect(result.height).toBe(1)
    })

    it(`file name works with spaces & special characters`, async () => {
      // test name encoding with various characters
      const testName = `spaces and '"@#$%^&,`

      const queueResult = queueImageResizing({
        file: getFileObject(
          path.join(__dirname, `images/144-density.png`),
          testName
        ),
        args: { width: 3 },
      })

      const queueResultName = path.parse(queueResult.src).name

      // decoding to check for outputting same name
      expect(decodeURIComponent(queueResultName)).toBe(testName)

      // regex for special characters above and spaces
      // testname should match, the queue result should not
      expect(testName.match(/[!@#$^&," ]/)).not.toBe(false)
      expect(queueResultName.match(/[!@#$^&," ]/)).not.toBe(true)
    })

    // re-enable when image processing on demand is implemented
    it.skip(`should process immediately when asked`, async () => {
      scheduleJob.mockClear()
      const result = queueImageResizing({
        file: getFileObject(path.join(__dirname, `images/144-density.png`)),
        args: { width: 3 },
      })

      await result.finishedPromise

      expect(scheduleJob).toMatchSnapshot()
    })

    it(`Shouldn't schedule a job when outputFile already exists`, async () => {
      scheduleJob.mockClear()
      fs.existsSync.mockReturnValue(true)

      const result = queueImageResizing({
        file: getFileObject(path.join(__dirname, `images/144-density.png`)),
        args: { width: 3 },
      })

      await result.finishedPromise

      expect(fs.existsSync).toHaveBeenCalledWith(result.absolutePath)
      expect(scheduleJob).not.toHaveBeenCalled()
    })
  })

  describe(`fluid`, () => {
    it(`includes responsive image properties, e.g. sizes, srcset, etc.`, async () => {
      const result = await fluid({ file })

      expect(result).toMatchSnapshot()
    })

    it(`adds pathPrefix if defined`, async () => {
      const pathPrefix = `/blog`
      const result = await fluid({
        file,
        args: {
          pathPrefix,
        },
      })

      expect(result.src.indexOf(pathPrefix)).toBe(0)
      expect(result.srcSet.indexOf(pathPrefix)).toBe(0)
    })

    it(`keeps original file name`, async () => {
      const result = await fluid({
        file,
      })

      expect(path.parse(result.src).name).toBe(file.name)
      expect(path.parse(result.srcSet).name).toBe(file.name)
    })

    it(`does not change the arguments object it is given`, async () => {
      const args = { maxWidth: 400 }
      await fluid({
        file,
        args,
      })

      expect(args).toEqual({ maxWidth: 400 })
    })

    it(`infers the maxWidth if only maxHeight is given`, async () => {
      const args = { maxHeight: 20 }
      const result = await fluid({
        file: getFileObject(path.join(__dirname, `images/144-density.png`)),
        args,
      })

      expect(result.presentationWidth).toEqual(41)
    })

    it(`should throw if maxWidth is less than 1`, async () => {
      const args = { maxWidth: 0 }
      const result = fluid({
        file: getFileObject(path.join(__dirname, `images/144-density.png`)),
        args,
      })

      await expect(result).rejects.toThrow()
    })

    it(`accepts srcSet breakpoints`, async () => {
      const srcSetBreakpoints = [50, 70, 150, 250]
      const args = { srcSetBreakpoints }
      const result = await fluid({
        file: getFileObject(path.join(__dirname, `images/144-density.png`)),
        args,
      })

      // width of the image tested
      const originalWidth = 281
      const expected = srcSetBreakpoints.map(size => `${size}w`)
      // add the original size of `144-density.png`
      expected.push(`${originalWidth}w`)

      const actual = findAllBreakpoints(result.srcSet)
      // should contain all requested sizes as well as the original size
      expect(actual).toEqual(expect.arrayContaining(expected))
    })

    it(`should throw on srcSet breakpoints less than 1`, async () => {
      const srcSetBreakpoints = [50, 0]
      const args = { srcSetBreakpoints }
      const result = fluid({
        file: getFileObject(path.join(__dirname, `images/144-density.png`)),
        args,
      })

      await expect(result).rejects.toThrow()
    })

    it(`ensure maxWidth is in srcSet breakpoints`, async () => {
      const srcSetBreakpoints = [50, 70, 150]
      const maxWidth = 200
      const args = {
        maxWidth,
        srcSetBreakpoints,
      }
      const result = await fluid({
        file: getFileObject(path.join(__dirname, `images/144-density.png`)),
        args,
      })

      expect(result.srcSet).toEqual(expect.stringContaining(`${maxWidth}w`))
    })

    it(`reject any breakpoints larger than the original width`, async () => {
      const srcSetBreakpoints = [
        50,
        70,
        150,
        250,
        300, // this shouldn't be in the output as it's wider than the original
      ]
      const maxWidth = 500 // this also shouldn't be in the output
      const args = {
        maxWidth,
        srcSetBreakpoints,
      }
      const result = await fluid({
        file: getFileObject(path.join(__dirname, `images/144-density.png`)),
        args,
      })

      // width of the image tested
      const originalWidth = 281
      const expected = srcSetBreakpoints
        // filter out the widths that are larger than the source image width
        .filter(size => size < originalWidth)
        .map(size => `${size}w`)
      // add the original size of `144-density.png`
      expected.push(`${originalWidth}w`)

      const actual = findAllBreakpoints(result.srcSet)
      // should contain all requested sizes as well as the original size
      expect(actual).toEqual(expect.arrayContaining(expected))
      // should contain no other sizes
      expect(actual.length).toEqual(expected.length)
    })

    it(`prevents duplicate breakpoints`, async () => {
      const srcSetBreakpoints = [50, 50, 100, 100, 100, 250, 250]
      const maxWidth = 100
      const args = {
        maxWidth,
        srcSetBreakpoints,
      }
      const result = await fluid({
        file: getFileObject(path.join(__dirname, `images/144-density.png`)),
        args,
      })

      const originalWidth = 281
      const expected = [`50w`, `100w`, `250w`, `${originalWidth}w`]

      const actual = findAllBreakpoints(result.srcSet)
      expect(actual).toEqual(expect.arrayContaining(expected))
      expect(actual.length).toEqual(expected.length)
    })
  })

  describe(`fixed`, () => {
    it(`does not warn when the requested width is equal to the image width`, async () => {
      console.warn = jest.fn()
      const args = { width: 1 }

      const result = await fixed({
        file,
        args,
      })

      expect(result.width).toEqual(1)
      expect(console.warn).toHaveBeenCalledTimes(0)
      console.warn.mockClear()
    })

    it(`warns when the requested width is greater than the image width`, async () => {
      console.warn = jest.fn()
      const { width } = await sharp(file.absolutePath).metadata()
      const args = { width: width * 2 }

      const result = await fixed({
        file,
        args,
      })

      expect(result.width).toEqual(width)
      expect(console.warn).toHaveBeenCalledTimes(1)
      console.warn.mockClear()
    })

    it(`correctly infers the width when only the height is given`, async () => {
      const args = { height: 10 }

      const result = await fixed({
        file: getFileObject(path.join(__dirname, `images/144-density.png`)),
        args,
      })

      expect(result.width).toEqual(21)
    })
  })

  describe(`base64`, () => {
    it(`converts image to base64`, async () => {
      const result = await base64({
        file,
        args,
      })

      expect(result).toMatchSnapshot()
    })
  })

  describe(`image quirks`, () => {
    // issue https://github.com/nodeca/probe-image-size/issues/20
    it(`handles padding bytes correctly`, () => {
      const result = getImageSize(
        getFileObject(path.join(__dirname, `images/padding-bytes.jpg`))
      )

      expect(result).toMatchSnapshot()
    })
  })

  describe(`tracedSVG`, () => {
    it(`doesn't always run`, async () => {
      const args = {
        maxWidth: 100,
        width: 100,
        tracedSVG: { color: `#FF0000` },
      }

      let result = await fixed({
        file,
        args,
      })

      expect(result.tracedSVG).toBeUndefined()

      result = await fluid({
        file,
        args,
      })

      expect(result.tracedSVG).toBeUndefined()
    })

    it(`runs on demand`, async () => {
      const args = {
        maxWidth: 100,
        width: 100,
        generateTracedSVG: true,
        tracedSVG: { color: `#FF0000` },
        base64: false,
      }

      const fixedSvg = await fixed({
        file,
        args,
      })

      expect(fixedSvg).toMatchSnapshot()

      const fluidSvg = await fluid({
        file,
        args,
      })

      expect(fluidSvg).toMatchSnapshot()
    })
  })

  describe(`duotone`, () => {
    const args = {
      maxWidth: 100,
      width: 100,
      duotone: { highlight: `#ffffff`, shadow: `#cccccc`, opacity: 50 },
    }

    it(`fixed`, async () => {
      let result = await fixed({ file, args })
      expect(result).toMatchSnapshot()
    })

    it(`fluid`, async () => {
      let result = await fluid({ file, args })
      expect(result).toMatchSnapshot()
    })
  })

  describe(`stats`, () => {
    it(`determines if the image is transparent, based on the presence and use of alpha channel`, async () => {
      const result = await stats({ file, args })
      expect(result).toMatchSnapshot()
      expect(result.isTransparent).toEqual(false)

      const alphaResult = await stats({
        file: getFileObject(path.join(__dirname, `images/alphatest.png`)),
        args,
      })
      expect(alphaResult).toMatchSnapshot()
      expect(alphaResult.isTransparent).toEqual(true)
    })
  })
})

function getFileObject(absolutePath, name = `test`) {
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
