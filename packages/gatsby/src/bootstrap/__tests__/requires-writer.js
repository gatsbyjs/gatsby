const { joinPath } = require(`gatsby-core-utils`)
const requiresWriter = require(`../requires-writer`)

const now = Date.now()

const generatePagesState = pages => {
  let state = new Map()
  pages.forEach(page => {
    state.set(page.path, {
      component: ``,
      componentChunkName: ``,
      ...page,
    })
  })

  return state
}

jest.mock(`fs-extra`, () => {
  return {
    writeFile: () => Promise.resolve(),
    move: () => {},
  }
})

const mockFsExtra = require(`fs-extra`)

describe(`requires-writer`, () => {
  const program = {
    directory: `/dir`,
  }
  let originalDateNow = global.Date.now

  beforeEach(() => {
    global.Date.now = () => now
    requiresWriter.resetLastHash()
  })

  afterAll(() => {
    global.Date.now = originalDateNow
  })

  describe(`writeAll`, () => {
    it(`writes requires files`, async () => {
      const pages = generatePagesState([
        {
          component: `component1`,
          componentChunkName: `chunkName1`,
          matchPath: `matchPath1`,
          path: `/path1`,
        },
        {
          component: `component2`,
          componentChunkName: `chunkName2`,
          path: `/path2`,
        },
      ])

      const spy = jest.spyOn(mockFsExtra, `writeFile`)
      await requiresWriter.writeAll({
        pages,
        program,
      })

      expect(spy).toBeCalledWith(
        joinPath(`/dir`, `.cache`, `match-paths.json.${now}`),
        JSON.stringify([{ path: `/path1`, matchPath: `matchPath1` }], null, 4)
      )
    })
  })
})
