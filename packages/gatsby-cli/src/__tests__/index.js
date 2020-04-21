jest.mock(`../reporter`, () => {
  return {
    panic: jest.fn(),
    log: jest.fn(),
    stripIndent: jest.fn(str => str),
    warn: jest.fn(),
  }
})
jest.mock(`../create-cli`)

const getCLI = () => {
  jest.resetModules()

  const reporter = require(`../reporter`)
  const createCLI = require(`../create-cli`)

  require(`../`)

  return {
    reporter,
    createCLI,
  }
}

let __process__
beforeAll(() => {
  __process__ = global.process
})

beforeEach(() => {
  global.process = __process__
})

const setup = version => {
  if (version) {
    Object.defineProperty(__process__, `version`, {
      get: () => version,
    })
  }

  return getCLI()
}

describe(`error handling`, () => {
  it(`panics on Node < 10.13.0`, () => {
    ;[`6.0.0`, `8.0.0`, `10.0.0`].forEach(version => {
      const { reporter } = setup(version)

      expect(reporter.panic).toHaveBeenCalledTimes(1)
      reporter.panic.mockClear()
    })
  })

  it(`shows error with link to more info`, () => {
    const { reporter } = setup(`v6.0.0`)

    expect(reporter.panic).toHaveBeenCalledWith(
      expect.stringContaining(`https://gatsby.dev/upgrading-node-js`)
    )
  })
})

// describe(`deprecation warning`, () => {
//   it(`warns on Node < 10.13.0`, () => {
//     const { reporter } = setup(`v10.12.0`)

//      expect(reporter.warn).toHaveBeenCalledWith(
//       expect.stringContaining(`https://gatsby.dev/upgrading-node-js`)
//     )
//   })
// })

describe(`normal behavior`, () => {
  it(`does not panic on Node >= 10.13.0`, () => {
    ;[`10.13.0`, `12.0.0`, `13.0.0`].forEach(version => {
      const { reporter } = setup(version)

      expect(reporter.panic).not.toHaveBeenCalled()
    })
  })

  it(`invokes createCLI`, () => {
    const { createCLI } = setup()

    expect(createCLI).toHaveBeenCalledTimes(1)
    expect(createCLI).toHaveBeenCalledWith(process.argv)
  })
})
