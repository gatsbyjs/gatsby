jest.mock(`../reporter`, () => {
  return {
    panic: jest.fn(),
    log: jest.fn(),
    stripIndent: jest.fn(str => str),
    warn: jest.fn(),
  }
})
jest.mock(`../create-cli`)

interface IGetCLI {
  reporter: {
    panic: jest.Mock
    log: jest.Mock
    stripIndent: jest.Mock
    warn: jest.Mock
  }
  createCli: jest.Mock
}

const getCLI = (): IGetCLI => {
  jest.resetModules()

  const reporter = require(`../reporter`)
  const { createCli } = require(`../create-cli`)

  require(`../`)

  return {
    reporter,
    createCli,
  }
}

const itWhenV4 = _CFLAGS_.GATSBY_MAJOR !== `5` ? it : it.skip
const itWhenV5 = _CFLAGS_.GATSBY_MAJOR === `5` ? it : it.skip

let __process__
beforeAll(() => {
  __process__ = global.process
})

beforeEach(() => {
  global.process = __process__
})

const setup = (version?: string): ReturnType<typeof getCLI> => {
  if (version) {
    Object.defineProperty(__process__, `version`, {
      get: () => version,
    })
  }

  return getCLI()
}

describe(`error handling`, () => {
  itWhenV4(`panics on Node < 14.15.0 (v4)`, () => {
    ;[`6.0.0`, `8.0.0`, `12.13.0`, `13.0.0`].forEach(version => {
      const { reporter } = setup(version)

      expect(reporter.panic).toHaveBeenCalledTimes(1)
      reporter.panic.mockClear()
    })
  })

  itWhenV5(`panics on Node < 18.0.0 (v5)`, () => {
    ;[`6.0.0`, `8.0.0`, `12.13.0`, `13.0.0`, `14.15.0`, `17.0.0`].forEach(
      version => {
        const { reporter } = setup(version)

        expect(reporter.panic).toHaveBeenCalledTimes(1)
        reporter.panic.mockClear()
      }
    )
  })

  it(`shows error with link to more info`, () => {
    const { reporter } = setup(`v6.0.0`)

    expect(reporter.panic).toHaveBeenCalledWith(
      expect.stringContaining(`https://gatsby.dev/upgrading-node-js`)
    )
  })

  it(`allows prerelease versions`, () => {
    const { reporter } = setup(`v19.0.0-pre`)

    expect(reporter.panic).not.toHaveBeenCalled()
  })

  it(`warns on prerelease versions`, () => {
    const { reporter } = setup(`v15.0.0-pre`)

    expect(reporter.warn).toHaveBeenCalledWith(
      expect.stringContaining(`prerelease`)
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
  itWhenV4(`does not panic on Node >= 14.15.0 (v4)`, () => {
    ;[`14.15.0`, `15.0.0`, `16.3.0`].forEach(version => {
      const { reporter } = setup(version)

      expect(reporter.panic).not.toHaveBeenCalled()
    })
  })

  itWhenV5(`does not panic on Node >= 18.0.0 (v5)`, () => {
    ;[`18.0.0`, `19.0.0`, `20.0.0`].forEach(version => {
      const { reporter } = setup(version)

      expect(reporter.panic).not.toHaveBeenCalled()
    })
  })

  it(`invokes createCli`, () => {
    const { createCli } = setup()

    expect(createCli).toHaveBeenCalledTimes(1)
    expect(createCli).toHaveBeenCalledWith(process.argv)
  })
})
