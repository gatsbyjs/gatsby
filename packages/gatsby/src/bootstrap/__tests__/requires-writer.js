const { joinPath } = require(`gatsby-core-utils`)
const requiresWriter = require(`../requires-writer`)
const { match } = require(`@gatsbyjs/reach-router`)

const now = Date.now()

const generatePagesState = pages => {
  const state = new Map()
  pages.forEach(page => {
    state.set(page.path, {
      component: ``,
      componentChunkName: ``,
      componentPath: `/some-path`,
      mode: `SSG`,
      ...page,
    })
  })

  return state
}

jest.mock(`../../utils/page-mode`, () => {
  return {
    getPageMode: jest.fn(page => page.mode),
  }
})

jest.mock(`fs-extra`, () => {
  return {
    writeFile: () => Promise.resolve(),
    outputFileSync: () => {},
    move: () => {},
  }
})

const mockFsExtra = require(`fs-extra`)

describe(`requires-writer`, () => {
  const program = {
    directory: `/dir`,
  }
  const originalDateNow = global.Date.now

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
          componentPath: `/component1`,
          matchPath: `matchPath1`,
          path: `/path1`,
        },
        {
          component: `component2`,
          componentChunkName: `chunkName2`,
          componentPath: `/component2`,
          path: `/path2`,
        },
      ])

      const spy = jest.spyOn(mockFsExtra, `writeFile`)
      await requiresWriter.writeAll({
        pages,
        program,
        slices: new Map(),
        components: new Map(),
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
          componentPath: `/root--component`,
        },
        {
          path: `/app/`,
          matchPath: `/app/*`,
          componentPath: `/app--component`,
        },
        {
          path: `/app/projects/`,
          matchPath: `/app/projects/*`,
          componentPath: `/projects--component`,
        },
        {
          path: `/app/clients/`,
          matchPath: `/app/clients/*`,
          componentPath: `/client--component`,
        },
        {
          path: `/app/login/`,
          componentPath: `/login--component`,
        },
      ])

      await requiresWriter.writeAll({
        pages,
        program,
        slices: new Map(),
        components: new Map(),
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
          componentPath: `/root--component`,
        },
        {
          path: `/app/`,
          matchPath: `/app/*`,
          componentPath: `/app--component`,
        },
        {
          path: `/app/clients/`,
          matchPath: `/app/clients/*`,
          componentPath: `/clients--component`,
        },
        {
          path: `/app/clients/static`,
          componentPath: `/static--component`,
        },
        {
          path: `/app/login/`,
          componentPath: `/login--component`,
        },
      ])

      await requiresWriter.writeAll({
        pages,
        program,
        slices: new Map(),
        components: new Map(),
      })

      expect(matchPaths[0].path).toBe(pages.get(`/app/clients/static`).path)
      expect(matchPaths).toMatchSnapshot()
    })

    it(`should have index pages with higher priority than matchPaths`, async () => {
      const pages = generatePagesState([
        {
          path: `/another-custom-404`,
          matchPath: `/*`,
          componentPath: `/404-2--component`,
        },
        {
          path: `/`,
          componentPath: `/root--component`,
        },
        {
          path: `/custom-404`,
          matchPath: `/*`,
          componentPath: `/404--component`,
        },
      ])

      await requiresWriter.writeAll({
        pages,
        program,
        slices: new Map(),
        components: new Map(),
      })

      expect(matchPaths[0].path).toBe(pages.get(`/`).path)
      expect(matchPaths).toMatchSnapshot()
    })

    const pagesInput = [
      {
        path: `/`,
        componentPath: `/root--component`,
      },
      {
        path: `/custom-404`,
        matchPath: `/*`,
        componentPath: `/404--component`,
      },
      {
        path: `/mp4`,
        matchPath: `/mp1/mp2/mp3/mp4/*`,
        componentPath: `/mp4--component`,
      },
      {
        path: `/some-page`,
        componentPath: `/some--component`,
      },
      {
        path: `/mp1/mp2`,
        componentPath: `/mp2--component`,
      },
      {
        path: `/mp1/with-params`,
        matchPath: `/mp1/:param`,
        componentPath: `/params--component`,
      },
      {
        path: `/ap1/ap2`,
        componentPath: `/ap2--component`,
      },
      {
        path: `/mp1/mp2/hello`,
        componentPath: `/hello--component`,
      },
      {
        path: `/mp1`,
        matchPath: `/mp1/*`,
        componentPath: `/mp1--component`,
      },
      {
        path: `/mp2`,
        matchPath: `/mp1/mp2/*`,
        componentPath: `/mp2-star--component`,
      },
      {
        path: `/mp3`,
        matchPath: `/mp1/mp2/mp3/*`,
        componentPath: `/mp3--component`,
      },
    ]

    it(`sorts pages based on matchPath/path specificity`, async () => {
      const pages = generatePagesState(pagesInput)

      await requiresWriter.writeAll({
        pages,
        program,
        slices: new Map(),
        components: new Map(),
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
        slices: new Map(),
        components: new Map(),
      })

      const matchPathsForInvertedInput = matchPaths
      pages = generatePagesState(pagesInput)
      await requiresWriter.writeAll({
        pages,
        program,
        slices: new Map(),
        components: new Map(),
      })

      expect(matchPathsForInvertedInput).toEqual(matchPaths)
    })

    describe(`matching tests (~integration)`, () => {
      const testScenario = async path => {
        const pages = generatePagesState([...pagesInput].reverse())
        await requiresWriter.writeAll({
          pages,
          program,
          slices: new Map(),
          components: new Map(),
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

      it(`will find path with dynamic parameter before path with wildcard`, async () => {
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

  describe(`getComponents`, () => {
    it(`should return components in a deterministic order`, () => {
      const pagesInput = generatePagesState([
        {
          component: `component1`,
          componentChunkName: `chunkName1`,
          componentPath: `/component1`,
          matchPath: `matchPath1`,
          path: `/path1`,
        },
        {
          component: `component2`,
          componentChunkName: `chunkName2`,
          componentPath: `/component2`,
          path: `/path2`,
        },
      ])

      const pages = [...pagesInput.values()]
      const pagesReversed = [...pagesInput.values()].reverse()
      const slices = new Map()
      const components = new Map()

      expect(requiresWriter.getComponents(pages, slices, components)).toEqual(
        requiresWriter.getComponents(pagesReversed, slices, components)
      )
    })
  })
})
