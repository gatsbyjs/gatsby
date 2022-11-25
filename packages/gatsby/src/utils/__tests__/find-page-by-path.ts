import { findPageByPath } from "../find-page-by-path"
import { IGatsbyPage, IGatsbyState } from "../../redux/types"

function generatePagesState(
  pages: Array<string | Partial<IGatsbyPage>>
): IGatsbyState {
  const state: IGatsbyState = {
    pages: new Map<string, IGatsbyPage>(
      pages.map(pathOrObject => {
        let pageObject

        if (typeof pathOrObject !== `object`) {
          pageObject = {
            path: pathOrObject,
          }
        } else {
          pageObject = pathOrObject
        }

        if (!pageObject.path) {
          throw new Error(
            `Missing path\n\n${JSON.stringify(pageObject, null, 2)}`
          )
        }

        return [pageObject.path, pageObject]
      })
    ),
  } as IGatsbyState

  return state
}

const commonPages = [
  `/`,
  `no-slashes`,
  `/leading-slash`,
  `trailing-slash/`,
  `/leading-and-trailing-slash/`,
  {
    path: `/app/`,
    matchPath: `/app/*`,
  },
  {
    path: `/app/p1/page/`,
    matchPath: `/app/:p1/page`,
  },
  {
    path: `/app/p1/p2/`,
    matchPath: `/app/:p1/:p2`,
  },
  {
    path: `/app/p1/page2/`,
    // this is very similar to `/app/:p1/page`, point of adding 2 of those is to make sure order of pages in state
    // doesn't impact deterministic page selection
    matchPath: `/app/:p1/page2`,
  },
  `/app/static/`,
  `/app/static/page/`,
]

const state = generatePagesState([...commonPages])

describe(`findPageByPath`, () => {
  function assertGetterWithSlashMatrix(
    pathWithoutTrailingOrLeadingSlashes: string,
    exactPath: string
  ): void {
    const withTrailingSlash = pathWithoutTrailingOrLeadingSlashes + `/`
    const withLeadingSlash = `/` + pathWithoutTrailingOrLeadingSlashes
    const withLeadingAndTrailingSlash =
      `/` + pathWithoutTrailingOrLeadingSlashes + `/`

    it(`Finds a page when request doesn't have trailing and leading slashes ("${pathWithoutTrailingOrLeadingSlashes}")`, () => {
      const page = findPageByPath(state, pathWithoutTrailingOrLeadingSlashes)
      expect(page).toBeDefined()
      expect(page?.path).toEqual(exactPath)
    })

    it(`Finds a page when request have trailing slash ("${withTrailingSlash}")`, () => {
      const page = findPageByPath(state, withTrailingSlash)
      expect(page).toBeDefined()
      expect(page?.path).toEqual(exactPath)
    })

    it(`Finds a page when request have leading slash ("${withLeadingSlash}")`, () => {
      const page = findPageByPath(state, withLeadingSlash)
      expect(page).toBeDefined()
      expect(page?.path).toEqual(exactPath)
    })

    it(`Finds a page when request have both leading and trailing slash ("${withLeadingAndTrailingSlash}")`, () => {
      const page = findPageByPath(state, withLeadingAndTrailingSlash)
      expect(page).toBeDefined()
      expect(page?.path).toEqual(exactPath)
    })
  }

  describe(`Index`, () => {
    it(`Exact match`, () => {
      const page = findPageByPath(state, `/`)
      expect(page).toBeDefined()
      expect(page?.path).toEqual(`/`)
    })

    it(`Empty pathname -> "/"`, () => {
      const page = findPageByPath(state, ``)
      expect(page).toBeDefined()
      expect(page?.path).toEqual(`/`)
    })
  })

  describe(`Page with no slashes ("no-slashes")`, () => {
    assertGetterWithSlashMatrix(`no-slashes`, `no-slashes`)
  })

  describe(`Page with leading slash ("/leading-slash")`, () => {
    assertGetterWithSlashMatrix(`leading-slash`, `/leading-slash`)
  })

  describe(`Page with trailing slash ("trailing-slash/")`, () => {
    assertGetterWithSlashMatrix(`trailing-slash`, `trailing-slash/`)
  })

  describe(`Page with leading and trailing slash ("/leading-and-trailing-slash/")`, () => {
    assertGetterWithSlashMatrix(
      `leading-and-trailing-slash`,
      `/leading-and-trailing-slash/`
    )
  })

  describe(`Client-only-paths`, () => {
    it(`Can match client-only path by matchPath`, () => {
      const page = findPageByPath(state, `/app/test`)
      expect(page).toBeDefined()
      expect(page?.path).toEqual(`/app/`)
    })

    it(`Picks most specific matchPath`, () => {
      {
        const page = findPageByPath(state, `/app/foo`)
        expect(page).toBeDefined()
        expect(page?.path).toEqual(`/app/`)
      }

      {
        const page = findPageByPath(state, `/app/foo/bar/baz`)
        expect(page).toBeDefined()
        expect(page?.path).toEqual(`/app/`)
      }

      {
        const page = findPageByPath(state, `/app/foo/bar`)
        expect(page).toBeDefined()
        expect(page?.path).toEqual(`/app/p1/p2/`)
      }

      {
        const page = findPageByPath(state, `/app/foo/page`)
        expect(page).toBeDefined()
        expect(page?.path).toEqual(`/app/p1/page/`)
      }

      {
        const page = findPageByPath(state, `/app/foo/page2`)
        expect(page).toBeDefined()
        expect(page?.path).toEqual(`/app/p1/page2/`)
      }
    })

    it(`Can match client-only path by static`, () => {
      const page = findPageByPath(state, `/app`)
      expect(page).toBeDefined()
      expect(page?.path).toEqual(`/app/`)
    })

    it(`Will prefer static page over client-only in case both match`, () => {
      {
        const page = findPageByPath(state, `/app/static`)
        expect(page).toBeDefined()
        expect(page?.path).toEqual(`/app/static/`)
      }

      {
        const page = findPageByPath(state, `/app/static/page`)
        expect(page).toBeDefined()
        expect(page?.path).toEqual(`/app/static/page/`)
      }
    })
  })

  describe(`No page found`, () => {
    const stateWithBoth404Pages = generatePagesState([
      ...commonPages,
      // for fallbacks
      `/dev-404-page/`,
      `/404.html`,
    ])

    it(`Will return 404 pages if requested not found (will prefer /dev-404-page/)`, () => {
      const page = findPageByPath(
        stateWithBoth404Pages,
        `/does-not-exist/`,
        true
      )
      expect(page).toBeDefined()
      expect(page?.path).toEqual(`/dev-404-page/`)
    })

    it(`Will return 404 page if requested not found (will fallback to /404.html)`, () => {
      const stateWith404HtmlPage = generatePagesState([
        ...commonPages,
        // for fallbacks (no /dev-404-page/)
        `/404.html`,
      ])

      const page = findPageByPath(
        stateWith404HtmlPage,
        `/does-not-exist/`,
        true
      )
      expect(page).toBeDefined()
      expect(page?.path).toEqual(`/404.html`)
    })

    it(`Returns undefined if not found any page and fallback turned off`, () => {
      const page = findPageByPath(
        stateWithBoth404Pages,
        `/does-not-exist/`,
        false
      )
      expect(page).toBeUndefined()
    })
  })
})
