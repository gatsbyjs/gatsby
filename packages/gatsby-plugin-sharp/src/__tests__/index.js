const path = require(`path`)
const fs = require(`fs-extra`)
jest.mock(`../scheduler`)

jest.mock(`async/queue`, () => () => {
  return {
    push: jest.fn(),
  }
})
jest.mock(`gatsby/dist/redux/actions`, () => {
  return {
    actions: {
      createJobV2: jest.fn().mockReturnValue(Promise.resolve()),
    },
  }
})

const sharp = require(`sharp`)
const { scheduleJob } = require(`../scheduler`)
scheduleJob.mockReturnValue(Promise.resolve())
fs.ensureDirSync = jest.fn()
fs.existsSync = jest.fn().mockReturnValue(false)

const {
  base64,
  generateBase64,
  fluid,
  fixed,
  queueImageResizing,
  getImageSize,
  getImageSizeAsync,
  stats,
  setActions,
} = require(`../`)

const {
  getPluginOptionsDefaults,
  setPluginOptions,
} = require(`../plugin-options`)

jest.mock(`gatsby/reporter`, () => {
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
    ;[`createJob`, `createJobV2`].forEach(api => {
      describe(`with ${api}`, () => {
        let actions
        beforeEach(() => {
          actions = {}
          if (api === `createJobV2`) {
            actions.createJobV2 = jest.fn().mockReturnValue(Promise.resolve())
          }
          setActions(actions)
          scheduleJob.mockClear()
        })

        it(`should round height when auto-calculated ${api}`, () => {
          // Resize 144-density.png (281x136) with a 3px width
          const result = queueImageResizing({
            file: getFileObject(path.join(__dirname, `images/144-density.png`)),
            args: { width: 3 },
          })

          // Width should be: w = (3 * 136) / 281 = 1.451957295
          // We expect value to be rounded to 1
          expect(result.height).toBe(1)
          if (api === `createJobV2`) {
            expect(actions.createJobV2).toHaveBeenCalledTimes(1)
            expect(actions.createJobV2).toMatchSnapshot()
          } else {
            expect(scheduleJob).toHaveBeenCalledTimes(1)
            expect(scheduleJob).toMatchSnapshot()
          }
        })

        it(`file name works with spaces & special characters ${api}`, async () => {
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
          if (api === `createJobV2`) {
            expect(actions.createJobV2).toHaveBeenCalledTimes(1)
            expect(actions.createJobV2).toMatchSnapshot()
          } else {
            expect(scheduleJob).toHaveBeenCalledTimes(1)
            expect(scheduleJob).toMatchSnapshot()
          }
        })

        // re-enable when image processing on demand is implemented
        it.skip(`should process immediately when asked`, async () => {
          const result = queueImageResizing({
            file: getFileObject(path.join(__dirname, `images/144-density.png`)),
            args: { width: 3 },
          })

          await result.finishedPromise

          expect(scheduleJob).toMatchSnapshot()
        })
      })
    })

    it(`should return the same result when using createJob as createJobV2`, async () => {
      scheduleJob.mockClear()
      const actions = {
        createJobV2: jest.fn(() => Promise.resolve()),
      }
      setActions(actions)
      const resultV2 = await queueImageResizing({
        file: getFileObject(path.join(__dirname, `images/144-density.png`)),
        args: { width: 3 },
      })

      setActions({})
      const result = await queueImageResizing({
        file: getFileObject(path.join(__dirname, `images/144-density.png`)),
        args: { width: 3 },
      })
      expect(actions.createJobV2).toHaveBeenCalledTimes(1)
      expect(scheduleJob).toHaveBeenCalledTimes(1)
      expect(result).toStrictEqual(resultV2)
    })
  })

  describe(`fluid`, () => {
    const actions = {}
    beforeEach(() => {
      actions.createJobV2 = jest.fn().mockReturnValue(Promise.resolve())
      setActions(actions)
      scheduleJob.mockClear()
    })

    it(`includes responsive image properties, e.g. sizes, srcset, etc.`, async () => {
      const result = await fluid({ file })

      expect(actions.createJobV2).toHaveBeenCalledTimes(1)
      expect(result).toMatchSnapshot()
    })

    it(`includes responsive image properties, e.g. sizes, srcset, etc. with the createJob api`, async () => {
      setActions({})
      const result = await fluid({ file })

      expect(actions.createJobV2).not.toHaveBeenCalled()
      expect(scheduleJob).toHaveBeenCalledTimes(1)
      expect(result).toMatchSnapshot()
    })

    it(`should give the same result with createJob as with createJobV2`, async () => {
      const resultV2 = await fluid({ file })

      setActions({})
      const result = await fluid({ file })
      expect(actions.createJobV2).toHaveBeenCalledTimes(1)
      expect(scheduleJob).toHaveBeenCalledTimes(1)
      expect(result).toStrictEqual(resultV2)
      expect(actions.createJobV2).toMatchSnapshot()
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
      expect(actions.createJobV2).toMatchSnapshot()
    })

    it(`keeps original file name`, async () => {
      const result = await fluid({
        file,
      })

      expect(path.parse(result.src).name).toBe(file.name)
      expect(path.parse(result.srcSet).name).toBe(file.name)
      expect(actions.createJobV2).toMatchSnapshot()
    })

    it(`does not change the arguments object it is given`, async () => {
      const args = { maxWidth: 400 }
      await fluid({
        file,
        args,
      })

      expect(args).toEqual({ maxWidth: 400 })
      expect(actions.createJobV2).toMatchSnapshot()
    })

    it(`infers the maxWidth if only maxHeight is given`, async () => {
      const args = { maxHeight: 20 }
      const result = await fluid({
        file: getFileObject(path.join(__dirname, `images/144-density.png`)),
        args,
      })

      expect(result.presentationWidth).toEqual(41)
      expect(actions.createJobV2).toMatchSnapshot()
    })

    it(`calculate height based on width when maxWidth & maxHeight are present`, async () => {
      const testsCases = [
        { args: { maxWidth: 20, maxHeight: 20 }, result: [20, 20] },
        {
          args: { maxWidth: 20, maxHeight: 20, fit: sharp.fit.fill },
          result: [20, 20],
        },
        {
          args: { maxWidth: 20, maxHeight: 20, fit: sharp.fit.inside },
          result: [20, 10],
        },
        {
          args: { maxWidth: 20, maxHeight: 20, fit: sharp.fit.outside },
          result: [41, 20],
        },
        { args: { maxWidth: 200, maxHeight: 200 }, result: [200, 200] },
        {
          args: { maxWidth: 200, maxHeight: 200, fit: sharp.fit.fill },
          result: [200, 200],
        },
        {
          args: { maxWidth: 200, maxHeight: 200, fit: sharp.fit.inside },
          result: [200, 97],
        },
        {
          args: { maxWidth: 200, maxHeight: 200, fit: sharp.fit.outside },
          result: [413, 200],
        },
      ]
      const fileObject = getFileObject(
        path.join(__dirname, `images/144-density.png`)
      )

      for (const testCase of testsCases) {
        actions.createJobV2.mockClear()
        const result = await fluid({
          file: fileObject,
          args: testCase.args,
        })

        expect(actions.createJobV2.mock.calls).toMatchSnapshot()
        expect(result.presentationWidth).toEqual(testCase.result[0])
        expect(result.presentationHeight).toEqual(testCase.result[1])
      }
    })

    it(`should throw if maxWidth is less than 1`, async () => {
      const args = { maxWidth: 0 }
      const result = fluid({
        file: getFileObject(path.join(__dirname, `images/144-density.png`)),
        args,
      })

      await expect(result).rejects.toThrow()
      expect(actions.createJobV2).toMatchSnapshot()
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
      expect(actions.createJobV2).toMatchSnapshot()
    })

    it(`should throw on srcSet breakpoints less than 1`, async () => {
      const srcSetBreakpoints = [50, 0]
      const args = { srcSetBreakpoints }
      const result = fluid({
        file: getFileObject(path.join(__dirname, `images/144-density.png`)),
        args,
      })

      await expect(result).rejects.toThrow()
      expect(actions.createJobV2).toMatchSnapshot()
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
      expect(actions.createJobV2).toMatchSnapshot()
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
      expect(actions.createJobV2).toMatchSnapshot()
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
      expect(actions.createJobV2).toMatchSnapshot()
    })
  })

  describe(`fixed`, () => {
    const actions = {}
    beforeEach(() => {
      actions.createJobV2 = jest.fn().mockReturnValue(Promise.resolve())
      setActions(actions)
      scheduleJob.mockClear()
      console.warn = jest.fn()
    })

    it(`should give the same result with createJob as with createJobV2`, async () => {
      const actions = {
        createJobV2: jest.fn(() => Promise.resolve()),
      }
      setActions(actions)
      const resultV2 = await fixed({ file, args: { width: 1 } })

      setActions({})
      const result = await fixed({ file, args: { width: 1 } })
      expect(actions.createJobV2).toHaveBeenCalledTimes(1)
      expect(scheduleJob).toHaveBeenCalledTimes(1)
      expect(result).toStrictEqual(resultV2)
      expect(actions.createJobV2).toMatchSnapshot()
    })

    it(`does not warn when the requested width is equal to the image width`, async () => {
      const args = { width: 1 }

      const result = await fixed({
        file,
        args,
      })

      expect(result.width).toEqual(1)
      expect(console.warn).toHaveBeenCalledTimes(0)
      expect(actions.createJobV2).toMatchSnapshot()
    })

    it(`warns when the requested width is greater than the image width`, async () => {
      const { width } = await sharp(file.absolutePath).metadata()
      const args = { width: width * 2 }

      const result = await fixed({
        file,
        args,
      })

      expect(result.width).toEqual(width)
      expect(console.warn).toHaveBeenCalledTimes(1)
      expect(actions.createJobV2).toMatchSnapshot()
    })

    it(`correctly infers the width when only the height is given`, async () => {
      const args = { height: 10 }

      const result = await fixed({
        file: getFileObject(path.join(__dirname, `images/144-density.png`)),
        args,
      })

      expect(result.width).toEqual(21)
      expect(actions.createJobV2).toMatchSnapshot()
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

    it(`should cache same image`, async () => {
      const file1 = getFileObject(absolutePath)
      const file2 = getFileObject(absolutePath)
      const file3 = getFileObject(absolutePath, `test`, `new-image`)
      // change file of file3
      file3.base = path.join(__dirname, `images/144-density.png`)

      const result = await base64({
        file: file1,
        args,
      })
      const result2 = await base64({
        file: file2,
        args,
      })
      const result3 = await base64({
        file: file3,
        args,
      })

      // I would like to test sharp being executed but I don't really know how to mock that beast :p
      expect(result).toEqual(result2)
      expect(result).not.toEqual(result3)
    })

    // Matches base64 string in snapshot, converts to jpg to force use of bg
    // Testing pixel colour for a match would be better
    it(`should support option: 'background'`, async () => {
      const result = await generateBase64({
        file: getFileObject(path.join(__dirname, `images/alphatest.png`)),
        args: {
          background: `#ff0000`,
          toFormatBase64: `jpg`,
        },
      })

      expect(result).toMatchSnapshot()
    })

    describe(`should support option: 'base64Width'`, () => {
      // Uses 'generateBase64()` directly to avoid `base64()` caching affecting results.
      it(`should support a configurable width`, async () => {
        const result = await generateBase64({
          file,
          args: { base64Width: 42 },
        })

        expect(result.width).toEqual(42)
      })

      it(`should support a configurable default width`, async () => {
        setPluginOptions({ base64Width: 32 })

        const result = await generateBase64({
          file,
          args,
        })

        expect(result.width).toEqual(32)
        setPluginOptions(getPluginOptionsDefaults())
      })

      it(`width via arg overrides global default`, async () => {
        setPluginOptions({ base64Width: 32 })

        const result = await generateBase64({
          file,
          args: { base64Width: 42 },
        })

        expect(result.width).toEqual(42)
        setPluginOptions(getPluginOptionsDefaults())
      })
    })

    describe(`should support options: 'toFormatBase64' and 'forceBase64Format'`, () => {
      it(`should support a different image format for base64`, async () => {
        const result = await generateBase64({
          file,
          args: { toFormatBase64: `webp` },
        })

        expect(result.src).toEqual(
          expect.stringMatching(/^data:image\/webp;base64/)
        )
      })

      it(`should support a configurable default base64 image format`, async () => {
        setPluginOptions({ forceBase64Format: `webp` })
        const result = await generateBase64({
          file,
          args,
        })

        expect(result.src).toEqual(
          expect.stringMatching(/^data:image\/webp;base64/)
        )
        setPluginOptions(getPluginOptionsDefaults())
      })

      it(`image format via arg overrides global default`, async () => {
        setPluginOptions({ forceBase64Format: `png` })
        const result = await generateBase64({
          file,
          args: { toFormatBase64: `webp` },
        })

        expect(result.src).toEqual(
          expect.stringMatching(/^data:image\/webp;base64/)
        )
        setPluginOptions(getPluginOptionsDefaults())
      })
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

    it(`handles padding bytes correctly in async version`, async () => {
      const result = await getImageSizeAsync(
        getFileObject(path.join(__dirname, `images/padding-bytes.jpg`))
      )

      expect(result).toMatchInlineSnapshot(`
        Object {
          "hUnits": "px",
          "height": 1000,
          "mime": "image/jpeg",
          "type": "jpg",
          "wUnits": "px",
          "width": 746,
        }
      `)
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
      const result = await fixed({ file, args })
      expect(result).toMatchSnapshot()
    })

    it(`fluid`, async () => {
      const result = await fluid({ file, args })
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
