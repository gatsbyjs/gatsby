const { createInterface } = require(`readline`)
const createLogger = require(`../prepare/logger`)

jest.mock(`readline`, () => {
  const rl = {
    question: jest.fn(),
    close: jest.fn(),
  }

  return {
    createInterface: () => rl,
  }
})

// our mocked version persists the same interface between `createInterface` calls
const getReadlineInterface = () => createInterface()

const answer = a =>
  getReadlineInterface().question.mockImplementationOnce((_prompt, cb) => cb(a))

describe(`logger`, () => {
  const consoleSpy = jest.spyOn(console, `log`).mockImplementation(() => {})

  afterEach(() => {
    consoleSpy.mockReset()
  })

  it(`logs all levels when logLevel = info`, () => {
    const logger = createLogger(`info`)

    logger.info(`blah`)
    logger.debug(`blah`)
    logger.warn(`blah`)
    logger.error(`blah`)

    expect(consoleSpy).toHaveBeenCalledTimes(4)
  })

  it(`disables output when logLevel = silent`, () => {
    const logger = createLogger(`silent`)

    logger.info(`blah`)
    logger.debug(`blah`)
    logger.warn(`blah`)
    logger.error(`blah`)

    expect(consoleSpy).toHaveBeenCalledTimes(0)
  })

  it(`uses provided adapter`, () => {
    const logger = createLogger(`info`)
    const adapter = jest.fn()

    logger.setAdapter(adapter)
    logger.info(`foo`)

    logger.resetAdapter()
    logger.info(`bar`)

    expect(adapter).toHaveBeenCalledWith(
      expect.stringContaining(`[info]`),
      `foo`
    )
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(`[info]`),
      `bar`
    )
  })

  it(`prompts the user for confirmation`, async () => {
    global.process.stdout.isTTY = true
    expect.assertions(5)

    const logger = createLogger(`info`)

    // preemptively answer each call to `confirm` so the `await` won't hang forever
    answer(``)
    answer(`blah`)
    answer(`yes`)
    expect(await logger.confirm(`are you sure?`)).toBe(true)

    answer(`y`)
    expect(await logger.confirm(`are you sure?`)).toBe(true)

    answer(`no`)
    expect(await logger.confirm(`are you sure?`)).toBe(false)

    answer(`n`)
    expect(await logger.confirm(`are you sure?`)).toBe(false)

    expect(getReadlineInterface().question).toHaveBeenCalledTimes(6)

    delete global.process.stdout.isTTY
  })
})
