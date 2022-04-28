import {
  IGatsbyState,
  IGatsbyPage,
  IHtmlFileState,
  IStaticQueryResultState,
} from "../../redux/types"

interface IMinimalStateSliceForTest {
  html: IGatsbyState["html"]
  pages: IGatsbyState["pages"]
  components: IGatsbyState["components"]
}

describe(`calcDirtyHtmlFiles`, () => {
  let calcDirtyHtmlFiles
  beforeEach(() => {
    jest.isolateModules(() => {
      calcDirtyHtmlFiles = require(`../build-utils`).calcDirtyHtmlFiles
    })
  })

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
      components: new Map(),
    }
    state.components.set(`/foo`, {
      componentPath: `/foo`,
      componentChunkName: `foo`,
      pages: new Set(),
      isInBootstrap: false,
      query: ``,
      serverData: false,
    })

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
          mode: `SSG`,
          defer: false,
          ownerNodeId: ``,
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
      // page not dirty - we can reuse, so shouldn't be regenerated, deleted or cleaned up
      "/to-reuse/": {
        dirty: 0,
      },
    })

    const results = calcDirtyHtmlFiles(state)

    // as nothing changed nothing should be regenerated, deleted or cleaned up
    expect(results.toRegenerate.sort()).toEqual([])
    expect(results.toDelete.sort()).toEqual([])
    expect(Array.from(results.toCleanupFromTrackedState).sort()).toEqual([])
  })

  it(`content for few pages changed`, () => {
    const state = generateStateToTestHelper({
      // pages were marked as dirty for whatever reason
      "/to-regenerate/": {
        dirty: 42,
      },
      "/to-regenerate/nested/": {
        dirty: 42,
      },
    })

    const results = calcDirtyHtmlFiles(state)

    // as pages are marked as dirty, artifacts for those should be (re)generated
    expect(results.toRegenerate.sort()).toEqual([
      `/to-regenerate/`,
      `/to-regenerate/nested/`,
    ])
    expect(results.toDelete.sort()).toEqual([])
    expect(Array.from(results.toCleanupFromTrackedState).sort()).toEqual([])
  })

  it(`few pages were deleted`, () => {
    const state = generateStateToTestHelper({
      // pages were deleted with `deletePage` action
      "/deleted/": {
        dirty: 0,
        removedOrDeleted: `deleted`,
      },
      "/deleted/nested/": {
        dirty: 42,
        removedOrDeleted: `deleted`,
      },
    })

    const results = calcDirtyHtmlFiles(state)

    // as pages are marked as deleted, artifacts for those should be deleted
    expect(results.toRegenerate.sort()).toEqual([])
    expect(results.toDelete.sort()).toEqual([`/deleted/`, `/deleted/nested/`])
    expect(Array.from(results.toCleanupFromTrackedState).sort()).toEqual([])
  })

  it(`few pages were not re-created`, () => {
    const state = generateStateToTestHelper({
      // pages are tracked, but were not recreated
      "/not-recreated/": {
        dirty: 0,
        removedOrDeleted: `not-recreated`,
      },
      "/not-recreated/nested/": {
        dirty: 0,
        removedOrDeleted: `not-recreated`,
      },
    })

    const results = calcDirtyHtmlFiles(state)

    // as pages are not recreated, artifacts for those should be deleted
    expect(results.toRegenerate.sort()).toEqual([])
    expect(results.toDelete.sort()).toEqual([
      `/not-recreated/`,
      `/not-recreated/nested/`,
    ])
    expect(Array.from(results.toCleanupFromTrackedState).sort()).toEqual([])
  })

  describe(`onCreatePage + deletePage + createPage that change path of a page (remove trailing slash)`, () => {
    it(`page is dirty`, () => {
      const state = generateStateToTestHelper({
        // page was created, then deleted and similar page with slightly different path was created for it
        // both page paths would result in same artifacts
        "/remove-trailing-slashes-dirty/": {
          dirty: 0,
          removedOrDeleted: `deleted`,
        },
        "/remove-trailing-slashes-dirty": {
          dirty: 42,
        },
      })

      const results = calcDirtyHtmlFiles(state)

      // as pages would generate artifacts with same filenames - we expect artifact for
      // deleted page NOT to be deleted, but instead just tracking state clean up
      // and regeneration of new page with adjusted path
      expect(results.toRegenerate.sort()).toEqual([
        `/remove-trailing-slashes-dirty`,
      ])
      expect(results.toDelete.sort()).toEqual([])
      expect(Array.from(results.toCleanupFromTrackedState).sort()).toEqual([
        `/remove-trailing-slashes-dirty/`,
      ])
    })

    it(`page is NOT dirty`, () => {
      const state = generateStateToTestHelper({
        // page was created, then deleted and similar page with slightly different path was created for it
        // both page paths would result in same artifacts
        "/remove-trailing-slashes-not-dirty/": {
          dirty: 0,
          removedOrDeleted: `deleted`,
        },
        "/remove-trailing-slashes-not-dirty": {
          dirty: 0,
        },
      })

      const results = calcDirtyHtmlFiles(state)

      // as pages would generate artifacts with same filenames - we expect artifact for
      // deleted page NOT to be deleted, but instead just tracking state clean up
      // adjusted page is not marked as dirty so it shouldn't regenerate ()
      expect(results.toRegenerate.sort()).toEqual([])
      expect(results.toDelete.sort()).toEqual([])
      expect(Array.from(results.toCleanupFromTrackedState).sort()).toEqual([
        `/remove-trailing-slashes-not-dirty/`,
      ])
    })
  })

  it(`slash was removed between builds (without onCreatePage + deletePage combination)`, () => {
    const state = generateStateToTestHelper({
      // page was created in previous build, but not recreated in current one
      // instead page with slightly different path is created
      // both page paths would result in same artifacts
      "/slash-removed-without-onCreatePage/": {
        dirty: 0,
        removedOrDeleted: `not-recreated`,
      },
      "/slash-removed-without-onCreatePage": {
        dirty: 1,
      },
    })

    const results = calcDirtyHtmlFiles(state)

    expect(results.toRegenerate.sort()).toEqual([
      `/slash-removed-without-onCreatePage`,
    ])
    expect(results.toDelete.sort()).toEqual([])
    expect(Array.from(results.toCleanupFromTrackedState).sort()).toEqual([
      `/slash-removed-without-onCreatePage/`,
    ])
  })

  describe(`onCreatePage + deletePage + createPage that change path casing of a page`, () => {
    it(`linux (case sensitive file system)`, () => {
      let isolatedCalcDirtyHtmlFiles
      jest.isolateModules(() => {
        process.env.TEST_FORCE_CASE_FS = `SENSITIVE`
        isolatedCalcDirtyHtmlFiles =
          require(`../build-utils`).calcDirtyHtmlFiles
        delete process.env.TEST_FORCE_CASE_FS
      })

      const state = generateStateToTestHelper({
        // page was created, then deleted and similar page with slightly different path was created for it
        // different artifacts would be created for them
        "/TEST/": {
          dirty: 0,
          removedOrDeleted: `deleted`,
        },
        "/test/": {
          dirty: 1,
        },
      })

      const results = isolatedCalcDirtyHtmlFiles(state)

      // on case sensitive file systems /test/ and /TEST/ are different files so we do need to delete a file
      expect(results.toRegenerate.sort()).toEqual([`/test/`])
      expect(results.toDelete.sort()).toEqual([`/TEST/`])
      expect(Array.from(results.toCleanupFromTrackedState).sort()).toEqual([])
    })

    it(`windows / mac (case insensitive file system)`, () => {
      let isolatedCalcDirtyHtmlFiles
      jest.isolateModules(() => {
        process.env.TEST_FORCE_CASE_FS = `INSENSITIVE`
        isolatedCalcDirtyHtmlFiles =
          require(`../build-utils`).calcDirtyHtmlFiles
        delete process.env.TEST_FORCE_CASE_FS
      })

      const state = generateStateToTestHelper({
        // page was created, then deleted and similar page with slightly different path was created for it
        // both page paths would result in same artifacts
        "/TEST/": {
          dirty: 0,
          removedOrDeleted: `deleted`,
        },
        "/test/": {
          dirty: 1,
        },
      })

      const results = isolatedCalcDirtyHtmlFiles(state)

      // on case insensitive file systems /test/ and /TEST/ are NOT different files so we should
      // not delete files, but still we should cleanup tracked state
      expect(results.toRegenerate.sort()).toEqual([`/test/`])
      expect(results.toDelete.sort()).toEqual([])
      expect(Array.from(results.toCleanupFromTrackedState).sort()).toEqual([
        `/TEST/`,
      ])
    })
  })

  // cases above are to be able to pinpoint exact failure, kitchen sink case is to test all of above in one go
  // and make sure that various conditions mixed together are handled correctly
  it(`kitchen sink`, () => {
    const state = generateStateToTestHelper({
      // page not dirty - we can reuse, so shouldn't be regenerated, deleted or cleaned up
      "/to-reuse/": {
        dirty: 0,
      },

      // pages were marked as dirty for whatever reason
      "/to-regenerate/": {
        dirty: 42,
      },
      "/to-regenerate/nested/": {
        dirty: 42,
      },

      // pages were deleted with `deletePage` action
      "/deleted/": {
        dirty: 0,
        removedOrDeleted: `deleted`,
      },
      "/deleted/nested/": {
        dirty: 42,
        removedOrDeleted: `deleted`,
      },

      // pages are tracked, but were not recreated
      "/not-recreated/": {
        dirty: 0,
        removedOrDeleted: `not-recreated`,
      },
      "/not-recreated/nested/": {
        dirty: 0,
        removedOrDeleted: `not-recreated`,
      },

      // page was created, then deleted and similar page with slightly different path was created for it
      // both page paths would result in same artifacts
      "/remove-trailing-slashes-dirty/": {
        dirty: 0,
        removedOrDeleted: `deleted`,
      },
      "/remove-trailing-slashes-dirty": {
        dirty: 42,
      },

      // page was created, then deleted and similar page with slightly different path was created for it
      // both page paths would result in same artifacts
      "/remove-trailing-slashes-not-dirty/": {
        dirty: 0,
        removedOrDeleted: `deleted`,
      },
      "/remove-trailing-slashes-not-dirty": {
        dirty: 0,
      },

      // page was created in previous build, but not recreated in current one
      // instead page with slightly different path is created
      // both page paths would result in same artifacts
      "/slash-removed-without-onCreatePage/": {
        dirty: 0,
        removedOrDeleted: `not-recreated`,
      },
      "/slash-removed-without-onCreatePage": {
        dirty: 1,
      },
    })

    const results = calcDirtyHtmlFiles(state)

    expect(results.toRegenerate.sort()).toEqual([
      `/remove-trailing-slashes-dirty`,
      `/slash-removed-without-onCreatePage`,
      `/to-regenerate/`,
      `/to-regenerate/nested/`,
    ])
    expect(results.toDelete.sort()).toEqual([
      `/deleted/`,
      `/deleted/nested/`,
      `/not-recreated/`,
      `/not-recreated/nested/`,
    ])
    expect(Array.from(results.toCleanupFromTrackedState).sort()).toEqual([
      `/remove-trailing-slashes-dirty/`,
      `/remove-trailing-slashes-not-dirty/`,
      `/slash-removed-without-onCreatePage/`,
    ])
  })
})
