const globCB = require(`glob`)
const Promise = require(`bluebird`)
const _ = require(`lodash`)
const chokidar = require(`chokidar`)
const systemPath = require(`path`)
const existsSync = require(`fs-exists-cached`).sync

const glob = Promise.promisify(globCB)

const createPath = require(`./create-path`)
const validatePath = require(`./validate-path`)
const ignorePath = require(`./ignore-path`)
const slash = require(`slash`)

// Path creator.
// Auto-create pages.
// algorithm is glob /pages directory for js/jsx/cjsx files *not*
// underscored. Then create url w/ our path algorithm *unless* user
// takes control of that page component in gatsby-node.
exports.createPagesStatefully = async (
  { store, actions, reporter },
  { path: pagesPath, pathCheck = true, ignore },
  doneCb
) => {
  const { createPage, deletePage } = actions
  const program = store.getState().program
  const exts = program.extensions.map(e => `${e.slice(1)}`).join(`,`)

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

  const pagesDirectory = slash(systemPath.posix.join(pagesPath))
  const pagesGlob = `${pagesDirectory}/**/*.{${exts}}`

  // Get initial list of files.
  let files = await glob(pagesGlob)
  files.forEach(file => _createPage(file, pagesDirectory, createPage, ignore))

  // Listen for new component pages to be added or removed.
  chokidar
    .watch(pagesGlob)
    .on(`add`, path => {
      path = slash(path)
      if (!_.includes(files, path)) {
        _createPage(path, pagesDirectory, createPage, ignore)
        files.push(path)
      }
    })
    .on(`unlink`, path => {
      path = slash(path)
      // Delete the page for the now deleted component.
      store.getState().pages.forEach(page => {
        if (page.component === path) {
          deletePage({
            path: createPath(pagesDirectory, path),
            component: path,
          })
        }
      })
      files = files.filter(f => f !== path)
    })
    .on(`ready`, () => doneCb())
}
const _createPage = (filePath, pagesDirectory, createPage, ignore) => {
  // Filter out special components that shouldn't be made into
  // pages.
  if (!validatePath(systemPath.posix.relative(pagesDirectory, filePath))) {
    return
  }

  // Filter out anything matching the given ignore patterns and options
  if (ignorePath(systemPath.posix.relative(pagesDirectory, filePath), ignore)) {
    return
  }

  // Create page object
  const page = {
    path: createPath(pagesDirectory, filePath),
    component: filePath,
  }

  // Add page
  createPage(page)
}
