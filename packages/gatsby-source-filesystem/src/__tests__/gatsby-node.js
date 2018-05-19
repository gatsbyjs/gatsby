const { sourceNodes } = require(`../gatsby-node`)
const fs = require(`fs`)
const chokidar = require(`chokidar`)

jest.mock(`chokidar`, () => {
  const chokidarMock = jest.genMockFromModule(`chokidar`)

  chokidarMock.watch.mockImplementation(() => {
    return {
      on: jest.fn(),
    }
  })

  return chokidarMock
})

jest.mock(`fs`, () => jest.genMockFromModule(`fs`))

describe(`sourceNodes`, () => {
  const mock = {
    boundActionCreators: {
      createNode: jest.fn(),
      deleteNode: jest.fn(),
    },
    getNode: jest.fn(),
    reporter: {
      error: jest.fn(),
      panic: jest.fn().mockImplementation(msg => { throw new Error(msg) }),
      info: jest.fn(),
    },
  }

  afterEach(() => jest.clearAllMocks())

  describe(`accepts ignore patterns in plugin options`, () => {
    beforeEach(() => fs.existsSync.mockReturnValue(true))

    describe(`calls chokidar.watch with provided ignore pattern(s)`, () => {
      it(`pluginOption.ignore is a string`, () => {
        const pattern = `ignore/pattern`
        sourceNodes(mock, { path: __dirname, ignore: pattern })
        expect(chokidar.watch).toHaveBeenCalled()
        expect(chokidar.watch.mock.calls[0][1].ignored).toContain(pattern)
      })

      it(`pluginOption.ignore is a RegExp`, () => {
        const pattern = /www/g
        sourceNodes(mock, { path: __dirname, ignore: pattern })
        expect(chokidar.watch).toHaveBeenCalled()
        expect(chokidar.watch.mock.calls[0][1].ignored).toContain(pattern)
      })

      it(`pluginOption.ignore is a function`, () => {
        const pattern = () => true
        sourceNodes(mock, { path: __dirname, ignore: pattern })
        expect(chokidar.watch).toHaveBeenCalled()
        expect(chokidar.watch.mock.calls[0][1].ignored).toContain(pattern)
      })

      it(`pluginOption.ignore is an array of string`, () => {
        const pattern = `ignore/pattern`
        sourceNodes(mock, { path: __dirname, ignore: [pattern] })
        expect(chokidar.watch).toHaveBeenCalled()
        expect(chokidar.watch.mock.calls[0][1].ignored).toContain(pattern)
      })
    })

    it(`calls panic with invalid ignore`, () => {
      expect(() => sourceNodes(mock, { path: __dirname, ignore: {} })).toThrow(/The 'ignore' passed to gatsby-source-filesystem/g)
      expect(() => sourceNodes(mock, { path: __dirname, ignore: 0 })).toThrow(/The 'ignore' passed to gatsby-source-filesystem/g)
      expect(() => sourceNodes(mock, { path: __dirname, ignore: null })).toThrow(/The 'ignore' passed to gatsby-source-filesystem/g)
      expect(() => sourceNodes(mock, { path: __dirname, ignore: NaN })).toThrow(/The 'ignore' passed to gatsby-source-filesystem/g)
      expect(() => sourceNodes(mock, { path: __dirname, ignore: [`src`, {}] })).toThrow(/The 'ignore' passed to gatsby-source-filesystem/g)
      expect(() => sourceNodes(mock, { path: __dirname, ignore: [`src`, NaN] })).toThrow(/The 'ignore' passed to gatsby-source-filesystem/g)
    })
  })
})
