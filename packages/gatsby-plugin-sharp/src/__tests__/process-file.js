jest.mock(`../safe-sharp`, () => {
  return {
    simd: jest.fn(),
    concurrency: jest.fn(),
  }
})
const { createArgsDigest } = require(`../process-file`)

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
})
