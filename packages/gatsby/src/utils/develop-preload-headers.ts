import { Response } from "express"
import * as path from "path"
import { fixedPagePath } from "gatsby-core-utils"
import { findPageByPath } from "./find-page-by-path"
import { readPageData } from "./page-data"
import { store } from "../redux"

/**
 * Add preload link headers to responses for .html files. This allows browser to schedule fetching critical resources
 * to render a page faster. Without them it would result in network waterfall (fetch js script -> parse and execute -> start downloading data)
 * With them we can start downloading data before JS executes.
 */
export async function appendPreloadHeaders(
  requestPath: string,
  res: Response
): Promise<void> {
  // add common.js and socket.io.js preload headers
  // TODO: make socket.io part not blocking - we don't need it anymore to render the page
  res.append(`Link`, `</commons.js>; rel=preload; as=script`)
  res.append(`Link`, `</socket.io/socket.io.js>; rel=preload; as=script`)

  const page = findPageByPath(store.getState(), requestPath, true)
  // we fallback to 404 pages - so there should always be a page (at worst dev-404)
  // this is just sanity check to not crash server in case it doesn't find anything
  if (page) {
    // add app-data.json preload
    res.append(
      `Link`,
      `</page-data/app-data.json>; rel=preload; as=fetch ; crossorigin`
    )

    // add page-data.json preload
    // our runtime also demands 404 and dev-404 page-data to be fetched to even render (see cache-dir/app.js)
    const pagePathsToPreload = [`/404.html`, `/dev-404-page/`]
    if (!pagePathsToPreload.includes(page.path)) {
      // let's make sure page path is first one (order shouldn't matter, just for reasonable order)
      pagePathsToPreload.unshift(page.path)
    }

    const staticQueriesToPreload = new Set<string>()
    for (const pagePath of pagePathsToPreload) {
      res.append(
        `Link`,
        `</${path.join(
          `page-data`,
          encodeURI(fixedPagePath(pagePath)),
          `page-data.json`
        )}>; rel=preload; as=fetch ; crossorigin`
      )

      try {
        const pageData = await readPageData(
          path.join(store.getState().program.directory, `public`),
          pagePath
        )

        // iterate over needed static queries and add them to Set of static queries to preload
        // Set will guarantee uniqueness in case queries are shared by requested page and 404 page.
        for (const staticQueryHash of pageData.staticQueryHashes) {
          staticQueriesToPreload.add(staticQueryHash)
        }
      } catch (e) {
        // there might be timing reasons why this fails - page-data file is not created yet
        // as page was just recently added (so page exists already but page-data doesn't yet)
        // in those cases we just do nothing
      }
    }

    // append accumulated static queries from pages we load
    for (const staticQueryHash of staticQueriesToPreload) {
      res.append(
        `Link`,
        `</page-data/sq/d/${staticQueryHash}.json>; rel=preload; as=fetch ; crossorigin`
      )
    }
  } else {
    // should we track cases when there is actually nothing returned to find cases
    // where we don't add preload headers if above assumption turns out to be wrong?
  }
}
