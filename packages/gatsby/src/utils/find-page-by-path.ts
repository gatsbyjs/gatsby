import { IGatsbyPage, IGatsbyState } from "../redux/types"
import { match } from "@reach/router/lib/utils"

export function findPageByPath(
  state: IGatsbyState,
  path: string,
  fallbackTo404: boolean = false
): IGatsbyPage | undefined {
  const { pages } = state

  // first check by exact path
  let page = pages.get(path)
  if (page) {
    return page
  }

  if (path === ``) {
    // from my tests I never was able to make request with
    // completely empty pathname, but just for the sake
    // of completeness - try available alternative
    page = pages.get(`/`)
    if (page) {
      return page
    }
  }
  // Gatsby doesn't allow for page path to be empty string,
  // so skipping trying to get page for "" path if we can't
  // find page for `/`
  else if (page !== `/`) {
    // check various trailing/leading slashes combinations
    const hasLeadingSlash = path.startsWith(`/`)
    const hasTrailingSlash = path.endsWith(`/`)
    for (const leadingSlash of [true, false]) {
      for (const trailingSlash of [true, false]) {
        if (
          leadingSlash === hasLeadingSlash &&
          trailingSlash === hasTrailingSlash
        ) {
          // we checked this already
          continue
        }

        let newPath = path

        if (leadingSlash !== hasLeadingSlash) {
          if (leadingSlash) {
            newPath = `/` + newPath
          } else {
            newPath = newPath.substring(1)
          }
        }

        if (trailingSlash !== hasTrailingSlash) {
          if (trailingSlash) {
            newPath = newPath + `/`
          } else {
            newPath = newPath.substring(0, newPath.length - 1)
          }
        }

        page = pages.get(newPath)
        if (page) {
          return page
        }
      }
    }
  }

  // we didn't find exact static page, time to check matchPaths
  for (const [, page] of pages) {
    if (page.matchPath && match(page.matchPath, path)) {
      return page
    }
  }

  if (fallbackTo404) {
    page = findPageByPath(state, `/dev-404-page/`, false)
    if (page) {
      return page
    }

    page = findPageByPath(state, `/404.html`, false)
    if (page) {
      return page
    }
  }
  return undefined
}
