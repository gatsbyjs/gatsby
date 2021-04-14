import { actions } from "../actions"
import { store } from "../index"

jest.mock(`../index`, () => {
  return {
    store: {
      getState: jest.fn(),
    },
    dispath: (): void => {},
    emitter: {
      on: jest.fn(),
    },
  }
})

const protocolArr = [
  [`https`, `https://example.com`],
  [`http`, `http://example.com`],
  [`//`, `//example.com`],
  [`ftp`, `ftp://example.com`],
  [`mailto`, `mailto:example@email.com`],
]

describe(`Add redirects`, () => {
  beforeEach(() => {
    ;(store.getState as jest.Mock).mockReturnValue({
      program: { pathPrefixs: false },
    })
  })

  it(`allows you to add redirects`, () => {
    const action = actions.createRedirect({
      fromPath: `/old/hello-world`,
      toPath: `/new/hello-world`,
    })

    expect(action).toMatchSnapshot()
  })
  it(`create redirects as permanent`, () => {
    const action = actions.createRedirect({
      fromPath: `/old/hello-world`,
      toPath: `/new/hello-world`,
      isPermanent: true,
    })

    expect(action).toMatchSnapshot()
  })

  it(`creates redirects with in-browser redirect option`, () => {
    const action = actions.createRedirect({
      fromPath: `/old/hello-world`,
      toPath: `/new/hello-world`,
      redirectInBrowser: true,
    })

    expect(action).toMatchSnapshot()
  })

  protocolArr.forEach(([protocol, toPath], index) => {
    it(`creates redirects to the URL starts with ${protocol}`, () => {
      const action = actions.createRedirect({
        fromPath: `/old/hello-world-${index}`,
        toPath,
      })

      expect(action).toMatchSnapshot()
    })
  })

  protocolArr.forEach(([protocol, fromPath], index) => {
    it(`creates redirects from the URL starts with ${protocol}`, () => {
      const action = actions.createRedirect({
        fromPath,
        toPath: `/new/hello-world-${index}`,
      })

      expect(action).toMatchSnapshot()
    })
  })
})

describe(`Add redirects with path prefixs`, () => {
  beforeEach(() => {
    ;(store.getState as jest.Mock).mockReturnValue({
      program: {
        prefixPaths: true,
      },
      config: {
        pathPrefix: `/blog`,
      },
    })
  })
  it(`allows you to add redirects`, () => {
    const action = actions.createRedirect({
      fromPath: `/old/hello-world`,
      toPath: `/new/hello-world`,
    })

    expect(action).toMatchSnapshot()
  })
  it(`create redirects as permanent`, () => {
    const action = actions.createRedirect({
      fromPath: `/old/hello-world`,
      toPath: `/new/hello-world`,
      isPermanent: true,
    })

    expect(action).toMatchSnapshot()
  })

  it(`creates redirects with in-browser redirect option`, () => {
    const action = actions.createRedirect({
      fromPath: `/old/hello-world`,
      toPath: `/new/hello-world`,
      redirectInBrowser: true,
    })

    expect(action).toMatchSnapshot()
  })

  protocolArr.forEach(([protocol, toPath], index) => {
    it(`creates redirects to the URL starts with ${protocol}`, () => {
      const action = actions.createRedirect({
        fromPath: `/old/hello-world-${index}`,
        toPath,
      })

      expect(action).toMatchSnapshot()
    })
  })

  protocolArr.forEach(([protocol, fromPath], index) => {
    it(`creates redirects from the URL starts with ${protocol}`, () => {
      const action = actions.createRedirect({
        fromPath,
        toPath: `/new/hello-world-${index}`,
      })

      expect(action).toMatchSnapshot()
    })
  })
})
