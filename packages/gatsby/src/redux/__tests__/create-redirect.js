jest.mock(`../`, () => {return {
  getNodes: jest.fn(),
  hasNodeChanged: jest.fn(),
  store: {
    getState: jest.fn(),
  },
}})
const { actions: { createRedirect } } = require(`../actions`)
const { store } = require(`../`)

const mockStore = (pathPrefix = ``) => {
  store.getState.mockReturnValue({
    config: {
      pathPrefix,
    },
    program: {
      prefixPaths: pathPrefix.length > 0,
    },
  })
}

beforeEach(() => {
  store.getState.mockReset()
})

describe(`createRedirect`, () => {
  it(`adds CREATE_REDIRECT type`, () => {
    mockStore()

    const action = createRedirect({
      fromPath: `/blog/other.html`,
      toPath: `/blog/sample.html`,
    })
    
    expect(action.type).toBe(`CREATE_REDIRECT`)
  })

  it(`handles root path`, () => {
    mockStore()

    const action = createRedirect({
      fromPath: `/index.html`,
      toPath: `/`,
    })

    expect(action.payload.toPath).toBe(`/`)
  })

  it(`removes trailing slashes`, () => {
    mockStore()

    const action = createRedirect({
      fromPath: `/blog/other/`,
      toPath: `/blog/this-other-thing///`,
    })

    expect(action.payload).toEqual(expect.objectContaining({
      fromPath: `/blog/other`,
      toPath: `/blog/this-other-thing`,
    }))
  })

  it(`passes through other properties`, () => {
    mockStore()

    const action = createRedirect({
      fromPath: `/blog`,
      toPath: `/docs`,
      other: true,
    })

    expect(action.payload.other).toBe(true)
  })

  it(`normalizes same structure with and without slash`, () => {
    mockStore()

    expect(createRedirect({
      fromPath: `/blog`,
      toPath: `/docs`,
    })).toEqual(createRedirect({
      fromPath: `/blog/`,
      toPath: `/docs/`,
    }))
  })

  describe(`pathPrefix`, () => {
    it(`adds on non-root domain`, () => {
      mockStore(`/blog`)
  
      const action = createRedirect({
        fromPath: `/other.html`,
        toPath: `/sample.html`,
      })
  
      expect(action.payload).toEqual(expect.objectContaining({
        fromPath: expect.stringMatching(/^\/blog/),
        toPath: expect.stringMatching(/^\/blog/),
      }))
    })

    it(`adds on root domain`, () => {
      mockStore(`/blog`)

      const action = createRedirect({
        fromPath: `/index.html`,
        toPath: `/`,
      })

      expect(action.payload).toEqual(expect.objectContaining({
        fromPath: expect.stringMatching(/^\/blog/),
        toPath: `/blog`,
      }))
    })
  })
})
