jest.mock(`got`)
jest.mock(`../safe-sharp`, () => {
  return {
    simd: jest.fn(),
    concurrency: jest.fn(),
  }
})
const { createArgsDigest, processFile, sortKeys } = require(`../process-file`)
const got = require(`got`)

describe(`createArgsDigest`, () => {
  const defaultArgsBaseline = {
    toFormat: `jpg`,
    width: 500,
    height: 500,
    cropFocus: 17,
    quality: 50,
    pngCompressionLevel: 4,
    jpegProgressive: false,
    grayscale: false,
    rotate: 0,
    duotone: null,
    fit: `COVER`,
    background: `rgb(0,0,0,1)`,
  }

  describe(`changes hash if used args are different`, () => {
    const testHashDifferent = (label, change, extraBaselineOptions = {}) => {
      it(label, () => {
        const argsBaseline = {
          ...defaultArgsBaseline,
          ...extraBaselineOptions,
        }
        const baselineHash = createArgsDigest(argsBaseline)
        const outputHash = createArgsDigest({
          ...defaultArgsBaseline,
          ...change,
        })
        expect(baselineHash).not.toBe(outputHash)
      })
    }

    testHashDifferent(`width change`, { width: defaultArgsBaseline.width + 1 })
    testHashDifferent(`height change`, {
      height: defaultArgsBaseline.height + 1,
    })
    testHashDifferent(`cropFocus change`, {
      cropFocus: defaultArgsBaseline.cropFocus + 1,
    })
    testHashDifferent(`format change`, { toFormat: `png` })
    testHashDifferent(`jpegProgressive change`, {
      jpegProgressive: !defaultArgsBaseline.jpegProgressive,
    })
    testHashDifferent(`grayscale change`, {
      grayscale: !defaultArgsBaseline.grayscale,
    })
    testHashDifferent(`rotate change`, {
      rotate: defaultArgsBaseline.rotate + 1,
    })
    testHashDifferent(`duotone change`, {
      duotone: {
        highlight: `#ff0000`,
        shadow: `#000000`,
      },
    })
    testHashDifferent(`fit change`, { fit: `CONTAIN` })
    testHashDifferent(`background change`, { background: `#fff0` })
  })

  describe(`doesn't change hash if not used options are different`, () => {
    const testHashEqual = (label, change, extraBaselineOptions = {}) => {
      it(label, () => {
        const argsBaseline = {
          ...defaultArgsBaseline,
          ...extraBaselineOptions,
        }
        const baselineHash = createArgsDigest(argsBaseline)
        const outputHash = createArgsDigest({
          ...defaultArgsBaseline,
          ...change,
        })
        expect(baselineHash).toBe(outputHash)
      })
    }

    testHashEqual(`unrelated argument`, { foo: `bar` })

    testHashEqual(`png option change when using jpg`, {
      pngCompressionLevel: defaultArgsBaseline.pngCompressionLevel + 1,
    })
    testHashEqual(
      `jpg option change when using png`,
      {
        toFormat: `png`,
        jpegProgressive: !defaultArgsBaseline.jpegProgressive,
      },
      {
        toFormat: `png`,
      }
    )
    describe(`not used arguments`, () => {
      testHashEqual(`maxWidth`, { maxWidth: 500 })
      testHashEqual(`base64`, { base64: true })
    })

    describe(`argument sorting`, () => {
      it(`sorts nested arguments`, () => {
        const args = {
          duotone: {
            shadow: `#10c5f8`,
            highlight: `#32CD32`,
          },
          cropFocus: 17,
        }
        const actual = sortKeys(args)
        expect(actual).toEqual({
          cropFocus: 17,
          duotone: {
            highlight: `#32CD32`,
            shadow: `#10c5f8`,
          },
        })
      })
    })
  })
})

describe(`processFile`, () => {
  beforeEach(() => {
    process.env.GATSBY_CLOUD_IMAGE_SERVICE_URL = `https://example.com/image-service`
    got.post.mockReset()
    got.post.mockResolvedValueOnce({})
  })

  afterAll(() => {
    delete process.env.GATSBY_CLOUD_IMAGE_SERVICE_URL
  })

  const mockProcessFile = async ({ hash = `1234lol` } = {}) => {
    const transforms = {
      outputPath: `myoutputpath/1234/file.jpg`,
      args: {
        width: 100,
        height: 100,
      },
    }

    const res = await processFile(`mypath/file.jpg`, hash, [transforms], {
      stripMetadata: true,
    })

    return [
      res,
      {
        transforms,
        hash,
      },
    ]
  }

  it(`should offload sharp transforms to the cloud`, async () => {
    const [res] = await mockProcessFile()

    expect(res).toMatchSnapshot()
  })

  it(`passes hash and transforms to cloud service`, async () => {
    const hash = `8675309jenny`

    const [, args] = await mockProcessFile(hash)

    expect(got.post).toHaveBeenCalledTimes(1)
    expect(got.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.objectContaining({
          hash: args.hash,
          transforms: [args.transforms],
        }),
      })
    )
  })
})
