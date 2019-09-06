// disable output coloring for tests
process.env.FORCE_COLOR = 0
const Joi = require(`@hapi/joi`)

const {
  maskText,
  getValidOptions,
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

  afterEach(() => {
    expect.hasAssertions()
  })

  const schema = getValidOptions(Joi)

  it(`Passes with valid options`, () => {
    expect(
      schema.validate({
        spaceId: `spaceId`,
        accessToken: `accessToken`,
        localeFilter: locale => locale.code === `de`,
        downloadLocal: false,
      })
    ).resolves.toEqual(expect.any(Object))
  })

  it(`Fails with missing required options`, async () => {
    try {
      await schema.validate({})
    } catch (e) {
      expect(e.name).toBe(`ValidationError`)
    }
  })

  it(`Fails with empty options`, async () => {
    try {
      await schema.validate({
        environment: ``,
        host: ``,
        accessToken: ``,
        spaceId: ``,
      })
    } catch (e) {
      expect(e.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining(`is not allowed to be empty`),
          }),
        ])
      )
    }
  })

  it(`Fails with options of wrong types`, async () => {
    try {
      await schema.validate({
        environment: 1,
        host: [],
        accessToken: true,
        spaceId: {},
        localeFilter: `yup`,
        downloadLocal: 5,
      })
    } catch (e) {
      expect(e.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining(`must be a`),
          }),
        ])
      )
    }
  })
})
