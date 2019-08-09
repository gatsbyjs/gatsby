const { joinPath } = require(`gatsby-core-utils`)
const requiresWriter = require(`../requires-writer`)

const now = Date.now()

const newMockState = () => {
  const pages = new Map()
  pages.set(`path1`, {
    component: `component1`,
    componentChunkName: `chunkName1`,
    matchPath: `matchPath1`,
    path: `/path1`,
  })
  pages.set(`path2`, {
    component: `component2`,
    componentChunkName: `chunkName2`,
    path: `/path2`,
  })
  const program = { directory: `/dir` }
  return { pages, program }
}

jest.mock(`fs-extra`, () => {
  return {
    writeFile: () => Promise.resolve(),
    move: () => {},
  }
})

const mockFsExtra = require(`fs-extra`)

describe(`requires-writer`, () => {
  beforeEach(() => {
    global.Date.now = () => now
    requiresWriter.resetLastHash()
  })
  describe(`writeAll`, () => {
    it(`writes requires files`, async () => {
      const spy = jest.spyOn(mockFsExtra, `writeFile`)
      await requiresWriter.writeAll(newMockState())
      expect(spy).toBeCalledWith(
        joinPath(`/dir`, `.cache`, `match-paths.json.${now}`),
        JSON.stringify([{ path: `/path1`, matchPath: `matchPath1` }], null, 4)
      )
    })
  })
})
