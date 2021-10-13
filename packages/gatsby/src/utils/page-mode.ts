import { store } from "../redux"
import {
  IGatsbyPage,
  IGatsbyState,
  IMaterializePageMode,
  PageMode,
} from "../redux/types"
import { warnOnce } from "./warn-once"

/**
 * In develop IGatsbyPage["mode"] can change at any time, so as a general rule we need to resolve it
 * every time from page component and IGatsbyPage["defer"] value.
 *
 * IGatsbyPage["mode"] is only reliable in engines and in `onPostBuild` hook.
 */
export function getPageMode(page: IGatsbyPage, state?: IGatsbyState): PageMode {
  const { components } = state ?? store.getState()

  // assume SSG until components are actually extracted
  const component = components.get(page.componentPath) ?? { serverData: false }

  // TODO: fs routes support:
  //   if (component.config) {
  //     const renderer = require(PAGE_RENDERER_PATH)
  //     const componentInstance = await renderer.getPageChunk({ componentChunkName: page.componentChunkName })
  //     return resolvePageMode(page, component, componentInstance)
  //   }
  return resolvePageMode(page, component)
}

function resolvePageMode(
  page: IGatsbyPage,
  component: { serverData: boolean }
  // TODO:
  //  componentInstance?: NodeModule
): PageMode {
  let pageMode: PageMode
  if (component.serverData) {
    pageMode = `SSR`
  } else {
    pageMode = page.defer ? `DSG` : `SSG`
  }
  // TODO: fs routes support, e.g.:
  //   if (componentInstance) {
  //     return componentInstance.config.defer(page) ? `DSG` : `SSG`
  //   }
  if (
    pageMode !== `SSG` &&
    (page.path === `/404.html` || page.path === `/500.html`)
  ) {
    warnOnce(
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
}
