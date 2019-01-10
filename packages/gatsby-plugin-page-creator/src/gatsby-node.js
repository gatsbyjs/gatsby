const globCB = require(`glob`)
const Promise = require(`bluebird`)
const _ = require(`lodash`)
const chokidar = require(`chokidar`)
const systemPath = require(`path`)
const existsSync = require(`fs-exists-cached`).sync
const slash = require(`slash`)

const glob = Promise.promisify(globCB)

const defaultCreatePath = require(`./create-path`)
const defaultValidatePath = require(`./validate-path`)

// Path creator.
// Auto-create pages.
// algorithm is glob /pages directory for js/jsx/cjsx files *not*
// underscored. Then create url w/ our path algorithm *unless* user
// takes control of that page component in gatsby-node,
// or provides a custom algorithm, via options.
exports.createPagesStatefully = async (
  { store, actions, reporter },
  {
    path: pagesPath,
    pathCheck = true,
    createPath = defaultCreatePath,
    validatePath = defaultValidatePath,
  },
  doneCb
) => {
  const { createPage, deletePage } = actions
  const program = store.getState().program
  const exts = program.extensions.map(e => `${e.slice(1)}`).join(`,`)
  const create = _createPage(
    createPage,
    validatePath,
    createPath,
    pagesDirectory
  )

  if (!pagesPath) {
    reporter.panic(
      `
      "path" is a required option for gatsby-plugin-page-creator

      See docs here - https://www.gatsbyjs.org/plugins/gatsby-plugin-page-creator/
      `
    )
  }

  // Validate that the path exists.
  if (pathCheck && !existsSync(pagesPath)) {
    reporter.panic(
      `
      The path passed to gatsby-plugin-page-creator does not exist on your file system:

      ${pagesPath}

      Please pick a path to an existing directory.
      `
    )
  }

  const pagesDirectory = systemPath.posix.join(pagesPath)
  const pagesGlob = `${pagesDirectory}/**/*.{${exts}}`

  // Get initial list of files.
  let files = await glob(pagesGlob)
  files.forEach(file => create(file))

  // Listen for new component pages to be added or removed.
  chokidar
    .watch(pagesGlob)
    .on(`add`, path => {
      if (!_.includes(files, path)) {
        create(path)
        files.push(path)
      }
    })
    .on(`unlink`, path => {
      path = slash(path)
      // Delete the page for the now deleted component.
      store.getState().pages.forEach(page => {
        if (page.component === path) {
          deletePage({
            path: createPath(pagesDirectory, path, defaultCreatePath),
            component: path,
          })
        }
      })
      files = files.filter(f => f !== path)
    })
    .on(`ready`, () => doneCb())
}
const _createPage = (
  createPage,
  validatePath,
  createPath,
  pagesDirectory
) => filePath => {
  // Filter out special components that shouldn't be made into pages.
  const relativePath = systemPath.posix.relative(pagesDirectory, filePath)
  if (!validatePath(relativePath, defaultValidatePath)) return

  // Create page object
  const page = {
    path: createPath(pagesDirectory, filePath, defaultCreatePath),
    component: filePath,
  }

  // Add page
  createPage(page)
}
