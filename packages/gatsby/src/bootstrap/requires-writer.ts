import _ from "lodash"
import path from "path"
import fs from "fs-extra"
import reporter from "gatsby-cli/lib/reporter"
import { match } from "@gatsbyjs/reach-router"
import { joinPath, md5, slash } from "gatsby-core-utils"
import { store, emitter } from "../redux/"
import { IGatsbyState, IGatsbyPage, IGatsbySlice } from "../redux/types"
import {
  writeModule,
  getAbsolutePathForVirtualModule,
} from "../utils/gatsby-webpack-virtual-modules"
import { getPageMode } from "../utils/page-mode"
import { devSSRWillInvalidate } from "../commands/build-html"
import { rankRoute } from "../utils/rank-route"

const hasContentFilePath = (componentPath: string): boolean =>
  componentPath.includes(`?__contentFilePath=`)

interface IGatsbyPageComponent {
  componentPath: string
  componentChunkName: string
  hasHeadComponent: boolean
}

interface IGatsbyPageMatchPath {
  path: string
  matchPath: string | undefined
}

let lastHash: string | null = null

export const resetLastHash = (): void => {
  lastHash = null
}

type IBareComponentData = Pick<
  IGatsbyPageComponent,
  `componentPath` | `componentChunkName`
> & {
  hasHeadComponent: boolean
}

export const getComponents = (
  pages: Array<IGatsbyPage>,
  slices: IGatsbyState["slices"],
  components: IGatsbyState["components"]
): Array<IGatsbyPageComponent> => {
  const pickComponentFields = (
    page: IGatsbyPage | IGatsbySlice
  ): IBareComponentData => {
    return {
      componentPath: page.componentPath,
      componentChunkName: page.componentChunkName,
      hasHeadComponent: components.get(page.componentPath)?.Head ?? false,
    }
  }

  return _.orderBy(
    _.uniqBy(
      _.map([...pages, ...slices.values()], pickComponentFields),
      c => c.componentChunkName
    ),
    c => c.componentChunkName
  )
}

/**
 * Get all dynamic routes and sort them by most specific at the top
 * code is based on @reach/router match utility (https://github.com/reach/router/blob/152aff2352bc62cefc932e1b536de9efde6b64a5/src/lib/utils.js#L224-L254)
 */
const getMatchPaths = (
  pages: Array<IGatsbyPage>
): Array<IGatsbyPageMatchPath> => {
  interface IMatchPathEntry extends IGatsbyPage {
    index: number
    score: number
    matchPath: string
  }

  const createMatchPathEntry = (
    page: IGatsbyPage,
    index: number
  ): IMatchPathEntry => {
    const { matchPath } = page

    if (matchPath === undefined) {
      return reporter.panic(
        `Error: matchPath property is undefined for page ${page.path}, should be a string`
      ) as never
    }

    return {
      ...page,
      matchPath,
      index,
      score: rankRoute(matchPath),
    }
  }

  const matchPathPages: Array<IMatchPathEntry> = []

  pages.forEach((page: IGatsbyPage, index: number): void => {
    if (page.matchPath && getPageMode(page) === `SSG`) {
      matchPathPages.push(createMatchPathEntry(page, index))
    }
  })

  // Pages can live in matchPaths, to keep them working without doing another network request
  // we save them in matchPath. We use `@reach/router` path ranking to score paths/matchPaths
  // and sort them so more specific paths are before less specific paths.
  // More info in https://github.com/gatsbyjs/gatsby/issues/16097
  // small speedup: don't bother traversing when no matchPaths found.
  if (matchPathPages.length) {
    const newMatches: Array<IMatchPathEntry> = []

    pages.forEach((page: IGatsbyPage, index: number): void => {
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

// Write out pages information.
export const writeAll = async (state: IGatsbyState): Promise<boolean> => {
  const { program, slices } = state
  const pages = [...state.pages.values()]
  const matchPaths = getMatchPaths(pages)
  const components = getComponents(pages, slices, state.components)
  let cleanedSSRVisitedPageComponents: Array<IGatsbyPageComponent> = []

  if (process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
    const ssrVisitedPageComponents = [
      ...(state.visitedPages.get(`server`)?.values() || []),
    ]

    // Remove any page components that no longer exist.
    cleanedSSRVisitedPageComponents = components.filter(
      c =>
        ssrVisitedPageComponents.some(s => s === c.componentChunkName) ||
        c.componentChunkName.startsWith(`slice---`)
    )
  }

  const newHash = await md5(
    JSON.stringify({
      matchPaths,
      components,
      cleanedSSRVisitedPageComponents,
    })
  )

  if (newHash === lastHash) {
    // Nothing changed. No need to rewrite files
    return false
  }

  lastHash = newHash

  if (process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
    // Create file with sync requires of visited page components files.

    const lazySyncRequires = `exports.ssrComponents = {\n${cleanedSSRVisitedPageComponents
      .map(
        (c: IGatsbyPageComponent): string =>
          `  "${c.componentChunkName}": require("${joinPath(c.componentPath)}")`
      )
      .join(`,\n`)}
  }\n\n`

    writeModule(`$virtual/ssr-sync-requires`, lazySyncRequires)
    // if this is executed, webpack should mark it as invalid, but sometimes there is some timing race
    // so we also explicitly set flag here as well
    devSSRWillInvalidate()
  }

  // Create file with sync requires of components/json files.
  let syncRequires = `
// prefer default export if available
const preferDefault = m => (m && m.default) || m
\n\n`
  syncRequires += `exports.components = {\n${components
    .map(
      (c: IGatsbyPageComponent): string =>
        `  "${c.componentChunkName}": preferDefault(require("${joinPath(
          c.componentPath
        )}"))`
    )
    .join(`,\n`)}
}\n\n`

  // Create file with async requires of components/json files.
  let asyncRequires = ``

  if (
    process.env.gatsby_executing_command === `develop` ||
    (_CFLAGS_.GATSBY_MAJOR === `5` && process.env.GATSBY_PARTIAL_HYDRATION)
  ) {
    asyncRequires = `exports.components = {\n${components
      .map((c: IGatsbyPageComponent): string => {
        // we need a relative import path to keep contenthash the same if directory changes
        const relativeComponentPath = path.relative(
          getAbsolutePathForVirtualModule(`$virtual`),
          c.componentPath
        )

        const rqPrefix = hasContentFilePath(relativeComponentPath) ? `&` : `?`

        return `  "${c.componentChunkName}": () => import("${slash(
          `./${relativeComponentPath}`
        )}${rqPrefix}export=default" /* webpackChunkName: "${
          c.componentChunkName
        }" */)`
      })
      .join(`,\n`)}
}\n\n

exports.head = {\n${components
      .map((c: IGatsbyPageComponent): string | undefined => {
        if (!c.hasHeadComponent) {
          return undefined
        }
        // we need a relative import path to keep contenthash the same if directory changes
        const relativeComponentPath = path.relative(
          getAbsolutePathForVirtualModule(`$virtual`),
          c.componentPath
        )

        const rqPrefix = hasContentFilePath(relativeComponentPath) ? `&` : `?`

        return `  "${c.componentChunkName}": () => import("${slash(
          `./${relativeComponentPath}`
        )}${rqPrefix}export=head" /* webpackChunkName: "${
          c.componentChunkName
        }head" */)`
      })
      .filter(Boolean)
      .join(`,\n`)}
}\n\n`
  } else {
    asyncRequires = `exports.components = {\n${components
      .map((c: IGatsbyPageComponent): string => {
        // we need a relative import path to keep contenthash the same if directory changes
        const relativeComponentPath = path.relative(
          getAbsolutePathForVirtualModule(`$virtual`),
          c.componentPath
        )
        return `  "${c.componentChunkName}": () => import("${slash(
          `./${relativeComponentPath}`
        )}" /* webpackChunkName: "${c.componentChunkName}" */)`
      })
      .join(`,\n`)}
}\n\n`
  }

  const writeAndMove = (
    virtualFilePath: string,
    file: string,
    data: string
  ): Promise<void> => {
    writeModule(virtualFilePath, data)

    // files in .cache are not used anymore as part of webpack builds, but
    // still can be used by other tools (for example `gatsby serve` reads
    // `match-paths.json` to setup routing)
    const destination = joinPath(program.directory, `.cache`, file)
    const tmp = `${destination}.${Date.now()}`
    return fs
      .writeFile(tmp, data)
      .then(() => fs.move(tmp, destination, { overwrite: true }))
  }

  await Promise.all([
    writeAndMove(`$virtual/sync-requires.js`, `sync-requires.js`, syncRequires),
    writeAndMove(
      `$virtual/async-requires.js`,
      `async-requires.js`,
      asyncRequires
    ),
    writeAndMove(
      `$virtual/match-paths.json`,
      `match-paths.json`,
      JSON.stringify(matchPaths, null, 4)
    ),
  ])

  return true
}

const debouncedWriteAll = _.debounce(
  async (): Promise<void> => {
    const activity = reporter.activityTimer(`write out requires`, {
      id: `requires-writer`,
    })
    activity.start()
    await writeAll(store.getState())
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
let listenerStarted = false
export const startListener = (): void => {
  // Only start the listener once.
  if (listenerStarted) {
    return
  }
  listenerStarted = true

  if (process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
    /**
     * Start listening to CREATE_SERVER_VISITED_PAGE events so we can rewrite
     * files as required
     */
    emitter.on(`CREATE_SERVER_VISITED_PAGE`, async (): Promise<void> => {
      // this event only happen on new additions
      devSSRWillInvalidate()
      reporter.pendingActivity({ id: `requires-writer` })
      debouncedWriteAll()
    })
  }

  emitter.on(`CREATE_PAGE`, (): void => {
    reporter.pendingActivity({ id: `requires-writer` })
    debouncedWriteAll()
  })

  emitter.on(`CREATE_PAGE_END`, (): void => {
    reporter.pendingActivity({ id: `requires-writer` })
    debouncedWriteAll()
  })

  emitter.on(`DELETE_PAGE`, (): void => {
    reporter.pendingActivity({ id: `requires-writer` })
    debouncedWriteAll()
  })

  emitter.on(`DELETE_PAGE_BY_PATH`, (): void => {
    reporter.pendingActivity({ id: `requires-writer` })
    debouncedWriteAll()
  })
}
