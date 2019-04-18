// disable output coloring for tests
process.env.FORCE_COLOR = 0

const {
  maskText,
  validateOptions,
  formatPluginOptionsForCLI,
} = require(`../plugin-options`)

const maskedCharacterCount = input =>
  input.split(``).filter(char => char === `*`).length

describe(`Mask text`, () => {
  it.each([
    [`handles very short inputs`, `a`, `*`],
    [`handles short inputs`, `abcd`, `***d`],
    [
      `handles long inputs`,
      `abcdefghijklmnopqrstuvwxyz`,
      `**********************wxyz`,
    ],
  ])(`%s`, (_, input, expectedResult) => {
    const result = maskText(input)

    // explicit check for result
    expect(result).toEqual(expectedResult)

    // has same string length
    expect(result.length).toEqual(input.length)
    // hides 75% or more of input
    expect(maskedCharacterCount(result)).toBeGreaterThanOrEqual(
      input.length * 0.75
    )
    // show at max 4 characters
    expect(result.length - maskedCharacterCount(result)).toBeLessThanOrEqual(4)
  })
})

describe(`Formatting plugin options`, () => {
  it(`kitchen sink`, () => {
    const result = formatPluginOptionsForCLI(
      {
        accessToken: `abcdefghijklmnopqrstuvwxyz`,
        host: `wat`,
        localeFilter: locale => locale.code === `de`,
        downloadLocal: false,
      },
      {
        spaceID: `foo`,
        environment: `bar`,
      }
    )
    console.log(result)

    expect(result).toMatchInlineSnapshot(`
"accessToken: \\"**********************wxyz\\"
host: \\"wat\\"
localeFilter: [Function]
downloadLocal: false
environment (default value): \\"master\\" - bar
spaceID: undefined - foo"
`)
  })
})

describe(`Options validation`, () => {
  const reporter = {
    panic: jest.fn((...args) => console.log(...args)),
  }

  beforeEach(() => {
    reporter.panic.mockClear()
  })

  it(`Passes with valid options`, () => {
    validateOptions(
      {
        reporter,
      },
      {
        spaceId: `spaceId`,
        accessToken: `accessToken`,
        localeFilter: locale => locale.code === `de`,
        downloadLocal: false,
      }
    )

    expect(reporter.panic).not.toBeCalled()
  })

  it(`Fails with missing required options`, () => {
    validateOptions(
      {
        reporter,
      },
      {}
    )

    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`Problems with plugin options`)
    )
    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`"accessToken" is required`)
    )
    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`"accessToken" is required`)
    )
  })

  it(`Fails with empty options`, () => {
    validateOptions(
      {
        reporter,
      },
      {
        environment: ``,
        host: ``,
        accessToken: ``,
        spaceId: ``,
      }
    )

    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`Problems with plugin options`)
    )
    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`"environment" is not allowed to be empty`)
    )
    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`"host" is not allowed to be empty`)
    )
    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`"accessToken" is not allowed to be empty`)
    )
    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`"spaceId" is not allowed to be empty`)
    )
  })

  it(`Fails with options of wrong types`, () => {
    validateOptions(
      {
        reporter,
      },
      {
        environment: 1,
        host: [],
        accessToken: true,
        spaceId: {},
        localeFilter: `yup`,
        downloadLocal: 5,
      }
    )

    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`Problems with plugin options`)
    )
    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`"environment" must be a string`)
    )
    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`"host" must be a string`)
    )
    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`"accessToken" must be a string`)
    )
    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`"spaceId" must be a string`)
    )
    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`"localeFilter" must be a Function`)
    )
    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`"downloadLocal" must be a boolean`)
    )
  })

  it(`Fails with undefined option keys`, () => {
    validateOptions(
      {
        reporter,
      },
      {
        spaceId: `spaceId`,
        accessToken: `accessToken`,
        wat: true,
      }
    )

    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`Problems with plugin options`)
    )
    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`"wat" is not allowed`)
    )
  })
})
