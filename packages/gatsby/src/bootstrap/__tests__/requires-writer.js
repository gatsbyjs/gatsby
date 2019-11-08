const { joinPath } = require(`gatsby-core-utils`)
const requiresWriter = require(`../requires-writer`)
const { match } = require(`@reach/router/lib/utils`)

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

    it(`should have index pages with higher priority than matchPaths`, async () => {
      const pages = generatePagesState([
        {
          path: `/another-custom-404`,
          matchPath: `/*`,
        },
        {
          path: `/`,
        },
        {
          path: `/custom-404`,
          matchPath: `/*`,
        },
      ])

      await requiresWriter.writeAll({
        pages,
        program,
      })

      expect(matchPaths[0].path).toBe(pages.get(`/`).path)
      expect(matchPaths).toMatchSnapshot()
    })

    const pagesInput = [
      {
        path: `/`,
      },
      {
        path: `/custom-404`,
        matchPath: `/*`,
      },
      {
        path: `/mp4`,
        matchPath: `/mp1/mp2/mp3/mp4/*`,
      },
      {
        path: `/some-page`,
      },
      {
        path: `/mp1/mp2`,
      },
      {
        path: `/mp1/with-params`,
        matchPath: `/mp1/:param`,
      },
      {
        path: `/ap1/ap2`,
      },
      {
        path: `/mp1/mp2/hello`,
      },
      {
        path: `/mp1`,
        matchPath: `/mp1/*`,
      },
      {
        path: `/mp2`,
        matchPath: `/mp1/mp2/*`,
      },
      {
        path: `/mp3`,
        matchPath: `/mp1/mp2/mp3/*`,
      },
    ]

    it(`sorts pages based on matchPath/path specificity`, async () => {
      const pages = generatePagesState(pagesInput)

      await requiresWriter.writeAll({
        pages,
        program,
      })

      expect(matchPaths.map(p => p.matchPath)).toMatchInlineSnapshot(`
        Array [
          "/mp1/mp2/mp3/mp4/*",
          "/mp1/mp2/hello",
          "/mp1/mp2/mp3/*",
          "/ap1/ap2",
          "/mp1/mp2",
          "/mp1/:param",
          "/mp1/mp2/*",
          "/some-page",
          "/mp1/*",
          "/",
          "/*",
        ]
      `)
      expect(matchPaths).toMatchSnapshot()
    })

    it(`page order is deterministic (regardless of page creation order)`, async () => {
      let pages
      pages = generatePagesState([...pagesInput].reverse())
      await requiresWriter.writeAll({
        pages,
        program,
      })

      const matchPathsForInvertedInput = matchPaths
      pages = generatePagesState(pagesInput)
      await requiresWriter.writeAll({
        pages,
        program,
      })

      expect(matchPathsForInvertedInput).toEqual(matchPaths)
    })

    describe(`matching tests (~integration)`, () => {
      const testScenario = async path => {
        const pages = generatePagesState([...pagesInput].reverse())
        await requiresWriter.writeAll({
          pages,
          program,
        })

        const allMatchingPages = matchPaths
          .map(p => p.matchPath)
          .filter(p => match(p, path))

        return {
          allMatchingPages,
          selectedPage: allMatchingPages[0],
        }
      }

      it(`will find static path before dynamic paths`, async () => {
        const { allMatchingPages, selectedPage } = await testScenario(
          `/mp1/mp2`
        )

        expect(allMatchingPages).toMatchInlineSnapshot(`
          Array [
            "/mp1/mp2",
            "/mp1/:param",
            "/mp1/mp2/*",
            "/mp1/*",
            "/*",
          ]
        `)

        expect(selectedPage).toMatchInlineSnapshot(`"/mp1/mp2"`)
      })

      it(`will find path with dynamic paramter before path with wildcard`, async () => {
        const { allMatchingPages, selectedPage } = await testScenario(
          `/mp1/test`
        )

        expect(allMatchingPages).toMatchInlineSnapshot(`
          Array [
            "/mp1/:param",
            "/mp1/*",
            "/*",
          ]
        `)

        expect(selectedPage).toMatchInlineSnapshot(`"/mp1/:param"`)
      })

      it(`it will find most specific path with wildcard`, async () => {
        const { allMatchingPages, selectedPage } = await testScenario(
          `/mp1/mp2/wat`
        )

        expect(allMatchingPages).toMatchInlineSnapshot(`
          Array [
            "/mp1/mp2/*",
            "/mp1/*",
            "/*",
          ]
        `)

        expect(selectedPage).toMatchInlineSnapshot(`"/mp1/mp2/*"`)
      })
    })
  })
})
