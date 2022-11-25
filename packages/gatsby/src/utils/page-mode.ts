import { store } from "../redux"
import {
  IGatsbyPage,
  IGatsbyState,
  IMaterializePageMode,
  PageMode,
} from "../redux/types"
import { reportOnce } from "./report-once"
import { ROUTES_DIRECTORY } from "../constants"
import { Runner } from "../bootstrap/create-graphql-runner"
import { getDataStore } from "../datastore"

type IPageConfigFn = (arg: { params: Record<string, unknown> }) => {
  defer: boolean
}

const pageConfigMap = new Map<string, IPageConfigFn>()

/**
 * In develop IGatsbyPage["mode"] can change at any time, so as a general rule we need to resolve it
 * every time from page component and IGatsbyPage["defer"] value.
 *
 * IGatsbyPage["mode"] is only reliable in engines and in `onPostBuild` hook.
 */
export function getPageMode(page: IGatsbyPage, state?: IGatsbyState): PageMode {
  const { components } = state ?? store.getState()

  // assume SSG until components are actually extracted
  const component = components.get(page.componentPath) ?? {
    serverData: false,
    config: false,
  }

  return resolvePageMode(page, component)
}

function resolvePageMode(
  page: IGatsbyPage,
  component: { serverData: boolean; config: boolean }
): PageMode {
  let pageMode: PageMode | undefined = undefined
  if (component.serverData) {
    pageMode = `SSR`
  } else if (component.config) {
    const pageConfigFn = pageConfigMap.get(page.componentChunkName)
    if (!pageConfigFn) {
      // This is possible in warm builds when `component.config` was persisted but
      // `preparePageTemplateConfigs` hasn't been executed yet
      // TODO: if we move `mode` away from page and persist it in the state separately,
      //  we can just return the old `mode` that should be in sync with `component.config`
      return `SSG`
    }

    const fsRouteParams = (
      typeof page.context[`__params`] === `object`
        ? page.context[`__params`]
        : {}
    ) as Record<string, unknown>

    const pageConfig = pageConfigFn({ params: fsRouteParams })
    if (typeof pageConfig.defer === `boolean`) {
      pageMode = pageConfig.defer ? `DSG` : `SSG`
    }
  }

  if (!pageMode) {
    pageMode = page.defer ? `DSG` : `SSG`
  }
  if (
    pageMode !== `SSG` &&
    (page.path === `/404.html` || page.path === `/500.html`)
  ) {
    reportOnce(
      `Status page "${page.path}" ignores page mode ("${pageMode}") and force sets it to SSG (this page can't be lazily rendered).`
    )
    pageMode = `SSG`
  }

  return pageMode
}

/**
 * Persist page.mode for SSR/DSG pages to ensure they work with `gatsby serve`
 *
 * TODO: ideally IGatsbyPage["mode"] should not exist at all and instead we need a different entity
 *   holding this information: an entity that is only created in the end of the build e.g. Route
 *   then materializePageMode transforms to createRoutes
 */
export async function materializePageMode(): Promise<void> {
  const { pages, components } = store.getState()

  let dispatchCount = 0
  for (const page of pages.values()) {
    const component = components.get(page.componentPath)
    if (!component) {
      throw new Error(`Could not find matching component for page ${page.path}`)
    }
    const pageMode = resolvePageMode(page, component)

    // Do not materialize for SSG pages: saves some CPU time as `page.mode` === `SSG` by default when creating a page
    // and our pages are re-generated on each build, not persisted
    // (so no way to get DSG/SSR value from the previous build)
    if (pageMode !== `SSG`) {
      const action: IMaterializePageMode = {
        type: `MATERIALIZE_PAGE_MODE`,
        payload: { path: page.path, pageMode },
      }
      store.dispatch(action)
    }
    // Do not block task queue of the event loop for too long:
    if (dispatchCount++ % 100 === 0) {
      await new Promise(resolve => setImmediate(resolve))
    }
  }
  await getDataStore().ready()
}

export async function preparePageTemplateConfigs(
  graphql: Runner
): Promise<void> {
  const { program } = store.getState()
  const pageRendererPath = `${program.directory}/${ROUTES_DIRECTORY}render-page.js`

  const pageRenderer = require(pageRendererPath)
  global[`__gatsbyGraphql`] = graphql

  await Promise.all(
    Array.from(store.getState().components.values()).map(async component => {
      if (component.config) {
        const componentInstance = await pageRenderer.getPageChunk({
          componentChunkName: component.componentChunkName,
        })
        const pageConfigFn = await componentInstance.config()
        if (typeof pageConfigFn !== `function`) {
          throw new Error(
            `Unexpected result of config factory. Expected "function", got "${typeof pageConfigFn}".`
          )
        }

        pageConfigMap.set(component.componentChunkName, pageConfigFn)
      }
    })
  )
  delete global[`__gatsbyGraphql`]
}
