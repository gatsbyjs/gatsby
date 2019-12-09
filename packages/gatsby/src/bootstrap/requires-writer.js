const _ = require(`lodash`)
const path = require(`path`)
const fs = require(`fs-extra`)
const crypto = require(`crypto`)
const { slash } = require(`gatsby-core-utils`)
const { store, emitter } = require(`../redux/`)
const reporter = require(`gatsby-cli/lib/reporter`)
const { match } = require(`@reach/router/lib/utils`)
import { joinPath } from "gatsby-core-utils"

// path ranking algorithm copied (with small adjustments) from `@reach/router` (internal util, not exported from the package)
// https://github.com/reach/router/blob/28a79e7fc3a3487cb3304210dc3501efb8a50eba/src/lib/utils.js#L216-L254
const paramRe = /^:(.+)/

const SEGMENT_POINTS = 4
const STATIC_POINTS = 3
const DYNAMIC_POINTS = 2
const SPLAT_PENALTY = 1
const ROOT_POINTS = 1

const isRootSegment = segment => segment === ``
const isDynamic = segment => paramRe.test(segment)
const isSplat = segment => segment === `*`

const rankRoute = path =>
  segmentize(path).reduce((score, segment) => {
    score += SEGMENT_POINTS
    if (isRootSegment(segment)) score += ROOT_POINTS
    else if (isDynamic(segment)) score += DYNAMIC_POINTS
    else if (isSplat(segment)) score -= SEGMENT_POINTS + SPLAT_PENALTY
    else score += STATIC_POINTS
    return score
  }, 0)

const segmentize = uri =>
  uri
    // strip starting/ending slashes
    .replace(/(^\/+|\/+$)/g, ``)
    .split(`/`)
// end of copied `@reach/router` internals

let lastHash = null

const resetLastHash = () => {
  lastHash = null
}

const pickComponentFields = page =>
  _.pick(page, [`component`, `componentChunkName`])

const getComponents = pages =>
  _(pages)
    .map(pickComponentFields)
    .uniqBy(c => c.componentChunkName)
    .value()

/**
 * Get all dynamic routes and sort them by most specific at the top
 * code is based on @reach/router match utility (https://github.com/reach/router/blob/152aff2352bc62cefc932e1b536de9efde6b64a5/src/lib/utils.js#L224-L254)
 */
const getMatchPaths = pages => {
  const createMatchPathEntry = (page, index) => {
    return {
      ...page,
      index,
      score: rankRoute(page.matchPath),
    }
  }

  const matchPathPages = []
  pages.forEach((page, index) => {
    if (page.matchPath) {
      matchPathPages.push(createMatchPathEntry(page, index))
    }
  })

  // Pages can live in matchPaths, to keep them working without doing another network request
  // we save them in matchPath. We use `@reach/router` path ranking to score paths/matchPaths
  // and sort them so more specific paths are before less specific paths.
  // More info in https://github.com/gatsbyjs/gatsby/issues/16097
  // small speedup: don't bother traversing when no matchPaths found.
  if (matchPathPages.length) {
    const newMatches = []
    pages.forEach((page, index) => {
      const isInsideMatchPath = !!matchPathPages.find(
        pageWithMatchPath =>
          !page.matchPath && match(pageWithMatchPath.matchPath, page.path)
      )

      if (isInsideMatchPath) {
        newMatches.push(
          createMatchPathEntry(
            {
              ...page,
              matchPath: page.path,
            },
            index
          )
        )
      }
    })
    // Add afterwards because the new matches are not relevant for the existing search
    matchPathPages.push(...newMatches)
  }

  return matchPathPages
    .sort((a, b) => {
      // The higher the score, the higher the specificity of our matchPath
      const order = b.score - a.score
      if (order !== 0) {
        return order
      }

      // if specificity is the same we do lexigraphic comparison of path to ensure
      // deterministic order regardless of order pages where created
      return a.matchPath.localeCompare(b.matchPath)
    })
    .map(({ path, matchPath }) => {
      return { path, matchPath }
    })
}

const createHash = (matchPaths, components) =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify({ matchPaths, components }))
    .digest(`hex`)

// Write out pages information.
const writeAll = async state => {
  // console.log(`on requiresWriter progress`)
  const { program } = state
  const pages = [...state.pages.values()]
  const matchPaths = getMatchPaths(pages)
  const components = getComponents(pages)

  const newHash = createHash(matchPaths, components)

  if (newHash === lastHash) {
    // Nothing changed. No need to rewrite files
    // console.log(`on requiresWriter END1`)
    return false
  }

  lastHash = newHash

  // Create file with sync requires of components/json files.
  let syncRequires = `const { hot } = require("react-hot-loader/root")

// prefer default export if available
const preferDefault = m => m && m.default || m
\n\n`
  syncRequires += `exports.components = {\n${components
    .map(
      c =>
        `  "${c.componentChunkName}": hot(preferDefault(require("${joinPath(
          c.component
        )}")))`
    )
    .join(`,\n`)}
}\n\n`

  // Create file with async requires of components/json files.
  let asyncRequires = `// prefer default export if available
const preferDefault = m => m && m.default || m
\n`
  asyncRequires += `exports.components = {\n${components
    .map(c => {
      // we need a relative import path to keep contenthash the same if directory changes
      const relativeComponentPath = path.relative(
        path.join(program.directory, `.cache`),
        c.component
      )

      return `  "${c.componentChunkName}": () => import("${slash(
        relativeComponentPath
      )}" /* webpackChunkName: "${c.componentChunkName}" */)`
    })
    .join(`,\n`)}
}\n\n`

  const writeAndMove = (file, data) => {
    const destination = joinPath(program.directory, `.cache`, file)
    const tmp = `${destination}.${Date.now()}`
    return fs
      .writeFile(tmp, data)
      .then(() => fs.move(tmp, destination, { overwrite: true }))
  }

  await Promise.all([
    writeAndMove(`sync-requires.js`, syncRequires),
    writeAndMove(`async-requires.js`, asyncRequires),
    writeAndMove(`match-paths.json`, JSON.stringify(matchPaths, null, 4)),
  ])

  return true
}

const debouncedWriteAll = _.debounce(
  async () => {
    const activity = reporter.activityTimer(`write out requires`, {
      id: `requires-writer`,
    })
    activity.start()
    const didRequiresChange = await writeAll(store.getState())
    if (didRequiresChange) {
      reporter.pendingActivity({ id: `webpack-develop` })
    }
    activity.end()
  },
  500,
  {
    // using "leading" can cause double `writeAll` call - particularly
    // when refreshing data using `/__refresh` hook.
    leading: false,
  }
)

/**
 * Start listening to CREATE/DELETE_PAGE events so we can rewrite
 * files as required
 */
const startListener = () => {
  emitter.on(`CREATE_PAGE`, () => {
    reporter.pendingActivity({ id: `requires-writer` })
    debouncedWriteAll()
  })

  emitter.on(`CREATE_PAGE_END`, () => {
    reporter.pendingActivity({ id: `requires-writer` })
    debouncedWriteAll()
  })

  emitter.on(`DELETE_PAGE`, () => {
    reporter.pendingActivity({ id: `requires-writer` })
    debouncedWriteAll()
  })

  emitter.on(`DELETE_PAGE_BY_PATH`, () => {
    reporter.pendingActivity({ id: `requires-writer` })
    debouncedWriteAll()
  })
}

module.exports = {
  writeAll,
  resetLastHash,
  startListener,
}
