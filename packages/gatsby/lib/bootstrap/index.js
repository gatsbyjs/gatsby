/* @flow */
import Promise from "bluebird"
import path from "path"
import globCB from "glob"
import _ from "lodash"
import slash from "slash"
import createPath from "./create-path"
import fs from "fs-extra"
import apiRunnerNode from "../utils/api-runner-node"
import { graphql } from "graphql"
import { store } from "../redux"
const { boundActionCreators } = require(`../redux/actions`)

// Start off the query running.
const QueryRunner = require(`../query-runner`)

// Override console.log to add the source file + line number.
// ["log", "warn"].forEach(function(method) {
// var old = console[method];
// console[method] = function() {
// var stack = new Error().stack.split(/\n/);
// // Chrome includes a single "Error" line, FF doesn't.
// if (stack[0].indexOf("Error") === 0) {
// stack = stack.slice(1);
// }
// var args = [].slice.apply(arguments).concat([stack[1].trim()]);
// return old.apply(console, args);
// };
// });

const preferDefault = m => (m && m.default) || m

const mkdirs = Promise.promisify(fs.mkdirs)
const copy = Promise.promisify(fs.copy)
const glob = Promise.promisify(globCB)

// Path creator.
// Auto-create pages.
// algorithm is glob /pages directory for js/jsx/cjsx files *not*
// underscored. Then create url w/ our path algorithm *unless* user
// takes control of that page component in gatsby-node.
const autoPathCreator = async () => {
  const { program } = store.getState()
  const pagesDirectory = path.posix.join(program.directory, `/src/pages`)
  const exts = program.extensions.map(e => `*${e}`).join(`|`)
  // The promisified version wasn't working for some reason
  // so we'll use sync for now.
  const files = glob.sync(`${pagesDirectory}/**/?(${exts})`)
  // Create initial page objects.
  let autoPages = files.map(filePath => ({
    component: filePath,
    path: filePath,
  }))

  // Convert path to one relative to the pages directory.
  autoPages = autoPages.map(page => ({
    ...page,
    path: path.posix.relative(pagesDirectory, page.path),
  }))

  // Remove pages starting with an underscore.
  autoPages = _.filter(autoPages, page => page.path.slice(0, 1) !== `_`)

  // Remove page templates.
  autoPages = _.filter(autoPages, page => page.path.slice(0, 9) !== `template-`)

  // Convert to our path format.
  autoPages = autoPages.map(page => ({
    ...page,
    path: createPath(pagesDirectory, page.component),
  }))

  // Add pages
  autoPages.forEach(page => {
    boundActionCreators.upsertPage(page)
  })
}

module.exports = async (program: any) => {
  console.log(`lib/bootstrap/index.js time since started:`, process.uptime())

  // Fix program directory path for windows env
  program.directory = slash(program.directory)

  store.dispatch({
    type: `SET_PROGRAM`,
    payload: program,
  })

  QueryRunner.watch(program.directory)

  // Try opening the site's gatsby-config.js file.
  console.time(`open and validate gatsby-config.js`)
  let config = {}
  try {
    // $FlowFixMe
    config = preferDefault(require(`${program.directory}/gatsby-config`))
  } catch (e) {
    console.log(`Couldn't open your gatsby-config.js file`)
    console.log(e)
    process.exit()
  }

  store.dispatch({
    type: `SET_SITE_CONFIG`,
    payload: config,
  })

  console.timeEnd(`open and validate gatsby-config.js`)

  // Instantiate plugins.
  const plugins = []
  // Create fake little site with a plugin for testing this
  // w/ snapshots. Move plugin processing to its own module.
  // Also test adding to redux store.
  const processPlugin = plugin => {
    if (_.isString(plugin)) {
      const resolvedPath = slash(path.dirname(require.resolve(plugin)))
      const packageJSON = JSON.parse(
        fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
      )
      return {
        resolve: resolvedPath,
        name: packageJSON.name,
        version: packageJSON.version,
        pluginOptions: {
          plugins: [],
        },
      }
    } else {
      // Plugins can have plugins.
      const subplugins = []
      if (plugin.options && plugin.options.plugins) {
        plugin.options.plugins.forEach(p => {
          subplugins.push(processPlugin(p))
        })
      }
      plugin.options.plugins = subplugins

      const resolvedPath = slash(path.dirname(require.resolve(plugin.resolve)))
      const packageJSON = JSON.parse(
        fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
      )
      return {
        resolve: resolvedPath,
        name: packageJSON.name,
        version: packageJSON.version,
        pluginOptions: _.merge({ plugins: [] }, plugin.options),
      }
    }
  }

  if (config.plugins) {
    config.plugins.forEach(plugin => {
      plugins.push(processPlugin(plugin))
    })
  }

  // Add the site's default "plugin" i.e. gatsby-x files in root of site.
  plugins.push({
    resolve: slash(process.cwd()),
    name: `defaultSitePlugin`,
    version: `n/a`,
    pluginOptions: {
      plugins: [],
    },
  })

  // Create a "flattened" array of plugins with all subplugins
  // brought to the top-level. This simplifies running gatsby-* files
  // for subplugins.
  const flattenedPlugins = []
  const extractPlugins = plugin => {
    plugin.pluginOptions.plugins.forEach(subPlugin => {
      flattenedPlugins.push(subPlugin)
      extractPlugins(subPlugin)
    })
  }

  plugins.forEach(plugin => {
    flattenedPlugins.push(plugin)
    extractPlugins(plugin)
  })

  store.dispatch({
    type: `SET_SITE_PLUGINS`,
    payload: plugins,
  })

  store.dispatch({
    type: `SET_SITE_FLATTENED_PLUGINS`,
    payload: flattenedPlugins,
  })

  // Ensure the public directory is created.
  await mkdirs(`${program.directory}/public`)

  // Copy our site files to the root of the site.
  console.time(`copy gatsby files`)
  const srcDir = `${__dirname}/../cache-dir`
  const siteDir = `${program.directory}/.cache`
  try {
    // await removeDir(siteDir)
    await copy(srcDir, siteDir, { clobber: true })
    await mkdirs(`${program.directory}/.cache/json`)
  } catch (e) {
    console.log(`Unable to copy site files to .cache`)
    console.log(e)
  }

  // Find plugins which implement gatsby-browser and gatsby-ssr and write
  // out api-runners for them.
  const hasAPIFile = (env, plugin) =>
    glob.sync(`${plugin.resolve}/gatsby-${env}*`)[0]

  const ssrPlugins = _.filter(
    flattenedPlugins.map(plugin => ({
      resolve: hasAPIFile(`ssr`, plugin),
      options: plugin.pluginOptions,
    })),
    plugin => plugin.resolve
  )
  const browserPlugins = _.filter(
    flattenedPlugins.map(plugin => ({
      resolve: hasAPIFile(`browser`, plugin),
      options: plugin.pluginOptions,
    })),
    plugin => plugin.resolve
  )

  let browserAPIRunner = fs.readFileSync(
    `${siteDir}/api-runner-browser.js`,
    `utf-8`
  )
  const browserPluginsRequires = browserPlugins.map(
    plugin => `{
      plugin: require('${plugin.resolve}'),
      options: ${JSON.stringify(plugin.options)},
    }`
  ).join(`,`)

  browserAPIRunner = `var plugins = [${browserPluginsRequires}]\n${browserAPIRunner}`

  let sSRAPIRunner = fs.readFileSync(`${siteDir}/api-runner-ssr.js`, `utf-8`)
  const ssrPluginsRequires = ssrPlugins.map(
    plugin => `{
      plugin: require('${plugin.resolve}'),
      options: ${JSON.stringify(plugin.options)},
    }`
  ).join(`,`)
  sSRAPIRunner = `var plugins = [${ssrPluginsRequires}]\n${sSRAPIRunner}`

  fs.writeFileSync(
    `${siteDir}/api-runner-browser.js`,
    browserAPIRunner,
    `utf-8`
  )
  fs.writeFileSync(`${siteDir}/api-runner-ssr.js`, sSRAPIRunner, `utf-8`)

  console.timeEnd(`copy gatsby files`)

  // Create Schema.
  await require(`../schema`)()

  const graphqlRunner = (query, context) => {
    const schema = store.getState().schema
    return graphql(schema, query, context, context, context)
  }

  // Collect resolvable extensions and attach to program.
  const extensions = [`.js`, `.jsx`]
  const apiResults = await apiRunnerNode(`resolvableExtensions`)

  store.dispatch({
    type: `SET_PROGRAM_EXTENSIONS`,
    payload: _.flattenDeep([extensions, apiResults]),
  })

  // Collect pages.
  await apiRunnerNode(`createPages`, {
    graphql: graphqlRunner,
  })

  // TODO move this to own source plugin per component type
  // (js/cjsx/typescript, etc.). Only do after there's themes
  // so can cement default /pages setup in default core theme.
  autoPathCreator()

  // Copy /404/ to /404.html as many static site hosting companies expect
  // site 404 pages to be named this.
  // https://www.gatsbyjs.org/docs/add-404-page/
  const exists404html = _.some(
    store.getState().pages,
    p => p.path === `/404.html`
  )
  if (!exists404html) {
    store.getState().pages.forEach(page => {
      if (page.path === `/404/`) {
        boundActionCreators.upsertPage({
          ...page,
          path: `/404.html`,
        })
      }
    })
  }

  console.log(`created js pages`)

  return new Promise(resolve => {
    QueryRunner.isInitialPageQueryingDone(() => {
      apiRunnerNode(`generateSideEffects`).then(() => {
        console.log(`bootstrap finished, time since started: ${process.uptime()}`)
        resolve({ graphqlRunner })
      })
    })
  })
}
