const path = require(`path`)
const globCB = require(`glob`)
const Promise = require(`bluebird`)
const _ = require(`lodash`)

const glob = Promise.promisify(globCB)

const createPath = require(`./create-path`)

// Path creator.
// Auto-create pages.
// algorithm is glob /pages directory for js/jsx/cjsx files *not*
// underscored. Then create url w/ our path algorithm *unless* user
// takes control of that page component in gatsby-node.
exports.createPages = async ({ store, boundActionCreators }) => {
  const { upsertPage } = boundActionCreators
  const program = store.getState().program
  const pagesDirectory = path.posix.join(program.directory, `/src/pages`)
  const exts = program.extensions.map(e => `*${e}`).join(`|`)

  const files = await glob(`${pagesDirectory}/**/?(${exts})`)

  // Create initial page objects.
  let autoPages = files.map(filePath => {
    return {
      component: filePath,
      path: filePath,
    }
  })

  // Convert path to one relative to the pages directory.
  autoPages = autoPages.map(page => {
    return {
      ...page,
      path: path.posix.relative(pagesDirectory, page.path),
    }
  })

  // Filter out special components that shouldn't be made into
  // pages.
  autoPages = filterPages(autoPages)

  // Convert to our path format.
  autoPages = autoPages.map(page => {
    return {
      ...page,
      path: createPath(pagesDirectory, page.component),
    }
  })

  // Add pages
  autoPages.forEach(page => {
    upsertPage(page)
  })
}

const filterPages = autoPages => {
  // Remove pages starting with an underscore.
  autoPages = _.filter(autoPages, page => {
    const parsedPath = path.parse(page.path)
    return parsedPath.name.slice(0, 1) !== `_`
  })

  // Remove page templates.
  autoPages = _.filter(autoPages, page => {
    const parsedPath = path.parse(page.path)
    return parsedPath.name.slice(0, 9) !== `template-`
  })

  return autoPages
}

exports.filterPages = filterPages
