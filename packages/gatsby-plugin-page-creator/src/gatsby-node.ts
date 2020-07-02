import globCB from "glob"
import Promise from "bluebird"
import _ from "lodash"
import systemPath from "path"
import { sync as existsSync } from "fs-exists-cached"
import { CreatePagesArgs, PluginOptions, PluginCallback } from "gatsby"

type GlobParameters = Parameters<typeof globCB>
const glob = Promise.promisify<
  Array<string>,
  GlobParameters[0],
  GlobParameters[1]
>(globCB)

const { createPage } = require(`./create-page-wrapper`)
const { createPath, watchDirectory } = require(`gatsby-page-utils`)

interface Options extends PluginOptions {
  path: string
  pathCheck: boolean
  ignore: Array<string>
}

// Path creator.
// Auto-create pages.
// algorithm is glob /pages directory for js/jsx/cjsx files *not*
// underscored. Then create url w/ our path algorithm *unless* user
// takes control of that page component in gatsby-node.
async function createPagesStatefully(
  {
    store,
    actions,
    reporter,
    graphql,
  }: CreatePagesArgs & {
    traceId: "initial-createPages"
  },
  { path: pagesPath, pathCheck = true, ignore }: Options,
  doneCb: PluginCallback
) {
  const { deletePage } = actions
  const { program } = store.getState()

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
  files.forEach(file => {
    createPage(file, pagesDirectory, actions, ignore, graphql)
  })

  watchDirectory(
    pagesPath,
    pagesGlob,
    addedPath => {
      if (!_.includes(files, addedPath)) {
        createPage(addedPath, pagesDirectory, actions, ignore, graphql)
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
  ).then(() => doneCb(null, null))
}

exports.createPagesStatefully = createPagesStatefully
