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

  describe(`matchPath`, () => {
    let matchPaths = []

    beforeEach(() => {
      mockFsExtra.writeFile.mockImplementation((file, buffer) => {
        if (file.includes(`match-paths.json`)) {
          matchPaths = JSON.parse(String(buffer))
        }

        return Promise.resolve()
      })
    })

    it(`should be sorted by specificity`, async () => {
      const pages = generatePagesState([
        {
          path: `/`,
        },
        {
          path: `/app/`,
          matchPath: `/app/*`,
        },
        {
          path: `/app/projects/`,
          matchPath: `/app/projects/*`,
        },
        {
          path: `/app/clients/`,
          matchPath: `/app/clients/*`,
        },
        {
          path: `/app/login/`,
        },
      ])

      await requiresWriter.writeAll({
        pages,
        program,
      })

      expect(matchPaths[0].path).toBe(pages.get(`/app/login/`).path)
      expect(matchPaths[matchPaths.length - 1].path).toBe(
        pages.get(`/app/`).path
      )
      expect(matchPaths).toMatchSnapshot()
    })

    it(`should have static pages that live inside a matchPath`, async () => {
      const pages = generatePagesState([
        {
          path: `/`,
        },
        {
          path: `/app/`,
          matchPath: `/app/*`,
        },
        {
          path: `/app/clients/`,
          matchPath: `/app/clients/*`,
        },
        {
          path: `/app/clients/static`,
        },
        {
          path: `/app/login/`,
        },
      ])

      await requiresWriter.writeAll({
        pages,
        program,
      })

      expect(matchPaths[0].path).toBe(pages.get(`/app/clients/static`).path)
      expect(matchPaths).toMatchSnapshot()
    })
  })
})
