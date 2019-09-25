const _ = require(`lodash`)
const fs = require(`fs-extra`)
const crypto = require(`crypto`)
const { store, emitter } = require(`../redux/`)
const { match } = require(`@reach/router/lib/utils`)
import { joinPath } from "gatsby-core-utils"

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
    let score = page.matchPath.replace(/\/$/, ``).split(`/`).length
    if (!page.matchPath.includes(`*`)) {
      score += 1
    }

    return {
      ...page,
      index,
      score,
    }
  }

  const matchPathPages = []
  pages.forEach((page, index) => {
    if (page.matchPath) {
      matchPathPages.push(createMatchPathEntry(page, index))
    }
  })

  // Pages can live in matchPaths, to keep them working without doing another network request
  // we save them in matchPath. Our sorting will put them above dynamic routes
  // as we add a static bonus point to static routes
  // More info in https://github.com/gatsbyjs/gatsby/issues/16097
  // small speedup: don't bother traversing when no matchPaths found.
  if (matchPathPages.length) {
    pages.forEach((page, index) => {
      const isInsideMatchPath = !!matchPathPages.find(
        pageWithMatchPath =>
          !page.matchPath && match(pageWithMatchPath.matchPath, page.path)
      )

      if (isInsideMatchPath) {
        matchPathPages.push(
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
  }

  return matchPathPages
    .sort((a, b) => {
      // The higher the score, the higher the specificity of our matchPath
      const order = b.score - a.score
      if (order !== 0) {
        return order
      }

      // if specificity is the same we use the array index
      return b.index - a.index
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
  const { program } = state
  const pages = [...state.pages.values()]
  const matchPaths = getMatchPaths(pages)
  const components = getComponents(pages)

  const newHash = createHash(matchPaths, components)

  if (newHash === lastHash) {
    // Nothing changed. No need to rewrite files
    return Promise.resolve()
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
    .map(
      c =>
        `  "${c.componentChunkName}": () => import("${joinPath(
          c.component
        )}" /* webpackChunkName: "${c.componentChunkName}" */)`
    )
    .join(`,\n`)}
}\n\n`

  const writeAndMove = (file, data) => {
    const destination = joinPath(program.directory, `.cache`, file)
    const tmp = `${destination}.${Date.now()}`
    return fs
      .writeFile(tmp, data)
      .then(() => fs.move(tmp, destination, { overwrite: true }))
  }

  const result = await Promise.all([
    writeAndMove(`sync-requires.js`, syncRequires),
    writeAndMove(`async-requires.js`, asyncRequires),
    writeAndMove(`match-paths.json`, JSON.stringify(matchPaths, null, 4)),
  ])

  return result
}

const debouncedWriteAll = _.debounce(() => writeAll(store.getState()), 500, {
  leading: true,
})

/**
 * Start listening to CREATE/DELETE_PAGE events so we can rewrite
 * files as required
 */
const startListener = () => {
  emitter.on(`CREATE_PAGE`, () => {
    debouncedWriteAll()
  })

  emitter.on(`CREATE_PAGE_END`, () => {
    debouncedWriteAll()
  })

  emitter.on(`DELETE_PAGE`, () => {
    debouncedWriteAll()
  })

  emitter.on(`DELETE_PAGE_BY_PATH`, () => {
    debouncedWriteAll()
  })
}

module.exports = {
  writeAll,
  resetLastHash,
  startListener,
}
