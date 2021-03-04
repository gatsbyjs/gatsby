import {
  IGatsbyState,
  IGatsbyPage,
  IHtmlFileState,
  IStaticQueryResultState,
} from "../../redux/types"
import { calcDirtyHtmlFiles } from "../build-utils"

interface IMinimalStateSliceForTest {
  html: IGatsbyState["html"]
  pages: IGatsbyState["pages"]
}

describe(`calcDirtyHtmlFiles`, () => {
  function generateStateToTestHelper(
    pages: Record<
      string,
      {
        dirty: number
        removedOrDeleted?: "deleted" | "not-recreated"
      }
    >
  ): IGatsbyState {
    const state: IMinimalStateSliceForTest = {
      pages: new Map<string, IGatsbyPage>(),
      html: {
        browserCompilationHash: `a-hash`,
        ssrCompilationHash: `a-hash`,
        trackedHtmlFiles: new Map<string, IHtmlFileState>(),
        unsafeBuiltinWasUsedInSSR: false,
        trackedStaticQueryResults: new Map<string, IStaticQueryResultState>(),
      },
    }

    for (const pagePath in pages) {
      const page = pages[pagePath]

      if (page.removedOrDeleted !== `not-recreated`) {
        state.pages.set(pagePath, {
          component: `/foo`,
          componentPath: `/foo`,
          componentChunkName: `foo`,
          context: {},
          internalComponentName: `foo`,
          isCreatedByStatefulCreatePages: false,
          path: pagePath,
          matchPath: undefined,
          pluginCreatorId: `foo`,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          pluginCreator___NODE: `foo`,
          updatedAt: 1,
        })
      }

      state.html.trackedHtmlFiles.set(pagePath, {
        dirty: page.dirty,
        pageDataHash: `a-hash`,
        isDeleted: page.removedOrDeleted === `deleted`,
      })
    }

    return state as IGatsbyState
  }

  it(`nothing changed`, () => {
    const state = generateStateToTestHelper({
      "/": {
        dirty: 0,
      },
    })

    const results = calcDirtyHtmlFiles(state)
    expect(results).toMatchInlineSnapshot(`
      Object {
        "toCleanupFromTrackedState": Set {},
        "toDelete": Array [],
        "toRegenerate": Array [],
      }
    `)
  })

  it(`content for few pages changed`, () => {
    const state = generateStateToTestHelper({
      "/": {
        dirty: 0,
      },
      "/blog/": {
        dirty: 42,
      },
      "/blog/some-article/": {
        dirty: 42,
      },
    })

    const results = calcDirtyHtmlFiles(state)
    expect(results).toMatchInlineSnapshot(`
      Object {
        "toCleanupFromTrackedState": Set {},
        "toDelete": Array [],
        "toRegenerate": Array [
          "/blog/",
          "/blog/some-article/",
        ],
      }
    `)
  })

  it(`few pages were deleted`, () => {
    const state = generateStateToTestHelper({
      "/": {
        dirty: 0,
      },
      "/blog/": {
        dirty: 0,
        removedOrDeleted: `deleted`,
      },
      "/blog/some-article/": {
        dirty: 0,
        removedOrDeleted: `deleted`,
      },
    })

    const results = calcDirtyHtmlFiles(state)
    expect(results).toMatchInlineSnapshot(`
      Object {
        "toCleanupFromTrackedState": Set {},
        "toDelete": Array [
          "/blog/",
          "/blog/some-article/",
        ],
        "toRegenerate": Array [],
      }
    `)
  })

  it(`few pages were not re-created`, () => {
    const state = generateStateToTestHelper({
      "/": {
        dirty: 0,
      },
      "/blog/": {
        dirty: 0,
        removedOrDeleted: `not-recreated`,
      },
      "/blog/some-article/": {
        dirty: 0,
        removedOrDeleted: `not-recreated`,
      },
    })

    const results = calcDirtyHtmlFiles(state)
    expect(results).toMatchInlineSnapshot(`
      Object {
        "toCleanupFromTrackedState": Set {},
        "toDelete": Array [
          "/blog/",
          "/blog/some-article/",
        ],
        "toRegenerate": Array [],
      }
    `)
  })

  it(`onCreatePage + deletePage that change path of a page (remove trailing slash)`, () => {
    const state = generateStateToTestHelper({
      "/": {
        dirty: 0,
      },
      "/blog/": {
        dirty: 0,
        removedOrDeleted: `deleted`,
      },
      "/blog": {
        dirty: 1,
      },
    })

    const results = calcDirtyHtmlFiles(state)
    expect(results).toMatchInlineSnapshot(`
      Object {
        "toCleanupFromTrackedState": Set {
          "/blog/",
        },
        "toDelete": Array [],
        "toRegenerate": Array [
          "/blog",
        ],
      }
    `)
  })

  it(`slash was removed between builds (without onCreatePage + deletePage combination)`, () => {
    const state = generateStateToTestHelper({
      "/": {
        dirty: 0,
      },
      "/blog/": {
        dirty: 0,
        removedOrDeleted: `not-recreated`,
      },
      "/blog": {
        dirty: 1,
      },
    })

    const results = calcDirtyHtmlFiles(state)
    expect(results).toMatchInlineSnapshot(`
      Object {
        "toCleanupFromTrackedState": Set {
          "/blog/",
        },
        "toDelete": Array [],
        "toRegenerate": Array [
          "/blog",
        ],
      }
    `)
  })
})
