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

describe(`Formatting plugin options for CLI`, () => {
  it(`kitchen sink`, () => {
    const options = {
      accessToken: `abcdefghijklmnopqrstuvwxyz`,
      spaceId: `abcdefgh`,
      host: `wat`,
      localeFilter: locale => locale.code === `de`,
    }
    const annotations = {
      spaceId: `foo`,
      environment: `bar`,
    }
    const result = formatPluginOptionsForCLI(options, annotations)

    const lines = result.split(`\n`)

    // doesn't leak secrets when listing plugin options
    expect(result).toContain(`accessToken`)
    expect(result).not.toContain(options.accessToken)
    expect(result).toContain(`spaceId`)
    expect(result).not.toContain(options.spaceId)

    // mark if default value is used
    expect(lines.find(line => line.includes(`downloadLocal`))).toContain(
      `default value`
    )
    expect(lines.find(line => line.includes(`useNameForId`))).toContain(
      `default value`
    )
    expect(lines.find(line => line.includes(`environment`))).toContain(
      `default value`
    )

    // annotations are added
    expect(lines.find(line => line.includes(`spaceId`))).toContain(
      annotations.spaceId
    )
    expect(lines.find(line => line.includes(`environment`))).toContain(
      annotations.environment
    )
  })
})

describe(`Options validation`, () => {
  const reporter = {
    panic: jest.fn(),
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
      expect.stringContaining(
        `Problems with gatsby-source-contentful plugin options`
      )
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
      expect.stringContaining(
        `Problems with gatsby-source-contentful plugin options`
      )
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
        useNameForId: 5,
      }
    )

    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(
        `Problems with gatsby-source-contentful plugin options`
      )
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
    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`"useNameForId" must be a boolean`)
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
      expect.stringContaining(
        `Problems with gatsby-source-contentful plugin options`
      )
    )
    expect(reporter.panic).toBeCalledWith(
      expect.stringContaining(`"wat" is not allowed`)
    )
  })
})
