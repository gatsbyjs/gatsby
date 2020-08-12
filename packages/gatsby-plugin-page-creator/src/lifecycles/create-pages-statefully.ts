import glob from "globby"
import _ from "lodash"
import systemPath from "path"
import { sync as existsSync } from "fs-exists-cached"
import { CreatePagesArgs, PluginCallback } from "gatsby"
import {
  createPath,
  watchDirectory,
  validatePath,
  ignorePath,
} from "gatsby-page-utils"
import { IOptions } from "../types"
import { Actions } from "gatsby"
import { createClientOnlyPage } from "../client-routes/create-client-only-page"
import { trackFeatureIsUsed } from "gatsby-telemetry"
import { Reporter } from "gatsby-cli/lib/reporter/reporter"

// Path creator.
// Auto-create pages.
// algorithm is glob /pages directory for js/jsx/cjsx files *not*
// underscored. Then create url w/ our path algorithm *unless* user
// takes control of that page component in gatsby-node.
export async function createPagesStatefully(
  {
    store,
    actions,
    reporter,
  }: CreatePagesArgs & {
    traceId: "initial-createPages"
  },
  { path: pagesPath, pathCheck = true, ignore }: IOptions,
  doneCb: PluginCallback
): Promise<void> {
  const { deletePage } = actions
  const { program } = store.getState()

  const exts = program.extensions.map(e => `${e.slice(1)}`).join(`,`)

  if (!pagesPath) {
    reporter.panic(`"path" is a required option for gatsby-plugin-page-creator

See docs here - https://www.gatsbyjs.org/plugins/gatsby-plugin-page-creator/`)
  }

  // Validate that the path exists.
  if (pathCheck && !existsSync(pagesPath)) {
    reporter.panic(`The path passed to gatsby-plugin-page-creator does not exist on your file system:

${pagesPath}

Please pick a path to an existing directory.`)
  }

  const pagesDirectory = systemPath.resolve(process.cwd(), pagesPath)
  const pagesGlob = `**/*.{${exts}}`

  // Get initial list of files.
  let files = await glob(pagesGlob, { cwd: pagesPath })

  files
    // We do NOT want to handle collection routes in stateful createPages. It should be in normal createPages
    .filter(filePath => !filePath.includes(`{`))
    .forEach(file => {
      createPage(file, pagesDirectory, actions, ignore, reporter)
    })

  watchDirectory(
    pagesPath,
    pagesGlob,
    addedPath => {
      if (!_.includes(files, addedPath) && addedPath.includes(`{`) !== true) {
        createPage(addedPath, pagesDirectory, actions, ignore, reporter)
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

function pathIsClientOnlyRoute(path: string): boolean {
  return path.includes(`[`)
}

export function createPage(
  filePath: string,
  pagesDirectory: string,
  actions: Actions,
  ignore: string[],
  reporter: Reporter
): void {
  try {
    // Filter out special components that shouldn't be made into
    // pages.
    if (!validatePath(filePath)) {
      return
    }

    // Filter out anything matching the given ignore patterns and options
    if (ignorePath(filePath, ignore)) {
      return
    }

    const absolutePath = systemPath.join(pagesDirectory, filePath)

    // If the path includes a `[]` in it, then we create it as a client only route
    if (pathIsClientOnlyRoute(absolutePath)) {
      trackFeatureIsUsed(`UnifiedRoutes:client-page-builder`)
      if (!process.env.GATSBY_EXPERIMENTAL_ROUTING_APIS) {
        reporter.panic(`PageCreator: Found a client route, but the proper env was not set to enable this experimental feature. Please run again with \`GATSBY_EXPERIMENTAL_ROUTING_APIS=1\` to enable.
Skipping creating pages for ${absolutePath}`)
      }
      createClientOnlyPage(filePath, absolutePath, actions)
      return
    }

    // Create page object
    const createdPath = createPath(filePath)
    const page = {
      path: createdPath,
      component: absolutePath,
      context: {},
    }

    // Add page
    actions.createPage(page)
  } catch (e) {
    reporter.panic(
      e.message.startsWith(`PageCreator`)
        ? e.message
        : `PageCreator: ${e.message}`
    )
  }
}
