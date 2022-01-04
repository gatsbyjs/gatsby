import { IGatsbyPage, IGatsbyState } from "../redux/types"
import { match } from "@gatsbyjs/reach-router/lib/utils"

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
  else if (path !== `/`) {
    // check various trailing/leading slashes combinations
    const hasLeadingSlash = path.startsWith(`/`)
    const hasTrailingSlash = path.endsWith(`/`)

    const bare = path.slice(
      hasLeadingSlash ? 1 : 0,
      hasTrailingSlash ? -1 : path.length
    )

    ;[bare, `/` + bare, bare + `/`, `/` + bare + `/`].some(potentialPath => {
      page = pages.get(potentialPath)
      return !!page
    })
    if (page) {
      return page
    }
  }

  // we didn't find exact static page, time to check matchPaths
  for (const page of pages.values()) {
    if (page.matchPath && match(page.matchPath, path)) {
      return page
    }
  }

  if (fallbackTo404) {
    return (
      findPageByPath(state, `/dev-404-page/`, false) ??
      findPageByPath(state, `/404.html`, false)
    )
  }
  return undefined
}
