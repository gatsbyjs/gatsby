const _ = require(`lodash`)
const fs = require(`fs-extra`)
const crypto = require(`crypto`)
const { store, emitter } = require(`../redux/`)
const reporter = require(`gatsby-cli/lib/reporter`)
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

const pickMatchPathFields = page => _.pick(page, [`path`, `matchPath`])

const getMatchPaths = pages =>
  pages.filter(page => page.matchPath).map(pickMatchPathFields)

const createHash = (matchPaths, components) =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify({ matchPaths, components }))
    .digest(`hex`)

// Write out pages information.
const writeAll = async state => {
  // reporter.activityTimer()
  // console.log(`on requiresWriter progress`)
  // reporter.stateUpdate(`requiresWriter`, `IN_PROGRESS`)
  const { program } = state
  const pages = [...state.pages.values()]
  const matchPaths = getMatchPaths(pages)
  const components = getComponents(pages)

  const newHash = createHash(matchPaths, components)

  if (newHash === lastHash) {
    // Nothing changed. No need to rewrite files
    // reporter.stateUpdate(`requiresWriter`, `SUCCESS`)
    // console.log(`on requiresWriter END1`)
    return Promise.resolve(false)
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

  // reporter.pendingActivity(`webpack-develop`)
  // reporter.stateUpdate(`webpack`, `NOT_STARTED`)

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
      // dontShowSuccess: true,
    })
    activity.start()
    const didRequiresChange = await writeAll(store.getState())
    if (didRequiresChange) {
      reporter.pendingActivity(`webpack-develop`)
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
    // console.log(`on CREATE_PAGE`)
    // reporter.stateUpdate(`requiresWriter`, `NOT_STARTED`)
    reporter.pendingActivity(`requires-writer`)
    debouncedWriteAll()
  })

  emitter.on(`CREATE_PAGE_END`, () => {
    // console.log(`on CREATE_PAGE_END`)
    // reporter.stateUpdate(`requiresWriter`, `NOT_STARTED`)
    reporter.pendingActivity(`requires-writer`)
    debouncedWriteAll()
  })

  emitter.on(`DELETE_PAGE`, () => {
    // console.log(`on DELETE_PAGE`)
    // reporter.stateUpdate(`requiresWriter`, `NOT_STARTED`)
    reporter.pendingActivity(`requires-writer`)
    debouncedWriteAll()
  })

  emitter.on(`DELETE_PAGE_BY_PATH`, () => {
    // console.log(`on DELETE_PAGE_BY_PATH`)
    // reporter.stateUpdate(`requiresWriter`, `NOT_STARTED`)
    reporter.pendingActivity(`requires-writer`)
    debouncedWriteAll()
  })
}

module.exports = {
  writeAll,
  resetLastHash,
  startListener,
}
