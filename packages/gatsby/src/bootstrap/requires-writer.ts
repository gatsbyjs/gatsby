import * as _ from "lodash"
import * as path from "path"
import * as fs from "fs-extra"
import * as crypto from "crypto"
import { slash } from "gatsby-core-utils"
import reporter from "gatsby-cli/lib/reporter"
import { match } from "@reach/router/lib/utils"
import { joinPath } from "gatsby-core-utils"

import { store, emitter } from "../redux/"

// path ranking algorithm copied (with small adjustments) from `@reach/router` (internal util, not exported from the package)
// https://github.com/reach/router/blob/28a79e7fc3a3487cb3304210dc3501efb8a50eba/src/lib/utils.js#L216-L254
const paramRe = /^:(.+)/

const SEGMENT_POINTS = 4
const STATIC_POINTS = 3
const DYNAMIC_POINTS = 2
const SPLAT_PENALTY = 1
const ROOT_POINTS = 1

function isRootSegment(segment: string): boolean {
  return segment === ``
}

function isDynamic(segment: string): boolean {
  return paramRe.test(segment)
}

function isSplat(segment: string): boolean {
  return segment === `*`
}

function rankRoute(path: string): number {
  return segmentize(path).reduce(function callbackfn(score, segment): number {
    score += SEGMENT_POINTS

    if (isRootSegment(segment)) {
      score += ROOT_POINTS
    } else if (isDynamic(segment)) {
      score += DYNAMIC_POINTS
    } else if (isSplat(segment)) {
      score -= SEGMENT_POINTS + SPLAT_PENALTY
    } else {
      score += STATIC_POINTS
    }

    return score
  }, 0)
}

function segmentize(uri: string): string[] {
  // strip starting/ending slashes
  return uri.replace(/(^\/+|\/+$)/g, ``).split(`/`)
}
// end of copied `@reach/router` internals

let lastHash: string | null = null

export function resetLastHash(): void {
  lastHash = null
}

interface IPage {
  path: string
  matchPath: string
  component: string
  componentChunkName: string
}

interface IMatchPathEntry extends IPage {
  index: number
  score: number
}

type IMatchPath = Pick<IPage, "path" | "matchPath">

type IPickedFields = Pick<IPage, "component" | "componentChunkName">

function pickComponentFields(page: IPage): IPickedFields {
  return _.pick(page, [`component`, `componentChunkName`])
}

function getComponents(pages: IPage[]): IPickedFields[] {
  return _(pages)
    .map(pickComponentFields)
    .uniqBy(function iteratee(c): string {
      return c.componentChunkName
    })
    .value()
}

function createMatchPathEntry(page: IPage, index: number): IMatchPathEntry {
  return {
    ...page,
    index,
    score: rankRoute(page.matchPath),
  }
}
/**
 * Get all dynamic routes and sort them by most specific at the top
 * code is based on @reach/router match utility (https://github.com/reach/router/blob/152aff2352bc62cefc932e1b536de9efde6b64a5/src/lib/utils.js#L224-L254)
 */
function getMatchPaths(pages: IPage[]): IMatchPath[] {
  const matchPathPages: IMatchPathEntry[] = []

  pages.forEach(function callbackfn(page, index): void {
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
    const newMatches: IMatchPathEntry[] = []

    pages.forEach((page, index) => {
      const isInsideMatchPath = !!matchPathPages.find(
        (pageWithMatchPath) =>
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
    .sort(function compareFn(a, b) {
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

function createHash(matchPaths, components): string {
  return crypto
    .createHash(`md5`)
    .update(JSON.stringify({ matchPaths, components }))
    .digest(`hex`)
}

// Write out pages information.
export async function writeAll(state): Promise<boolean> {
  // console.log(`on requiresWriter progress`)
  const { program } = state
  const pages = [...state.pages.values()]
  const matchPaths: IMatchPath[] = getMatchPaths(pages)
  const components = getComponents(pages)

  const newHash = createHash(matchPaths, components)

  if (newHash === lastHash) {
    // Nothing changed. No need to rewrite files
    // console.log(`on requiresWriter END1`)
    return false
  }

  lastHash = newHash

  // TODO: Remove all "hot" references in this `syncRequires` variable when fast-refresh is the default
  const hotImport =
    process.env.GATSBY_HOT_LOADER !== `fast-refresh`
      ? `const { hot } = require("react-hot-loader/root")`
      : ``
  const hotMethod =
    process.env.GATSBY_HOT_LOADER !== `fast-refresh` ? `hot` : ``

  // Create file with sync requires of components/json files.
  let syncRequires = `${hotImport}

// prefer default export if available
const preferDefault = m => m && m.default || m
\n\n`
  syncRequires += `exports.components = {\n${components
    .map(
      (c) =>
        `  "${
          c.componentChunkName
        }": ${hotMethod}(preferDefault(require("${joinPath(c.component)}")))`
    )
    .join(`,\n`)}
}\n\n`

  // Create file with async requires of components/json files.
  let asyncRequires = `// prefer default export if available
const preferDefault = m => m && m.default || m
\n`
  asyncRequires += `exports.components = {\n${components
    .map(function callbackfn(c): string {
      // we need a relative import path to keep contenthash the same if directory changes
      const relativeComponentPath = path.relative(
        path.join(program.directory, `.cache`),
        c.component
      )

      return `  "${
        c.componentChunkName
      }": () => import("${slash(`./${relativeComponentPath}`)}" /* webpackChunkName: "${c.componentChunkName}" */)`
    })
    .join(`,\n`)}
}\n\n`

  function writeAndMove(file: string, data): Promise<void> {
    const destination = joinPath(program.directory, `.cache`, file)

    const tmp = `${destination}.${Date.now()}`

    return fs.writeFile(tmp, data).then(function onfulfilled() {
      return fs.move(tmp, destination, { overwrite: true })
    })
  }

  await Promise.all([
    writeAndMove(`sync-requires.js`, syncRequires),
    writeAndMove(`async-requires.js`, asyncRequires),
    writeAndMove(`match-paths.json`, JSON.stringify(matchPaths, null, 4)),
  ])

  return true
}

const debouncedWriteAll = _.debounce(
  async function debounce() {
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
export function startListener(): void {
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
