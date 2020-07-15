const globCB = require(`glob`)
const Promise = require(`bluebird`)
const _ = require(`lodash`)
const systemPath = require(`path`)
const existsSync = require(`fs-exists-cached`).sync

const glob = Promise.promisify(globCB)

import {
  createPath,
  validatePath,
  ignorePath,
  watchDirectory,
} from "gatsby-page-utils"

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

  const pagesDirectory = systemPath.resolve(process.cwd(), pagesPath)
  const pagesGlob = `**/*.{${exts}}`

  // Get initial list of files.
  let files = await glob(pagesGlob, { cwd: pagesPath })
  files.forEach(file => _createPage(file, pagesDirectory, createPage, ignore))

  watchDirectory(
    pagesPath,
    pagesGlob,
    addedPath => {
      if (!_.includes(files, addedPath)) {
        _createPage(addedPath, pagesDirectory, createPage, ignore)
        files.push(addedPath)
      }
    },
    removedPath => {
      // Delete the page for the now deleted component.
      const componentPath = systemPath.join(pagesDirectory, removedPath)
      store.getState().pages.forEach(page => {
        if (page.component === componentPath) {
          deletePage({
            path: createPath(removedPath),
            component: componentPath,
          })
        }
      })
      files = files.filter(f => f !== removedPath)
    }
  ).then(() => doneCb())
}
const _createPage = (filePath, pagesDirectory, createPage, ignore) => {
  // Filter out special components that shouldn't be made into
  // pages.
  if (!validatePath(filePath)) {
    return
  }

  // Filter out anything matching the given ignore patterns and options
  if (ignorePath(filePath, ignore)) {
    return
  }

  // Create page object
  const createdPath = createPath(filePath)
  const page = {
    path: createdPath,
    component: systemPath.join(pagesDirectory, filePath),
  }

  // Add page
  createPage(page)
}
